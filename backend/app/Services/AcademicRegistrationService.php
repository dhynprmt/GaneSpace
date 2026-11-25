<?php

namespace App\Services;

use App\Models\Event;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AcademicRegistrationService
{
    public function register(User $student, Event $event): Registration
    {
        return DB::transaction(function () use ($student, $event) {
            $event = Event::lockForUpdate()->findOrFail($event->id);
            $profile = $student->studentProfile()->lockForUpdate()->first();
            abort_unless($profile?->verification_status === 'verified' && $student->isVerifiedStudent(), 403,
                'Email dan identitas mahasiswa harus terverifikasi.');
            abort_unless($event->publication_status === 'published' && $event->organization?->is_active, 404);
            abort_unless($event->eventType?->category?->slug === 'academic', 422, 'Acara ini menggunakan pendaftaran eksternal.');
            $now = now('UTC');
            abort_if($event->cancelled_at || $now->gte($event->start_at)
                || ($event->registration_opens_at && $now->lt($event->registration_opens_at))
                || ($event->registration_closes_at && $now->gt($event->registration_closes_at)),
                409, 'Pendaftaran sedang ditutup.');
            $active = $event->registrations()->where('status', 'active');
            abort_if((clone $active)->where('student_user_id', $student->id)->exists(), 409, 'Anda sudah terdaftar.');
            abort_if($event->capacity !== null && $active->count() >= $event->capacity, 409, 'Kuota acara sudah penuh.');

            $record = $event->registrations()->create([
                'student_user_id' => $student->id, 'public_uuid' => (string) Str::uuid(),
                'registration_code' => 'GS-'.strtoupper(bin2hex(random_bytes(8))),
                'status' => 'active', 'registered_at' => $now,
                'participant_snapshot' => ['name' => $student->name, 'nim' => $profile->nim,
                    'study_program' => $profile->studyProgram?->name],
                'event_snapshot' => ['title' => $event->title, 'slug' => $event->slug,
                    'organizer' => $event->organization->name, 'start_at' => $event->start_at->toIso8601String(),
                    'end_at' => $event->end_at->toIso8601String(), 'location' => collect([
                        $event->venue_name, $event->venue_address,
                        in_array($event->location_mode, ['online', 'hybrid']) ? 'Daring' : null,
                    ])->filter()->implode(' · ')],
            ]);
            app(StudentNoticeService::class)->registration($record, 'registration_success', (string) $record->id);
            return $record;
        }, 3);
    }

    public function cancel(User $student, Registration $registration): void
    {
        DB::transaction(function () use ($student, $registration) {
            $event = Event::lockForUpdate()->findOrFail($registration->event_id);
            $record = Registration::lockForUpdate()->findOrFail($registration->id);
            abort_unless($record->student_user_id === $student->id, 404);
            abort_if($record->status !== 'active' || now('UTC')->gte($event->start_at), 409,
                'Pendaftaran ini sudah tidak dapat dibatalkan.');
            abort_unless($student->can('cancel', $record), 403);
            $record->update(['status' => 'cancelled', 'cancelled_at' => now('UTC'),
                'cancelled_by' => $student->id, 'cancellation_source' => 'student']);
            app(StudentNoticeService::class)->registration($record, 'registration_cancelled', (string) $record->id);
        }, 3);
    }
}

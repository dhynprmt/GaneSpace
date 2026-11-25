<?php

namespace App\Services;

use App\Jobs\SendStudentNotice;
use App\Models\Event;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Ramsey\Uuid\Uuid;

class StudentNoticeService
{
    public function notify(User $user, string $cause, string $type, string $title, string $message, string $link): void
    {
        DB::transaction(function () use ($user, $cause, $type, $title, $message, $link) {
            $id = Uuid::uuid5(Uuid::NAMESPACE_URL, "ganespace/$type/$cause/$user->id")->toString();
            $notice = $user->notifications()->firstOrCreate(['id' => $id], [
                'type' => $type, 'data' => compact('title', 'message', 'link'),
            ]);
            if (! $notice->wasRecentlyCreated) {
                return;
            }
            $delivery = DB::table('notification_delivery_logs')->insertGetId([
                'user_id' => $user->id, 'notification_id' => $id, 'channel' => 'email',
                'recipient_email' => $user->email, 'template_key' => $type, 'delivery_status' => 'queued',
                'created_at' => now(), 'updated_at' => now(),
            ]);
            // Same database connection as the domain transaction. Workers see this job only after commit.
            SendStudentNotice::dispatch($delivery)->onConnection('ganespace_mail')->beforeCommit();
        });
    }

    public function registration(Registration $record, string $type, string $cause): void
    {
        $student = $record->student;
        if (! $student) {
            return;
        }
        $title = match ($type) {
            'registration_success' => 'Pendaftaran berhasil',
            'registration_cancelled' => 'Pendaftaran dibatalkan',
            'event_cancelled' => 'Acara dibatalkan',
            'schedule_change' => 'Informasi acara diperbarui',
        };
        $event = $record->event;
        $link = $type === 'schedule_change' ? '/events/'.$event->slug : '/student/registrations/'.$record->id;
        $this->notify($student, $cause, $type, $title, $title.' · '.$event->title, $link);
    }

    public function participants(Event $event, string $type, string $cause): void
    {
        $event->registrations()->where('status', 'active')->with('student')->chunkById(100,
            function ($records) use ($event, $type, $cause) {
                foreach ($records as $record) {
                    $record->setRelation('event', $event);
                    $this->registration($record, $type, $cause);
                }
            });
    }
}

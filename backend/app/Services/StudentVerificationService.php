<?php

namespace App\Services;

use App\Models\StudentProfile;
use App\Models\StudentVerificationLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StudentVerificationService
{
    public function review(StudentProfile $profile, User $reviewer, string $status, ?string $reason): StudentProfile
    {
        return DB::transaction(function () use ($profile, $reviewer, $status, $reason) {
            $profile = StudentProfile::query()->with('user')->lockForUpdate()->findOrFail($profile->id);
            if ($status === 'verified') {
                if (! $profile->user->hasVerifiedEmail()) {
                    throw ValidationException::withMessages(['status' => ['Email must be verified first.']]);
                }
                if (empty($profile->ktm_private_path)) {
                    throw ValidationException::withMessages(['status' => ['Student ID proof is required.']]);
                }
            }
            if ($profile->verification_status === $status) {
                throw ValidationException::withMessages(['status' => ['No verification status change.']]);
            }
            $previous = $profile->verification_status;
            $profile->update([
                'verification_status' => $status, 'verification_note' => $reason,
                'verified_by' => $status === 'verified' ? $reviewer->id : null,
                'verified_at' => $status === 'verified' ? now('UTC') : null,
            ]);
            $review = StudentVerificationLog::create([
                'student_profile_id' => $profile->id, 'actor_user_id' => $reviewer->id,
                'previous_status' => $previous, 'new_status' => $status,
                'reason' => $reason, 'created_at' => now('UTC'),
            ]);
            app(StudentNoticeService::class)->notify($profile->user, (string) $review->id, 'identity_review',
                'Hasil verifikasi mahasiswa', 'Status verifikasi identitas Anda: '.$status.'.', '/student/profile');
            return $profile->refresh();
        }, 3);
    }
}

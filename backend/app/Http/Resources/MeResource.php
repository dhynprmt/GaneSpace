<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $profile = $this->whenLoaded('studentProfile');
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'email_verified' => $this->hasVerifiedEmail(),
            'account_status' => $this->account_status,
            'roles' => $this->whenLoaded('roleAssignments', fn () => $this->roleAssignments
                ->whereNull('revoked_at')->map(fn ($assignment) => [
                    'role' => $assignment->role?->slug,
                    'organization_id' => $assignment->organization_id,
                    'organization_name' => $assignment->organization?->name,
                ])->values()->all()),
            'student' => $this->whenLoaded('studentProfile', function () {
                $p = $this->studentProfile;
                if (! $p) return null;
                return [
                    'nim' => $p->nim,
                    'verification_status' => $p->verification_status,
                    'verification_note' => $p->verification_note,
                    'verified_at' => $p->verified_at,
                    'has_profile_photo' => filled($p->profile_photo_path),
                    'has_ktm' => $p->ktm_private_path !== null,
                    'study_program' => [
                        'id' => $p->studyProgram?->id,
                        'department_id' => $p->studyProgram?->department_id,
                        'faculty_id' => $p->studyProgram?->department?->faculty_id,
                        'name' => $p->studyProgram?->name,
                        'department' => $p->studyProgram?->department?->name,
                        'faculty' => $p->studyProgram?->department?->faculty?->name,
                    ],
                ];
            }),
        ];
    }
}

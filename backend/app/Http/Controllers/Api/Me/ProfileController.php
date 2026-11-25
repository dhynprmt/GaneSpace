<?php

namespace App\Http\Controllers\Api\Me;

use App\Http\Controllers\Controller;
use App\Http\Requests\Me\ResubmitStudentProfileRequest;
use App\Http\Resources\MeResource;
use App\Models\StudentProfile;
use App\Models\StudentVerificationLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    public function show(Request $request): MeResource
    {
        return new MeResource($request->user()->load(
            'roleAssignments.role', 'roleAssignments.organization',
            'studentProfile.studyProgram.department.faculty'
        ));
    }

    public function verification(Request $request): JsonResponse
    {
        $p = $request->user()->studentProfile;
        return response()->json(['email_verified' => $request->user()->hasVerifiedEmail(),
            'nim_status' => $p?->verification_status, 'nim_note' => $p?->verification_note,
            'can_use_student_features' => $request->user()->isVerifiedStudent()]);
    }

    public function update(Request $request): MeResource
    {
        $data = $request->validate(['name' => ['required','string','max:160']]);
        $request->user()->update($data);
        return $this->show($request);
    }

    public function resubmit(ResubmitStudentProfileRequest $request): JsonResponse
    {
        $data = $request->validated();
        if (! array_key_exists('nim', $data) && ! array_key_exists('study_program_id', $data) && ! $request->hasFile('ktm')) {
            throw ValidationException::withMessages(['profile' => ['Provide a NIM, study program or proof file.']]);
        }
        $user = $request->user();
        $newPath = null;
        try {
            DB::transaction(function () use ($request, $data, $user, &$newPath) {
                $profile = StudentProfile::query()->where('user_id', $user->id)->lockForUpdate()->firstOrFail();
                if ($request->hasFile('ktm')) {
                    $newPath = $request->file('ktm')->store("student-ktm/{$user->id}", 'local');
                    if (! $newPath) throw new \RuntimeException('Could not store proof.');
                }
                $previous = $profile->verification_status;
                $changes = [
                    'verification_status' => 'pending', 'verification_note' => null,
                    'verified_by' => null, 'verified_at' => null,
                    'verification_requested_at' => now('UTC'),
                ];
                if (array_key_exists('nim', $data)) $changes['nim'] = $data['nim'];
                if (array_key_exists('study_program_id', $data)) $changes['study_program_id'] = $data['study_program_id'];
                if ($newPath) {
                    $changes['ktm_private_path'] = $newPath;
                    $changes['ktm_uploaded_at'] = now('UTC');
                }
                $profile->update($changes);
                StudentVerificationLog::create([
                    'student_profile_id' => $profile->id, 'actor_user_id' => $user->id,
                    'previous_status' => $previous, 'new_status' => 'pending',
                    'reason' => 'Student resubmitted identity details or proof',
                    'created_at' => now('UTC'),
                ]);
            }, 3);
        } catch (\Throwable $error) {
            if ($newPath) Storage::disk('local')->delete($newPath);
            throw $error;
        }
        // Old private proof files are retained for audit until a retention policy is adopted.
        return response()->json(['message' => 'Profile submitted for manual review.','nim_status' => 'pending']);
    }

    public function ktm(Request $request)
    {
        $profile = $request->user()->studentProfile;
        abort_unless($profile && $profile->ktm_private_path, 404);
        abort_unless(Storage::disk('local')->exists($profile->ktm_private_path), 404);
        return Storage::disk('local')->download($profile->ktm_private_path,
            'student-proof.' . pathinfo($profile->ktm_private_path, PATHINFO_EXTENSION));
    }
}

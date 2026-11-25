<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\StudentProfile;
use App\Models\StudentVerificationLog;
use App\Models\User;
use App\Services\RoleAssignmentService;
use App\Services\TurnstileVerifier;
use App\Services\StudentPhotoService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class RegistrationController extends Controller
{
    public function store(RegisterRequest $request, TurnstileVerifier $captcha, RoleAssignmentService $roles, StudentPhotoService $photos): JsonResponse
    {
        $data = $request->validated();
        $captcha->verify($data['turnstile_token'], $request);
        $filePath = null;
        $photoPath = null;
        try {
            $user = DB::transaction(function () use ($request, $data, $roles, $photos, &$filePath, &$photoPath) {
                $user = User::create([
                    'name' => $data['name'],
                    'email' => Str::lower($data['email']),
                    'password' => $data['password'],
                    'account_status' => 'active',
                ]);
                $filePath = $request->file('ktm')->store("student-ktm/{$user->id}", 'local');
                if (! $filePath) {
                    throw new \RuntimeException('Unable to store student proof.');
                }
                $profile = StudentProfile::create([
                    'user_id' => $user->id, 'nim' => $data['nim'],
                    'study_program_id' => $data['study_program_id'],
                    'ktm_private_path' => $filePath, 'ktm_uploaded_at' => now('UTC'),
                    'verification_status' => 'pending', 'verification_requested_at' => now('UTC'),
                ]);
                if ($request->hasFile('profile_photo')) {
                    $photoPath = $photos->store($request->file('profile_photo'), $user->id);
                    $profile->update(['profile_photo_path' => $photoPath]);
                }
                StudentVerificationLog::create([
                    'student_profile_id' => $profile->id, 'previous_status' => null,
                    'new_status' => 'pending', 'reason' => 'Student registered',
                    'created_at' => now('UTC'),
                ]);
                $roles->assign($user, 'student');
                return $user;
            });
        } catch (\Throwable $error) {
            if ($photoPath) Storage::disk('local')->delete($photoPath);
            if ($filePath) Storage::disk('local')->delete($filePath);
            throw $error;
        }

        event(new Registered($user));
        return response()->json([
            'message' => 'Account created. Check your email to verify your address.',
        ], 201);
    }
}

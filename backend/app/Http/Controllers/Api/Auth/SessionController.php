<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\MeResource;
use App\Models\User;
use App\Services\TurnstileVerifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SessionController extends Controller
{
    public function login(LoginRequest $request, TurnstileVerifier $captcha): JsonResponse
    {
        $credentials = $request->validated();
        $captcha->verify($credentials['turnstile_token'], $request);
        $email = Str::lower($credentials['email']);
        if (! Auth::guard('web')->attempt(['email' => $email, 'password' => $credentials['password']])) {
            throw ValidationException::withMessages(['email' => ['Invalid credentials.']]);
        }
        /** @var User $user */
        $user = Auth::guard('web')->user();
        if ($user->account_status !== 'active' || ! $user->hasVerifiedEmail()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return response()->json([
                'message' => $user->account_status !== 'active' ? 'Account is not active.' : 'Verify your email before login.',
                'code' => $user->account_status !== 'active' ? 'ACCOUNT_INACTIVE' : 'EMAIL_NOT_VERIFIED',
            ], 403);
        }
        $request->session()->regenerate();
        $user->forceFill(['last_login_at' => now('UTC')])->save();
        $user->load('roleAssignments.role', 'roleAssignments.organization', 'studentProfile.studyProgram.department.faculty');
        return response()->json(['user' => (new MeResource($user))->resolve($request)]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->json(['message' => 'Logged out.']);
    }
}

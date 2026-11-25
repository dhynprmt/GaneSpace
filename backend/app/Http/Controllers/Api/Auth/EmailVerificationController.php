<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TurnstileVerifier;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\RateLimiter;

class EmailVerificationController extends Controller
{
    public function verify(Request $request, int $id, string $hash): RedirectResponse
    {
        $user = User::query()->findOrFail($id);
        abort_unless(hash_equals(sha1($user->getEmailForVerification()), $hash), 403);
        if (! $user->hasVerifiedEmail() && $user->markEmailAsVerified()) {
            event(new Verified($user));
        }
        $target = rtrim(config('ueis.frontend_url'), '/') . '/auth/email-verified?status=success';
        return redirect()->away($target);
    }

    public function resend(Request $request, TurnstileVerifier $captcha): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required','email','max:254'],
            'turnstile_token' => ['required','string','max:2048'],
        ]);
        $captcha->verify($data['turnstile_token'], $request);
        $user = User::query()->where('email', Str::lower($data['email']))->first();
        if ($user && $user->account_status === 'active' && ! $user->hasVerifiedEmail()) {
            $user->sendEmailVerificationNotification();
        }
        return response()->json(['message' => 'If an unverified account exists, a verification email has been sent.']);
    }
}

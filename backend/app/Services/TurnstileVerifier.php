<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class TurnstileVerifier
{
    public function verify(string $token, Request $request): void
    {
        $secret = config('ueis.turnstile.secret');
        if (! is_string($secret) || $secret === '') {
            throw new \RuntimeException('Cloudflare Turnstile is not configured.');
        }

        if (! app()->environment(['local', 'testing']) && preg_match('/^[123]x0{31}AA$/D', $secret)) {
            throw new \RuntimeException('Turnstile requires a production secret in this environment.');
        }

        try {
            $client = Http::asForm()->timeout(8);
            if ($proxy = config('ueis.turnstile.https_proxy')) {
                $client = $client->withOptions(['proxy' => ['https' => $proxy]]);
            }
            $response = $client->post(
                'https://challenges.cloudflare.com/turnstile/v0/siteverify',
                ['secret' => $secret, 'response' => $token, 'remoteip' => $request->ip()]
            );
        } catch (\Throwable $exception) {
            report($exception);
            throw ValidationException::withMessages([
                'turnstile_token' => ['CAPTCHA could not be validated. Try again.'],
            ]);
        }

        $expectedHostname = config('ueis.turnstile.expected_hostname');
        $validHostname = empty($expectedHostname)
            || $response->json('hostname') === $expectedHostname;

        if (! $response->ok() || $response->json('success') !== true || ! $validHostname) {
            throw ValidationException::withMessages([
                'turnstile_token' => ['CAPTCHA verification failed or expired.'],
            ]);
        }
    }
}

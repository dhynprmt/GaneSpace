<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveAccount
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || $request->user()->account_status !== 'active') {
            return response()->json(['message' => 'Account is not active.', 'code' => 'ACCOUNT_INACTIVE'], 403);
        }
        // UEIS deliberately uses first-party SPA sessions, not personal Bearer tokens.
        if ($request->user()->currentAccessToken() instanceof \Laravel\Sanctum\PersonalAccessToken) {
            return response()->json(['message' => 'Session-based authentication is required.'], 403);
        }
        return $next($request);
    }
}

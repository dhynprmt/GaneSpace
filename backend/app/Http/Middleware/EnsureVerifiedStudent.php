<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureVerifiedStudent
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->isVerifiedStudent()) {
            return response()->json(['message' => 'Verified student status is required.', 'code' => 'NIM_NOT_VERIFIED'], 403);
        }
        return $next($request);
    }
}

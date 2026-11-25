<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (! $request->user()?->hasActiveRole($role)) {
            return response()->json(['message' => 'Insufficient permissions.'], 403);
        }
        return $next($request);
    }
}

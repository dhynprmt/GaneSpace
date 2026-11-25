<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuditRecorder
{
    /** Only pass non-sensitive, explicitly selected fields. Never include tokens or uploaded file paths. */
    public function record(User $actor, Request $request, string $action, string $subjectType, ?int $subjectId, array $old = [], array $new = [], ?int $organizationId = null): void
    {
        DB::table('audit_logs')->insert([
            'actor_user_id' => $actor->id,
            'organization_id' => $organizationId,
            'action' => $action,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'old_values' => json_encode($old),
            'new_values' => json_encode($new),
            'ip_address' => $request->ip(),
            'user_agent' => mb_substr((string) $request->userAgent(), 0, 2000),
            'session_reference_hash' => $request->hasSession() && $request->session()->isStarted()
                ? hash('sha256', $request->session()->getId()) : null,
            'created_at' => now('UTC'),
        ]);
    }
}

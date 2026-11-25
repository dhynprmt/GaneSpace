<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\AssignRoleRequest;
use App\Models\User;
use App\Models\UserRole;
use App\Services\AuditRecorder;
use App\Services\RoleAssignmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoleAssignmentController extends Controller
{
    public function store(AssignRoleRequest $request, RoleAssignmentService $roles, AuditRecorder $audit): JsonResponse
    {
        $data = $request->validated();
        $assignment = DB::transaction(function () use ($request, $roles, $audit, $data) {
            $assignment = $roles->assign(User::findOrFail($data['user_id']), $data['role_slug'], $data['organization_id'] ?? null, $request->user());
            $audit->record($request->user(), $request, 'user.role.assign', UserRole::class, $assignment->id,
                [], ['user_id' => $assignment->user_id, 'role' => $data['role_slug'], 'organization_id' => $assignment->organization_id],
                $assignment->organization_id);
            return $assignment;
        }, 3);
        return response()->json(['message' => 'Role assigned.', 'data' => [
            'id' => $assignment->id, 'user_id' => $assignment->user_id,
            'role' => $data['role_slug'], 'organization_id' => $assignment->organization_id,
        ]], 201);
    }

    public function destroy(Request $request, UserRole $userRole, RoleAssignmentService $roles, AuditRecorder $audit): JsonResponse
    {
        $userRole->load('role');
        DB::transaction(function () use ($roles, $userRole, $request, $audit) {
            $roles->revoke($userRole, $request->user());
            $audit->record($request->user(), $request, 'user.role.revoke', UserRole::class, $userRole->id,
                ['user_id' => $userRole->user_id, 'role' => $userRole->role->slug, 'organization_id' => $userRole->organization_id],
                ['revoked' => true], $userRole->organization_id);
        }, 3);
        return response()->json(['message' => 'Role revoked.']);
    }
}

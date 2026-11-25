<?php

namespace App\Services;

use App\Models\Organization;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RoleAssignmentService
{
    public function assign(User $user, string $roleSlug, ?int $organizationId = null, ?User $actor = null): UserRole
    {
        return DB::transaction(function () use ($user, $roleSlug, $organizationId, $actor) {
            User::query()->whereKey($user->id)->lockForUpdate()->firstOrFail();
            $role = Role::query()->where('slug', $roleSlug)->firstOrFail();

            if ($roleSlug === 'student' && ! $user->studentProfile()->exists()) {
                throw ValidationException::withMessages(['role_slug' => ['Student role requires a student profile.']]);
            }

            if ($role->scope_type === 'organization') {
                if ($organizationId === null || ! Organization::query()->whereKey($organizationId)->where('is_active', true)->exists()) {
                    throw ValidationException::withMessages(['organization_id' => ['An active organization is required.']]);
                }
            } elseif ($organizationId !== null) {
                throw ValidationException::withMessages(['organization_id' => ['This role must not have an organization.']]);
            }

            $exists = UserRole::query()
                ->where('user_id', $user->id)->where('role_id', $role->id)
                ->where('organization_id', $organizationId)->whereNull('revoked_at')->exists();
            if ($exists) {
                throw ValidationException::withMessages(['role_slug' => ['The user already has this active assignment.']]);
            }

            return UserRole::create([
                'user_id' => $user->id, 'role_id' => $role->id,
                'organization_id' => $organizationId, 'assigned_by' => $actor?->id,
                'assigned_at' => now('UTC'),
            ]);
        }, 3);
    }

    public function revoke(UserRole $assignment, User $actor): void
    {
        DB::transaction(function () use ($assignment, $actor) {
            $assignment = UserRole::query()->with('role')->lockForUpdate()->findOrFail($assignment->id);
            if ($assignment->revoked_at !== null) {
                throw ValidationException::withMessages(['role' => ['This role assignment was already revoked.']]);
            }
            if ($assignment->role->slug === 'super_admin') {
                if ($assignment->user_id === $actor->id) {
                    throw ValidationException::withMessages(['role' => ['You cannot revoke your own Super Admin role.']]);
                }
                Role::query()->whereKey($assignment->role_id)->lockForUpdate()->firstOrFail();
                $activeMasters = UserRole::query()->where('role_id', $assignment->role_id)
                    ->whereNull('revoked_at')->count();
                if ($activeMasters <= 1) {
                    throw ValidationException::withMessages(['role' => ['At least one Super Admin must remain.']]);
                }
            }
            $assignment->update(['revoked_at' => now('UTC')]);
        }, 3);
    }
}

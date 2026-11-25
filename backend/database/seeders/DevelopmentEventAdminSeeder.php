<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class DevelopmentEventAdminSeeder extends Seeder
{
    use DevelopmentSeedGuard;

    public function run(): void
    {
        $this->assertDevelopmentSeedTarget();

        $superAdmin = User::query()->where('email', 'admin@example.test')->first();
        if (! $superAdmin || $superAdmin->account_status !== 'active' || ! $superAdmin->isSuperAdmin()) {
            throw new RuntimeException('Existing admin@example.test Super Admin was not found or does not have an active super_admin role. It will not be recreated.');
        }

        $organization = Organization::query()->where('slug', 'hmj-teknik-informatika')->first();
        $role = Role::query()->where('slug', 'event_admin')->first();
        if (! $organization || ! $role) {
            throw new RuntimeException('HMJ Teknik Informatika organization or event_admin role is missing.');
        }

        if (! $organization->is_active) {
            throw new RuntimeException('HMJ Teknik Informatika organization is inactive. No Event Admin account will be assigned.');
        }

        $email = 'hmjti@example.test';
        $name = 'Admin HMJ TI';

        DB::transaction(function () use ($superAdmin, $organization, $role, $email, $name): void {
            $user = User::withTrashed()->where('email', $email)->first();
            if ($user?->trashed()) {
                throw new RuntimeException("Account {$email} exists as a soft-deleted user. It was not recreated or modified.");
            }

            if (! $user) {
                $password = config('development_seed.event_admin_password');
                if (! is_string($password) || strlen($password) < 12) {
                    throw new RuntimeException('Set GANESPACE_DEMO_EVENT_ADMIN_PASSWORD in backend .env to a unique password of at least 12 characters before seeding.');
                }

                $user = new User();
                $user->name = $name;
                $user->email = $email;
                $user->password = Hash::make($password);
                $user->email_verified_at = now('UTC');
                $user->account_status = 'active';
                $user->save();

                UserRole::query()->create([
                    'user_id' => $user->id,
                    'role_id' => $role->id,
                    'organization_id' => $organization->id,
                    'assigned_by' => $superAdmin->id,
                    'assigned_at' => now('UTC'),
                    'revoked_at' => null,
                ]);

                return;
            }

            // Never reset an existing account or silently grant a privileged role to it.
            if ($user->name !== $name || $user->account_status !== 'active' || ! $user->hasVerifiedEmail()) {
                throw new RuntimeException("Account {$email} already exists but is not the expected active, email-verified development account. It was not modified.");
            }

            $activeAssignments = $user->roleAssignments()
                ->whereNull('revoked_at')
                ->with('role')
                ->get();

            $isExpectedAssignment = $activeAssignments->count() === 1
                && $activeAssignments->first()->role?->slug === 'event_admin'
                && (int) $activeAssignments->first()->organization_id === (int) $organization->id;

            if (! $isExpectedAssignment) {
                throw new RuntimeException("Account {$email} already exists but does not have exactly the expected HMJ TI Event Admin assignment. No role was granted or changed. Review the account manually.");
            }
        });
    }
}

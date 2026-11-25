<?php

namespace App\Policies;

use App\Models\Organization;
use App\Models\User;

class OrganizationPolicy
{
    public function create(User $user): bool { return $user->account_status === 'active' && $user->isSuperAdmin(); }
    public function update(User $user, Organization $organization): bool { return $this->create($user); }
    public function delete(User $user, Organization $organization): bool { return $this->create($user); }
    public function view(User $user, Organization $organization): bool { return $user->managesOrganization($organization->id); }
}

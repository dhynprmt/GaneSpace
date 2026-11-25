<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrganizationResource;
use App\Models\Organization;
use Illuminate\Http\Request;

class OrganizationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (! $user->isSuperAdmin() && ! $user->hasActiveRole('event_admin')) {
            abort(403, 'Event Admin or Super Admin access is required.');
        }

        $query = Organization::query()->where('is_active', true)->with(['parent', 'faculty']);

        if (! $user->isSuperAdmin()) {
            $organizationIds = $user->roleAssignments()
                ->whereNull('revoked_at')
                ->whereHas('role', fn ($q) => $q->where('slug', 'event_admin'))
                ->whereHas('organization', fn ($q) => $q->where('is_active', true))
                ->pluck('organization_id');

            $query->whereIn('id', $organizationIds);
        }

        return OrganizationResource::collection($query->orderBy('name')->get());
    }
}

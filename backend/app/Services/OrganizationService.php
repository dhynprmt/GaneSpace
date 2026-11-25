<?php

namespace App\Services;

use App\Models\Event;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrganizationService
{
    public function __construct(private readonly AuditRecorder $auditRecorder)
    {
    }

    public function create(array $data, User $actor, Request $request): Organization
    {
        $payload = $data;
        $payload['slug'] = $data['slug'] ?? $this->uniqueSlug($data['name']);
        $organization = Organization::create($payload);

        $this->auditRecorder->record(
            $actor, $request, 'organization.created', Organization::class, $organization->id,
            [], ['name' => $organization->name, 'slug' => $organization->slug, 'organization_type' => $organization->organization_type]
        );

        return $organization->load(['parent', 'faculty']);
    }

    public function update(Organization $organization, array $data, User $actor, Request $request): Organization
    {
        $old = ['name' => $organization->name, 'organization_type' => $organization->organization_type, 'is_active' => $organization->is_active];

        if (array_key_exists('parent_id', $data)) {
            $parentId = $data['parent_id'];
            if ($parentId !== null && ((int) $parentId === (int) $organization->id || $this->isDescendant($organization, (int) $parentId))) {
                throw ValidationException::withMessages(['parent_id' => 'An organization cannot be its own parent or a descendant of itself.']);
            }
        }

        $organization->fill($data);
        $organization->save();

        $this->auditRecorder->record(
            $actor, $request, 'organization.updated', Organization::class, $organization->id,
            $old, ['name' => $organization->name, 'organization_type' => $organization->organization_type, 'is_active' => $organization->is_active]
        );

        return $organization->load(['parent', 'faculty']);
    }

    public function delete(Organization $organization, User $actor, Request $request): void
    {
        $hasDependencies = Event::withTrashed()->where('organization_id', $organization->id)->exists()
            || $organization->roleAssignments()->exists()
            || $organization->children()->exists();

        if ($hasDependencies) {
            throw ValidationException::withMessages([
                'organization' => 'This organization has events, role history, or child organizations. Deactivate it instead of deleting it.',
            ]);
        }

        $snapshot = ['name' => $organization->name, 'slug' => $organization->slug];
        DB::transaction(fn () => $organization->delete());

        $this->auditRecorder->record(
            $actor, $request, 'organization.deleted', Organization::class, $organization->id,
            $snapshot, []
        );
    }

    private function isDescendant(Organization $organization, int $candidateId): bool
    {
        $cursor = Organization::find($candidateId);
        $visited = [];

        while ($cursor !== null) {
            if (isset($visited[$cursor->id])) {
                return true;
            }
            $visited[$cursor->id] = true;
            if ((int) $cursor->parent_id === (int) $organization->id) {
                return true;
            }
            $cursor = $cursor->parent_id ? Organization::find($cursor->parent_id) : null;
        }

        return false;
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'organization';
        $slug = $base;
        $suffix = 2;

        while (Organization::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $suffix++;
        }

        return $slug;
    }
}

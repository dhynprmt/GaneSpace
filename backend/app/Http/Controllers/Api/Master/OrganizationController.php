<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Organizations\StoreOrganizationRequest;
use App\Http\Requests\Organizations\UpdateOrganizationRequest;
use App\Http\Resources\OrganizationResource;
use App\Models\Organization;
use App\Services\OrganizationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class OrganizationController extends Controller
{
    public function __construct(private readonly OrganizationService $organizations)
    {
    }

    public function index(Request $request)
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'is_active' => ['nullable', 'boolean'],
            'organization_type' => ['nullable', 'string', 'max:40'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Organization::query()->with(['parent', 'faculty'])
            ->when(isset($filters['is_active']), fn ($q) => $q->where('is_active', $filters['is_active']))
            ->when($filters['organization_type'] ?? null, fn ($q, $type) => $q->where('organization_type', $type));

        if (! empty($filters['q'])) {
            $term = '%' . addcslashes($filters['q'], '%_') . '%';
            $query->where('name', 'like', $term);
        }

        return OrganizationResource::collection($query->orderBy('name')->paginate($filters['per_page'] ?? 20)->withQueryString());
    }

    public function store(StoreOrganizationRequest $request)
    {
        $data = $request->validated();
        if (! empty($data['parent_id'])) {
            abort_unless(Organization::whereKey($data['parent_id'])->where('is_active', true)->exists(), 422,
                'The selected parent organization is inactive.');
        }

        $organization = $this->organizations->create($data, $request->user(), $request);

        return (new OrganizationResource($organization))->response()->setStatusCode(201);
    }

    public function show(Organization $organization)
    {
        return new OrganizationResource($organization->load(['parent', 'faculty']));
    }

    public function update(UpdateOrganizationRequest $request, Organization $organization)
    {
        $data = $request->validated();

        if (array_key_exists('parent_id', $data) && $data['parent_id'] !== null) {
            abort_unless(Organization::whereKey($data['parent_id'])->where('is_active', true)->exists(), 422,
                'The selected parent organization is inactive.');
        }

        return new OrganizationResource($this->organizations->update($organization, $data, $request->user(), $request));
    }

    public function destroy(Request $request, Organization $organization)
    {
        Gate::authorize('delete', $organization);

        try {
            $this->organizations->delete($organization, $request->user(), $request);
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => 'Organization cannot be deleted.',
                'errors' => $exception->errors(),
            ], 409);
        }

        return response()->json(['message' => 'Organization deleted successfully.']);
    }
}

<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Events\StoreEventRequest;
use App\Http\Requests\Events\UpdateEventRequest;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Services\EventService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class EventController extends Controller
{
    public function __construct(private readonly EventService $events)
    {
    }

    public function index(Request $request)
    {
        $filters = $request->validate([
            'organization_id' => ['nullable', 'integer', 'exists:organizations,id'],
            'publication_status' => ['nullable', Rule::in(['draft', 'published', 'unpublished'])],
            'q' => ['nullable', 'string', 'max:120'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $user = $request->user();
        if (! $user->isSuperAdmin() && ! $user->hasActiveRole('event_admin')) {
            abort(403, 'Event Admin or Super Admin access is required.');
        }

        $query = Event::query()->with(['organization', 'eventType.category', 'media'])
            ->withCount(['registrations as active_registrations_count' => fn ($q) => $q->where('status', 'active')]);

        if (! $user->isSuperAdmin()) {
            $organizationIds = $user->roleAssignments()
                ->whereNull('revoked_at')
                ->whereHas('role', fn ($q) => $q->where('slug', 'event_admin'))
                ->whereHas('organization', fn ($q) => $q->where('is_active', true))
                ->pluck('organization_id');

            if (isset($filters['organization_id']) && ! $organizationIds->contains((int) $filters['organization_id'])) {
                abort(403, 'You are not assigned to this organization.');
            }

            $query->whereIn('organization_id', $organizationIds);
        }

        $query->when($filters['organization_id'] ?? null, fn ($q, $id) => $q->where('organization_id', $id))
            ->when($filters['publication_status'] ?? null, fn ($q, $status) => $q->where('publication_status', $status));

        if (! empty($filters['q'])) {
            $term = '%' . addcslashes($filters['q'], '%_') . '%';
            $query->where('title', 'like', $term);
        }

        return EventResource::collection(
            $query->orderByDesc('updated_at')->paginate($filters['per_page'] ?? 15)->withQueryString()
        );
    }

    public function store(StoreEventRequest $request)
    {
        $data = $request->validated();
        abort_unless($request->user()->managesOrganization((int) $data['organization_id']), 403,
            'You are not assigned to the selected organization.');

        $event = $this->events->create($data, $request->user(), $request);

        return (new EventResource($event))->response()->setStatusCode(201);
    }

    public function show(Event $event)
    {
        Gate::authorize('update', $event);

        $event->load(['organization', 'eventType.category', 'media'])
            ->loadCount(['registrations as active_registrations_count' => fn ($q) => $q->where('status', 'active')]);

        return new EventResource($event);
    }

    public function update(UpdateEventRequest $request, Event $event)
    {
        $data = $request->validated();
        abort_unless($request->user()->managesOrganization((int) $data['organization_id']), 403,
            'You are not assigned to the selected organization.');

        return new EventResource($this->events->update($event, $data, $request->user(), $request));
    }

    public function destroy(Request $request, Event $event)
    {
        Gate::authorize('delete', $event);
        try {
            $this->events->delete($event, $request->user(), $request);
        } catch (\Illuminate\Validation\ValidationException $exception) {
            return response()->json([
                'message' => 'Event cannot be archived.',
                'errors' => $exception->errors(),
            ], 409);
        }

        return response()->json(['message' => 'Event archived successfully.']);
    }

    public function publish(Request $request, Event $event)
    {
        Gate::authorize('publish', $event);

        return new EventResource($this->events->setPublication($event, 'published', $request->user(), $request));
    }

    public function unpublish(Request $request, Event $event)
    {
        Gate::authorize('publish', $event);

        return new EventResource($this->events->setPublication($event, 'unpublished', $request->user(), $request));
    }
}

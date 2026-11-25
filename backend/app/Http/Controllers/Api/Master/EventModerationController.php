<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Events\ModerateEventRequest;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Services\EventModerationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class EventModerationController extends Controller
{
    public function __construct(private readonly EventModerationService $moderation)
    {
    }

    public function index(Request $request)
    {
        $filters = $request->validate([
            'publication_status' => ['nullable', 'in:draft,published,unpublished'],
            'organization_id' => ['nullable', 'integer', 'exists:organizations,id'],
            'q' => ['nullable', 'string', 'max:120'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Event::query()->with(['organization', 'eventType.category', 'media'])
            ->withCount(['registrations as active_registrations_count' => fn ($q) => $q->where('status', 'active')])
            ->when($filters['publication_status'] ?? null, fn ($q, $status) => $q->where('publication_status', $status))
            ->when($filters['organization_id'] ?? null, fn ($q, $id) => $q->where('organization_id', $id));

        if (! empty($filters['q'])) {
            $term = '%' . addcslashes($filters['q'], '%_') . '%';
            $query->where('title', 'like', $term);
        }

        return EventResource::collection($query->orderByDesc('created_at')->paginate($filters['per_page'] ?? 20)->withQueryString());
    }

    public function moderate(ModerateEventRequest $request, Event $event)
    {
        Gate::authorize('moderate', $event);

        return new EventResource(
            $this->moderation->moderate(
                $event,
                $request->validated('action'),
                $request->validated('reason'),
                $request->user(),
                $request
            )
        );
    }

    public function logs(Event $event)
    {
        Gate::authorize('moderate', $event);

        return response()->json([
            'data' => $event->moderationLogs()
                ->with('moderator:id,name')
                ->orderByDesc('created_at')
                ->paginate(20)
                ->through(fn ($log) => [
                    'id' => $log->id,
                    'action' => $log->action,
                    'previous_publication_status' => $log->previous_publication_status,
                    'new_publication_status' => $log->new_publication_status,
                    'reason' => $log->reason,
                    'moderator' => $log->moderator ? [
                        'id' => $log->moderator->id,
                        'name' => $log->moderator->name,
                    ] : null,
                    'created_at' => $log->created_at?->timezone('Asia/Makassar')->toIso8601String(),
                ]),
        ]);
    }
}

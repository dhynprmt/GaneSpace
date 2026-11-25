<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\Event;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'category' => ['nullable', Rule::in(['academic', 'non-academic'])],
            'event_type' => ['nullable', 'string', 'max:100'],
            'organization' => ['nullable', 'string', 'max:180'],
            'location' => ['nullable', 'string', 'max:200'],
            'location_mode' => ['nullable', Rule::in(['onsite', 'online', 'hybrid'])],
            'period' => ['nullable', Rule::in(['upcoming', 'past', 'all'])],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        if (! empty($filters['from']) && ! empty($filters['to'])
            && Carbon::parse($filters['to'], 'Asia/Makassar')->lt(Carbon::parse($filters['from'], 'Asia/Makassar'))) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'to' => 'The to date must be on or after the from date.',
            ]);
        }

        $query = Event::query()
            ->where('publication_status', 'published')
            ->whereHas('organization', fn ($q) => $q->where('is_active', true))
            ->with(['organization', 'eventType.category', 'media'])
            ->withCount(['registrations as active_registrations_count' => fn ($q) => $q->where('status', 'active')]);

        if (! empty($filters['q'])) {
            $term = '%' . addcslashes($filters['q'], '%_') . '%';
            $query->where(fn ($q) => $q->where('title', 'like', $term)->orWhere('description', 'like', $term));
        }

        if (! empty($filters['category'])) {
            $query->whereHas('eventType.category', fn ($q) => $q->where('slug', $filters['category']));
        }

        if (! empty($filters['event_type'])) {
            $query->whereHas('eventType', fn ($q) => $q->where('slug', $filters['event_type']));
        }

        if (! empty($filters['organization'])) {
            $query->whereHas('organization', fn ($q) => $q->where('slug', $filters['organization'])->where('is_active', true));
        }

        if (! empty($filters['location'])) {
            $term = '%' . addcslashes($filters['location'], '%_') . '%';
            $query->where(fn ($q) => $q->where('venue_name', 'like', $term)->orWhere('venue_address', 'like', $term));
        }
        if (! empty($filters['location_mode'])) {
            $query->where('location_mode', $filters['location_mode']);
        }

        // Date filters are interpreted as WITA calendar dates, then converted to UTC.
        if (! empty($filters['from'])) {
            $fromUtc = Carbon::parse($filters['from'], 'Asia/Makassar')->startOfDay()->utc();
            $query->where('start_at', '>=', $fromUtc);
        }

        if (! empty($filters['to'])) {
            $toUtc = Carbon::parse($filters['to'], 'Asia/Makassar')->endOfDay()->utc();
            $query->where('start_at', '<=', $toUtc);
        }

        $period = $filters['period'] ?? 'upcoming';
        if ($period === 'upcoming') {
            $query->where('start_at', '>=', now('UTC'))->orderBy('start_at')->orderBy('id');
        } elseif ($period === 'past') {
            $query->where('start_at', '<', now('UTC'))->orderByDesc('start_at')->orderByDesc('id');
        } else {
            $query->orderBy('start_at')->orderBy('id');
        }

        return EventResource::collection($query->paginate($filters['per_page'] ?? 12)->withQueryString());
    }

    public function show(string $slug)
    {
        $event = Event::query()
            ->where('slug', $slug)
            ->where('publication_status', 'published')
            ->whereHas('organization', fn ($q) => $q->where('is_active', true))
            ->with(['organization', 'eventType.category', 'media'])
            ->withCount(['registrations as active_registrations_count' => fn ($q) => $q->where('status', 'active')])
            ->firstOrFail();

        return new EventResource($event);
    }
}

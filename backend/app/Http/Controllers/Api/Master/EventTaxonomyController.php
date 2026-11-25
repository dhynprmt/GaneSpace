<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Taxonomy\StoreEventTypeRequest;
use App\Http\Requests\Taxonomy\UpdateEventCategoryRequest;
use App\Http\Requests\Taxonomy\UpdateEventTypeRequest;
use App\Http\Resources\EventCategoryResource;
use App\Http\Resources\EventTypeResource;
use App\Models\Event;
use App\Models\EventCategory;
use App\Models\EventType;
use App\Services\AuditRecorder;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class EventTaxonomyController extends Controller
{
    public function categories()
    {
        return EventCategoryResource::collection(
            EventCategory::with('eventTypes')->orderBy('id')->get()
        );
    }

    public function updateCategory(UpdateEventCategoryRequest $request, EventCategory $eventCategory, AuditRecorder $audit)
    {
        $old = ['name' => $eventCategory->name];
        $eventCategory->name = $request->validated('name');
        $eventCategory->save();

        $audit->record($request->user(), $request, 'event_category.renamed', EventCategory::class, $eventCategory->id, $old, ['name' => $eventCategory->name]);

        return new EventCategoryResource($eventCategory->load('eventTypes'));
    }

    public function types(Request $request)
    {
        $filters = $request->validate([
            'category_id' => ['nullable', 'integer', 'exists:event_categories,id'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $query = EventType::with('category')
            ->when(isset($filters['category_id']), fn ($q) => $q->where('event_category_id', $filters['category_id']))
            ->when(isset($filters['is_active']), fn ($q) => $q->where('is_active', $filters['is_active']));

        return EventTypeResource::collection($query->orderBy('name')->paginate(30));
    }

    public function storeType(StoreEventTypeRequest $request, AuditRecorder $audit)
    {
        $data = $request->validated();
        $category = EventCategory::findOrFail($data['event_category_id']);
        $slug = $data['slug'] ?? Str::slug($data['name']);
        $base = $slug ?: 'event-type';
        $suffix = 2;
        while (EventType::where('event_category_id', $category->id)->where('slug', $slug)->exists()) {
            $slug = $base . '-' . $suffix++;
        }

        $type = EventType::create([
            'event_category_id' => $category->id,
            'name' => $data['name'],
            'slug' => $slug,
            'is_active' => $data['is_active'] ?? true,
        ]);

        $audit->record($request->user(), $request, 'event_type.created', EventType::class, $type->id,
            [], ['name' => $type->name, 'slug' => $type->slug, 'event_category_id' => $type->event_category_id]);

        return (new EventTypeResource($type->load('category')))->response()->setStatusCode(201);
    }

    public function updateType(UpdateEventTypeRequest $request, EventType $eventType, AuditRecorder $audit)
    {
        $old = ['name' => $eventType->name, 'is_active' => $eventType->is_active];
        $eventType->fill($request->validated());
        $eventType->save();

        $audit->record($request->user(), $request, 'event_type.updated', EventType::class, $eventType->id,
            $old, ['name' => $eventType->name, 'is_active' => $eventType->is_active]);

        return new EventTypeResource($eventType->load('category'));
    }

    public function destroyType(Request $request, EventType $eventType, AuditRecorder $audit)
    {
        if (Event::withTrashed()->where('event_type_id', $eventType->id)->exists()) {
            return response()->json([
                'message' => 'This event type is used by existing events. Deactivate it instead of deleting it.',
            ], 409);
        }

        $snapshot = ['name' => $eventType->name, 'slug' => $eventType->slug];
        DB::transaction(fn () => $eventType->delete());

        $audit->record($request->user(), $request, 'event_type.deleted', EventType::class, $eventType->id, $snapshot, []);

        return response()->json(['message' => 'Event type deleted successfully.']);
    }
}

<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventCategoryResource;
use App\Http\Resources\EventTypeResource;
use App\Models\EventCategory;
use App\Models\EventType;
use Illuminate\Http\Request;

class EventTaxonomyController extends Controller
{
    public function categories()
    {
        $categories = EventCategory::query()
            ->where('is_active', true)
            ->with(['eventTypes' => fn ($q) => $q->where('is_active', true)->orderBy('name')])
            ->orderBy('id')
            ->get();

        return EventCategoryResource::collection($categories);
    }

    public function types(Request $request)
    {
        $filters = $request->validate([
            'category' => ['nullable', 'string', 'max:40'],
        ]);

        $types = EventType::query()
            ->where('is_active', true)
            ->with('category')
            ->when($filters['category'] ?? null, fn ($q, $slug) =>
                $q->whereHas('category', fn ($category) => $category->where('slug', $slug)->where('is_active', true)))
            ->orderBy('name')
            ->get();

        return EventTypeResource::collection($types);
    }
}

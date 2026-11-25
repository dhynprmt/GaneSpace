<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventCategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'is_active' => (bool) $this->is_active,
            'event_types' => EventTypeResource::collection($this->whenLoaded('eventTypes')),
        ];
    }
}

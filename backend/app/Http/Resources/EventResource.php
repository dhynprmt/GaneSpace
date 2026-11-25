<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    private function wita($value): ?string
    {
        return $value ? $value->copy()->timezone('Asia/Makassar')->toIso8601String() : null;
    }

    private function registrationStatus(bool $academic): string
    {
        if ($this->cancelled_at !== null) {
            return 'cancelled';
        }

        if (! $academic) {
            return 'external';
        }

        $now = now('UTC');
        if ($this->registration_opens_at && $now->lt($this->registration_opens_at)) {
            return 'upcoming';
        }

        if ($now->gte($this->start_at) || ($this->registration_closes_at && $now->gt($this->registration_closes_at))) {
            return 'closed';
        }

        $activeCount = $this->getAttribute('active_registrations_count');
        if ($this->capacity !== null && $activeCount !== null && $activeCount >= $this->capacity) {
            return 'full';
        }

        return 'open';
    }

    public function toArray(Request $request): array
    {
        $categorySlug = $this->eventType?->category?->slug;
        $academic = $categorySlug === 'academic';

        $poster = null;
        $gallery = [];
        if ($this->relationLoaded('media')) {
            $posterModel = $this->media->firstWhere('media_kind', 'poster');
            $poster = $posterModel ? (new EventMediaResource($posterModel))->resolve() : null;
            $gallery = EventMediaResource::collection(
                $this->media->where('media_kind', 'gallery')->values()
            )->resolve();
        }

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'objectives' => $this->objectives,
            'topics' => $this->topics,
            'participant_requirements' => $this->participant_requirements,
            'category' => $this->whenLoaded('eventType', fn () => [
                'id' => $this->eventType?->category?->id,
                'slug' => $this->eventType?->category?->slug,
                'name' => $this->eventType?->category?->name,
            ]),
            'event_type' => $this->whenLoaded('eventType', fn () => [
                'id' => $this->eventType?->id,
                'slug' => $this->eventType?->slug,
                'name' => $this->eventType?->name,
            ]),
            'organization' => $this->whenLoaded('organization', fn () => [
                'id' => $this->organization?->id,
                'name' => $this->organization?->name,
                'slug' => $this->organization?->slug,
                'organization_type' => $this->organization?->organization_type,
            ]),
            'schedule' => [
                'start_at' => $this->wita($this->start_at),
                'end_at' => $this->wita($this->end_at),
            ],
            'location' => [
                'mode' => $this->location_mode,
                'venue_name' => $this->venue_name,
                'venue_address' => $this->venue_address,
            ],
            'registration' => [
                'method' => $academic ? 'internal' : 'external',
                'status' => $this->registrationStatus($academic),
                'capacity' => $academic ? $this->capacity : null,
                'active_count' => $academic ? $this->getAttribute('active_registrations_count') : null,
                'opens_at' => $academic ? $this->wita($this->registration_opens_at) : null,
                'closes_at' => $academic ? $this->wita($this->registration_closes_at) : null,
                'external_url' => $academic ? null : $this->external_registration_url,
            ],
            'contact' => [
                'name' => $this->contact_name,
                'email' => $this->contact_email,
                'phone' => $this->contact_phone,
            ],
            'publication_status' => $this->publication_status,
            'published_at' => $this->wita($this->published_at),
            'cancelled' => $this->cancelled_at !== null,
            'cancellation' => $this->cancelled_at ? [
                'cancelled_at' => $this->wita($this->cancelled_at),
                'reason' => $this->cancellation_reason,
            ] : null,
            'poster' => $poster,
            'gallery' => $gallery,
            'created_at' => $this->wita($this->created_at),
            'updated_at' => $this->wita($this->updated_at),
            // meeting_url_encrypted is intentionally never included in this resource.
        ];
    }
}

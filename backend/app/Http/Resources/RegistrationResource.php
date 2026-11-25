<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RegistrationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $snapshot = $this->event_snapshot;
        $person = $this->participant_snapshot;
        return [
            'id' => $this->id, 'registration_code' => $this->registration_code,
            'event_id' => $this->event_id, 'event_title' => $snapshot['title'] ?? '',
            'event_slug' => $snapshot['slug'] ?? '', 'organizer' => $snapshot['organizer'] ?? '',
            'start_datetime' => $snapshot['start_at'] ?? null, 'end_datetime' => $snapshot['end_at'] ?? null,
            'location' => $snapshot['location'] ?? '', 'event_category' => 'Akademik',
            'name' => $person['name'] ?? '', 'nim' => $person['nim'] ?? '', 'study_program' => $person['study_program'] ?? '',
            'registered_at' => $this->registered_at, 'cancelled_at' => $this->cancelled_at, 'status' => $this->status,
            'can_cancel' => $this->status === 'active' && $this->event?->start_at?->isFuture()
                && $request->user()?->can('cancel', $this->resource),
        ];
    }
}

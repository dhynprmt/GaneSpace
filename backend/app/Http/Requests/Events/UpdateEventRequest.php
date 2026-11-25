<?php

namespace App\Http\Requests\Events;

use App\Models\Event;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        $event = $this->route('event');

        return $event instanceof Event
            && ($this->user()?->can('update', $event) ?? false);
    }

    // PUT replaces editable event details.
    // Public slug remains immutable.
    public function rules(): array
    {
        return [
            'organization_id' => [
                'required',
                'integer',
                Rule::exists('organizations', 'id')->where('is_active', true),
            ],
            'event_type_id' => [
                'required',
                'integer',
                Rule::exists('event_types', 'id')->where('is_active', true),
            ],

            'title' => ['required', 'string', 'max:220'],
            'description' => ['required', 'string'],

            'objectives' => ['nullable', 'string'],
            'topics' => ['nullable', 'string'],
            'participant_requirements' => ['nullable', 'string'],

            'start_at' => ['required', 'date'],
            'end_at' => ['required', 'date', 'after:start_at'],

            'location_mode' => [
                'required',
                Rule::in(['onsite', 'online', 'hybrid']),
            ],

            'venue_name' => ['nullable', 'string', 'max:200'],
            'venue_address' => ['nullable', 'string'],
            'meeting_url' => ['nullable', 'url', 'max:2048'],

            'capacity' => ['nullable', 'integer', 'min:1'],

            'registration_opens_at' => ['nullable', 'date'],
            'registration_closes_at' => ['nullable', 'date'],

            'external_registration_url' => ['nullable', 'url', 'max:2048'],
            'contact_name' => ['nullable', 'string', 'max:160'],
            'contact_email' => ['nullable', 'email', 'max:254'],
            'contact_phone' => ['nullable', 'string', 'max:40'],
        ];
    }
}
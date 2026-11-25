<?php

namespace App\Http\Requests\Events;

use App\Models\Event;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEventMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        $event = $this->route('event');
        return $event instanceof Event && ($this->user()?->can('update', $event) ?? false);
    }

    public function rules(): array
    {
        return [
            'media_kind' => ['required', Rule::in(['poster', 'gallery'])],
            'file' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'alt_text' => ['nullable', 'string', 'max:220'],
        ];
    }
}

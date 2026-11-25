<?php

namespace App\Http\Requests\Taxonomy;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEventTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isSuperAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'event_category_id' => ['required', 'integer', Rule::exists('event_categories', 'id')->where('is_active', true)],
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:100', 'alpha_dash', Rule::unique('event_types', 'slug')->where('event_category_id', $this->input('event_category_id'))],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}

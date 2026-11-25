<?php

namespace App\Http\Requests\Events;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ModerateEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isSuperAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'action' => ['required', Rule::in(['flag', 'unpublish', 'restore', 'cancel'])],
            'reason' => ['required', 'string', 'min:5', 'max:5000'],
        ];
    }
}

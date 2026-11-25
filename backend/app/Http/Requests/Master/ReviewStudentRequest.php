<?php

namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReviewStudentRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->isSuperAdmin() ?? false; }
    public function rules(): array
    {
        return [
            'status' => ['required',Rule::in(['verified','rejected','manual_review'])],
            'reason' => ['nullable','string','max:2000',Rule::requiredIf(fn () => in_array($this->input('status'), ['rejected','manual_review'], true))],
        ];
    }
}

<?php

namespace App\Http\Requests\Me;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ResubmitStudentProfileRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->hasActiveRole('student') ?? false; }
    public function rules(): array
    {
        return [
            'nim' => ['sometimes','required','string','max:30','regex:/^[0-9A-Za-z]+$/', Rule::unique('student_profiles','nim')->ignore($this->user()?->studentProfile?->id)],
            'study_program_id' => ['sometimes','required','integer', Rule::exists('study_programs','id')->where('is_active', true)],
            'ktm' => ['sometimes','required','file','mimes:jpeg,jpg,png,pdf','max:4096'],
        ];
    }
}

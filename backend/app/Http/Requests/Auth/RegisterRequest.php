<?php

namespace App\Http\Requests\Auth;

use App\Services\StudentPhotoService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:160'],
            'email' => ['required', 'email:rfc', 'max:254', Rule::unique('users', 'email')],
            'password' => ['required', 'confirmed', Password::min(10)->letters()->numbers()],
            'nim' => ['required', 'string', 'max:30', 'regex:/^[0-9A-Za-z]+$/', Rule::unique('student_profiles', 'nim')],
            'faculty_id' => ['required', 'integer', Rule::exists('faculties', 'id')->where('is_active', true)],
            'department_id' => ['required', 'integer', Rule::exists('departments', 'id')->where('faculty_id', $this->input('faculty_id'))->where('is_active', true)],
            'study_program_id' => ['required', 'integer', Rule::exists('study_programs', 'id')->where('department_id', $this->input('department_id'))->where('is_active', true)],
            'profile_photo' => ['sometimes', ...StudentPhotoService::rules()],
            'ktm' => ['required', 'file', 'mimes:jpeg,jpg,png,pdf', 'max:4096'],
            'turnstile_token' => ['required', 'string', 'max:2048'],
        ];
    }
}

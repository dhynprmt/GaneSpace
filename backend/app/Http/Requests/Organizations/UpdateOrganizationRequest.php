<?php

namespace App\Http\Requests\Organizations;

use App\Models\Organization;
use Illuminate\Foundation\Http\FormRequest;

class UpdateOrganizationRequest extends FormRequest
{
    public function authorize(): bool
    {
        $organization = $this->route('organization');
        return $organization instanceof Organization && ($this->user()?->can('update', $organization) ?? false);
    }

    public function rules(): array
    {
        return [
            'parent_id' => ['sometimes', 'nullable', 'integer', 'exists:organizations,id'],
            'faculty_id' => ['sometimes', 'nullable', 'integer', 'exists:faculties,id'],
            'name' => ['sometimes', 'required', 'string', 'max:160'],
            // Organization slugs are stable once created; do not change public references.
            'organization_type' => ['sometimes', 'required', 'string', 'max:40', 'regex:/^[a-z0-9_-]+$/'],
            'contact_email' => ['sometimes', 'nullable', 'email', 'max:254'],
            'contact_phone' => ['sometimes', 'nullable', 'string', 'max:40'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}

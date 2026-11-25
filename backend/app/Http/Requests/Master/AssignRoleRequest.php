<?php

namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignRoleRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->isSuperAdmin() ?? false; }
    public function rules(): array
    {
        return [
            'user_id' => ['required','integer',Rule::exists('users','id')->where('account_status','active')->whereNull('deleted_at')],
            'role_slug' => ['required',Rule::in(['student','event_admin','super_admin'])],
            'organization_id' => ['nullable','integer',Rule::exists('organizations','id')->where('is_active',true)],
        ];
    }
}

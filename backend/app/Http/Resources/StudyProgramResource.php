<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudyProgramResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'department_id' => $this->department_id,
            'code' => $this->code,
            'name' => $this->name,
            'degree_level' => $this->degree_level,
            'is_active' => (bool) $this->is_active,
            'department' => $this->whenLoaded('department', fn () => $this->department ? [
                'id' => $this->department->id,
                'name' => $this->department->name,
                'faculty' => $this->department->faculty?->name,
            ] : null),
        ];
    }
}

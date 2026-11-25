<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\DepartmentResource;
use App\Http\Resources\FacultyResource;
use App\Http\Resources\StudyProgramResource;
use App\Models\Department;
use App\Models\Faculty;

class CampusDirectoryController extends Controller
{
    public function faculties()
    {
        return FacultyResource::collection(Faculty::where('is_active', true)->orderBy('name')->get());
    }

    public function departments(Faculty $faculty)
    {
        abort_unless($faculty->is_active, 404);

        return DepartmentResource::collection(
            $faculty->departments()->where('is_active', true)->orderBy('name')->get()
        );
    }

    public function studyPrograms(Department $department)
    {
        abort_unless($department->is_active && $department->faculty?->is_active, 404);

        return StudyProgramResource::collection(
            $department->studyPrograms()->where('is_active', true)->orderBy('name')->get()
        );
    }
}

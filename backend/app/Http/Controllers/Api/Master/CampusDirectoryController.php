<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Http\Resources\DepartmentResource;
use App\Http\Resources\FacultyResource;
use App\Http\Resources\StudyProgramResource;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\StudyProgram;
use App\Services\AuditRecorder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CampusDirectoryController extends Controller
{
    public function faculties(Request $request)
    {
        return FacultyResource::collection(Faculty::orderBy('name')->paginate(50));
    }

    public function storeFaculty(Request $request, AuditRecorder $audit)
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:30', 'unique:faculties,code'],
            'name' => ['required', 'string', 'max:160'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $faculty = Faculty::create($data);
        $audit->record($request->user(), $request, 'faculty.created', Faculty::class, $faculty->id, [], ['code' => $faculty->code, 'name' => $faculty->name]);

        return (new FacultyResource($faculty))->response()->setStatusCode(201);
    }

    public function updateFaculty(Request $request, Faculty $faculty, AuditRecorder $audit)
    {
        $data = $request->validate([
            'code' => ['sometimes', 'required', 'string', 'max:30', Rule::unique('faculties', 'code')->ignore($faculty->id)],
            'name' => ['sometimes', 'required', 'string', 'max:160'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $old = ['code' => $faculty->code, 'name' => $faculty->name, 'is_active' => $faculty->is_active];
        $faculty->fill($data)->save();
        $audit->record($request->user(), $request, 'faculty.updated', Faculty::class, $faculty->id, $old, $data);

        return new FacultyResource($faculty);
    }

    public function departments(Request $request)
    {
        $filters = $request->validate(['faculty_id' => ['nullable', 'integer', 'exists:faculties,id']]);
        $query = Department::with('faculty')
            ->when(isset($filters['faculty_id']), fn ($q) => $q->where('faculty_id', $filters['faculty_id']));

        return DepartmentResource::collection($query->orderBy('name')->paginate(50));
    }

    public function storeDepartment(Request $request, AuditRecorder $audit)
    {
        $data = $request->validate([
            'faculty_id' => ['required', 'integer', Rule::exists('faculties', 'id')->where('is_active', true)],
            'code' => ['required', 'string', 'max:30'],
            'name' => ['required', 'string', 'max:160'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        validator($data, ['code' => [Rule::unique('departments', 'code')->where('faculty_id', $data['faculty_id'])]])->validate();

        $department = Department::create($data);
        $audit->record($request->user(), $request, 'department.created', Department::class, $department->id, [], ['faculty_id' => $department->faculty_id, 'code' => $department->code, 'name' => $department->name]);

        return (new DepartmentResource($department->load('faculty')))->response()->setStatusCode(201);
    }

    public function updateDepartment(Request $request, Department $department, AuditRecorder $audit)
    {
        $data = $request->validate([
            'faculty_id' => ['sometimes', 'required', 'integer', Rule::exists('faculties', 'id')->where('is_active', true)],
            'code' => ['sometimes', 'required', 'string', 'max:30'],
            'name' => ['sometimes', 'required', 'string', 'max:160'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $facultyId = $data['faculty_id'] ?? $department->faculty_id;
        if (array_key_exists('code', $data)) {
            validator(['code' => $data['code']], [
                'code' => [Rule::unique('departments', 'code')->where('faculty_id', $facultyId)->ignore($department->id)],
            ])->validate();
        }

        if (isset($data['faculty_id']) && (int) $data['faculty_id'] !== (int) $department->faculty_id
            && $department->studyPrograms()->whereHas('studentProfiles')->exists()) {
            return response()->json(['message' => 'This department cannot be moved because student profiles depend on its study programs.'], 409);
        }

        $old = ['faculty_id' => $department->faculty_id, 'code' => $department->code, 'name' => $department->name, 'is_active' => $department->is_active];
        $department->fill($data)->save();
        $audit->record($request->user(), $request, 'department.updated', Department::class, $department->id, $old, $data);

        return new DepartmentResource($department->load('faculty'));
    }

    public function studyPrograms(Request $request)
    {
        $filters = $request->validate(['department_id' => ['nullable', 'integer', 'exists:departments,id']]);
        $query = StudyProgram::with('department.faculty')
            ->when(isset($filters['department_id']), fn ($q) => $q->where('department_id', $filters['department_id']));

        return StudyProgramResource::collection($query->orderBy('name')->paginate(50));
    }

    public function storeStudyProgram(Request $request, AuditRecorder $audit)
    {
        $data = $request->validate([
            'department_id' => ['required', 'integer', Rule::exists('departments', 'id')->where('is_active', true)],
            'code' => ['required', 'string', 'max:30'],
            'name' => ['required', 'string', 'max:160'],
            'degree_level' => ['nullable', 'string', 'max:30'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        validator($data, ['code' => [Rule::unique('study_programs', 'code')->where('department_id', $data['department_id'])]])->validate();

        $program = StudyProgram::create($data);
        $audit->record($request->user(), $request, 'study_program.created', StudyProgram::class, $program->id, [], ['department_id' => $program->department_id, 'code' => $program->code, 'name' => $program->name]);

        return (new StudyProgramResource($program->load('department.faculty')))->response()->setStatusCode(201);
    }

    public function updateStudyProgram(Request $request, StudyProgram $studyProgram, AuditRecorder $audit)
    {
        $data = $request->validate([
            'department_id' => ['sometimes', 'required', 'integer', Rule::exists('departments', 'id')->where('is_active', true)],
            'code' => ['sometimes', 'required', 'string', 'max:30'],
            'name' => ['sometimes', 'required', 'string', 'max:160'],
            'degree_level' => ['sometimes', 'nullable', 'string', 'max:30'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $departmentId = $data['department_id'] ?? $studyProgram->department_id;
        if (array_key_exists('code', $data)) {
            validator(['code' => $data['code']], [
                'code' => [Rule::unique('study_programs', 'code')->where('department_id', $departmentId)->ignore($studyProgram->id)],
            ])->validate();
        }

        if (isset($data['department_id']) && (int) $data['department_id'] !== (int) $studyProgram->department_id
            && $studyProgram->studentProfiles()->exists()) {
            return response()->json(['message' => 'This study program cannot be moved because student profiles depend on it.'], 409);
        }

        $old = ['department_id' => $studyProgram->department_id, 'code' => $studyProgram->code, 'name' => $studyProgram->name, 'degree_level' => $studyProgram->degree_level, 'is_active' => $studyProgram->is_active];
        $studyProgram->fill($data)->save();
        $audit->record($request->user(), $request, 'study_program.updated', StudyProgram::class, $studyProgram->id, $old, $data);

        return new StudyProgramResource($studyProgram->load('department.faculty'));
    }
}

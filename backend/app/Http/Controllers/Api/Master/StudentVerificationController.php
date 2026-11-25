<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\ReviewStudentRequest;
use App\Models\StudentProfile;
use App\Services\AuditRecorder;
use App\Services\StudentVerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class StudentVerificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'status' => ['sometimes','in:pending,verified,rejected,manual_review'],
            'per_page' => ['sometimes','integer','min:1','max:100'],
        ]);
        $profiles = StudentProfile::query()
            ->with('user:id,name,email', 'studyProgram.department.faculty', 'reviewer:id,name')
            ->when(isset($data['status']), fn ($q) => $q->where('verification_status', $data['status']))
            ->orderByDesc('verification_requested_at')
            ->paginate($data['per_page'] ?? 15);
        return response()->json($profiles->through(fn ($p) => $this->formatProfile($p)));
    }

    public function show(StudentProfile $studentProfile): JsonResponse
    {
        return response()->json(['data' => $this->formatProfile(
            $studentProfile->load('user:id,name,email', 'studyProgram.department.faculty', 'reviewer:id,name')
        )]);
    }

    public function update(ReviewStudentRequest $request, StudentProfile $studentProfile, StudentVerificationService $service, AuditRecorder $audit): JsonResponse
    {
        $updated = DB::transaction(function () use ($request, $studentProfile, $service, $audit) {
            $oldStatus = $studentProfile->verification_status;
            $updated = $service->review($studentProfile, $request->user(), $request->validated('status'), $request->validated('reason'));
            $audit->record($request->user(), $request, 'student.verification.review', StudentProfile::class,
                $updated->id, ['status' => $oldStatus], ['status' => $updated->verification_status]);
            return $updated;
        }, 3);
        return response()->json(['message' => 'Verification updated.', 'data' => $this->formatProfile(
            $updated->load('user:id,name,email', 'studyProgram.department.faculty', 'reviewer:id,name')
        )]);
    }

    public function ktm(StudentProfile $studentProfile)
    {
        abort_unless($studentProfile->ktm_private_path, 404);
        abort_unless(Storage::disk('local')->exists($studentProfile->ktm_private_path), 404);
        return Storage::disk('local')->download($studentProfile->ktm_private_path,
            'student-proof.' . pathinfo($studentProfile->ktm_private_path, PATHINFO_EXTENSION));
    }

    private function formatProfile(StudentProfile $p): array
    {
        return [
            'id' => $p->id,
            'student' => ['id' => $p->user_id, 'name' => $p->user?->name, 'email' => $p->user?->email],
            'nim' => $p->nim,
            'study_program' => $p->studyProgram?->name,
            'department' => $p->studyProgram?->department?->name,
            'faculty' => $p->studyProgram?->department?->faculty?->name,
            'status' => $p->verification_status,
            'reason' => $p->verification_note,
            'has_ktm' => (bool) $p->ktm_private_path,
            'requested_at' => $p->verification_requested_at,
            'reviewer' => $p->reviewer?->name,
            'verified_at' => $p->verified_at,
        ];
    }
}

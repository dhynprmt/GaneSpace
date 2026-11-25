<?php

namespace App\Http\Controllers\Api\Me;

use App\Http\Controllers\Controller;
use App\Http\Resources\RegistrationResource;
use App\Models\Event;
use App\Models\Registration;
use App\Services\AcademicRegistrationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AcademicRegistrationController extends Controller
{
    public function store(Request $request, Event $event, AcademicRegistrationService $service)
    {
        $record = $service->register($request->user(), $event);
        return (new RegistrationResource($record))->additional([
            'message' => 'Pendaftaran berhasil.', 'registration_id' => $record->id,
        ])->response()->setStatusCode(201);
    }

    public function index(Request $request)
    {
        $filter = $request->validate(['status' => 'sometimes|in:active,cancelled']);
        return RegistrationResource::collection($request->user()->registrations()->with('event')
            ->when(isset($filter['status']), fn ($q) => $q->where('status', $filter['status']))
            ->latest('id')->paginate(50));
    }

    public function show(Request $request, Registration $registration)
    {
        abort_unless($registration->student_user_id === $request->user()->id, 404);
        return (new RegistrationResource($registration))->additional([
            'verification_url' => app(\App\Services\RegistrationReceiptService::class)->verificationUrl($registration),
        ]);
    }

    public function cancel(Request $request, Registration $registration, AcademicRegistrationService $service)
    {
        abort_unless($registration->student_user_id === $request->user()->id, 404);
        $service->cancel($request->user(), $registration);
        return response()->json(['message' => 'Pendaftaran dibatalkan.']);
    }

    public function participants(Request $request, Event $event)
    {
        Gate::authorize('viewParticipants', $event);
        $filter = $request->validate(['status' => 'sometimes|in:active,cancelled', 'search' => 'nullable|string|max:120']);
        $rows = $event->registrations()->with('event')
            ->when(isset($filter['status']), fn ($q) => $q->where('status', $filter['status']))
            ->when(filled($filter['search'] ?? null), fn ($q) => $q->where(function ($q) use ($filter) {
                foreach (['name', 'nim', 'study_program'] as $key) {
                    $q->orWhere("participant_snapshot->$key", 'like', '%'.$filter['search'].'%');
                }
            }))->latest('id')->paginate(50);
        return RegistrationResource::collection($rows);
    }
}

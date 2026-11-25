<?php

namespace App\Http\Controllers\Api\Events;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class MeetingLinkController extends Controller
{
    public function show(Event $event): JsonResponse
    {
        // Authorize BEFORE reading the encrypted attribute.
        Gate::authorize('viewMeetingLink', $event);

        $meetingUrl = $event->meeting_url_encrypted;
        abort_if(blank($meetingUrl), 404, 'No private meeting link is available for this event.');

        return response()->json([
            'data' => ['meeting_url' => $meetingUrl],
        ])->header('Cache-Control', 'private, no-store, no-cache, must-revalidate')
          ->header('Pragma', 'no-cache')
          ->header('Vary', 'Cookie, Authorization');
    }
}

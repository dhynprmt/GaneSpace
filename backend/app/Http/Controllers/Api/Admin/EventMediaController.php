<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Events\StoreEventMediaRequest;
use App\Http\Resources\EventMediaResource;
use App\Models\Event;
use App\Models\EventMedia;
use App\Services\EventMediaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class EventMediaController extends Controller
{
    public function __construct(private readonly EventMediaService $media)
    {
    }

    public function store(StoreEventMediaRequest $request, Event $event)
    {
        $media = $this->media->store(
            $event,
            $request->file('file'),
            $request->validated('media_kind'),
            $request->validated('alt_text'),
            $request->user(),
            $request
        );

        return (new EventMediaResource($media))->response()->setStatusCode(201);
    }

    public function destroy(Request $request, Event $event, EventMedia $media)
    {
        Gate::authorize('update', $event);
        $this->media->delete($event, $media, $request->user(), $request);

        return response()->json(['message' => 'Event media deleted successfully.']);
    }
}

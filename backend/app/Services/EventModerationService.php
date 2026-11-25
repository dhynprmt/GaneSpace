<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventModerationLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EventModerationService
{
    public function __construct(private readonly AuditRecorder $auditRecorder)
    {
    }

    public function moderate(Event $event, string $action, string $reason, User $moderator, Request $request): Event
    {
        $oldStatus = DB::transaction(function () use ($event, $action, $reason, $moderator) {
            $locked = Event::query()->lockForUpdate()->findOrFail($event->id);

            $previous = $locked->publication_status;
            if ($action === 'cancel' && $locked->cancelled_at !== null) {
                throw ValidationException::withMessages(['action' => 'This event is already cancelled.']);
            }

            if ($action === 'restore' && $locked->publication_status === 'published' && $locked->cancelled_at === null) {
                throw ValidationException::withMessages(['action' => 'This event is already published and active.']);
            }

            switch ($action) {
                case 'unpublish':
                    $locked->publication_status = 'unpublished';
                    break;
                case 'restore':
                    $locked->publication_status = 'published';
                    $locked->published_at ??= now('UTC');
                    $locked->cancelled_at = null;
                    $locked->cancelled_by = null;
                    $locked->cancellation_reason = null;
                    break;
                case 'cancel':
                    app(StudentNoticeService::class)->participants($locked, 'event_cancelled', (string) \Illuminate\Support\Str::uuid());
                    $locked->registrations()->where('status', 'active')->update([
                        'status' => 'cancelled', 'cancelled_at' => now('UTC'), 'cancelled_by' => $moderator->id,
                        'cancellation_source' => 'master', 'cancellation_reason' => $reason,
                    ]);
                    $locked->cancelled_at = now('UTC');
                    $locked->cancelled_by = $moderator->id;
                    $locked->cancellation_reason = $reason;
                    break;
                case 'flag':
                    // A flag is an immutable moderation record; it does not change public visibility.
                    break;
            }

            $locked->updated_by = $moderator->id;
            $locked->save();

            EventModerationLog::create([
                'event_id' => $locked->id,
                'moderator_user_id' => $moderator->id,
                'action' => $action,
                'previous_publication_status' => $previous,
                'new_publication_status' => $locked->publication_status,
                'reason' => $reason,
                'created_at' => now('UTC'),
            ]);
            return $previous;
        }, 3);

        $event->refresh();
        $this->auditRecorder->record(
            $moderator, $request, 'event.moderated', Event::class, $event->id,
            ['publication_status' => $oldStatus],
            ['action' => $action, 'publication_status' => $event->publication_status, 'cancelled' => $event->cancelled_at !== null],
            $event->organization_id
        );

        return $event->load(['organization', 'eventType.category', 'media'])
            ->loadCount(['registrations as active_registrations_count' => fn ($q) => $q->where('status', 'active')]);
    }
}

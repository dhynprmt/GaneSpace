<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class EventService
{
    public function __construct(private readonly AuditRecorder $auditRecorder)
    {
    }

    public function create(array $data, User $actor, Request $request): Event
    {
        $type = EventType::with('category')->findOrFail($data['event_type_id']);
        $payload = $this->normalize($data, $type);
        $payload['slug'] = $this->uniqueSlug($data['title']);
        $payload['created_by'] = $actor->id;
        $payload['publication_status'] = 'draft';

        $event = DB::transaction(fn () => Event::create($payload));

        $this->auditRecorder->record(
            $actor, $request, 'event.created', Event::class, $event->id,
            [], $this->auditSnapshot($event), $event->organization_id
        );

        return $event->load(['organization', 'eventType.category', 'media'])
            ->loadCount(['registrations as active_registrations_count' => fn ($q) => $q->where('status', 'active')]);
    }

    public function update(Event $event, array $data, User $actor, Request $request): Event
    {
        $type = EventType::with('category')->findOrFail($data['event_type_id']);
        $old = $this->auditSnapshot($event);
        $payload = $this->normalize($data, $type);
        $payload['updated_by'] = $actor->id;

        DB::transaction(function () use ($event, $payload, $type, $actor): void {
            $locked = Event::query()->lockForUpdate()->findOrFail($event->id);
            abort_unless($actor->can('update', $locked) && $actor->managesOrganization($payload['organization_id']), 403);
            if ($locked->eventType?->category?->slug !== $type->category?->slug && $locked->registrations()->exists()) {
                throw ValidationException::withMessages(['event_type_id' => 'Event category cannot change after registration.']);
            }
            if ($payload['capacity'] !== null && $payload['capacity'] < $locked->registrations()->where('status', 'active')->count()) {
                throw ValidationException::withMessages(['capacity' => 'Capacity is lower than the active registration count.']);
            }
            if ($locked->meeting_url_encrypted === $payload['meeting_url_encrypted']) {
                unset($payload['meeting_url_encrypted']);
            }
            $locked->fill($payload);
            $notify = count(array_diff(array_keys($locked->getDirty()), ['updated_by'])) > 0;
            $locked->save();
            if ($notify) {
                app(StudentNoticeService::class)->participants($locked, 'schedule_change', (string) Str::uuid());
            }
        }, 3);

        $event->refresh();
        $this->auditRecorder->record(
            $actor, $request, 'event.updated', Event::class, $event->id,
            $old, $this->auditSnapshot($event), $event->organization_id
        );

        return $event->load(['organization', 'eventType.category', 'media'])
            ->loadCount(['registrations as active_registrations_count' => fn ($q) => $q->where('status', 'active')]);
    }

    public function setPublication(Event $event, string $status, User $actor, Request $request): Event
    {
        $oldStatus = DB::transaction(function () use ($event, $status, $actor) {
            $locked = Event::lockForUpdate()->findOrFail($event->id);
            abort_unless($actor->can('publish', $locked), 403);
            $previous = $locked->publication_status;
            $locked->publication_status = $status;
            if ($status === 'published' && $locked->published_at === null) {
                $locked->published_at = now('UTC');
            }
            $locked->updated_by = $actor->id;
            $locked->save();
            return $previous;
        }, 3);
        $event->refresh();

        $this->auditRecorder->record(
            $actor, $request, 'event.publication_changed', Event::class, $event->id,
            ['publication_status' => $oldStatus],
            ['publication_status' => $status],
            $event->organization_id
        );

        return $event->load(['organization', 'eventType.category', 'media'])
            ->loadCount(['registrations as active_registrations_count' => fn ($q) => $q->where('status', 'active')]);
    }

    public function delete(Event $event, User $actor, Request $request): void
    {
        $snapshot = $this->auditSnapshot($event);
        DB::transaction(function () use ($event, $actor) {
            $locked = Event::lockForUpdate()->findOrFail($event->id);
            abort_unless($actor->can('delete', $locked), 403);
            if ($locked->registrations()->exists()) {
                throw ValidationException::withMessages(['event' => 'Archive unavailable for events with registration history.']);
            }
            $locked->delete();
        });
        $this->auditRecorder->record(
            $actor, $request, 'event.archived', Event::class, $event->id,
            $snapshot, ['deleted' => true], $event->organization_id
        );
    }

    private function normalize(array $data, EventType $type): array
    {
        $academic = $type->category?->slug === 'academic';
        $fields = [
            'organization_id', 'event_type_id', 'title', 'description', 'objectives',
            'topics', 'participant_requirements', 'location_mode', 'venue_name',
            'venue_address', 'capacity', 'external_registration_url', 'contact_name',
            'contact_email', 'contact_phone',
        ];
        $payload = Arr::only($data, $fields);

        $payload['start_at'] = $this->toUtc($data['start_at']);
        $payload['end_at'] = $this->toUtc($data['end_at']);
        $payload['registration_opens_at'] = $academic ? $this->toUtc($data['registration_opens_at'] ?? null) : null;
        $payload['registration_closes_at'] = $academic ? $this->toUtc($data['registration_closes_at'] ?? null) : null;
        $payload['capacity'] = $academic ? ($data['capacity'] ?? null) : null;
        $payload['external_registration_url'] = $academic ? null : ($data['external_registration_url'] ?? null);

        $mode = $data['location_mode'];
        $payload['meeting_url_encrypted'] = $academic && in_array($mode, ['online', 'hybrid'], true)
            ? ($data['meeting_url'] ?? null)
            : null;

        return $payload;
    }

    private function toUtc(?string $value): ?Carbon
    {
        return blank($value) ? null : Carbon::parse($value, 'Asia/Makassar')->utc();
    }

    private function uniqueSlug(string $title): string
    {
        $base = Str::slug($title) ?: 'event';
        $slug = $base;
        $suffix = 2;

        while (Event::withTrashed()->where('slug', $slug)->exists()) {
            $slug = $base . '-' . $suffix++;
        }

        return $slug;
    }

    private function auditSnapshot(Event $event): array
    {
        return [
            'title' => $event->title,
            'slug' => $event->slug,
            'organization_id' => $event->organization_id,
            'event_type_id' => $event->event_type_id,
            'start_at' => $event->start_at?->toIso8601String(),
            'end_at' => $event->end_at?->toIso8601String(),
            'location_mode' => $event->location_mode,
            'publication_status' => $event->publication_status,
            'capacity' => $event->capacity,
            // Never include meeting URLs, private files, NIMs, or passwords in audit data.
        ];
    }
}

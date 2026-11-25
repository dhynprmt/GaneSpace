<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventMedia;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class EventMediaService
{
    public function __construct(private readonly AuditRecorder $auditRecorder)
    {
    }

    public function store(Event $event, UploadedFile $file, string $kind, ?string $altText, User $actor, Request $request): EventMedia
    {
        $path = $file->store('events/' . $event->id, 'public');
        if (! $path) throw new \RuntimeException('Could not store event media.');
        $oldPosterRows = collect();

        try {
            $media = DB::transaction(function () use ($event, $file, $kind, $altText, $path, &$oldPosterRows): EventMedia {
                Event::whereKey($event->id)->lockForUpdate()->firstOrFail();
                if ($kind === 'gallery' && $event->media()->where('media_kind', 'gallery')->count() >= 12) {
                    throw ValidationException::withMessages(['file' => 'An event can have at most 12 gallery images.']);
                }
                if ($kind === 'poster') {
                    $oldPosterRows = $event->media()->where('media_kind', 'poster')->get();
                    $event->media()->where('media_kind', 'poster')->delete();
                }

                return $event->media()->create([
                    'media_kind' => $kind,
                    'storage_disk' => 'public',
                    'file_path' => $path,
                    'alt_text' => $altText,
                    'mime_type' => $file->getMimeType() ?: $file->getClientMimeType(),
                    'file_size_bytes' => $file->getSize(),
                    'sort_order' => 0,
                ]);
            });
        } catch (\Throwable $exception) {
            Storage::disk('public')->delete($path);
            throw $exception;
        }

        foreach ($oldPosterRows as $oldPoster) {
            if ($oldPoster->storage_disk === 'public') {
                Storage::disk('public')->delete($oldPoster->file_path);
            }
        }

        $this->auditRecorder->record(
            $actor, $request, 'event.media_uploaded', Event::class, $event->id,
            [], ['media_id' => $media->id, 'media_kind' => $kind, 'mime_type' => $media->mime_type, 'file_size_bytes' => $media->file_size_bytes],
            $event->organization_id
        );

        return $media;
    }

    public function delete(Event $event, EventMedia $media, User $actor, Request $request): void
    {
        abort_unless($media->event_id === $event->id, 404);

        $disk = $media->storage_disk;
        $path = $media->file_path;
        $mediaId = $media->id;
        $kind = $media->media_kind;

        DB::transaction(fn () => $media->delete());
        if ($disk === 'public') {
            Storage::disk('public')->delete($path);
        }

        $this->auditRecorder->record(
            $actor, $request, 'event.media_deleted', Event::class, $event->id,
            ['media_id' => $mediaId, 'media_kind' => $kind],
            [], $event->organization_id
        );
    }
}

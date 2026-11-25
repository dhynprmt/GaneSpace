<?php

namespace App\Policies;

use App\Models\Event;
use App\Models\User;

class EventPolicy
{
    public function view(?User $user, Event $event): bool
    {
        if ($event->publication_status === 'published' && $event->organization?->is_active) {
            return true;
        }

        return $user !== null && $user->managesOrganization($event->organization_id);
    }

    public function create(User $user): bool
    {
        return $user->account_status === 'active'
            && ($user->isSuperAdmin()
                || $user->roleAssignments()
                    ->whereNull('revoked_at')
                    ->whereHas('role', fn ($query) => $query->where('slug', 'event_admin'))
                    ->whereHas('organization', fn ($query) => $query->where('is_active', true))
                    ->exists());
    }

    public function update(User $user, Event $event): bool
    {
        return $user->managesOrganization($event->organization_id);
    }

    public function delete(User $user, Event $event): bool
    {
        return $this->update($user, $event);
    }

    public function publish(User $user, Event $event): bool
    {
        if (! $this->update($user, $event) || $event->cancelled_at !== null) {
            return false;
        }

        // UPA TIK must explicitly restore an event after a moderation unpublish.
        if (! $user->isSuperAdmin()) {
            $lastVisibilityDecision = $event->moderationLogs()
                ->whereIn('action', ['unpublish', 'restore'])
                ->latest('created_at')
                ->first();

            if ($lastVisibilityDecision?->action === 'unpublish') {
                return false;
            }
        }

        return true;
    }

    public function moderate(User $user, Event $event): bool
    {
        return $user->account_status === 'active' && $user->isSuperAdmin();
    }

    public function viewParticipants(User $user, Event $event): bool
    {
        return $this->update($user, $event);
    }

    public function viewMeetingLink(User $user, Event $event): bool
    {
        if ($user->managesOrganization($event->organization_id)) {
            return true;
        }

        if (! $user->isVerifiedStudent()) {
            return false;
        }

        if ($event->publication_status !== 'published' || $event->cancelled_at !== null
            || ! $event->organization()->where('is_active', true)->exists()) {
            return false;
        }

        return $event->registrations()
            ->where('student_user_id', $user->id)
            ->where('status', 'active')
            ->exists();
    }
}

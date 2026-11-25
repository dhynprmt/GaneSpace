<?php

namespace App\Policies;

use App\Models\Registration;
use App\Models\User;

class RegistrationPolicy
{
    public function view(User $user, Registration $registration): bool
    {
        return $user->account_status === 'active' && (
            $registration->student_user_id === $user->id
            || $user->managesOrganization($registration->event->organization_id)
        );
    }

    public function cancel(User $user, Registration $registration): bool
    {
        return $registration->student_user_id === $user->id && $registration->status === 'active'
            && $user->isVerifiedStudent();
    }
}

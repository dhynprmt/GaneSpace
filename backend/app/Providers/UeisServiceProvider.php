<?php

namespace App\Providers;

use App\Models\AiConversation;
use App\Models\Event;
use App\Models\Organization;
use App\Models\Registration;
use App\Policies\AiConversationPolicy;
use App\Policies\EventPolicy;
use App\Policies\OrganizationPolicy;
use App\Policies\RegistrationPolicy;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class UeisServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Gate::policy(Event::class, EventPolicy::class);
        Gate::policy(Organization::class, OrganizationPolicy::class);
        Gate::policy(Registration::class, RegistrationPolicy::class);
        Gate::policy(AiConversation::class, AiConversationPolicy::class);

        ResetPassword::createUrlUsing(function ($user, string $token): string {
            return rtrim(config('ueis.frontend_url'), '/') . '/reset-password?token=' . rawurlencode($token)
                . '&email=' . rawurlencode($user->getEmailForPasswordReset());
        });
    }
}

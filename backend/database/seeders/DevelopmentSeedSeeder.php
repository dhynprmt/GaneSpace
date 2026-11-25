<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use RuntimeException;

/**
 * Local-only development fixtures for the GaneSpace snapshot.
 * This seeder intentionally does not run migrations or touch student registrations.
 */
class DevelopmentSeedSeeder extends Seeder
{
    use DevelopmentSeedGuard;

    public function run(): void
    {
        $this->assertDevelopmentSeedTarget();

        $this->command?->warn('Applying local GaneSpace development fixtures to ganespace. No migrations will be run.');

        $this->call([
            DevelopmentOrganizationSeeder::class,
            DevelopmentEventTypeSeeder::class,
            DevelopmentEventAdminSeeder::class,
            DevelopmentEventSeeder::class,
        ]);

        $this->command?->info('Development fixtures prepared: organizations, event types, Event Admin, events, and posters.');
        $this->command?->warn('No Student account, student profile, registrations, notification history, audit logs, or moderation logs were seeded.');
    }
}

<?php

namespace Database\Seeders;

use App\Models\EventCategory;
use App\Models\EventType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class DevelopmentEventTypeSeeder extends Seeder
{
    use DevelopmentSeedGuard;

    public function run(): void
    {
        $this->assertDevelopmentSeedTarget();

        $academic = EventCategory::query()->where('slug', 'academic')->first();
        $nonAcademic = EventCategory::query()->where('slug', 'non-academic')->first();

        if (! $academic || ! $academic->is_active || ! $nonAcademic || ! $nonAcademic->is_active) {
            throw new RuntimeException('The existing academic and non-academic event categories must exist and be active.');
        }

        $types = [
            [$academic->id, 'sharing-session', 'Sharing Session'],
            [$academic->id, 'bootcamp', 'Bootcamp'],
            [$academic->id, 'technology-seminar', 'Technology Seminar'],
            [$nonAcademic->id, 'beauty-class', 'Beauty Class'],
            [$nonAcademic->id, 'committee-recruitment', 'Committee Recruitment'],
        ];

        DB::transaction(function () use ($types): void {
            foreach ($types as [$categoryId, $slug, $name]) {
                $eventType = EventType::query()
                    ->where('event_category_id', $categoryId)
                    ->where('slug', $slug)
                    ->first();

                if ($eventType) {
                    if ($eventType->name !== $name || ! $eventType->is_active) {
                        throw new RuntimeException("Event type '{$slug}' exists but does not match the expected active development type. It was not modified.");
                    }

                    continue;
                }

                EventType::query()->create([
                    'event_category_id' => $categoryId,
                    'slug' => $slug,
                    'name' => $name,
                    'is_active' => true,
                ]);
            }
        });
    }
}

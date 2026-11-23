<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EventTypeSeeder extends Seeder
{
    public function run(): void
    {
        $now = now('UTC');
        $academic = DB::table('event_categories')->where('slug', 'academic')->value('id');
        $nonAcademic = DB::table('event_categories')->where('slug', 'non-academic')->value('id');

        $types = [
            [$academic, 'proposal-seminar', 'Proposal Seminar'],
            [$academic, 'research-results-seminar', 'Research Results Seminar'],
            [$academic, 'workshop', 'Workshop'],
            [$academic, 'national-seminar', 'National Seminar'],
            [$academic, 'international-seminar', 'International Seminar'],
            [$academic, 'public-lecture', 'Public Lecture'],
            [$nonAcademic, 'concert', 'Concert'],
            [$nonAcademic, 'exhibition', 'Exhibition'],
            [$nonAcademic, 'festival', 'Festival'],
            [$nonAcademic, 'competition', 'Competition'],
            [$nonAcademic, 'student-organization-activity', 'Student Organization Activity'],
            [$nonAcademic, 'ukm-activity', 'UKM Activity'],
        ];

        foreach ($types as [$categoryId, $slug, $name]) {
            DB::table('event_types')->upsert([
                ['event_category_id' => $categoryId, 'slug' => $slug, 'name' => $name,
                    'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ], ['event_category_id', 'slug'], ['name', 'updated_at']);
        }
    }
}

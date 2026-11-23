<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EventCategorySeeder extends Seeder
{
    public function run(): void
    {
        $now = now('UTC');
        DB::table('event_categories')->upsert([
            ['slug' => 'academic', 'name' => 'Academic', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            ['slug' => 'non-academic', 'name' => 'Non-Academic', 'is_active' => true, 'created_at' => $now, 'updated_at' => $now],
        ], ['slug'], ['name', 'updated_at']);
    }
}

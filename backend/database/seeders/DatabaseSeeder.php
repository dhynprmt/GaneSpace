<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // No real users, NIMs, organization records, or credentials are seeded.
        $this->call([
            RoleSeeder::class,
            EventCategorySeeder::class,
            EventTypeSeeder::class,
        ]);
    }
}

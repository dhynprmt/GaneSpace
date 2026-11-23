<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $now = now('UTC');

        DB::table('roles')->upsert([
            ['slug' => 'student', 'name' => 'Student', 'scope_type' => 'global', 'created_at' => $now, 'updated_at' => $now],
            ['slug' => 'event_admin', 'name' => 'Event Admin', 'scope_type' => 'organization', 'created_at' => $now, 'updated_at' => $now],
            ['slug' => 'super_admin', 'name' => 'Super Admin (UPA TIK)', 'scope_type' => 'global', 'created_at' => $now, 'updated_at' => $now],
        ], ['slug'], ['name', 'scope_type', 'updated_at']);
    }
}

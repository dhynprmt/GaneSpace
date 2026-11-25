<?php

namespace Tests\Feature;

use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Tests\DatabaseTestCase;

/**
 * Run against a disposable MariaDB TEST database (never production).
 * This test intentionally checks that the critical schema was created.
 */
class UeisSchemaTest extends DatabaseTestCase
{

    public function test_every_custom_table_exists(): void
    {
        foreach ([
            'faculties', 'departments', 'study_programs', 'student_profiles',
            'roles', 'organizations', 'user_roles', 'student_verification_logs',
            'event_categories', 'event_types', 'events', 'event_media',
            'event_moderation_logs', 'registrations', 'event_ai_summaries',
            'ai_conversations', 'ai_messages', 'audit_logs', 'security_events',
            'notification_delivery_logs', 'notifications',
        ] as $table) {
            $this->assertTrue(Schema::hasTable($table), "Missing table: {$table}");
        }
        $this->assertTrue(Schema::hasColumns('users', [
            'account_status', 'last_login_at', 'deleted_at',
        ]));
    }

    public function test_mariadb_generated_uniqueness_indexes_exist(): void
    {
        $this->assertSame('mysql', DB::connection()->getDriverName());
        $result = DB::select("SELECT TABLE_NAME, INDEX_NAME FROM information_schema.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE()
            AND INDEX_NAME IN ('uq_registration_active_student', 'uq_user_role_active_scope')
            GROUP BY TABLE_NAME, INDEX_NAME");
        $pairs = collect($result)->map(fn ($row) => $row->TABLE_NAME . '.' . $row->INDEX_NAME)->all();
        $this->assertContains('registrations.uq_registration_active_student', $pairs);
        $this->assertContains('user_roles.uq_user_role_active_scope', $pairs);
    }

    public function test_role_history_allows_reassignment_but_not_duplicate_active_scope(): void
    {
        $userId = DB::table('users')->insertGetId([
            'name' => 'Demo Admin', 'email' => 'admin-schema-test@example.test',
            'password' => bcrypt('temporary-long-demo-password'),
        ]);
        $roleId = DB::table('roles')->insertGetId([
            'slug' => 'test_admin', 'name' => 'Demo Role', 'scope_type' => 'global',
        ]);
        $scope = [
            'user_id' => $userId, 'role_id' => $roleId,
            'organization_id' => null, 'assigned_at' => now('UTC'),
        ];
        $firstId = DB::table('user_roles')->insertGetId($scope);

        $this->assertDuplicateRejected(fn () => DB::table('user_roles')->insert($scope));
        DB::table('user_roles')->where('id', $firstId)->update(['revoked_at' => now('UTC')]);
        DB::table('user_roles')->insert($scope);
        $this->assertSame(2, DB::table('user_roles')->where('user_id', $userId)->count());
    }

    public function test_cancelled_history_does_not_block_fresh_active_registration(): void
    {
        $userId = DB::table('users')->insertGetId([
            'name' => 'Demo Student', 'email' => 'student-schema-test@example.test',
            'password' => bcrypt('temporary-long-demo-password'),
        ]);
        $orgId = DB::table('organizations')->insertGetId([
            'name' => 'Test Organizer', 'slug' => 'test-organizer',
            'organization_type' => 'campus_unit',
        ]);
        $categoryId = \App\Models\EventCategory::firstOrCreate(['slug' => 'academic'], ['name' => 'Academic'])->id;
        $typeId = DB::table('event_types')->insertGetId([
            'event_category_id' => $categoryId,
            'slug' => 'test-seminar', 'name' => 'Test Seminar',
        ]);
        $eventId = DB::table('events')->insertGetId([
            'organization_id' => $orgId, 'event_type_id' => $typeId,
            'created_by' => $userId, 'title' => 'Test Event',
            'slug' => 'test-event', 'description' => 'Test description',
            'start_at' => now('UTC')->addDays(2),
            'end_at' => now('UTC')->addDays(2)->addHours(2),
            'location_mode' => 'onsite', 'publication_status' => 'published',
        ]);
        $newRegistration = fn (string $code) => [
            'public_uuid' => (string) Str::uuid(), 'registration_code' => $code,
            'event_id' => $eventId, 'student_user_id' => $userId,
            'status' => 'active', 'registered_at' => now('UTC'),
            'participant_snapshot' => json_encode(['name' => 'Demo Student', 'nim' => 'TEST']),
            'event_snapshot' => json_encode(['title' => 'Test Event']),
        ];

        $firstId = DB::table('registrations')->insertGetId($newRegistration('GANESPACE-TEST-01'));
        $this->assertDuplicateRejected(
            fn () => DB::table('registrations')->insert($newRegistration('GANESPACE-TEST-02'))
        );
        DB::table('registrations')->where('id', $firstId)->update([
            'status' => 'cancelled', 'cancelled_at' => now('UTC'),
        ]);
        DB::table('registrations')->insert($newRegistration('GANESPACE-TEST-03'));
        $this->assertSame(2, DB::table('registrations')->where('student_user_id', $userId)->count());
        $this->assertSame(1, DB::table('registrations')->where('student_user_id', $userId)
            ->where('status', 'active')->count());
    }

    private function assertDuplicateRejected(callable $attempt): void
    {
        try {
            $attempt();
            $this->fail('A duplicate active record was incorrectly accepted.');
        } catch (QueryException $exception) {
            $this->assertStringContainsString('Duplicate entry', $exception->getMessage());
        }
    }
}

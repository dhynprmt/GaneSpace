<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Event;
use App\Models\EventCategory;
use App\Models\EventType;
use App\Models\Faculty;
use App\Models\Organization;
use App\Models\StudentProfile;
use App\Models\StudyProgram;
use App\Models\User;
use App\Services\RoleAssignmentService;
use Database\Seeders\RoleSeeder;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\DatabaseTestCase;

/** Run ONLY against a disposable MariaDB ueis_test database. */
class UeisAuthAndAuthorizationTest extends DatabaseTestCase
{

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
        config(['ueis.turnstile.secret' => 'TEST_SECRET', 'ueis.turnstile.expected_hostname' => null]);
        Http::fake(['https://challenges.cloudflare.com/turnstile/v0/siteverify' =>
            Http::response(['success' => true, 'hostname' => 'localhost'], 200)]);
    }

    private function directory(): StudyProgram
    {
        $faculty = Faculty::create(['code' => 'TST', 'name' => 'Test Faculty']);
        $dept = Department::create(['faculty_id' => $faculty->id, 'code' => 'DPT', 'name' => 'Test Department']);
        return StudyProgram::create(['department_id' => $dept->id, 'code' => 'PGM', 'name' => 'Test Program']);
    }

    private function user(string $email, bool $verified = true): User
    {
        $user = User::create(['name' => 'Test Person', 'email' => $email,
            'password' => 'ValidPassword123', 'account_status' => 'active']);
        if ($verified) $user->forceFill(['email_verified_at' => now('UTC')])->save();
        return $user;
    }

    public function test_student_registration_writes_pending_profile_and_private_proof(): void
    {
        Notification::fake();
        Storage::fake('local');
        $program = $this->directory();
        $response = $this->post('/api/auth/register', [
            'name' => 'Student Example', 'email' => 'student@example.test',
            'password' => 'ValidPassword123', 'password_confirmation' => 'ValidPassword123',
            'nim' => '230001', 'faculty_id' => $program->department->faculty_id,
            'department_id' => $program->department_id, 'study_program_id' => $program->id,
            'ktm' => UploadedFile::fake()->createWithContent('ktm.pdf', "%PDF-1.4\n1 0 obj <</Type /Catalog>> endobj\n%%EOF"),
            'turnstile_token' => 'fake-token',
        ]);
        $response->assertCreated();
        $user = User::where('email', 'student@example.test')->firstOrFail();
        $this->assertFalse($user->hasVerifiedEmail());
        $this->assertTrue($user->hasActiveRole('student'));
        $this->assertSame('pending', $user->studentProfile->verification_status);
        Storage::disk('local')->assertExists($user->studentProfile->ktm_private_path);
        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_new_student_can_register_with_private_photo_and_ktm(): void
    {
        Notification::fake();
        Storage::fake('local');
        $program = $this->directory();
        $this->post('/api/auth/register', [
            'name'=>'Photo student', 'email'=>'registration-photo@example.test', 'password'=>'ValidPassword123',
            'password_confirmation'=>'ValidPassword123', 'nim'=>'PHOTO23001', 'faculty_id'=>$program->department->faculty_id,
            'department_id'=>$program->department_id, 'study_program_id'=>$program->id,
            'ktm'=>UploadedFile::fake()->image('ktm.jpg'), 'profile_photo'=>UploadedFile::fake()->image('profile.jpg', 60, 80),
            'turnstile_token'=>'test',
        ])->assertCreated();
        $user = User::where('email','registration-photo@example.test')->firstOrFail();
        $profile = $user->studentProfile;
        Storage::disk('local')->assertExists([$profile->ktm_private_path, $profile->profile_photo_path]);
        $this->assertNotSame($profile->ktm_private_path, $profile->profile_photo_path);
        $this->assertSame('pending', $profile->verification_status);
        $this->actingAs($user)->getJson('/api/me')->assertJsonPath('data.student.has_profile_photo', true)
            ->assertJsonMissingPath('data.student.profile_photo_path');
    }

    public function test_signed_email_link_verifies_the_account(): void
    {
        $user = $this->user('email-pending@example.test', false);
        $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(60), [
            'id' => $user->id, 'hash' => sha1($user->getEmailForVerification()),
        ]);
        $this->get($url)->assertRedirect('http://localhost:5173/auth/email-verified?status=success');
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
    }

    public function test_student_cannot_use_verified_only_features_until_manual_approval(): void
    {
        $user = $this->user('unverified-nim@example.test');
        $program = $this->directory();
        StudentProfile::create(['user_id' => $user->id, 'nim' => '230002',
            'study_program_id' => $program->id, 'ktm_private_path' => 'student-ktm/dummy.pdf',
            'verification_status' => 'pending']);
        app(RoleAssignmentService::class)->assign($user, 'student');
        $this->assertFalse($user->isVerifiedStudent());

        $master = $this->user('master@example.test');
        app(RoleAssignmentService::class)->assign($master, 'super_admin');
        $this->actingAs($master)->patchJson('/api/master/student-verifications/'.$user->studentProfile->id,
            ['status' => 'verified'])->assertOk();
        $this->assertTrue($user->isVerifiedStudent());
        $this->assertDatabaseHas('student_verification_logs', [
            'student_profile_id' => $user->studentProfile->id, 'new_status' => 'verified',
        ]);
    }

    public function test_normal_user_cannot_assign_roles_or_review_students(): void
    {
        $ordinary = $this->user('ordinary@example.test');
        $this->actingAs($ordinary)->postJson('/api/master/user-roles', [
            'user_id' => $ordinary->id, 'role_slug' => 'super_admin',
        ])->assertForbidden();
        $this->actingAs($ordinary)->getJson('/api/master/student-verifications')->assertForbidden();
    }

    public function test_event_admin_permissions_are_limited_to_assigned_organization_and_link_is_encrypted(): void
    {
        $admin = $this->user('event-admin@example.test');
        $orgA = Organization::create(['name' => 'Org A', 'slug' => 'org-a', 'organization_type' => 'campus_unit']);
        $orgB = Organization::create(['name' => 'Org B', 'slug' => 'org-b', 'organization_type' => 'campus_unit']);
        app(RoleAssignmentService::class)->assign($admin, 'event_admin', $orgA->id);
        $cat = EventCategory::firstOrCreate(['slug' => 'academic'], ['name' => 'Academic']);
        $type = EventType::create(['event_category_id' => $cat->id, 'slug' => 'seminar', 'name' => 'Seminar']);
        $make = function ($org, $slug) use ($admin, $type) {
            return Event::create(['organization_id' => $org->id, 'event_type_id' => $type->id,
                'created_by' => $admin->id, 'title' => 'Example Event', 'slug' => $slug,
                'description' => 'Description', 'start_at' => now('UTC')->addDays(2),
                'end_at' => now('UTC')->addDays(2)->addHours(2), 'location_mode' => 'online',
                'meeting_url_encrypted' => 'https://example.test/private-meeting']);
        };
        $eventA = $make($orgA, 'event-a');
        $eventB = $make($orgB, 'event-b');
        $this->assertTrue(Gate::forUser($admin)->allows('update', $eventA));
        $this->assertFalse(Gate::forUser($admin)->allows('update', $eventB));
        $this->assertNotEquals('https://example.test/private-meeting',
            DB::table('events')->where('id', $eventA->id)->value('meeting_url_encrypted'));
        $this->assertArrayNotHasKey('meeting_url_encrypted', $eventA->toArray());
    }
}

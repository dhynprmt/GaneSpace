<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\RoleAssignmentService;
use Database\Seeders\RoleSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Tests\DatabaseTestCase;

class GaneSpacePhotoTest extends DatabaseTestCase
{
    private function student(): User
    {
        $student = User::create(['name'=>'Photo test', 'email'=>\Illuminate\Support\Str::uuid().'@example.test',
            'password'=>'ValidPassword123', 'account_status'=>'active']);
        $faculty = \App\Models\Faculty::firstOrCreate(['code'=>'IMG', 'name'=>'Photo test']);
        $department = $faculty->departments()->firstOrCreate(['code'=>'IMG', 'name'=>'Photo test']);
        $program = $department->studyPrograms()->firstOrCreate(['code'=>'IMG', 'name'=>'Photo test']);
        $student->studentProfile()->create(['nim'=>'PH'.$student->id, 'study_program_id'=>$program->id,
            'ktm_private_path'=>'private-proof.pdf', 'verification_status'=>'verified']);
        app(RoleAssignmentService::class)->assign($student, 'student');
        return $student;
    }

    public function test_guests_cannot_read_or_write_photos(): void
    {
        $this->getJson('/api/me/student-profile/photo')->assertUnauthorized();
        $this->postJson('/api/me/student-profile/photo')->assertUnauthorized();
    }

    public function test_student_upload_rejects_a_document_and_missing_photo_returns_404(): void
    {
        $this->seed(RoleSeeder::class);
        $student = $this->student();
        $this->actingAs($student)->getJson('/api/me/student-profile/photo')->assertNotFound();
        $this->postJson('/api/me/student-profile/photo', ['profile_photo' => UploadedFile::fake()->create('proof.pdf')])
            ->assertUnprocessable()->assertJsonValidationErrors('profile_photo');
    }

    public function test_photo_replacement_preserves_verification_and_ownership(): void
    {
        if (! Schema::hasColumn('student_profiles', 'profile_photo_path')) {
            $this->markTestSkipped('Requires the approved photo migration to have been applied to ueis_test.');
        }
        Storage::fake('local');
        $this->seed(RoleSeeder::class);
        $student = $this->student();
        $other = $this->student();
        $profile = $student->studentProfile;
        $this->actingAs($student);
        foreach ([1,2] as $version) {
            $this->postJson('/api/me/student-profile/photo', ['profile_photo'=>UploadedFile::fake()->image("photo{$version}.jpg", 60, 80)])->assertNoContent();
            $this->get('/api/me/student-profile/photo')->assertOk()->assertHeader('Content-Type', 'image/jpeg');
        }
        $this->assertCount(1, Storage::disk('local')->allFiles('student-photos'));
        $this->assertSame('verified', $profile->fresh()->verification_status);
        $this->actingAs($other)->getJson('/api/me/student-profile/photo')->assertNotFound();
    }
}

<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\EventType;
use App\Models\Faculty;
use App\Models\Organization;
use App\Models\User;
use App\Services\RoleAssignmentService;
use Database\Seeders\EventCategorySeeder;
use Database\Seeders\EventTypeSeeder;
use Database\Seeders\RoleSeeder;
use Tests\DatabaseTestCase;

class GaneSpaceLifecycleTest extends DatabaseTestCase
{
    protected Event $event;
    protected User $student;
    protected User $other;
    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RoleSeeder::class, EventCategorySeeder::class, EventTypeSeeder::class]);
        $faculty = Faculty::create(['code'=>'LCT', 'name'=>'Lifecycle']);
        $program = $faculty->departments()->create(['code'=>'LCT', 'name'=>'Lifecycle'])
            ->studyPrograms()->create(['code'=>'LCT', 'name'=>'Lifecycle']);
        foreach (['student','other','admin'] as $key) {
            $person = User::create(['name'=>$key, 'email'=>$key.'@lifecycle.test',
                'password'=>'ValidPassword123', 'account_status'=>'active']);
            $person->markEmailAsVerified();
            $this->$key = $person;
            if ($key !== 'admin') {
                $person->studentProfile()->create(['nim'=>'LC'.$person->id, 'study_program_id'=>$program->id,
                    'verification_status'=>'verified']);
                app(RoleAssignmentService::class)->assign($person, 'student');
            }
        }
        $org = Organization::create(['name'=>'Lifecycle','slug'=>'lifecycle','organization_type'=>'campus_unit','is_active'=>true]);
        app(RoleAssignmentService::class)->assign($this->admin,'event_admin',$org->id);
        $this->event = Event::create(['organization_id'=>$org->id,
            'event_type_id'=>EventType::where('slug','national-seminar')->firstOrFail()->id,
            'created_by'=>$this->admin->id,'title'=>'Seminar Lifecycle','slug'=>'seminar-lifecycle','description'=>'Lifecycle',
            'start_at'=>now()->addDays(2),'end_at'=>now()->addDays(3),'location_mode'=>'onsite','venue_name'=>'Aula',
            'registration_opens_at'=>now()->subDay(),'registration_closes_at'=>now()->addDay(),
            'capacity'=>1,'publication_status'=>'published']);
    }

    private function book(User $user)
    {
        return $this->actingAs($user)->postJson('/api/events/'.$this->event->id.'/registrations');
    }

    public function test_capacity_ownership_history_and_scoped_participants(): void
    {
        $id = $this->book($this->student)->assertCreated()->json('data.id');
        $this->book($this->student)->assertConflict();
        $this->book($this->other)->assertConflict();
        $uri = '/api/me/registrations/'.$id;
        $this->getJson($uri)->assertNotFound();
        $this->postJson($uri.'/cancel')->assertNotFound();
        $participants = '/api/admin/events/'.$this->event->id.'/participants';
        $this->getJson($participants)->assertForbidden();
        $otherOrg = Organization::create(['name'=>'Different org','slug'=>'other-lifecycle','organization_type'=>'campus_unit','is_active'=>true]);
        app(RoleAssignmentService::class)->assign($this->other, 'event_admin', $otherOrg->id);
        $this->getJson($participants)->assertForbidden();
        $this->actingAs($this->admin)->getJson($participants.'?search=LC&status=active')->assertOk()->assertJsonCount(1,'data');
        $this->getJson($participants.'?search=unknown')->assertOk()->assertJsonCount(0,'data');
        $this->actingAs($this->student)->postJson($uri.'/cancel')->assertOk();
        $this->postJson($uri.'/cancel')->assertConflict();
        $next = $this->book($this->student)->assertCreated()->json('data.id');
        $this->assertNotSame($id, $next);
        $this->getJson('/api/me/registrations')->assertOk()->assertJsonCount(2,'data');
        $this->getJson($uri)->assertOk()->assertJsonPath('data.status','cancelled');
    }

    public function test_registration_rechecks_identity_publication_category_and_window(): void
    {
        $this->student->studentProfile()->update(['verification_status'=>'pending']);
        $this->book($this->student)->assertForbidden();
        $this->event->update(['publication_status'=>'draft']);
        $this->book($this->other)->assertNotFound();
        $this->event->update(['publication_status'=>'published','registration_opens_at'=>now()->addHour()]);
        $this->book($this->other)->assertConflict();
        $this->event->update(['registration_opens_at'=>now()->subDays(2),'registration_closes_at'=>now()->subDay()]);
        $this->book($this->other)->assertConflict();
        $type = EventType::whereHas('category',fn ($q) => $q->where('slug','!=','academic'))->firstOrFail();
        $this->event->update(['event_type_id'=>$type->id]);
        $this->book($this->other)->assertUnprocessable();
    }

    public function test_notices_are_targeted_deduplicated_and_email_job_replay_is_safe(): void
    {
        $id = $this->book($this->student)->assertCreated()->json('data.id');
        $record = \App\Models\Registration::findOrFail($id);
        app(\App\Services\StudentNoticeService::class)->registration($record, 'registration_success', (string) $id);
        $inbox = '/api/me/notifications';
        $notice = $this->getJson($inbox)->assertOk()->assertJsonCount(1, 'data')->json('data.0.id');
        $this->getJson($inbox.'/unread-count')->assertJsonPath('unread_count', 1);
        $this->actingAs($this->other)->patchJson("$inbox/$notice/read")->assertNotFound();
        $this->patchJson("$inbox/read-all")->assertNoContent();
        $this->actingAs($this->student)->getJson($inbox.'/unread-count')->assertJsonPath('unread_count', 1);
        $this->patchJson("$inbox/$notice/read")->assertNoContent();
        $this->getJson($inbox.'/unread-count')->assertJsonPath('unread_count', 0);
        $logs = \Illuminate\Support\Facades\DB::table('notification_delivery_logs')->where('notification_id', $notice);
        $this->assertSame(1, $logs->count());
        $job = new \App\Jobs\SendStudentNotice($logs->value('id'));
        $job->handle();
        $job->handle();
        $this->assertSame('preview', $logs->value('delivery_status'));
        $this->assertSame(1, (int) $logs->value('attempts'));
    }

    public function test_event_updates_and_cancellation_notify_active_students_and_preserve_history(): void
    {
        $id = $this->book($this->student)->assertCreated()->json('data.id');
        $event = $this->event;
        app(\App\Services\EventService::class)->update($event, [
            'organization_id'=>$event->organization_id, 'event_type_id'=>$event->event_type_id,
            'title'=>'Updated title', 'description'=>$event->description, 'location_mode'=>'onsite',
            'start_at'=>$event->start_at->toIso8601String(), 'end_at'=>$event->end_at->toIso8601String(),
            'capacity'=>1, 'registration_opens_at'=>$event->registration_opens_at->toIso8601String(),
            'registration_closes_at'=>$event->registration_closes_at->toIso8601String(),
        ], $this->admin, request());
        app(RoleAssignmentService::class)->assign($this->admin, 'super_admin');
        $this->actingAs($this->admin)->patchJson('/api/master/events/'.$event->id.'/moderation',
            ['action'=>'cancel','reason'=>'Event cancelled for testing'])->assertOk();
        $this->actingAs($this->student)->getJson('/api/me/notifications')->assertJsonCount(3, 'data')
            ->assertJsonFragment(['type'=>'schedule_change'])->assertJsonFragment(['type'=>'event_cancelled']);
        $this->getJson('/api/me/registrations/'.$id)->assertJsonPath('data.status','cancelled')
            ->assertJsonPath('data.event_title','Seminar Lifecycle');
    }

    public function test_receipt_is_owner_only_and_public_status_survives_cancellation(): void
    {
        $id = $this->book($this->student)->assertCreated()->json('data.id');
        $record = \App\Models\Registration::findOrFail($id);
        $path = '/api/me/registrations/'.$id;
        $this->assertStringStartsWith('%PDF-', $this->get($path.'/receipt')->assertOk()
            ->assertHeader('Content-Type','application/pdf')->getContent());
        $this->assertStringStartsWith("\x89PNG\r\n", $this->get($path.'/qr')->assertOk()->getContent());
        $this->actingAs($this->other)->getJson($path.'/receipt')->assertNotFound();
        $this->getJson($path.'/qr')->assertNotFound();
        $public = '/api/receipts/verify/'.$record->public_uuid;
        $this->getJson($public)->assertOk()->assertExactJson(['data'=>['event_title'=>'Seminar Lifecycle','status'=>'active']]);
        $this->actingAs($this->student)->postJson($path.'/cancel')->assertOk();
        $this->get($path.'/receipt')->assertOk();
        $this->getJson($public)->assertOk()->assertExactJson(['data'=>['event_title'=>'Seminar Lifecycle','status'=>'cancelled']]);
        $this->getJson('/api/receipts/verify/'.\Illuminate\Support\Str::uuid())->assertNotFound();
    }

    public function test_manual_role_and_directory_changes_govern_access_to_organization(): void
    {
        app(RoleAssignmentService::class)->assign($this->admin, 'super_admin');
        $this->actingAs($this->admin);
        $org = $this->postJson('/api/master/organizations', [
            'name'=>'Test organization', 'organization_type'=>'campus_unit',
        ])->assertCreated()->json('data.id');
        $this->patchJson("/api/master/organizations/$org", ['name'=>'Updated organization'])->assertOk();
        $assignment = $this->postJson('/api/master/user-roles', ['user_id'=>$this->other->id,
            'role_slug'=>'event_admin', 'organization_id'=>$org])->assertCreated()->json('data.id');
        $this->actingAs($this->other)->getJson('/api/admin/organizations')->assertOk()
            ->assertJsonFragment(['name'=>'Updated organization']);
        $this->actingAs($this->admin)->deleteJson("/api/master/user-roles/$assignment")->assertOk();
        $this->assertFalse($this->other->managesOrganization($org));

        $faculty = $this->postJson('/api/master/faculties',['name'=>'New faculty','code'=>'NEWF'])->assertCreated()->json('data.id');
        $dept = $this->postJson('/api/master/departments',['name'=>'New department','code'=>'NEWD','faculty_id'=>$faculty])
            ->assertCreated()->json('data.id');
        $program = $this->postJson('/api/master/study-programs',['name'=>'New program','code'=>'NEWP','department_id'=>$dept])
            ->assertCreated()->json('data.id');
        $this->patchJson("/api/master/study-programs/$program", ['name'=>'Updated program'])->assertOk();
        $this->getJson("/api/departments/$dept/study-programs")->assertOk()->assertJsonFragment(['name'=>'Updated program']);
        $category = $this->event->eventType->category;
        $this->patchJson("/api/master/event-categories/$category->id", ['name'=>'Academic QA'])->assertOk();
        $type = $this->postJson('/api/master/event-types', ['name'=>'QA colloquium','event_category_id'=>$category->id])
            ->assertCreated()->json('data.id');
        $this->patchJson("/api/master/event-types/$type", ['name'=>'QA forum'])->assertOk();
        $this->getJson('/api/event-types')->assertOk()->assertJsonFragment(['name'=>'QA forum']);
    }

    public function test_resubmission_revokes_verification_and_does_not_disclose_private_paths(): void
    {
        $this->actingAs($this->student)->postJson('/api/me/student-profile/resubmit', ['nim'=>'QA202611'])
            ->assertOk()->assertJsonPath('nim_status','pending');
        $this->getJson('/api/me')->assertOk()->assertJsonPath('data.student.verification_status','pending')
            ->assertJsonMissingPath('data.student.ktm_private_path')->assertJsonMissingPath('data.student.profile_photo_path');
        $this->book($this->student)->assertForbidden();
    }
}

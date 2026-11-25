<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\EventCategory;
use App\Models\EventType;
use App\Models\Organization;
use App\Models\User;
use App\Services\RoleAssignmentService;
use Database\Seeders\EventCategorySeeder;
use Database\Seeders\EventTypeSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\DatabaseTestCase;

/** Run only against a disposable MariaDB ueis_test database. */
class UeisEventManagementTest extends DatabaseTestCase
{

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RoleSeeder::class, EventCategorySeeder::class, EventTypeSeeder::class]);
        Storage::fake('public');
    }

    private function user(string $email): User
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => $email,
            'password' => 'ValidPassword123',
            'account_status' => 'active',
            'email_verified_at' => now('UTC'),
        ]);

        return $user;
    }

    private function organization(string $slug): Organization
    {
        return Organization::create([
            'name' => ucfirst($slug),
            'slug' => $slug,
            'organization_type' => 'campus_unit',
            'is_active' => true,
        ]);
    }

    private function academicType(): EventType
    {
        return EventType::where('slug', 'national-seminar')->firstOrFail();
    }

    private function eventPayload(Organization $organization): array
    {
        return [
            'organization_id' => $organization->id,
            'event_type_id' => $this->academicType()->id,
            'title' => 'UEIS Test Seminar',
            'description' => 'A test seminar description.',
            'start_at' => now('Asia/Makassar')->addDays(5)->toIso8601String(),
            'end_at' => now('Asia/Makassar')->addDays(5)->addHours(2)->toIso8601String(),
            'location_mode' => 'online',
            'meeting_url' => 'https://meeting.example.test/secret',
            'capacity' => 100,
            'registration_opens_at' => now('Asia/Makassar')->addDay()->toIso8601String(),
            'registration_closes_at' => now('Asia/Makassar')->addDays(4)->toIso8601String(),
        ];
    }

    public function test_public_event_listing_only_returns_published_events_and_never_exposes_meeting_url(): void
    {
        $organization = $this->organization('public-org');
        $user = $this->user('creator@example.test');

        $directPayload = $this->eventPayload($organization);
        $directPayload['meeting_url_encrypted'] = $directPayload['meeting_url'];
        unset($directPayload['meeting_url']);

        Event::create([
            ...$directPayload,
            'created_by' => $user->id,
            'slug' => 'draft-event',
            'publication_status' => 'draft',
        ]);

        Event::create([
            ...$directPayload,
            'created_by' => $user->id,
            'slug' => 'published-event',
            'publication_status' => 'published',
            'published_at' => now('UTC'),
        ]);

        $response = $this->getJson('/api/events?period=all')->assertOk();
        $response->assertJsonFragment(['slug' => 'published-event']);
        $response->assertJsonMissing(['slug' => 'draft-event']);
        $response->assertJsonMissingPath('data.0.meeting_url');
        $response->assertJsonMissingPath('data.0.meeting_url_encrypted');
    }

    public function test_event_admin_cannot_edit_another_organizations_event(): void
    {
        $admin = $this->user('scoped-admin@example.test');
        $ownOrganization = $this->organization('own-org');
        $otherOrganization = $this->organization('other-org');

        app(RoleAssignmentService::class)->assign($admin, 'event_admin', $ownOrganization->id);

        $event = Event::create([
            ...$this->eventPayload($otherOrganization),
            'created_by' => $admin->id,
            'slug' => 'other-org-event',
            'publication_status' => 'draft',
        ]);

        $this->actingAs($admin)
            ->getJson('/api/admin/events/' . $event->id)
            ->assertForbidden();
    }

    public function test_event_admin_can_create_event_only_for_assigned_organization(): void
    {
        $admin = $this->user('creator-admin@example.test');
        $organization = $this->organization('assigned-org');
        app(RoleAssignmentService::class)->assign($admin, 'event_admin', $organization->id);

        $this->actingAs($admin)
            ->postJson('/api/admin/events', $this->eventPayload($organization))
            ->assertCreated()
            ->assertJsonPath('data.publication_status', 'draft');

        $this->assertDatabaseHas('events', [
            'organization_id' => $organization->id,
            'publication_status' => 'draft',
        ]);
    }

    public function test_super_admin_can_cancel_event_and_moderation_log_is_preserved(): void
    {
        $master = $this->user('master@example.test');
        app(RoleAssignmentService::class)->assign($master, 'super_admin');
        $organization = $this->organization('moderated-org');

        $event = Event::create([
            ...$this->eventPayload($organization),
            'created_by' => $master->id,
            'slug' => 'moderated-event',
            'publication_status' => 'published',
            'published_at' => now('UTC'),
        ]);

        $this->actingAs($master)
            ->patchJson('/api/master/events/' . $event->id . '/moderation', [
                'action' => 'cancel',
                'reason' => 'The organizer requested cancellation.',
            ])
            ->assertOk()
            ->assertJsonPath('data.cancelled', true);

        $this->assertDatabaseHas('event_moderation_logs', [
            'event_id' => $event->id,
            'moderator_user_id' => $master->id,
            'action' => 'cancel',
        ]);
    }

    public function test_event_admin_can_upload_public_poster_to_an_owned_event(): void
    {
        $admin = $this->user('media-admin@example.test');
        $organization = $this->organization('media-org');
        app(RoleAssignmentService::class)->assign($admin, 'event_admin', $organization->id);

        $event = Event::create([
            ...$this->eventPayload($organization),
            'created_by' => $admin->id,
            'slug' => 'media-event',
            'publication_status' => 'draft',
        ]);

        $response = $this->actingAs($admin)->post('/api/admin/events/' . $event->id . '/media', [
            'media_kind' => 'poster',
            'file' => UploadedFile::fake()->createWithContent('poster.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/pZ8AAAAASUVORK5CYII=')),
            'alt_text' => 'UEIS event poster',
        ], ['Accept' => 'application/json']);

        $response->assertCreated()->assertJsonPath('data.kind', 'poster');
        $this->assertDatabaseHas('event_media', [
            'event_id' => $event->id,
            'media_kind' => 'poster',
            'storage_disk' => 'public',
        ]);
    }

    public function test_meeting_link_requires_active_registration_or_organization_scope(): void
    {
        $student = $this->user('unregistered@example.test');
        $organization = $this->organization('private-org');
        $creator = $this->user('private-creator@example.test');

        $payload = $this->eventPayload($organization);
        $payload['meeting_url_encrypted'] = $payload['meeting_url'];
        unset($payload['meeting_url']);
        $event = Event::create([
            ...$payload,
            'created_by' => $creator->id,
            'slug' => 'private-online-event',
            'publication_status' => 'published',
            'published_at' => now('UTC'),
        ]);

        $this->actingAs($student)
            ->getJson('/api/events/' . $event->id . '/meeting-link')
            ->assertForbidden();
    }
}

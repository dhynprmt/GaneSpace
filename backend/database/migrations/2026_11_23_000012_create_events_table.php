<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            // Encrypt meeting_url_encrypted in Eloquent, never return it in public API Resources.
            $table->id();
            $table->unsignedBigInteger('organization_id');
            $table->unsignedBigInteger('event_type_id');
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->string('title', 220);
            $table->string('slug', 240);
            $table->longText('description');
            $table->text('objectives')->nullable();
            $table->text('topics')->nullable();
            $table->text('participant_requirements')->nullable();
            $table->dateTime('start_at', 6);
            $table->dateTime('end_at', 6);
            $table->string('location_mode', 20);
            $table->string('venue_name', 200)->nullable();
            $table->text('venue_address')->nullable();
            $table->text('meeting_url_encrypted')->nullable();
            $table->unsignedInteger('capacity')->nullable();
            $table->dateTime('registration_opens_at', 6)->nullable();
            $table->dateTime('registration_closes_at', 6)->nullable();
            $table->string('external_registration_url', 2048)->nullable();
            $table->string('contact_name', 160)->nullable();
            $table->string('contact_email', 254)->nullable();
            $table->string('contact_phone', 40)->nullable();
            $table->string('publication_status', 20)->default('draft');
            $table->dateTime('published_at', 6)->nullable();
            $table->dateTime('cancelled_at', 6)->nullable();
            $table->unsignedBigInteger('cancelled_by')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->dateTime('created_at', 6)->nullable();
            $table->dateTime('updated_at', 6)->nullable();
            $table->dateTime('deleted_at', 6)->nullable();

            $table->foreign('organization_id')->references('id')->on('organizations')->restrictOnDelete();
            $table->foreign('event_type_id')->references('id')->on('event_types')->restrictOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->restrictOnDelete();
            $table->foreign('updated_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('cancelled_by')->references('id')->on('users')->nullOnDelete();

            $table->unique('slug', 'uq_events_slug');
            $table->index(['publication_status', 'start_at'], 'ix_events_publication_status_start_at');
            $table->index(['organization_id', 'start_at'], 'ix_events_organization_id_start_at');
            $table->index(['event_type_id', 'start_at'], 'ix_events_event_type_id_start_at');
            $table->index('registration_closes_at', 'ix_events_registration_closes_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};

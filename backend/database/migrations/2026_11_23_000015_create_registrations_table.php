<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registrations', function (Blueprint $table) {
            // MariaDB allows multiple NULLs in UNIQUE indexes. Once status is
            // cancelled, active_student_key becomes NULL, preserving registration history.
            $table->id();
            $table->char('public_uuid', 36);
            $table->string('registration_code', 40);
            $table->unsignedBigInteger('event_id');
            $table->unsignedBigInteger('student_user_id');
            $table->string('status', 20)->default('active');
            $table->dateTime('registered_at', 6);
            $table->dateTime('cancelled_at', 6)->nullable();
            $table->unsignedBigInteger('cancelled_by')->nullable();
            $table->string('cancellation_source', 30)->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->json('participant_snapshot');
            $table->json('event_snapshot');
            $table->unsignedBigInteger('active_student_key')->nullable()->storedAs("CASE WHEN status = 'active' THEN student_user_id ELSE NULL END");
            $table->dateTime('created_at', 6)->nullable();
            $table->dateTime('updated_at', 6)->nullable();

            $table->foreign('event_id')->references('id')->on('events')->restrictOnDelete();
            $table->foreign('student_user_id')->references('id')->on('users')->restrictOnDelete();
            $table->foreign('cancelled_by')->references('id')->on('users')->nullOnDelete();

            $table->unique('public_uuid', 'uq_registrations_public_uuid');
            $table->unique('registration_code', 'uq_registrations_registration_code');
            $table->unique(['event_id', 'active_student_key'], 'uq_registration_active_student');
            $table->index(['student_user_id', 'registered_at'], 'ix_registrations_student_user_id_registered_at');
            $table->index(['event_id', 'status'], 'ix_registrations_event_id_status');
            $table->index(['event_id', 'registered_at'], 'ix_registrations_event_id_registered_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registrations');
    }
};

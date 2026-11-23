<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('actor_user_id')->nullable();
            $table->unsignedBigInteger('organization_id')->nullable();
            $table->string('action', 100);
            $table->string('subject_type', 160);
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->char('session_reference_hash', 64)->nullable();
            $table->dateTime('created_at', 6);

            $table->foreign('actor_user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('organization_id')->references('id')->on('organizations')->nullOnDelete();

            $table->index(['actor_user_id', 'created_at'], 'ix_audit_logs_actor_user_id_created_at');
            $table->index(['subject_type', 'subject_id', 'created_at'], 'ix_audit_logs_subject_type_subject_id_created_at');
            $table->index(['action', 'created_at'], 'ix_audit_logs_action_created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};

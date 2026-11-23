<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('security_events', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('event_type', 100);
            $table->string('severity', 20)->default('info');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('context_redacted')->nullable();
            $table->dateTime('created_at', 6);

            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();

            $table->index(['event_type', 'created_at'], 'ix_security_events_event_type_created_at');
            $table->index(['user_id', 'created_at'], 'ix_security_events_user_id_created_at');
            $table->index(['severity', 'created_at'], 'ix_security_events_severity_created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('security_events');
    }
};

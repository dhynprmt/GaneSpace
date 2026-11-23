<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_moderation_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('event_id');
            $table->unsignedBigInteger('moderator_user_id');
            $table->string('action', 40);
            $table->string('previous_publication_status', 20)->nullable();
            $table->string('new_publication_status', 20)->nullable();
            $table->text('reason');
            $table->dateTime('created_at', 6);

            $table->foreign('event_id')->references('id')->on('events')->restrictOnDelete();
            $table->foreign('moderator_user_id')->references('id')->on('users')->restrictOnDelete();

            $table->index(['event_id', 'created_at'], 'ix_event_moderation_logs_event_id_created_at');
            $table->index(['moderator_user_id', 'created_at'], 'ix_event_moderation_logs_moderator_user_id_created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_moderation_logs');
    }
};

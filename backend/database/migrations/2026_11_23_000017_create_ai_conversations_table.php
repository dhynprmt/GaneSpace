<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_conversations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_user_id');
            $table->unsignedBigInteger('event_id');
            $table->string('title', 180)->nullable();
            $table->dateTime('closed_at', 6)->nullable();
            $table->dateTime('created_at', 6)->nullable();
            $table->dateTime('updated_at', 6)->nullable();

            $table->foreign('student_user_id')->references('id')->on('users')->restrictOnDelete();
            $table->foreign('event_id')->references('id')->on('events')->restrictOnDelete();

            $table->index(['student_user_id', 'updated_at'], 'ix_ai_conversations_student_user_id_updated_at');
            $table->index('event_id', 'ix_ai_conversations_event_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_conversations');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ai_conversation_id');
            $table->string('role', 20);
            $table->longText('content');
            $table->string('model_name', 120)->nullable();
            $table->unsignedInteger('token_input')->nullable();
            $table->unsignedInteger('token_output')->nullable();
            $table->dateTime('created_at', 6);

            $table->foreign('ai_conversation_id')->references('id')->on('ai_conversations')->restrictOnDelete();

            $table->index(['ai_conversation_id', 'id'], 'ix_ai_messages_ai_conversation_id_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_messages');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_ai_summaries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('event_id');
            $table->char('source_hash', 64);
            $table->longText('summary_text');
            $table->string('model_name', 120);
            $table->dateTime('generated_at', 6);
            $table->dateTime('created_at', 6)->nullable();
            $table->dateTime('updated_at', 6)->nullable();

            $table->foreign('event_id')->references('id')->on('events')->restrictOnDelete();

            $table->unique('event_id', 'uq_event_ai_summaries_event_id');
            $table->index('source_hash', 'ix_event_ai_summaries_source_hash');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_ai_summaries');
    }
};

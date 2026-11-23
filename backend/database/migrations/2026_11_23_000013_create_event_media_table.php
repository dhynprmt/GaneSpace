<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_media', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('event_id');
            $table->string('media_kind', 20);
            $table->string('storage_disk', 30);
            $table->string('file_path', 500);
            $table->string('alt_text', 220)->nullable();
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('file_size_bytes');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->dateTime('created_at', 6)->nullable();
            $table->dateTime('updated_at', 6)->nullable();

            $table->foreign('event_id')->references('id')->on('events')->restrictOnDelete();

            $table->index(['event_id', 'media_kind', 'sort_order'], 'ix_event_media_event_id_media_kind_sort_order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_media');
    }
};

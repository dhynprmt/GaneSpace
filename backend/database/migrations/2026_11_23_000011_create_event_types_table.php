<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_types', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('event_category_id');
            $table->string('slug', 100);
            $table->string('name', 120);
            $table->boolean('is_active')->default(true);
            $table->dateTime('created_at', 6)->nullable();
            $table->dateTime('updated_at', 6)->nullable();

            $table->foreign('event_category_id')->references('id')->on('event_categories')->restrictOnDelete();

            $table->unique(['event_category_id', 'slug'], 'uq_event_types_event_category_id_slug');
            $table->index(['event_category_id', 'is_active'], 'ix_event_types_event_category_id_is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_types');
    }
};

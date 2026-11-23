<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('faculties', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30);
            $table->string('name', 160);
            $table->boolean('is_active')->default(true);
            $table->dateTime('created_at', 6)->nullable();
            $table->dateTime('updated_at', 6)->nullable();

            $table->unique('code', 'uq_faculties_code');
            $table->index(['is_active', 'name'], 'ix_faculties_is_active_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faculties');
    }
};

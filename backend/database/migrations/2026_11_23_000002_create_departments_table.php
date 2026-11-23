<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('faculty_id');
            $table->string('code', 30);
            $table->string('name', 160);
            $table->boolean('is_active')->default(true);
            $table->dateTime('created_at', 6)->nullable();
            $table->dateTime('updated_at', 6)->nullable();

            $table->foreign('faculty_id')->references('id')->on('faculties')->restrictOnDelete();

            $table->unique(['faculty_id', 'code'], 'uq_departments_faculty_id_code');
            $table->index(['faculty_id', 'name'], 'ix_departments_faculty_id_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('departments');
    }
};

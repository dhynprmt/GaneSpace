<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('study_programs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('department_id');
            $table->string('code', 30);
            $table->string('name', 160);
            $table->string('degree_level', 30)->nullable();
            $table->boolean('is_active')->default(true);
            $table->dateTime('created_at', 6)->nullable();
            $table->dateTime('updated_at', 6)->nullable();

            $table->foreign('department_id')->references('id')->on('departments')->restrictOnDelete();

            $table->unique(['department_id', 'code'], 'uq_study_programs_department_id_code');
            $table->index(['department_id', 'name'], 'ix_study_programs_department_id_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('study_programs');
    }
};

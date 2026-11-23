<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('nim', 30);
            $table->unsignedBigInteger('study_program_id');
            $table->string('ktm_private_path', 500)->nullable();
            $table->dateTime('ktm_uploaded_at', 6)->nullable();
            $table->string('verification_status', 20)->default('pending');
            $table->text('verification_note')->nullable();
            $table->unsignedBigInteger('verified_by')->nullable();
            $table->dateTime('verified_at', 6)->nullable();
            $table->dateTime('verification_requested_at', 6)->nullable();
            $table->dateTime('created_at', 6)->nullable();
            $table->dateTime('updated_at', 6)->nullable();

            $table->foreign('user_id')->references('id')->on('users')->restrictOnDelete();
            $table->foreign('study_program_id')->references('id')->on('study_programs')->restrictOnDelete();
            $table->foreign('verified_by')->references('id')->on('users')->nullOnDelete();

            $table->unique('user_id', 'uq_student_profiles_user_id');
            $table->unique('nim', 'uq_student_profiles_nim');
            $table->index(['verification_status', 'verification_requested_at'], 'ix_student_profiles_verification_status_verification_r_d8339ab0');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_profiles');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_verification_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_profile_id');
            $table->unsignedBigInteger('actor_user_id')->nullable();
            $table->string('previous_status', 20)->nullable();
            $table->string('new_status', 20);
            $table->text('reason')->nullable();
            $table->dateTime('created_at', 6);

            $table->foreign('student_profile_id')->references('id')->on('student_profiles')->restrictOnDelete();
            $table->foreign('actor_user_id')->references('id')->on('users')->nullOnDelete();

            $table->index(['student_profile_id', 'created_at'], 'ix_student_verification_logs_student_profile_id_created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_verification_logs');
    }
};

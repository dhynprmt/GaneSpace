<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->unsignedBigInteger('faculty_id')->nullable();
            $table->string('name', 160);
            $table->string('slug', 180);
            $table->string('organization_type', 40);
            $table->string('contact_email', 254)->nullable();
            $table->string('contact_phone', 40)->nullable();
            $table->boolean('is_active')->default(true);
            $table->dateTime('created_at', 6)->nullable();
            $table->dateTime('updated_at', 6)->nullable();

            $table->foreign('parent_id')->references('id')->on('organizations')->restrictOnDelete();
            $table->foreign('faculty_id')->references('id')->on('faculties')->nullOnDelete();

            $table->unique('slug', 'uq_organizations_slug');
            $table->index('parent_id', 'ix_organizations_parent_id');
            $table->index(['faculty_id', 'is_active'], 'ix_organizations_faculty_id_is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organizations');
    }
};

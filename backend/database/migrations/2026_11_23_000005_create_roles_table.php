<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 40);
            $table->string('name', 100);
            $table->string('scope_type', 20);
            $table->dateTime('created_at', 6)->nullable();
            $table->dateTime('updated_at', 6)->nullable();

            $table->unique('slug', 'uq_roles_slug');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};

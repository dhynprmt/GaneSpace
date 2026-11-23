<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_roles', function (Blueprint $table) {
            // A revoked role gets NULL active_scope_key; current roles remain unique.
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('role_id');
            $table->unsignedBigInteger('organization_id')->nullable();
            $table->unsignedBigInteger('assigned_by')->nullable();
            $table->dateTime('assigned_at', 6);
            $table->dateTime('revoked_at', 6)->nullable();
            $table->unsignedBigInteger('active_scope_key')->nullable()->storedAs("CASE WHEN revoked_at IS NULL THEN COALESCE(organization_id, 0) ELSE NULL END");

            $table->foreign('user_id')->references('id')->on('users')->restrictOnDelete();
            $table->foreign('role_id')->references('id')->on('roles')->restrictOnDelete();
            $table->foreign('organization_id')->references('id')->on('organizations')->restrictOnDelete();
            $table->foreign('assigned_by')->references('id')->on('users')->nullOnDelete();

            $table->unique(['user_id', 'role_id', 'active_scope_key'], 'uq_user_role_active_scope');
            $table->index(['organization_id', 'role_id', 'revoked_at'], 'ix_user_roles_organization_id_role_id_revoked_at');
            $table->index(['user_id', 'revoked_at'], 'ix_user_roles_user_id_revoked_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_roles');
    }
};

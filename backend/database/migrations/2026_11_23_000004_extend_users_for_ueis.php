<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Laravel 12 already creates users, sessions and password_reset_tokens.
        // This migration adds UEIS-specific fields without replacing that framework migration.
        Schema::table('users', function (Blueprint $table) {
            $table->string('name', 160)->change();
            $table->string('email', 254)->change();
            $table->string('account_status', 20)->default('active')->index('ix_users_account_status');
            $table->dateTime('last_login_at', 6)->nullable();
            $table->dateTime('deleted_at', 6)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('ix_users_account_status');
            $table->dropColumn(['account_status', 'last_login_at', 'deleted_at']);
            $table->string('name', 255)->change();
            $table->string('email', 255)->change();
        });
    }
};

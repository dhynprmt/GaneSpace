<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_delivery_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->char('notification_id', 36)->nullable();
            $table->string('channel', 20);
            $table->string('template_key', 80);
            $table->string('delivery_status', 20)->default('queued');
            $table->string('recipient_email', 254)->nullable();
            $table->unsignedSmallInteger('attempts')->default(0);
            $table->string('provider_message_id', 200)->nullable();
            $table->text('last_error_redacted')->nullable();
            $table->dateTime('sent_at', 6)->nullable();
            $table->dateTime('created_at', 6)->nullable();
            $table->dateTime('updated_at', 6)->nullable();

            $table->foreign('user_id')->references('id')->on('users')->restrictOnDelete();
            $table->foreign('notification_id')->references('id')->on('notifications')->nullOnDelete();

            $table->index(['user_id', 'created_at'], 'ix_notification_delivery_logs_user_id_created_at');
            $table->index('notification_id', 'ix_notification_delivery_logs_notification_id');
            $table->index(['delivery_status', 'created_at'], 'ix_notification_delivery_logs_delivery_status_created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_delivery_logs');
    }
};

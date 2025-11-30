<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('chat_channel_messages', function (Blueprint $table) {
            $table->string('attachment_path')->nullable();
            $table->string('attachment_name')->nullable();
            $table->string('attachment_mime')->nullable();
            $table->unsignedBigInteger('attachment_size')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chat_channel_messages', function (Blueprint $table) {
            $table->dropColumn('attachment_path');
            $table->dropColumn('attachment_name');
            $table->dropColumn('attachment_mime');
            $table->dropColumn('attachment_size');
        });
    }
};

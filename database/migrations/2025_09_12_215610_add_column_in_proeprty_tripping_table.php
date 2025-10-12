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
        Schema::table('property_trippings', function (Blueprint $table) {
            $table->unsignedBigInteger('broker_id')->nullable();
            $table->foreign('broker_id')->references('id')->on('users')->cascadeOnDelete();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('property_trippings', function (Blueprint $table) {
            $table->dropForeign(['broker_id']);
            $table->dropColumn('broker_id');
        });
    }
};

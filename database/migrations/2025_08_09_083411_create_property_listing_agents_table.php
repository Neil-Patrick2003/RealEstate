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
        Schema::create('property_listing_agents', function (Blueprint $table) {
            $table->unsignedBigInteger('property_listing_id');
            $table->unsignedBigInteger('agent_id');

            $table->foreign('property_listing_id')->references('id')->on('property_listings')->onDelete('cascade');
            $table->foreign('agent_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('property_listing_agents');
    }
};

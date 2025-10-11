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
        Schema::create('deals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('property_listing_id');
            $table->unsignedBigInteger('buyer_id');
            $table->string('status')->default('PENDING');
            $table->decimal('amount');
            $table->foreign('property_listing_id')->references('id')->on('property_listings')->onDelete('cascade');
            $table->foreign('buyer_id')->references('id')->on('users')->onDelete('cascade');
            $table->timestamps();
            $table->timestamp('amount_last_updated_at')->nullable();
            $table->unsignedBigInteger('amount_last_updated_by')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deals');
    }
};

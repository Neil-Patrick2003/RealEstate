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
        Schema::create('property_coordinates', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('property_id');
                $table->json('coordinates'); // [[lat, lng], [lat, lng], ...]
                $table->string('type')->default('polygon'); // for future-proofing
                $table->timestamps();

                $table->foreign('property_id')
                ->references('id')
                ->on('properties')
                ->cascadeOnDelete();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('property_coordinates');
    }
};

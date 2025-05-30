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
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('seller_id');
            $table->string('title');
            $table->text('description');
            $table->string('property_type');
            $table->string('sub_type');
            $table->decimal('price', 15, 2);
            $table->string('address');
            $table->string('status');
            $table->decimal('lot_area', 10, 2)->nullable();
            $table->decimal('floor_area', 10, 2)->nullable(); 
            $table->unsignedTinyInteger('total_rooms')->nullable();
            $table->unsignedTinyInteger('bedrooms')->nullable();
            $table->unsignedTinyInteger('bathrooms')->nullable();
            $table->unsignedTinyInteger('car_slots')->nullable();
            $table->timestamps();
            $table->foreign('seller_id')
            ->references('id')
            ->on('users');


        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};

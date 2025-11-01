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
        Schema::create('house_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();

            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();

            $table->unsignedTinyInteger('bed_room')->default(0);
            $table->unsignedTinyInteger('bath_room')->default(0);
            $table->unsignedTinyInteger('car_slot')->default(0);

            $table->decimal('floor_area_sqm', 8, 2)->default(0);
            $table->decimal('lot_area_sqm', 8, 2)->default(0);
            $table->decimal('base_price', 15, 2)->default(0);

            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('house_types');
    }
};

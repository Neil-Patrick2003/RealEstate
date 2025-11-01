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
        Schema::create('inventory_pools', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id');
            $table->unsignedBigInteger('block_id');
            $table->unsignedBigInteger('house_type_id');
            $table->integer('total');
            $table->integer('held');
            $table->integer('reserved');
            $table->integer('sold');

            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
            $table->foreign('block_id')->references('id')->on('blocks')->onDelete('cascade');
            $table->foreign('house_type_id')->references('id')->on('house_types')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_pools');
    }
};

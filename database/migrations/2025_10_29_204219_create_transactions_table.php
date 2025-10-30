<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();

            // 🔗 Relationships
            $table->foreignId('inquiry_id')->nullable()->constrained('inquiries')->nullOnDelete();
//            $table->foreignId('inventory_pool_id')->nullable()->constrained('inventory_pools')->nullOnDelete();
//            $table->foreignId('pool_allocation_id')->nullable()->constrained('pool_allocations')->nullOnDelete();
            $table->foreignId('property_id')->nullable()->constrained('properties')->nullOnDelete();
            $table->foreignId('deal_id')->nullable()->constrained('deals')->nullOnDelete();

            // 👥 Parties
            $table->foreignId('buyer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('primary_agent_id')->nullable()->constrained('users')->nullOnDelete();

            // 🔄 Lifecycle
            $table->enum('status', [
                'DRAFT',
                'RESERVED',
                'BOOKED',
                'SOLD',
                'CANCELLED',
                'EXPIRED',
                'REFUNDED',
            ])->default('DRAFT');

            $table->dateTime('reserved_at')->nullable();
            $table->dateTime('booked_at')->nullable();
            $table->dateTime('closed_at')->nullable();
            $table->dateTime('cancelled_at')->nullable();
            $table->string('cancel_reason', 255)->nullable();
            $table->dateTime('expires_at')->nullable();

            // 💰 Commercial snapshot
            $table->decimal('base_price', 15, 2)->nullable();
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('fees_amount', 15, 2)->default(0);
            $table->decimal('tcp', 15, 2)->nullable();                 // total contract price
            $table->decimal('reservation_amount', 15, 2)->default(0);
            $table->decimal('downpayment_amount', 15, 2)->default(0);
            $table->decimal('balance_amount', 15, 2)->default(0);

            // 🏦 Terms snapshot
            $table->enum('financing', ['cash', 'bank', 'in_house', 'other'])->nullable();
            $table->json('payment_terms_json')->nullable();
            $table->string('reference_no', 100)->nullable();

            // 🗒️ Notes
            $table->text('remarks')->nullable();

            $table->timestamps();

            // ⚡ Helpful indexes
            $table->index(['status']);
            $table->index(['buyer_id', 'status']);
//            $table->index(['inventory_pool_id', 'status']);
            $table->index(['property_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};

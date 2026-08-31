<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDonationsTable extends Migration
{
    public function up()
    {
        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->onDelete('cascade');
            $table->string('donor_name');
            $table->string('donor_phone');
            $table->string('donor_email');
            $table->string('cloth_type');
            $table->integer('quantity');
            $table->enum('collection_type', ['pickup', 'drop']);
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('address')->nullable();
            $table->enum('status', ['pending', 'assigned', 'picked_up', 'delivered', 'verified'])->default('pending');
            $table->integer('verified_quantity')->nullable();
            $table->foreignId('agent_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('picked_up_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('donations');
    }
}

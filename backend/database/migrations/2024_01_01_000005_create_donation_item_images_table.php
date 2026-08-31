<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDonationItemImagesTable extends Migration
{
    public function up()
    {
        Schema::create('donation_item_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('donation_item_id')->constrained('donation_items')->onDelete('cascade');
            $table->string('path');       // storage path
            $table->string('url');        // public URL
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('donation_item_images');
    }
}

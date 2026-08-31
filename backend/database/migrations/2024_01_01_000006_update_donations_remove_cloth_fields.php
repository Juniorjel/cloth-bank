<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateDonationsRemoveClothFields extends Migration
{
    public function up()
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropColumn(['cloth_type', 'quantity']);
        });
    }

    public function down()
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->string('cloth_type')->nullable();
            $table->integer('quantity')->nullable();
        });
    }
}

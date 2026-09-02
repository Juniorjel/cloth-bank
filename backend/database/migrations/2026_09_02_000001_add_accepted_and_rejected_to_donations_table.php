<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class AddAcceptedAndRejectedToDonationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // 1. Update ENUM column for status to include 'accepted' and 'rejected'
        DB::statement("ALTER TABLE donations MODIFY COLUMN status ENUM('pending', 'accepted', 'rejected', 'assigned', 'picked_up', 'delivered', 'verified') NOT NULL DEFAULT 'pending'");

        // 2. Add rejection and triage tracking columns
        Schema::table('donations', function (Blueprint $table) {
            if (!Schema::hasColumn('donations', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('status');
            }
            if (!Schema::hasColumn('donations', 'accepted_by')) {
                $table->foreignId('accepted_by')->nullable()->after('rejection_reason')->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('donations', 'accepted_at')) {
                $table->timestamp('accepted_at')->nullable()->after('accepted_by');
            }
            if (!Schema::hasColumn('donations', 'rejected_by')) {
                $table->foreignId('rejected_by')->nullable()->after('accepted_at')->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('donations', 'rejected_at')) {
                $table->timestamp('rejected_at')->nullable()->after('rejected_by');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('donations', function (Blueprint $table) {
            if (Schema::hasColumn('donations', 'rejected_at')) {
                $table->dropColumn('rejected_at');
            }
            if (Schema::hasColumn('donations', 'rejected_by')) {
                $table->dropConstrainedForeignId('rejected_by');
            }
            if (Schema::hasColumn('donations', 'accepted_at')) {
                $table->dropColumn('accepted_at');
            }
            if (Schema::hasColumn('donations', 'accepted_by')) {
                $table->dropConstrainedForeignId('accepted_by');
            }
            if (Schema::hasColumn('donations', 'rejection_reason')) {
                $table->dropColumn('rejection_reason');
            }
        });

        DB::statement("ALTER TABLE donations MODIFY COLUMN status ENUM('pending', 'assigned', 'picked_up', 'delivered', 'verified') NOT NULL DEFAULT 'pending'");
    }
}

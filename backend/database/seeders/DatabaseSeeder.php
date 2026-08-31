<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Campaign;
use App\Models\ClothType;
use App\Models\Donation;
use App\Models\DonationItem;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // 1. Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@clothbank.com'],
            [
                'name'      => 'Super Admin',
                'password'  => Hash::make('password'),
                'role'      => 'admin',
                'phone'     => '9801000001',
                'is_active' => true,
            ]
        );

        $agent1 = User::firstOrCreate(
            ['email' => 'agent@clothbank.com'],
            [
                'name'      => 'Ram Shrestha',
                'password'  => Hash::make('password'),
                'role'      => 'agent',
                'phone'     => '9841234567',
                'is_active' => true,
            ]
        );

        $agent2 = User::firstOrCreate(
            ['email' => 'driver@clothbank.com'],
            [
                'name'      => 'Sita Thapa',
                'password'  => Hash::make('password'),
                'role'      => 'agent',
                'phone'     => '9812345678',
                'is_active' => true,
            ]
        );

        // 2. Campaigns
        $camp1 = Campaign::firstOrCreate(
            ['title' => 'Winter Clothes Drive 2024'],
            [
                'description' => 'Collecting warm jackets, sweaters, and blankets for vulnerable families in rural regions.',
                'start_date'  => Carbon::today()->subDays(10),
                'end_date'    => Carbon::today()->addDays(25),
                'status'      => 'active',
            ]
        );

        $camp2 = Campaign::firstOrCreate(
            ['title' => 'Kids & School Uniforms Support'],
            [
                'description' => 'Distributing clean clothing and shoes to children in community schools.',
                'start_date'  => Carbon::today()->subDays(5),
                'end_date'    => Carbon::today()->addDays(35),
                'status'      => 'active',
            ]
        );

        $camp3 = Campaign::firstOrCreate(
            ['title' => 'Summer Relief Clothes Drop'],
            [
                'description' => 'Light cotton garments and everyday wear for shelter homes.',
                'start_date'  => Carbon::today()->subDays(2),
                'end_date'    => Carbon::today()->addDays(40),
                'status'      => 'active',
            ]
        );

        // 3. Cloth Types
        $types = [
            'Winter Jackets & Coats',
            'Sweaters & Hoodies',
            "Children's Clothing",
            "Men's Casual Wear",
            "Women's Wear",
            'Blankets & Bedding',
            'Shoes & Footwear',
            'Scarves, Gloves & Caps',
            'Mixed / Other Garments',
        ];

        $clothTypeModels = [];
        foreach ($types as $type) {
            $clothTypeModels[] = ClothType::firstOrCreate(
                ['name' => $type],
                ['is_active' => true]
            );
        }

        // 4. Sample Donations with rich lifecycle data if table has fewer than 5 records
        if (Donation::count() < 4) {
            // Donation 1: Verified (Delivered & Verified)
            $d1 = Donation::create([
                'campaign_id'       => $camp1->id,
                'donor_name'        => 'Aarav Sharma',
                'donor_phone'       => '9841122334',
                'donor_email'       => 'aarav.sharma@example.com',
                'collection_type'   => 'pickup',
                'latitude'          => 27.7172,
                'longitude'         => 85.3240,
                'address'           => 'Lazimpat, Kathmandu',
                'status'            => 'verified',
                'agent_id'          => $agent1->id,
                'picked_up_at'      => Carbon::now()->subDays(3)->setTime(10, 30),
                'delivered_at'      => Carbon::now()->subDays(3)->setTime(15, 0),
                'verified_at'       => Carbon::now()->subDays(2)->setTime(11, 0),
                'verified_quantity' => 14,
                'created_at'        => Carbon::now()->subDays(4),
            ]);
            DonationItem::create([
                'donation_id'   => $d1->id,
                'cloth_type_id' => $clothTypeModels[0]->id,
                'quantity'      => 6,
                'note'          => 'Gently used puffer jackets',
            ]);
            DonationItem::create([
                'donation_id'   => $d1->id,
                'cloth_type_id' => $clothTypeModels[1]->id,
                'quantity'      => 8,
                'note'          => 'Woolen sweaters in good shape',
            ]);

            // Donation 2: Delivered (Awaiting Warehouse Verification)
            $d2 = Donation::create([
                'campaign_id'       => $camp1->id,
                'donor_name'        => 'Pooja KC',
                'donor_phone'       => '9860112233',
                'donor_email'       => 'pooja.kc@example.com',
                'collection_type'   => 'pickup',
                'latitude'          => 27.6710,
                'longitude'         => 85.3200,
                'address'           => 'Pulchowk, Lalitpur',
                'status'            => 'delivered',
                'agent_id'          => $agent1->id,
                'picked_up_at'      => Carbon::now()->subDay()->setTime(9, 15),
                'delivered_at'      => Carbon::now()->subDay()->setTime(14, 20),
                'created_at'        => Carbon::now()->subDays(2),
            ]);
            DonationItem::create([
                'donation_id'   => $d2->id,
                'cloth_type_id' => $clothTypeModels[2]->id,
                'quantity'      => 12,
                'note'          => 'Warm kids hoodies and thermal tops',
            ]);

            // Donation 3: Picked Up (In Transit)
            $d3 = Donation::create([
                'campaign_id'       => $camp2->id,
                'donor_name'        => 'Bikash Adhikari',
                'donor_phone'       => '9801234455',
                'donor_email'       => 'bikash.adhikari@example.com',
                'collection_type'   => 'pickup',
                'latitude'          => 27.6915,
                'longitude'         => 85.3420,
                'address'           => 'Baneshwor, Kathmandu',
                'status'            => 'picked_up',
                'agent_id'          => $agent2->id,
                'picked_up_at'      => Carbon::now()->subHours(3),
                'created_at'        => Carbon::now()->subDay(),
            ]);
            DonationItem::create([
                'donation_id'   => $d3->id,
                'cloth_type_id' => $clothTypeModels[3]->id,
                'quantity'      => 8,
                'note'          => 'Shirts and trousers',
            ]);
            DonationItem::create([
                'donation_id'   => $d3->id,
                'cloth_type_id' => $clothTypeModels[6]->id,
                'quantity'      => 4,
                'note'          => 'Clean sports shoes',
            ]);

            // Donation 4: Assigned (Scheduled for Driver Pickup)
            $d4 = Donation::create([
                'campaign_id'       => $camp2->id,
                'donor_name'        => 'Sunita Gurung',
                'donor_phone'       => '9818889900',
                'donor_email'       => 'sunita.gurung@example.com',
                'collection_type'   => 'pickup',
                'latitude'          => 27.7000,
                'longitude'         => 85.3000,
                'address'           => 'Kalanki, Kathmandu',
                'status'            => 'assigned',
                'agent_id'          => $agent2->id,
                'created_at'        => Carbon::now()->subHours(6),
            ]);
            DonationItem::create([
                'donation_id'   => $d4->id,
                'cloth_type_id' => $clothTypeModels[4]->id,
                'quantity'      => 10,
                'note'          => 'Cardigans and shawls',
            ]);

            // Donation 5: Pending Pickup
            $d5 = Donation::create([
                'campaign_id'       => $camp3->id,
                'donor_name'        => 'Rohan Shrestha',
                'donor_phone'       => '9849998877',
                'donor_email'       => 'rohan.shrestha@example.com',
                'collection_type'   => 'pickup',
                'latitude'          => 27.7100,
                'longitude'         => 85.3150,
                'address'           => 'Thamel, Kathmandu',
                'status'            => 'pending',
                'created_at'        => Carbon::now()->subHours(2),
            ]);
            DonationItem::create([
                'donation_id'   => $d5->id,
                'cloth_type_id' => $clothTypeModels[5]->id,
                'quantity'      => 5,
                'note'          => 'Warm fleece blankets',
            ]);
        }
    }
}

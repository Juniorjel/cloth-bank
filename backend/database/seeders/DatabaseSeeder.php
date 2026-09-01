<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;
use App\Models\Campaign;
use App\Models\ClothType;
use App\Models\Donation;
use App\Models\DonationItem;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // 1. Seed Roles & Permissions
        $this->call(PermissionSeeder::class);

        $adminRole = Role::where('slug', 'admin')->first();
        $agentRole = Role::where('slug', 'agent')->first();

        // 2. Seed Users with assigned roles
        $admin = User::updateOrCreate(
            ['email' => 'admin@clothbank.com'],
            [
                'name'      => 'Super Admin',
                'password'  => Hash::make('password'),
                'role'      => 'admin',
                'role_id'   => $adminRole ? $adminRole->id : null,
                'phone'     => '9801000001',
                'is_active' => true,
            ]
        );
        if ($adminRole) {
            $admin->roles()->syncWithoutDetaching([$adminRole->id]);
        }

        $agent1 = User::updateOrCreate(
            ['email' => 'agent@clothbank.com'],
            [
                'name'      => 'Ram Shrestha',
                'password'  => Hash::make('password'),
                'role'      => 'agent',
                'role_id'   => $agentRole ? $agentRole->id : null,
                'phone'     => '9841234567',
                'is_active' => true,
            ]
        );
        if ($agentRole) {
            $agent1->roles()->syncWithoutDetaching([$agentRole->id]);
        }

        $agent2 = User::updateOrCreate(
            ['email' => 'driver@clothbank.com'],
            [
                'name'      => 'Sita Thapa',
                'password'  => Hash::make('password'),
                'role'      => 'agent',
                'role_id'   => $agentRole ? $agentRole->id : null,
                'phone'     => '9812345678',
                'is_active' => true,
            ]
        );
        if ($agentRole) {
            $agent2->roles()->syncWithoutDetaching([$agentRole->id]);
        }

        // 3. Campaigns
        $camp1 = Campaign::updateOrCreate(
            ['title' => 'Winter Clothes Drive 2024'],
            [
                'description' => 'Collecting warm jackets, sweaters, and blankets for vulnerable families in rural regions.',
                'start_date'  => Carbon::today()->subDays(10),
                'end_date'    => Carbon::today()->addDays(25),
                'status'      => 'active',
            ]
        );

        $camp2 = Campaign::updateOrCreate(
            ['title' => 'School Uniforms for Kids'],
            [
                'description' => 'Gathering clean, reusable school uniforms, shirts, and trousers for underprivileged students.',
                'start_date'  => Carbon::today()->subDays(5),
                'end_date'    => Carbon::today()->addDays(40),
                'status'      => 'active',
            ]
        );

        $camp3 = Campaign::updateOrCreate(
            ['title' => 'Summer Youth Wear Campaign'],
            [
                'description' => 'Light cotton T-shirts, tops, and pants collection drive.',
                'start_date'  => Carbon::today()->subDays(20),
                'end_date'    => Carbon::today()->subDays(2),
                'status'      => 'inactive',
            ]
        );

        // 4. Cloth Types
        $typesData = [
            ['name' => 'Jackets & Coats', 'is_active' => true],
            ['name' => 'Shirts & T-Shirts', 'is_active' => true],
            ['name' => 'Pants & Jeans', 'is_active' => true],
            ['name' => 'Sweaters & Woolens', 'is_active' => true],
            ['name' => 'Children Wear', 'is_active' => true],
            ['name' => 'Blankets & Bedding', 'is_active' => true],
        ];

        $clothTypes = [];
        foreach ($typesData as $t) {
            $clothTypes[] = ClothType::updateOrCreate(['name' => $t['name']], $t);
        }

        // 5. Donations & Donation Items
        $donationsData = [
            [
                'donor_name'        => 'Rajib Kumar Bhujel',
                'donor_email'       => 'rajibjel@gmail.com',
                'donor_phone'       => '9801234560',
                'address'           => 'New Baneshwor, Kathmandu',
                'collection_type'   => 'pickup',
                'status'            => 'assigned',
                'campaign_id'       => $camp1->id,
                'agent_id'          => $agent1->id,
                'verified_quantity' => null,
                'items' => [
                    ['cloth_type_id' => $clothTypes[0]->id, 'quantity' => 3],
                    ['cloth_type_id' => $clothTypes[3]->id, 'quantity' => 2],
                ]
            ],
            [
                'donor_name'        => 'Aarav Sharma',
                'donor_email'       => 'aarav@example.com',
                'donor_phone'       => '9841122334',
                'address'           => 'Jhamsikhel, Lalitpur',
                'collection_type'   => 'pickup',
                'status'            => 'verified',
                'campaign_id'       => $camp1->id,
                'agent_id'          => $agent1->id,
                'verified_quantity' => 8,
                'items' => [
                    ['cloth_type_id' => $clothTypes[1]->id, 'quantity' => 5],
                    ['cloth_type_id' => $clothTypes[2]->id, 'quantity' => 3],
                ]
            ],
            [
                'donor_name'        => 'Pooja KC',
                'donor_email'       => 'pooja.kc@example.com',
                'donor_phone'       => '9860112233',
                'address'           => 'Maitidevi, Kathmandu',
                'collection_type'   => 'pickup',
                'status'            => 'delivered',
                'campaign_id'       => $camp2->id,
                'agent_id'          => $agent2->id,
                'verified_quantity' => null,
                'items' => [
                    ['cloth_type_id' => $clothTypes[4]->id, 'quantity' => 6],
                ]
            ],
            [
                'donor_name'        => 'Bikash Adhikari',
                'donor_email'       => 'bikash@example.com',
                'donor_phone'       => '9851239988',
                'address'           => 'Thamel, Kathmandu',
                'collection_type'   => 'pickup',
                'status'            => 'picked_up',
                'campaign_id'       => $camp1->id,
                'agent_id'          => $agent1->id,
                'verified_quantity' => null,
                'items' => [
                    ['cloth_type_id' => $clothTypes[0]->id, 'quantity' => 4],
                ]
            ],
            [
                'donor_name'        => 'Sunita Gurung',
                'donor_email'       => 'sunita.g@example.com',
                'donor_phone'       => '9818334455',
                'address'           => 'Patan Dhoka, Lalitpur',
                'collection_type'   => 'pickup',
                'status'            => 'assigned',
                'campaign_id'       => $camp2->id,
                'agent_id'          => $agent2->id,
                'verified_quantity' => null,
                'items' => [
                    ['cloth_type_id' => $clothTypes[1]->id, 'quantity' => 4],
                    ['cloth_type_id' => $clothTypes[4]->id, 'quantity' => 3],
                ]
            ],
            [
                'donor_name'        => 'Rohan Shrestha',
                'donor_email'       => 'rohan.sh@example.com',
                'donor_phone'       => '9849998877',
                'address'           => 'Kalanki, Kathmandu',
                'collection_type'   => 'pickup',
                'status'            => 'pending',
                'campaign_id'       => $camp1->id,
                'agent_id'          => null,
                'verified_quantity' => null,
                'items' => [
                    ['cloth_type_id' => $clothTypes[5]->id, 'quantity' => 2],
                    ['cloth_type_id' => $clothTypes[3]->id, 'quantity' => 4],
                ]
            ],
        ];

        foreach ($donationsData as $d) {
            $items = $d['items'];
            unset($d['items']);

            $donation = Donation::updateOrCreate(
                ['donor_email' => $d['donor_email'], 'donor_phone' => $d['donor_phone']],
                $d
            );

            foreach ($items as $item) {
                DonationItem::firstOrCreate(
                    [
                        'donation_id'   => $donation->id,
                        'cloth_type_id' => $item['cloth_type_id'],
                    ],
                    [
                        'quantity'      => $item['quantity'],
                        'note'          => $item['note'] ?? null,
                    ]
                );
            }
        }
    }
}

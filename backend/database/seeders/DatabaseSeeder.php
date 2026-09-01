<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Campaign;
use App\Models\ClothType;
use App\Models\Donation;
use App\Models\DonationItem;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // 1. Seed Granular Permissions
        $permissionData = [
            // Dashboard
            ['slug' => 'dashboard.view', 'name' => 'View Executive Dashboard', 'module' => 'Dashboard', 'description' => 'Access real-time KPI metrics, charts, and summary reports'],
            ['slug' => 'reports.view', 'name' => 'View & Export Reports', 'module' => 'Dashboard', 'description' => 'Export donation velocity and breakdown reports'],

            // Donations
            ['slug' => 'donations.view', 'name' => 'View Donations List', 'module' => 'Donations', 'description' => 'Browse all incoming clothing donation submissions'],
            ['slug' => 'donations.create', 'name' => 'Create / Submit Donation', 'module' => 'Donations', 'description' => 'Submit donation forms for donors or walk-in gifts'],
            ['slug' => 'donations.assign_driver', 'name' => 'Dispatch Drivers', 'module' => 'Donations', 'description' => 'Assign field logistics drivers to doorstep pickups'],
            ['slug' => 'donations.verify', 'name' => 'Verify Warehouse Intake', 'module' => 'Donations', 'description' => 'Inspect pieces, verify quantities, and issue certificates'],
            ['slug' => 'donations.update_status', 'name' => 'Update Lifecycle Status', 'module' => 'Donations', 'description' => 'Transition donation stages (Picked Up, Delivered, etc.)'],

            // Campaigns
            ['slug' => 'campaigns.view', 'name' => 'View Campaign Drives', 'module' => 'Campaigns', 'description' => 'View active and upcoming charity clothing campaigns'],
            ['slug' => 'campaigns.create', 'name' => 'Create Campaigns', 'module' => 'Campaigns', 'description' => 'Launch new clothing drive campaigns'],
            ['slug' => 'campaigns.edit', 'name' => 'Edit Campaigns', 'module' => 'Campaigns', 'description' => 'Update campaign details, targets, and dates'],
            ['slug' => 'campaigns.delete', 'name' => 'Delete Campaigns', 'module' => 'Campaigns', 'description' => 'Remove or cancel clothing campaigns'],

            // Clothing Types
            ['slug' => 'cloth_types.manage', 'name' => 'Manage Clothing Categories', 'module' => 'Cloth Categories', 'description' => 'Create, edit, toggle, and delete cloth categories'],

            // Staff & Users
            ['slug' => 'users.view', 'name' => 'View Staff & Users', 'module' => 'Users & Staff', 'description' => 'Access user list and profile details'],
            ['slug' => 'users.create', 'name' => 'Create Staff Accounts', 'module' => 'Users & Staff', 'description' => 'Add new administrators, agents, or staff members'],
            ['slug' => 'users.edit', 'name' => 'Edit Staff & Passwords', 'module' => 'Users & Staff', 'description' => 'Update staff profiles, roles, and status'],
            ['slug' => 'users.delete', 'name' => 'Delete Staff Accounts', 'module' => 'Users & Staff', 'description' => 'Remove staff accounts from system'],

            // Roles & Permissions
            ['slug' => 'roles.manage', 'name' => 'Manage Roles & Permissions', 'module' => 'Roles & RBAC', 'description' => 'Create custom roles and configure fine-grained permissions'],
        ];

        $permissions = [];
        foreach ($permissionData as $perm) {
            $permissions[$perm['slug']] = Permission::updateOrCreate(
                ['slug' => $perm['slug']],
                $perm
            );
        }

        // 2. Seed Roles
        $adminRole = Role::updateOrCreate(
            ['slug' => 'admin'],
            [
                'name'        => 'Super Admin',
                'description' => 'Full unrestricted access to all modules, management, dispatching, and system settings.',
                'is_system'   => true,
            ]
        );
        $adminRole->syncPermissions(collect($permissions)->pluck('id')->toArray());

        $agentRole = Role::updateOrCreate(
            ['slug' => 'agent'],
            [
                'name'        => 'Logistics Field Agent',
                'description' => 'Field driver assigned to pick up donated clothes, navigate GPS routes, and deliver to warehouse.',
                'is_system'   => true,
            ]
        );
        $agentRole->syncPermissions([
            $permissions['dashboard.view']->id,
            $permissions['donations.view']->id,
            $permissions['donations.update_status']->id,
        ]);

        $userRole = Role::updateOrCreate(
            ['slug' => 'user'],
            [
                'name'        => 'Donor / Normal User',
                'description' => 'Community donor who browses drives, submits clothes donations, and tracks pickup status.',
                'is_system'   => true,
            ]
        );
        $userRole->syncPermissions([
            $permissions['campaigns.view']->id,
            $permissions['donations.create']->id,
            $permissions['donations.view']->id,
        ]);

        $managerRole = Role::updateOrCreate(
            ['slug' => 'warehouse-manager'],
            [
                'name'        => 'Warehouse Intake Manager',
                'description' => 'Oversees sorting, piece verification, quality checking, and category management at the central hub.',
                'is_system'   => false,
            ]
        );
        $managerRole->syncPermissions([
            $permissions['dashboard.view']->id,
            $permissions['donations.view']->id,
            $permissions['donations.verify']->id,
            $permissions['donations.assign_driver']->id,
            $permissions['cloth_types.manage']->id,
            $permissions['campaigns.view']->id,
        ]);

        $coordRole = Role::updateOrCreate(
            ['slug' => 'campaign-coordinator'],
            [
                'name'        => 'Campaign Coordinator',
                'description' => 'Creates and promotes clothing drives, sets collection goals, and monitors campaign progress.',
                'is_system'   => false,
            ]
        );
        $coordRole->syncPermissions([
            $permissions['dashboard.view']->id,
            $permissions['campaigns.view']->id,
            $permissions['campaigns.create']->id,
            $permissions['campaigns.edit']->id,
            $permissions['donations.view']->id,
            $permissions['reports.view']->id,
        ]);

        // 3. Seed Users and assign roles
        $admin = User::updateOrCreate(
            ['email' => 'admin@clothbank.com'],
            [
                'name'      => 'Super Admin',
                'password'  => Hash::make('password'),
                'role'      => 'admin',
                'role_id'   => $adminRole->id,
                'phone'     => '9801000001',
                'is_active' => true,
            ]
        );
        $admin->roles()->syncWithoutDetaching([$adminRole->id]);

        $agent1 = User::updateOrCreate(
            ['email' => 'agent@clothbank.com'],
            [
                'name'      => 'Ram Shrestha',
                'password'  => Hash::make('password'),
                'role'      => 'agent',
                'role_id'   => $agentRole->id,
                'phone'     => '9841234567',
                'is_active' => true,
            ]
        );
        $agent1->roles()->syncWithoutDetaching([$agentRole->id]);

        $agent2 = User::updateOrCreate(
            ['email' => 'driver@clothbank.com'],
            [
                'name'      => 'Sita Thapa',
                'password'  => Hash::make('password'),
                'role'      => 'agent',
                'role_id'   => $agentRole->id,
                'phone'     => '9812345678',
                'is_active' => true,
            ]
        );
        $agent2->roles()->syncWithoutDetaching([$agentRole->id]);

        // 4. Campaigns
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

        // 5. Cloth Types
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

        // 6. Donations & Donation Items
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
                    ['cloth_type_id' => $clothTypes[0]->id, 'quantity' => 3, 'condition' => 'good'],
                    ['cloth_type_id' => $clothTypes[3]->id, 'quantity' => 2, 'condition' => 'gently_used'],
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
                    ['cloth_type_id' => $clothTypes[1]->id, 'quantity' => 5, 'condition' => 'good'],
                    ['cloth_type_id' => $clothTypes[2]->id, 'quantity' => 3, 'condition' => 'good'],
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
                    ['cloth_type_id' => $clothTypes[4]->id, 'quantity' => 6, 'condition' => 'good'],
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
                    ['cloth_type_id' => $clothTypes[0]->id, 'quantity' => 4, 'condition' => 'good'],
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
                    ['cloth_type_id' => $clothTypes[1]->id, 'quantity' => 4, 'condition' => 'good'],
                    ['cloth_type_id' => $clothTypes[4]->id, 'quantity' => 3, 'condition' => 'gently_used'],
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
                    ['cloth_type_id' => $clothTypes[5]->id, 'quantity' => 2, 'condition' => 'good'],
                    ['cloth_type_id' => $clothTypes[3]->id, 'quantity' => 4, 'condition' => 'good'],
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

            // Seed donation items
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

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds for permissions and default system roles.
     *
     * @return void
     */
    public function run()
    {
        // ── 1. Granular Modular Permissions Definition ──
        $permissions = [
            // Dashboard & Analytics
            [
                'slug'        => 'dashboard.view',
                'name'        => 'View Dashboard Metrics',
                'module'      => 'Dashboard',
                'description' => 'Access real-time KPI tiles, donation velocity trends, and breakdown charts.',
            ],
            [
                'slug'        => 'reports.view',
                'name'        => 'View Reports & Analytics',
                'module'      => 'Dashboard',
                'description' => 'Browse summary collection reports and donor activity metrics.',
            ],
            [
                'slug'        => 'reports.export',
                'name'        => 'Export Reports Data',
                'module'      => 'Dashboard',
                'description' => 'Export CSV/Excel spreadsheets of donation intake and dispatch metrics.',
            ],

            // Donations & Warehouse Intake
            [
                'slug'        => 'donations.view',
                'name'        => 'View All Donations',
                'module'      => 'Donations',
                'description' => 'Browse and filter the incoming clothing donation queue.',
            ],
            [
                'slug'        => 'donations.create',
                'name'        => 'Create / Submit Donation',
                'module'      => 'Donations',
                'description' => 'Submit donation forms for walk-in gifts or assisted donor intake.',
            ],
            [
                'slug'        => 'donations.assign_driver',
                'name'        => 'Dispatch Logistics Drivers',
                'module'      => 'Donations',
                'description' => 'Assign field logistics drivers to scheduled doorstep pickups.',
            ],
            [
                'slug'        => 'donations.verify',
                'name'        => 'Verify Warehouse Intake',
                'module'      => 'Donations',
                'description' => 'Inspect pieces, verify quantities, and issue thank-you email certificates.',
            ],
            [
                'slug'        => 'donations.update_status',
                'name'        => 'Update Lifecycle Status',
                'module'      => 'Donations',
                'description' => 'Transition donation stages (Picked Up, Delivered, Verified, etc.).',
            ],
            [
                'slug'        => 'donations.delete',
                'name'        => 'Delete Donation Records',
                'module'      => 'Donations',
                'description' => 'Remove voided or duplicate donation submissions from system.',
            ],
            [
                'slug'        => 'donations.track',
                'name'        => 'Track Donation Status',
                'module'      => 'Donations',
                'description' => 'Lookup real-time status and driver ETA by tracking reference ID.',
            ],

            // Campaigns & Clothes Drives
            [
                'slug'        => 'campaigns.view',
                'name'        => 'View Campaigns List',
                'module'      => 'Campaigns',
                'description' => 'Browse active, upcoming, and completed clothing drives.',
            ],
            [
                'slug'        => 'campaigns.create',
                'name'        => 'Create New Campaigns',
                'module'      => 'Campaigns',
                'description' => 'Launch new community donation drives with target dates and goals.',
            ],
            [
                'slug'        => 'campaigns.edit',
                'name'        => 'Edit Campaigns',
                'module'      => 'Campaigns',
                'description' => 'Update campaign titles, descriptions, goals, and schedule dates.',
            ],
            [
                'slug'        => 'campaigns.delete',
                'name'        => 'Delete Campaigns',
                'module'      => 'Campaigns',
                'description' => 'Remove or cancel promotional clothing drive campaigns.',
            ],
            [
                'slug'        => 'campaigns.pause_activate',
                'name'        => 'Pause / Activate Campaigns',
                'module'      => 'Campaigns',
                'description' => 'Toggle campaign active status to pause intake or reopen drives.',
            ],

            // Clothing Types & Categories
            [
                'slug'        => 'cloth_types.manage',
                'name'        => 'Manage Clothing Categories',
                'module'      => 'Cloth Categories',
                'description' => 'Create, edit, toggle active status, and delete cloth categories.',
            ],

            // Users, Staff & Agents
            [
                'slug'        => 'users.view',
                'name'        => 'View Staff & Users',
                'module'      => 'Users & Staff',
                'description' => 'Access system administrators, field drivers, and donor profiles.',
            ],
            [
                'slug'        => 'users.create',
                'name'        => 'Create Staff Accounts',
                'module'      => 'Users & Staff',
                'description' => 'Register new administrators, logistics drivers, and managers.',
            ],
            [
                'slug'        => 'users.edit',
                'name'        => 'Edit Staff & Passwords',
                'module'      => 'Users & Staff',
                'description' => 'Modify staff profile details, phone numbers, and reset credentials.',
            ],
            [
                'slug'        => 'users.delete',
                'name'        => 'Delete Staff Accounts',
                'module'      => 'Users & Staff',
                'description' => 'Remove staff and driver accounts from system directory.',
            ],
            [
                'slug'        => 'users.assign_role',
                'name'        => 'Assign Staff Roles',
                'module'      => 'Users & Staff',
                'description' => 'Change user role assignments and grant custom permission sets.',
            ],

            // Roles & RBAC System
            [
                'slug'        => 'roles.manage',
                'name'        => 'Manage Roles & Permissions',
                'module'      => 'Roles & RBAC',
                'description' => 'Create custom roles and configure granular module permissions matrix.',
            ],

            // Mobile App & Field Logistics
            [
                'slug'        => 'logistics.pickup',
                'name'        => 'Perform Doorstep Pickups',
                'module'      => 'Field Logistics',
                'description' => 'Access driver pickup queue, one-touch phone dialer, and GPS navigation.',
            ],
            [
                'slug'        => 'logistics.deliver',
                'name'        => 'Deliver Intake to Warehouse',
                'module'      => 'Field Logistics',
                'description' => 'Hand over collected items to central warehouse intake desk.',
            ],
        ];

        // ── 2. Create or Update Permissions ──
        $seededPermissions = [];
        foreach ($permissions as $perm) {
            $seededPermissions[$perm['slug']] = Permission::updateOrCreate(
                ['slug' => $perm['slug']],
                $perm
            );
        }

        // ── 3. Configure Default System Roles ──

        // Super Admin (All Permissions)
        $adminRole = Role::updateOrCreate(
            ['slug' => 'admin'],
            [
                'name'        => 'Super Admin',
                'description' => 'Unrestricted access to all operational modules, settings, dispatching, and RBAC management.',
                'is_system'   => true,
            ]
        );
        $adminRole->syncPermissions(collect($seededPermissions)->pluck('id')->toArray());

        // Logistics Field Agent
        $agentRole = Role::updateOrCreate(
            ['slug' => 'agent'],
            [
                'name'        => 'Logistics Field Agent',
                'description' => 'Field driver assigned to pick up donated clothes, navigate GPS routes, and deliver to warehouse.',
                'is_system'   => true,
            ]
        );
        $agentRole->syncPermissions([
            $seededPermissions['dashboard.view']->id,
            $seededPermissions['donations.view']->id,
            $seededPermissions['donations.update_status']->id,
            $seededPermissions['logistics.pickup']->id,
            $seededPermissions['logistics.deliver']->id,
        ]);

        // Donor / Normal User
        $userRole = Role::updateOrCreate(
            ['slug' => 'user'],
            [
                'name'        => 'Donor / Normal User',
                'description' => 'Community donor who browses drives, submits clothes donations, and tracks pickup status.',
                'is_system'   => true,
            ]
        );
        $userRole->syncPermissions([
            $seededPermissions['campaigns.view']->id,
            $seededPermissions['donations.create']->id,
            $seededPermissions['donations.view']->id,
            $seededPermissions['donations.track']->id,
        ]);

        // Warehouse Intake Manager
        $managerRole = Role::updateOrCreate(
            ['slug' => 'warehouse-manager'],
            [
                'name'        => 'Warehouse Intake Manager',
                'description' => 'Oversees sorting, piece verification, quality checking, and category management at the central hub.',
                'is_system'   => false,
            ]
        );
        $managerRole->syncPermissions([
            $seededPermissions['dashboard.view']->id,
            $seededPermissions['donations.view']->id,
            $seededPermissions['donations.verify']->id,
            $seededPermissions['donations.assign_driver']->id,
            $seededPermissions['cloth_types.manage']->id,
            $seededPermissions['campaigns.view']->id,
            $seededPermissions['reports.view']->id,
        ]);

        // Campaign Coordinator
        $coordRole = Role::updateOrCreate(
            ['slug' => 'campaign-coordinator'],
            [
                'name'        => 'Campaign Coordinator',
                'description' => 'Creates and promotes clothing drives, sets collection goals, and monitors campaign progress.',
                'is_system'   => false,
            ]
        );
        $coordRole->syncPermissions([
            $seededPermissions['dashboard.view']->id,
            $seededPermissions['campaigns.view']->id,
            $seededPermissions['campaigns.create']->id,
            $seededPermissions['campaigns.edit']->id,
            $seededPermissions['campaigns.pause_activate']->id,
            $seededPermissions['donations.view']->id,
            $seededPermissions['reports.view']->id,
        ]);

        $this->command->info('Seeded ' . count($seededPermissions) . ' granular permissions and 5 system roles successfully!');
    }
}

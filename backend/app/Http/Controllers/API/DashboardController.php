<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Donation;
use App\Models\DonationItem;
use App\Models\ClothType;
use App\Models\User;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $totalDonations    = Donation::count();
        $pendingCount      = Donation::where('status', 'pending')->count();
        $acceptedCount     = Donation::where('status', 'accepted')->count();
        $rejectedCount     = Donation::where('status', 'rejected')->count();
        $assignedCount     = Donation::where('status', 'assigned')->count();
        $pickedUpCount     = Donation::where('status', 'picked_up')->count();
        $deliveredCount    = Donation::where('status', 'delivered')->count();
        $verifiedCount     = Donation::where('status', 'verified')->count();

        $pickupModeCount   = Donation::where('collection_type', 'pickup')->count();
        $dropModeCount     = Donation::where('collection_type', 'drop')->count();

        $totalClothes      = DonationItem::whereHas('donation', function ($q) {
            $q->where('status', '!=', 'rejected');
        })->sum('quantity') ?: 0;
        $verifiedClothes   = Donation::where('status', 'verified')->sum('verified_quantity') ?: 0;

        $stats = [
            'total_campaigns'    => Campaign::count(),
            'active_campaigns'   => Campaign::where('status', 'active')->count(),
            'total_donations'    => $totalDonations,
            'pending_donations'  => $pendingCount,
            'accepted_donations' => $acceptedCount,
            'rejected_donations' => $rejectedCount,
            'assigned_donations' => $assignedCount,
            'picked_up_donations'=> $pickedUpCount,
            'delivered_donations'=> $deliveredCount,
            'verified_donations' => $verifiedCount,
            'total_agents'       => User::where('role', 'agent')->count(),
            'total_quantity'     => $totalClothes,
            'verified_quantity'  => $verifiedClothes,
            'pickup_count'       => $pickupModeCount,
            'drop_count'         => $dropModeCount,
        ];

        // Status breakdown object & list
        $statusBreakdownObj = [
            'pending'   => $pendingCount,
            'accepted'  => $acceptedCount,
            'rejected'  => $rejectedCount,
            'assigned'  => $assignedCount,
            'picked_up' => $pickedUpCount,
            'delivered' => $deliveredCount,
            'verified'  => $verifiedCount,
        ];

        $statusBreakdownList = [
            ['status' => 'Pending',   'key' => 'pending',   'count' => $pendingCount,   'color' => '#f59e0b'],
            ['status' => 'Accepted',  'key' => 'accepted',  'count' => $acceptedCount,  'color' => '#6366f1'],
            ['status' => 'Assigned',  'key' => 'assigned',  'count' => $assignedCount,  'color' => '#0ea5e9'],
            ['status' => 'Picked Up', 'key' => 'picked_up', 'count' => $pickedUpCount,  'color' => '#8b5cf6'],
            ['status' => 'Delivered', 'key' => 'delivered', 'count' => $deliveredCount, 'color' => '#ec4899'],
            ['status' => 'Verified',  'key' => 'verified',  'count' => $verifiedCount,  'color' => '#10b981'],
            ['status' => 'Rejected',  'key' => 'rejected',  'count' => $rejectedCount,  'color' => '#ef4444'],
        ];

        // Last 7 days donation trend
        $velocitySeries = [];
        $weeklyTrends   = [];
        for ($i = 6; $i >= 0; $i--) {
            $date      = Carbon::today()->subDays($i);
            $dayLabel  = $date->format('D');
            $fullLabel = $date->format('D, M j');
            $count     = Donation::whereDate('created_at', $date)->count();

            $velocitySeries[] = [
                'label' => $dayLabel,
                'count' => $count,
            ];
            $weeklyTrends[] = [
                'day'   => $fullLabel,
                'count' => $count,
            ];
        }

        // Top Categories
        $topCategories = ClothType::withCount('donationItems')
            ->get()
            ->map(function ($t) {
                return [
                    'name'  => $t->name,
                    'count' => $t->donation_items_count ?? 0,
                ];
            })
            ->sortByDesc('count')
            ->take(5)
            ->values();

        // Recent 5 donations
        $recentDonations = Donation::with(['campaign', 'agent', 'items.clothType'])
            ->latest()
            ->take(6)
            ->get();

        // Active Campaigns with total quantity collected
        $campaignsList = Campaign::withCount('donations')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($c) {
                return [
                    'id'               => $c->id,
                    'title'            => $c->title,
                    'campaign'         => $c->title,
                    'status'           => $c->status,
                    'target_quantity'  => $c->target_quantity ?? 100,
                    'total_quantity'   => $c->totalQuantity(),
                    'donations_count'  => $c->donations_count,
                    'donations'        => $c->donations_count,
                ];
            });

        // Agent stats
        $agentStats = User::where('role', 'agent')
            ->withCount(['donations as total_assigned'])
            ->withCount(['donations as total_verified' => function ($q) {
                $q->where('status', 'verified');
            }])
            ->get()
            ->map(function ($a) {
                return [
                    'agent'          => $a->name,
                    'phone'          => $a->phone,
                    'total_assigned' => $a->total_assigned,
                    'total_verified' => $a->total_verified,
                ];
            });

        return response()->json([
            'total_campaigns'    => Campaign::count(),
            'active_campaigns'   => Campaign::where('status', 'active')->count(),
            'total_donations'    => $totalDonations,
            'pending_donations'  => $pendingCount,
            'assigned_donations' => $assignedCount,
            'picked_up_donations'=> $pickedUpCount,
            'delivered_donations'=> $deliveredCount,
            'verified_donations' => $verifiedCount,
            'total_agents'       => User::where('role', 'agent')->count(),
            'total_quantity'     => $totalClothes,
            'verified_quantity'  => $verifiedClothes,
            'pickup_count'       => $pickupModeCount,
            'drop_count'         => $dropModeCount,

            'stats'              => $stats,
            'status_breakdown'   => $statusBreakdownObj,
            'statusBreakdown'    => $statusBreakdownList,
            'velocity_series'    => $velocitySeries,
            'weeklyTrends'       => $weeklyTrends,
            'topCategories'      => $topCategories,
            'recent_donations'   => $recentDonations,
            'recentDonations'    => $recentDonations,
            'campaigns_list'     => $campaignsList,
            'campaignStats'      => $campaignsList,
            'agentStats'         => $agentStats,
        ]);
    }
}

<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CampaignController;
use App\Http\Controllers\API\DonationController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\ClothTypeController;
use App\Http\Controllers\API\RoleController;

/*
|--------------------------------------------------------------------------
| Public Routes (No Auth Required — for Guests & Mobile Dynamic Setup)
|--------------------------------------------------------------------------
*/
Route::get('/ping', [AuthController::class, 'ping']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Public donation intake & categories (matches web guest /donate form)
Route::get('/campaigns/active', [CampaignController::class, 'index']);
Route::get('/campaigns/{id}', [CampaignController::class, 'show']);
Route::post('/donations', [DonationController::class, 'store']);
Route::get('/cloth-types', [ClothTypeController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Authenticated Routes (Staff: Admin & Field Driver)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:api')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/my-donations', [DonationController::class, 'myDonations']);

    // Admin Routes
    Route::middleware('admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);

        // Campaigns
        Route::get('/campaigns', [CampaignController::class, 'index']);
        Route::post('/campaigns', [CampaignController::class, 'store']);
        Route::put('/campaigns/{id}', [CampaignController::class, 'update']);
        Route::delete('/campaigns/{id}', [CampaignController::class, 'destroy']);

        // Cloth Types (admin full CRUD)
        Route::post('/cloth-types', [ClothTypeController::class, 'store']);
        Route::put('/cloth-types/{id}', [ClothTypeController::class, 'update']);
        Route::delete('/cloth-types/{id}', [ClothTypeController::class, 'destroy']);

        // Donations
        Route::get('/donations', [DonationController::class, 'index']);
        Route::get('/donations/stats', [DonationController::class, 'stats']);
        Route::get('/donations/{id}', [DonationController::class, 'show']);
        Route::patch('/donations/{id}/assign', [DonationController::class, 'assign']);
        Route::patch('/donations/{id}/verify', [DonationController::class, 'verify']);

        // Users
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/agents', [UserController::class, 'agents']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);

        // Roles & Permissions (Custom RBAC)
        Route::get('/roles', [RoleController::class, 'index']);
        Route::get('/roles/{id}', [RoleController::class, 'show']);
        Route::post('/roles', [RoleController::class, 'store']);
        Route::put('/roles/{id}', [RoleController::class, 'update']);
        Route::delete('/roles/{id}', [RoleController::class, 'destroy']);
        Route::get('/permissions', [RoleController::class, 'permissions']);
    });

    // Agent Routes
    Route::middleware('agent')->group(function () {
        Route::get('/agent/pickups', [DonationController::class, 'agentPickups']);
        Route::patch('/donations/{id}/pickup', [DonationController::class, 'markPickedUp']);
        Route::patch('/donations/{id}/deliver', [DonationController::class, 'markDelivered']);
    });
});

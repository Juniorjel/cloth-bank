<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\Interfaces\CampaignRepositoryInterface;
use App\Repositories\Interfaces\DonationRepositoryInterface;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Repositories\Interfaces\ClothTypeRepositoryInterface;
use App\Repositories\CampaignRepository;
use App\Repositories\DonationRepository;
use App\Repositories\UserRepository;
use App\Repositories\ClothTypeRepository;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register()
    {
        $this->app->bind(CampaignRepositoryInterface::class, CampaignRepository::class);
        $this->app->bind(DonationRepositoryInterface::class, DonationRepository::class);
        $this->app->bind(UserRepositoryInterface::class,     UserRepository::class);
        $this->app->bind(ClothTypeRepositoryInterface::class, ClothTypeRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}

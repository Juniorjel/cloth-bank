<?php

namespace App\Repositories;

use App\Models\Campaign;
use App\Repositories\Interfaces\CampaignRepositoryInterface;

class CampaignRepository implements CampaignRepositoryInterface
{
    protected $model;

    public function __construct(Campaign $model)
    {
        $this->model = $model;
    }

    public function all()
    {
        return $this->model->withCount('donations')->latest()->get();
    }

    public function find($id)
    {
        return $this->model->withCount('donations')->findOrFail($id);
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function update($id, array $data)
    {
        $campaign = $this->model->findOrFail($id);
        $campaign->update($data);
        return $campaign;
    }

    public function delete($id)
    {
        $campaign = $this->model->findOrFail($id);
        return $campaign->delete();
    }

    public function active()
    {
        return $this->model->where('status', 'active')
            ->whereDate('start_date', '<=', today())
            ->whereDate('end_date', '>=', today())
            ->get();
    }
}

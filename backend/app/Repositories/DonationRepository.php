<?php

namespace App\Repositories;

use App\Models\Donation;
use App\Repositories\Interfaces\DonationRepositoryInterface;

class DonationRepository implements DonationRepositoryInterface
{
    protected $model;

    public function __construct(Donation $model)
    {
        $this->model = $model;
    }

    public function all(array $filters = [])
    {
        $query = $this->model->with(['campaign', 'agent', 'acceptedBy', 'rejectedBy', 'items.clothType', 'items.images']);

        if (!empty($filters['campaign_id'])) {
            $query->where('campaign_id', $filters['campaign_id']);
        }
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['agent_id'])) {
            $query->where('agent_id', $filters['agent_id']);
        }

        return $query->latest()->get();
    }

    public function find($id)
    {
        return $this->model
            ->with(['campaign', 'agent', 'acceptedBy', 'rejectedBy', 'items.clothType', 'items.images'])
            ->findOrFail($id);
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function update($id, array $data)
    {
        $donation = $this->model->findOrFail($id);
        $donation->update($data);
        return $donation->fresh(['campaign', 'agent', 'acceptedBy', 'rejectedBy', 'items.clothType', 'items.images']);
    }

    public function getByAgent($agentId)
    {
        return $this->model
            ->with(['campaign', 'items.clothType', 'items.images'])
            ->where('agent_id', $agentId)
            ->whereIn('status', ['assigned', 'picked_up', 'delivered'])
            ->latest()
            ->get();
    }

    public function getStats()
    {
        return [
            'total'                   => $this->model->count(),
            'pending'                 => $this->model->where('status', 'pending')->count(),
            'accepted'                => $this->model->where('status', 'accepted')->count(),
            'rejected'                => $this->model->where('status', 'rejected')->count(),
            'assigned'                => $this->model->where('status', 'assigned')->count(),
            'picked_up'               => $this->model->where('status', 'picked_up')->count(),
            'delivered'               => $this->model->where('status', 'delivered')->count(),
            'verified'                => $this->model->where('status', 'verified')->count(),
            'verified_quantity_total' => $this->model->sum('verified_quantity'),
        ];
    }
}

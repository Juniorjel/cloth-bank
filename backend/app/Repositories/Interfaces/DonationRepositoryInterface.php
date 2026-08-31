<?php

namespace App\Repositories\Interfaces;

interface DonationRepositoryInterface
{
    public function all(array $filters = []);
    public function find($id);
    public function create(array $data);
    public function update($id, array $data);
    public function getByAgent($agentId);
    public function getStats();
}

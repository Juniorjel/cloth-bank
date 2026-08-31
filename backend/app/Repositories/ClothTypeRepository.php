<?php

namespace App\Repositories;

use App\Models\ClothType;
use App\Repositories\Interfaces\ClothTypeRepositoryInterface;

class ClothTypeRepository implements ClothTypeRepositoryInterface
{
    protected $model;

    public function __construct(ClothType $model)
    {
        $this->model = $model;
    }

    public function all()
    {
        return $this->model->latest()->get();
    }

    public function active()
    {
        return $this->model->where('is_active', true)->orderBy('name')->get();
    }

    public function find($id)
    {
        return $this->model->findOrFail($id);
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function update($id, array $data)
    {
        $type = $this->model->findOrFail($id);
        $type->update($data);
        return $type;
    }

    public function delete($id)
    {
        $type = $this->model->findOrFail($id);
        return $type->delete();
    }
}

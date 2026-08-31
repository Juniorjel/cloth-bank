<?php

namespace App\Repositories\Interfaces;

interface ClothTypeRepositoryInterface
{
    public function all();
    public function active();
    public function find($id);
    public function create(array $data);
    public function update($id, array $data);
    public function delete($id);
}

<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Repositories\Interfaces\ClothTypeRepositoryInterface;
use Illuminate\Http\Request;

class ClothTypeController extends Controller
{
    protected $repo;

    public function __construct(ClothTypeRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }

    // GET /api/cloth-types — public (active only) or admin (all)
    public function index(Request $request)
    {
        $user = auth('api')->user() ?? $request->user();
        if ($user && $user->isAdmin()) {
            return response()->json($this->repo->all());
        }
        return response()->json($this->repo->active());
    }

    // POST /api/cloth-types — admin only
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'      => 'required|string|max:100|unique:cloth_types,name',
            'is_active' => 'boolean',
        ]);
        return response()->json($this->repo->create($data), 201);
    }

    // PUT /api/cloth-types/{id} — admin only
    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'name'      => 'sometimes|string|max:100|unique:cloth_types,name,' . $id,
            'is_active' => 'boolean',
        ]);
        return response()->json($this->repo->update($id, $data));
    }

    // DELETE /api/cloth-types/{id} — admin only
    public function destroy($id)
    {
        $this->repo->delete($id);
        return response()->json(['message' => 'Cloth type deleted.']);
    }
}

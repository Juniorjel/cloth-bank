<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Http\Request;

class UserController extends Controller
{
    protected $userRepo;

    public function __construct(UserRepositoryInterface $userRepo)
    {
        $this->userRepo = $userRepo;
    }

    // GET /api/users - Admin only
    public function index()
    {
        $users = $this->userRepo->all();
        return response()->json($users);
    }

    // GET /api/users/agents - Admin only
    public function agents()
    {
        $agents = $this->userRepo->agents();
        return response()->json($agents);
    }

    // GET /api/users/{id}
    public function show($id)
    {
        $user = $this->userRepo->find($id);
        return response()->json($user);
    }

    // POST /api/users - Admin only
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'      => 'required|string|max:255',
            'email'     => 'required|email|unique:users,email',
            'phone'     => 'nullable|string|max:20',
            'password'  => 'required|string|min:6',
            'role'      => 'nullable|string|max:50',
            'role_id'   => 'nullable|exists:roles,id',
            'role_ids'  => 'nullable|array',
            'role_ids.*'=> 'exists:roles,id',
            'is_active' => 'boolean',
        ]);

        $user = $this->userRepo->create($data);
        return response()->json($user, 201);
    }

    // PUT /api/users/{id} - Admin only
    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'name'      => 'sometimes|string|max:255',
            'email'     => 'sometimes|email|unique:users,email,' . $id,
            'phone'     => 'nullable|string|max:20',
            'password'  => 'nullable|string|min:6',
            'role'      => 'nullable|string|max:50',
            'role_id'   => 'nullable|exists:roles,id',
            'role_ids'  => 'nullable|array',
            'role_ids.*'=> 'exists:roles,id',
            'is_active' => 'boolean',
        ]);

        $user = $this->userRepo->update($id, $data);
        return response()->json($user);
    }

    // DELETE /api/users/{id} - Admin only
    public function destroy($id)
    {
        $this->userRepo->delete($id);
        return response()->json(['message' => 'User deleted']);
    }
}

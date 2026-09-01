<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Role;
use App\Models\Permission;

class RoleController extends Controller
{
    // GET /api/roles
    public function index()
    {
        $roles = Role::with(['permissions', 'users:id,name,email'])
            ->withCount('users')
            ->orderBy('is_system', 'desc')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json($roles);
    }

    // GET /api/permissions
    public function permissions()
    {
        $permissions = Permission::orderBy('module')->orderBy('name')->get();
        $grouped = $permissions->groupBy('module');

        return response()->json([
            'all'     => $permissions,
            'grouped' => $grouped,
        ]);
    }

    // POST /api/roles
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'slug'           => 'nullable|string|max:255|unique:roles,slug',
            'description'    => 'nullable|string',
            'permission_ids' => 'nullable|array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);

        $slug = !empty($data['slug']) ? Str::slug($data['slug']) : Str::slug($data['name']);

        // Ensure unique slug
        $originalSlug = $slug;
        $count = 1;
        while (Role::where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-{$count}";
            $count++;
        }

        $role = Role::create([
            'name'        => $data['name'],
            'slug'        => $slug,
            'description' => $data['description'] ?? null,
            'is_system'   => false,
        ]);

        if (!empty($data['permission_ids'])) {
            $role->syncPermissions($data['permission_ids']);
        }

        $role->load('permissions');

        return response()->json([
            'message' => 'Role created successfully',
            'role'    => $role,
        ], 201);
    }

    // GET /api/roles/{id}
    public function show($id)
    {
        $role = Role::with(['permissions', 'users:id,name,email,role'])->findOrFail($id);
        return response()->json($role);
    }

    // PUT /api/roles/{id}
    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'slug'           => 'nullable|string|max:255|unique:roles,slug,' . $role->id,
            'description'    => 'nullable|string',
            'permission_ids' => 'nullable|array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);

        $updateData = [
            'name'        => $data['name'],
            'description' => $data['description'] ?? null,
        ];

        // Only allow slug modification on non-system roles
        if (!$role->is_system && !empty($data['slug'])) {
            $updateData['slug'] = Str::slug($data['slug']);
        }

        $role->update($updateData);

        if (isset($data['permission_ids'])) {
            $role->syncPermissions($data['permission_ids']);
        }

        $role->load(['permissions', 'users']);

        return response()->json([
            'message' => 'Role updated successfully',
            'role'    => $role,
        ]);
    }

    // DELETE /api/roles/{id}
    public function destroy($id)
    {
        $role = Role::withCount('users')->findOrFail($id);

        if ($role->is_system) {
            return response()->json(['message' => 'System roles cannot be deleted'], 422);
        }

        if ($role->users_count > 0) {
            return response()->json(['message' => 'Cannot delete role with assigned users. Reassign users first.'], 422);
        }

        $role->permissions()->detach();
        $role->delete();

        return response()->json(['message' => 'Role deleted successfully']);
    }
}

<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    // GET /api/ping — Dynamic Server Reachability & QR Verification
    public function ping(Request $request)
    {
        return response()->json([
            'status'      => 'online',
            'app_name'    => config('app.name', 'Cloth Bank'),
            'version'     => '1.0.0',
            'client_name' => 'Cloth Bank Central Hub',
            'server_time' => now()->toIso8601String(),
            'features'    => [
                'roles'            => ['admin', 'agent', 'user'],
                'photo_uploads'    => true,
                'qr_config'        => true,
                'email_reminders'  => true,
            ]
        ]);
    }

    // POST /api/register — Normal User / Donor Registration
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'phone'    => 'nullable|string|max:20',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name'      => $data['name'],
            'email'     => $data['email'],
            'phone'     => $data['phone'] ?? null,
            'password'  => Hash::make($data['password']),
            'role'      => 'user',
            'is_active' => true,
        ]);

        $token = $user->createToken('ClothBankToken')->accessToken;

        return response()->json([
            'message' => 'Registration successful',
            'token'   => $token,
            'user'    => [
                'id'          => $user->id,
                'name'        => $user->name,
                'email'       => $user->email,
                'phone'       => $user->phone,
                'role'        => $user->role,
                'permissions' => $user->permissions,
            ],
        ], 201);
    }

    // POST /api/login — Multi-role Authentication (Admin, Agent, User)
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = Auth::user();

        if (!$user->is_active) {
            return response()->json(['message' => 'Your account is deactivated'], 403);
        }

        $token = $user->createToken('ClothBankToken')->accessToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'          => $user->id,
                'name'        => $user->name,
                'email'       => $user->email,
                'phone'       => $user->phone,
                'role'        => $user->role,
                'permissions' => $user->permissions,
            ],
        ]);
    }

    // POST /api/logout
    public function logout(Request $request)
    {
        if ($request->user() && $request->user()->token()) {
            $request->user()->token()->revoke();
        }
        return response()->json(['message' => 'Logged out successfully']);
    }

    // GET /api/me
    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id'          => $user->id,
            'name'        => $user->name,
            'email'       => $user->email,
            'phone'       => $user->phone,
            'role'        => $user->role,
            'permissions' => $user->permissions,
        ]);
    }
}

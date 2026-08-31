<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AgentMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || (!$request->user()->isAgent() && !$request->user()->isAdmin())) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return $next($request);
    }
}

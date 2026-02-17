<?php

namespace App\Http\Controllers\Api;

use App\Domain\Workspace\ResolveWorkspace;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request, ResolveWorkspace $resolveWorkspace): JsonResponse
    {
        $workspace = $resolveWorkspace(
            $request->user(),
            $request->filled('workspace_id') ? (int) $request->query('workspace_id') : null
        );

        $memberIds = $workspace->members()->pluck('users.id')->push($workspace->owner_id)->unique();

        return response()->json([
            'users' => User::query()
                ->whereIn('id', $memberIds)
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'role']),
        ]);
    }
}


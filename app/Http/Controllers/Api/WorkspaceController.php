<?php

namespace App\Http\Controllers\Api;

use App\Domain\Workspace\ResolveWorkspace;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Workspace\JoinWorkspaceRequest;
use App\Http\Requests\Api\Workspace\StoreWorkspaceRequest;
use App\Http\Requests\Api\Workspace\UpdateWorkspaceRequest;
use App\Http\Resources\WorkspaceResource;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WorkspaceController extends Controller
{
    private function generateJoinCode(): string
    {
        do {
            $code = strtoupper(Str::random(10));
        } while (Workspace::query()->where('join_code', $code)->exists());

        return $code;
    }

    public function index(Request $request, ResolveWorkspace $resolveWorkspace): JsonResponse
    {
        $actor = $request->user();
        $current = $resolveWorkspace($actor);

        $workspaces = Workspace::query()
            ->where(function ($query) use ($actor) {
                $query->where('owner_id', $actor->id)
                    ->orWhereHas('members', fn ($members) => $members->where('users.id', $actor->id));
            })
            ->orderBy('id')
            ->get();

        return response()->json([
            'workspaces' => WorkspaceResource::collection($workspaces),
            'current_workspace_id' => $current->id,
        ]);
    }

    public function store(StoreWorkspaceRequest $request): JsonResponse
    {
        $workspace = new Workspace();
        $workspace->forceFill([
            'owner_id' => $request->user()->id,
            'name' => $request->validated('name'),
            'color' => $request->validated('color'),
            'join_code' => $this->generateJoinCode(),
        ]);
        $workspace->saveOrFail();
        $workspace->members()->syncWithoutDetaching([$request->user()->id => ['role' => 'owner']]);

        return response()->json([
            'workspace' => WorkspaceResource::make($workspace),
        ], 201);
    }

    public function switch(Request $request, Workspace $workspace): JsonResponse
    {
        $actor = $request->user();

        $isMember = $workspace->owner_id === $actor->id
            || $workspace->members()->where('users.id', $actor->id)->exists();
        if (! $isMember) {
            abort(403);
        }

        $actor->forceFill(['current_workspace_id' => $workspace->id])->save();

        return response()->json([
            'workspace' => WorkspaceResource::make($workspace),
            'message' => 'Пространство переключено.',
        ]);
    }

    public function update(UpdateWorkspaceRequest $request, Workspace $workspace): JsonResponse
    {
        if ($workspace->owner_id !== $request->user()->id) {
            abort(403);
        }

        $workspace->fill($request->validated());
        $workspace->save();

        return response()->json([
            'workspace' => WorkspaceResource::make($workspace->fresh()),
        ]);
    }

    public function join(JoinWorkspaceRequest $request): JsonResponse
    {
        $joinCode = strtoupper($request->validated('join_code'));

        $workspace = Workspace::query()->where('join_code', $joinCode)->first();
        if (! $workspace) {
            return response()->json([
                'message' => 'Пространство с таким кодом не найдено.',
            ], 422);
        }

        $workspace->members()->syncWithoutDetaching([
            $request->user()->id => ['role' => 'member'],
        ]);
        $request->user()->forceFill(['current_workspace_id' => $workspace->id])->save();

        return response()->json([
            'workspace' => WorkspaceResource::make($workspace),
            'message' => 'Подключение к пространству выполнено.',
        ]);
    }

    public function members(Request $request, Workspace $workspace): JsonResponse
    {
        $actor = $request->user();
        $isMember = $workspace->owner_id === $actor->id
            || $workspace->members()->where('users.id', $actor->id)->exists();
        if (! $isMember) {
            abort(403);
        }

        $users = $workspace->members()
            ->orderBy('users.name')
            ->get(['users.id', 'users.name', 'users.email', 'users.role']);

        if (! $users->contains('id', $workspace->owner_id)) {
            $owner = $workspace->owner()->first(['id', 'name', 'email', 'role']);
            if ($owner) {
                $users->push($owner);
            }
        }

        return response()->json([
            'users' => $users->unique('id')->values(),
        ]);
    }
}


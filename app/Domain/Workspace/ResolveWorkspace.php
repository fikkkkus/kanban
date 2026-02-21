<?php

namespace App\Domain\Workspace;

use App\Models\User;
use App\Models\Workspace;

class ResolveWorkspace
{
    private function generateJoinCode(): string
    {
        do {
            $code = strtoupper(\Illuminate\Support\Str::random(10));
        } while (Workspace::query()->where('join_code', $code)->exists());

        return $code;
    }

    private function accessibleWorkspaces(User $user)
    {
        return Workspace::query()
            ->where(function ($query) use ($user) {
                $query->where('owner_id', $user->id)
                    ->orWhereHas('members', fn ($members) => $members->where('users.id', $user->id));
            });
    }

    public function __invoke(User $user, ?int $workspaceId = null): Workspace
    {
        if ($workspaceId !== null) {
            $workspace = $this->accessibleWorkspaces($user)
                ->find($workspaceId);

            if (! $workspace) {
                abort(404, 'Workspace not found.');
            }

            if ($user->current_workspace_id !== $workspace->id) {
                $user->forceFill(['current_workspace_id' => $workspace->id])->save();
            }

            return $workspace;
        }

        if ($user->current_workspace_id) {
            $workspace = $this->accessibleWorkspaces($user)
                ->find($user->current_workspace_id);

            if ($workspace) {
                return $workspace;
            }
        }

        $workspace = $this->accessibleWorkspaces($user)
            ->orderBy('id')
            ->first();

        if (! $workspace) {
            $workspace = new Workspace();
            $workspace->forceFill([
                'owner_id' => $user->id,
                'name' => 'Workspace',
                'color' => '#7c3aed',
                'join_code' => $this->generateJoinCode(),
            ]);
            $workspace->saveOrFail();
            $workspace->members()->syncWithoutDetaching([$user->id => ['role' => 'owner']]);
        }

        $user->forceFill(['current_workspace_id' => $workspace->id])->save();

        return $workspace;
    }
}


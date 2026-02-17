<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;
use App\Models\Workspace;

class TaskPolicy
{
    private function isWorkspaceMember(User $user, ?int $workspaceId): bool
    {
        if (! $workspaceId) {
            return false;
        }

        return Workspace::query()
            ->whereKey($workspaceId)
            ->where(function ($query) use ($user) {
                $query->where('owner_id', $user->id)
                    ->orWhereHas('members', fn ($members) => $members->where('users.id', $user->id));
            })
            ->exists();
    }
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Task $task): bool
    {
        return $user->isAdmin() || $this->isWorkspaceMember($user, $task->workspace_id);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Task $task): bool
    {
        return $user->isAdmin() || $this->isWorkspaceMember($user, $task->workspace_id);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Task $task): bool
    {
        return $user->isAdmin() || $this->isWorkspaceMember($user, $task->workspace_id);
    }
}

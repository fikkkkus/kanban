<?php

namespace App\Domain\Task;

use App\Models\Task;
use App\Models\TaskColumn;
use App\Models\User;
use Illuminate\Support\Collection;

interface TaskRepository
{
    public function listColumnsFor(User $actor, int $workspaceId): Collection;

    public function listFor(User $actor, int $workspaceId, ?string $search = null): Collection;

    public function createColumnFor(User $owner, int $workspaceId, array $data): TaskColumn;

    public function reorderColumns(User $actor, int $workspaceId, array $orderedIds): void;

    public function createFor(User $owner, int $workspaceId, array $data): Task;

    public function update(Task $task, array $data): Task;

    public function move(Task $task, int $workspaceId, int $columnId): Task;

    public function reorder(User $actor, int $workspaceId, int $columnId, array $orderedIds): void;

    public function delete(Task $task): void;
}


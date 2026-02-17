<?php

namespace App\Domain\Task\UseCases;

use App\Domain\Task\TaskRepository;
use App\Models\User;

class ReorderColumn
{
    public function __construct(private readonly TaskRepository $tasks) {}

    public function __invoke(User $actor, int $workspaceId, int $columnId, array $orderedIds): void
    {
        $this->tasks->reorder($actor, $workspaceId, $columnId, $orderedIds);
    }
}


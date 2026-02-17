<?php

namespace App\Domain\Task\UseCases;

use App\Domain\Task\TaskRepository;
use App\Models\User;

class ReorderColumns
{
    public function __construct(private readonly TaskRepository $tasks) {}

    public function __invoke(User $actor, int $workspaceId, array $orderedIds): void
    {
        $this->tasks->reorderColumns($actor, $workspaceId, $orderedIds);
    }
}


<?php

namespace App\Domain\Task\UseCases;

use App\Domain\Task\TaskRepository;
use App\Models\Task;

class MoveTask
{
    public function __construct(private readonly TaskRepository $tasks) {}

    public function __invoke(Task $task, int $workspaceId, int $columnId): Task
    {
        return $this->tasks->move($task, $workspaceId, $columnId);
    }
}


<?php

namespace App\Domain\Task\UseCases;

use App\Domain\Task\TaskRepository;
use App\Models\Task;
use App\Models\User;

class CreateTask
{
    public function __construct(private readonly TaskRepository $tasks) {}

    public function __invoke(User $owner, int $workspaceId, array $data): Task
    {
        return $this->tasks->createFor($owner, $workspaceId, $data);
    }
}


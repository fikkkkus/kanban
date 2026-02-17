<?php

namespace App\Domain\Task\UseCases;

use App\Domain\Task\TaskRepository;
use App\Models\TaskColumn;
use App\Models\User;

class CreateColumn
{
    public function __construct(private readonly TaskRepository $tasks) {}

    public function __invoke(User $owner, int $workspaceId, array $data): TaskColumn
    {
        return $this->tasks->createColumnFor($owner, $workspaceId, $data);
    }
}


<?php

namespace App\Domain\Task\UseCases;

use App\Domain\Task\TaskRepository;
use App\Models\User;
use Illuminate\Support\Collection;

class ListTasks
{
    public function __construct(private readonly TaskRepository $tasks) {}

    public function __invoke(User $actor, int $workspaceId, ?string $search = null): Collection
    {
        return $this->tasks->listFor($actor, $workspaceId, $search);
    }
}


<?php

namespace App\Domain\Task\UseCases;

use App\Domain\Task\TaskRepository;
use App\Models\User;
use Illuminate\Support\Collection;

class ListColumns
{
    public function __construct(private readonly TaskRepository $tasks) {}

    public function __invoke(User $actor, int $workspaceId): Collection
    {
        return $this->tasks->listColumnsFor($actor, $workspaceId);
    }
}


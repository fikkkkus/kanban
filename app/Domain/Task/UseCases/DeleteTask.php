<?php

namespace App\Domain\Task\UseCases;

use App\Domain\Task\TaskRepository;
use App\Models\Task;

class DeleteTask
{
    public function __construct(private readonly TaskRepository $tasks) {}

    public function __invoke(Task $task): void
    {
        $this->tasks->delete($task);
    }
}


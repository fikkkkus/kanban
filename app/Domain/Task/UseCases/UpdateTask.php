<?php

namespace App\Domain\Task\UseCases;

use App\Domain\Task\TaskRepository;
use App\Models\Task;

class UpdateTask
{
    public function __construct(private readonly TaskRepository $tasks) {}

    public function __invoke(Task $task, array $data): Task
    {
        $updatedTask = $task;
        $workspaceId = isset($data['workspace_id'])
            ? (int) $data['workspace_id']
            : (int) ($task->workspace_id ?? 0);

        if (isset($data['column_id']) && (int) $data['column_id'] !== (int) $task->column_id) {
            $updatedTask = $this->tasks->move($task, $workspaceId, (int) $data['column_id']);
        }

        if (
            array_key_exists('title', $data)
            || array_key_exists('description', $data)
            || array_key_exists('due_date', $data)
            || array_key_exists('participant_ids', $data)
            || array_key_exists('column_id', $data)
        ) {
            $updatedTask = $this->tasks->update($updatedTask, $data);
        }

        return $updatedTask;
    }
}


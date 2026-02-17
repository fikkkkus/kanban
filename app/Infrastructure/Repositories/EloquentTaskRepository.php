<?php

namespace App\Infrastructure\Repositories;

use App\Domain\Task\TaskRepository;
use App\Models\Task;
use App\Models\TaskColumn;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class EloquentTaskRepository implements TaskRepository
{
    public function listColumnsFor(User $actor, int $workspaceId): Collection
    {
        $this->ensureWorkspaceAccess($actor, $workspaceId);
        $this->ensureDefaultColumns($actor->id, $workspaceId);

        return TaskColumn::query()
            ->where('workspace_id', $workspaceId)
            ->orderBy('position')
            ->orderBy('id')
            ->get();
    }

    public function listFor(User $actor, int $workspaceId, ?string $search = null): Collection
    {
        $this->ensureWorkspaceAccess($actor, $workspaceId);

        $query = Task::query()
            ->with('column')
            ->where('workspace_id', $workspaceId)
            ->orderBy('position')
            ->orderBy('id');

        if ($search) {
            $query->where('title', 'like', '%'.$search.'%');
        }

        return $query->get();
    }

    public function createColumnFor(User $owner, int $workspaceId, array $data): TaskColumn
    {
        $this->ensureWorkspaceAccess($owner, $workspaceId);

        return DB::transaction(function () use ($owner, $workspaceId, $data): TaskColumn {
            $position = $this->nextColumnPosition($workspaceId);

            return TaskColumn::create([
                'user_id' => $owner->id,
                'workspace_id' => $workspaceId,
                'name' => $data['name'],
                'color' => $data['color'],
                'position' => $position,
            ]);
        });
    }

    public function reorderColumns(User $actor, int $workspaceId, array $orderedIds): void
    {
        $this->ensureWorkspaceAccess($actor, $workspaceId);

        DB::transaction(function () use ($workspaceId, $orderedIds): void {
            $columns = TaskColumn::query()
                ->where('workspace_id', $workspaceId)
                ->whereIn('id', $orderedIds)
                ->get()
                ->keyBy('id');

            if ($columns->count() !== count($orderedIds)) {
                abort(422, 'Invalid column list for reorder.');
            }

            foreach ($orderedIds as $index => $columnId) {
                $column = $columns->get($columnId);
                if (! $column) {
                    continue;
                }

                $column->position = $index;
                $column->save();
            }
        });
    }

    public function createFor(User $owner, int $workspaceId, array $data): Task
    {
        $this->ensureWorkspaceAccess($owner, $workspaceId);

        $participantIds = $this->normalizeParticipantIds($data['participant_ids'] ?? []);
        $columnId = $this->resolveColumnIdForCreate($owner, $workspaceId, $data);

        return DB::transaction(function () use ($owner, $workspaceId, $data, $columnId, $participantIds): Task {
            $position = $this->nextPosition($workspaceId, $columnId);

            return Task::create([
                'user_id' => $owner->id,
                'workspace_id' => $workspaceId,
                'column_id' => $columnId,
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'due_date' => $data['due_date'] ?? null,
                'participant_ids' => $participantIds,
                'status' => Task::STATUS_TODO,
                'position' => $position,
            ]);
        });
    }

    public function update(Task $task, array $data): Task
    {
        $task->fill([
            'title' => $data['title'] ?? $task->title,
            'description' => array_key_exists('description', $data) ? $data['description'] : $task->description,
            'due_date' => array_key_exists('due_date', $data) ? $data['due_date'] : $task->due_date,
            'participant_ids' => array_key_exists('participant_ids', $data)
                ? $this->normalizeParticipantIds($data['participant_ids'] ?? [])
                : ($task->participant_ids ?? []),
            'column_id' => array_key_exists('column_id', $data) ? $data['column_id'] : $task->column_id,
        ]);
        $task->save();

        return $task->fresh();
    }

    public function move(Task $task, int $workspaceId, int $columnId): Task
    {
        return DB::transaction(function () use ($task, $workspaceId, $columnId): Task {
            $oldColumnId = $task->column_id;

            $task->column_id = $columnId;
            $task->workspace_id = $workspaceId;
            $task->position = $this->nextPosition($workspaceId, $columnId);
            $task->save();

            if ($oldColumnId) {
                $this->normalizePositions($workspaceId, $oldColumnId);
            }

            return $task->fresh();
        });
    }

    public function reorder(User $actor, int $workspaceId, int $columnId, array $orderedIds): void
    {
        $this->ensureWorkspaceAccess($actor, $workspaceId);

        DB::transaction(function () use ($workspaceId, $columnId, $orderedIds): void {
            $tasks = Task::query()
                ->where('workspace_id', $workspaceId)
                ->where('column_id', $columnId)
                ->whereIn('id', $orderedIds)
                ->get()
                ->keyBy('id');

            if ($tasks->count() !== count($orderedIds)) {
                abort(422, 'Invalid task list for reorder.');
            }

            foreach ($orderedIds as $index => $taskId) {
                $task = $tasks->get($taskId);

                if (! $task) {
                    continue;
                }

                $task->position = $index;
                $task->save();
            }
        });
    }

    public function delete(Task $task): void
    {
        DB::transaction(function () use ($task): void {
            $workspaceId = $task->workspace_id;
            $columnId = $task->column_id;

            $task->delete();
            if ($columnId && $workspaceId) {
                $this->normalizePositions($workspaceId, $columnId);
            }
        });
    }

    private function nextPosition(int $workspaceId, int $columnId): int
    {
        $maxPosition = Task::query()
            ->where('workspace_id', $workspaceId)
            ->where('column_id', $columnId)
            ->max('position');

        return is_null($maxPosition) ? 0 : $maxPosition + 1;
    }

    private function normalizePositions(int $workspaceId, int $columnId): void
    {
        $tasks = Task::query()
            ->where('workspace_id', $workspaceId)
            ->where('column_id', $columnId)
            ->orderBy('position')
            ->get();

        foreach ($tasks as $index => $task) {
            if ($task->position === $index) {
                continue;
            }

            $task->position = $index;
            $task->save();
        }
    }

    private function normalizeParticipantIds(array $participantIds): array
    {
        return collect($participantIds)
            ->filter(fn ($id) => is_numeric($id))
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();
    }

    private function nextColumnPosition(int $workspaceId): int
    {
        $maxPosition = TaskColumn::query()
            ->where('workspace_id', $workspaceId)
            ->max('position');

        return is_null($maxPosition) ? 0 : $maxPosition + 1;
    }

    private function resolveColumnIdForCreate(User $owner, int $workspaceId, array $data): int
    {
        $columnId = isset($data['column_id']) ? (int) $data['column_id'] : 0;
        if ($columnId > 0) {
            $query = TaskColumn::query()
                ->whereKey($columnId)
                ->where('workspace_id', $workspaceId);

            if ($query->exists()) {
                return $columnId;
            }
        }

        $this->ensureDefaultColumns($owner->id, $workspaceId);
        $firstColumn = TaskColumn::query()
            ->where('workspace_id', $workspaceId)
            ->orderBy('position')
            ->value('id');

        if ($firstColumn) {
            return (int) $firstColumn;
        }

        abort(422, 'Column is required.');
    }

    private function ensureDefaultColumns(int $userId, int $workspaceId): void
    {
        $hasColumns = TaskColumn::query()
            ->where('workspace_id', $workspaceId)
            ->exists();
        if ($hasColumns) {
            return;
        }

        $defaults = [
            ['name' => 'To Do', 'color' => '#64748b', 'position' => 0],
            ['name' => 'In Progress', 'color' => '#f59e0b', 'position' => 1],
            ['name' => 'Done', 'color' => '#10b981', 'position' => 2],
        ];

        foreach ($defaults as $column) {
            TaskColumn::query()->create([
                'user_id' => $userId,
                'workspace_id' => $workspaceId,
                'name' => $column['name'],
                'color' => $column['color'],
                'position' => $column['position'],
            ]);
        }
    }

    private function ensureWorkspaceAccess(User $actor, int $workspaceId): void
    {
        $hasAccess = Workspace::query()
            ->whereKey($workspaceId)
            ->where(function ($query) use ($actor) {
                $query->where('owner_id', $actor->id)
                    ->orWhereHas('members', fn ($members) => $members->where('users.id', $actor->id));
            })
            ->exists();

        if (! $hasAccess) {
            abort(403);
        }
    }
}


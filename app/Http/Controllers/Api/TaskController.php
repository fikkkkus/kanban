<?php

namespace App\Http\Controllers\Api;

use App\Events\WorkspaceBoardUpdated;
use App\Domain\Task\UseCases\CreateTask;
use App\Domain\Task\UseCases\DeleteTask;
use App\Domain\Task\UseCases\ListColumns;
use App\Domain\Task\UseCases\ListTasks;
use App\Domain\Task\UseCases\MoveTask;
use App\Domain\Task\UseCases\ReorderColumn;
use App\Domain\Task\UseCases\UpdateTask;
use App\Domain\Workspace\ResolveWorkspace;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Task\ReorderColumnRequest;
use App\Http\Requests\Api\Task\StoreTaskRequest;
use App\Http\Requests\Api\Task\UpdateTaskRequest;
use App\Http\Requests\Api\Task\UpdateTaskStatusRequest;
use App\Http\Resources\TaskColumnResource;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    private function validateParticipantsForWorkspace(array $payload, int $workspaceId): ?JsonResponse
    {
        if (! array_key_exists('participant_ids', $payload)) {
            return null;
        }

        $workspace = \App\Models\Workspace::query()
            ->whereKey($workspaceId)
            ->with(['members:id'])
            ->first();
        if (! $workspace) {
            return response()->json([
                'message' => 'Пространство не найдено.',
            ], 404);
        }

        $allowedIds = $workspace->members
            ->pluck('id')
            ->push((int) $workspace->owner_id)
            ->unique()
            ->values();

        $participantIds = collect($payload['participant_ids'] ?? [])
            ->filter(fn ($id) => is_numeric($id))
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        $invalid = $participantIds->diff($allowedIds);
        if ($invalid->isNotEmpty()) {
            return response()->json([
                'message' => 'Участники должны состоять в выбранном пространстве.',
                'errors' => [
                    'participant_ids' => ['Участники должны состоять в выбранном пространстве.'],
                ],
            ], 422);
        }

        return null;
    }

    public function index(
        Request $request,
        ListTasks $listTasks,
        ListColumns $listColumns,
        ResolveWorkspace $resolveWorkspace
    ): JsonResponse
    {
        $actor = $request->user();
        $workspace = $resolveWorkspace(
            $actor,
            $request->filled('workspace_id') ? (int) $request->query('workspace_id') : null
        );
        $tasks = $listTasks(
            $actor,
            $workspace->id,
            $request->query('search')
        );
        $columns = $listColumns($actor, $workspace->id)->keyBy('id');

        foreach ($columns as $column) {
            $column->setRelation('tasks', collect());
        }

        foreach ($tasks as $task) {
            if (! $task->column_id || ! $columns->has($task->column_id)) {
                continue;
            }

            $column = $columns->get($task->column_id);
            $existing = $column->getRelation('tasks');
            $column->setRelation('tasks', $existing->push($task));
        }

        return response()->json([
            'workspace_id' => $workspace->id,
            'columns' => TaskColumnResource::collection($columns->values()),
        ]);
    }

    public function store(
        StoreTaskRequest $request,
        CreateTask $createTask,
        ResolveWorkspace $resolveWorkspace
    ): JsonResponse
    {
        $this->authorize('create', Task::class);
        $workspace = $resolveWorkspace(
            $request->user(),
            $request->filled('workspace_id') ? (int) $request->validated('workspace_id') : null
        );

        $payload = $request->validated();
        $validationError = $this->validateParticipantsForWorkspace($payload, $workspace->id);
        if ($validationError) {
            return $validationError;
        }

        $task = $createTask($request->user(), $workspace->id, $payload);
        WorkspaceBoardUpdated::dispatch($workspace->id, $request->user()->id, 'task.created');

        return response()->json([
            'task' => TaskResource::make($task),
        ], 201);
    }

    public function update(
        UpdateTaskRequest $request,
        Task $task,
        UpdateTask $updateTask,
        ResolveWorkspace $resolveWorkspace
    ): JsonResponse
    {
        $this->authorize('update', $task);
        $payload = $request->validated();
        $workspaceId = isset($payload['workspace_id'])
            ? (int) $payload['workspace_id']
            : (int) ($task->workspace_id ?? 0);
        $workspace = $resolveWorkspace($request->user(), $workspaceId > 0 ? $workspaceId : null);
        $validationError = $this->validateParticipantsForWorkspace($payload, $workspace->id);
        if ($validationError) {
            return $validationError;
        }

        $updatedTask = $updateTask($task, $payload);
        WorkspaceBoardUpdated::dispatch($workspace->id, $request->user()->id, 'task.updated');

        return response()->json([
            'task' => TaskResource::make($updatedTask),
        ]);
    }

    public function destroy(Request $request, Task $task, DeleteTask $deleteTask): JsonResponse
    {
        $this->authorize('delete', $task);
        $workspaceId = (int) ($task->workspace_id ?? 0);
        $deleteTask($task);
        if ($workspaceId > 0) {
            WorkspaceBoardUpdated::dispatch($workspaceId, $request->user()->id, 'task.deleted');
        }

        return response()->json([
            'message' => 'Карточка удалена.',
        ]);
    }

    public function reorder(
        ReorderColumnRequest $request,
        ReorderColumn $reorderColumn,
        ResolveWorkspace $resolveWorkspace
    ): JsonResponse
    {
        $workspace = $resolveWorkspace(
            $request->user(),
            $request->filled('workspace_id') ? (int) $request->validated('workspace_id') : null
        );
        $orderedIds = $request->input('orderedIds', $request->input('ordered_ids', []));

        $reorderColumn(
            $request->user(),
            $workspace->id,
            (int) $request->validated('column_id'),
            is_array($orderedIds) ? $orderedIds : []
        );
        WorkspaceBoardUpdated::dispatch($workspace->id, $request->user()->id, 'task.reordered');

        return response()->json([
            'message' => 'Порядок карточек обновлён.',
        ]);
    }

    public function updateStatus(
        UpdateTaskStatusRequest $request,
        Task $task,
        MoveTask $moveTask,
        ResolveWorkspace $resolveWorkspace
    ): JsonResponse {
        $this->authorize('update', $task);
        $workspaceId = (int) ($task->workspace_id ?? 0);
        $workspace = $resolveWorkspace($request->user(), $workspaceId > 0 ? $workspaceId : null);

        $updatedTask = $moveTask($task, $workspace->id, (int) $request->validated('column_id'));
        WorkspaceBoardUpdated::dispatch($workspace->id, $request->user()->id, 'task.moved');

        return response()->json([
            'task' => TaskResource::make($updatedTask),
        ]);
    }
}


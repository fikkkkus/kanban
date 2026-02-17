<?php

namespace App\Http\Controllers\Api;

use App\Events\WorkspaceBoardUpdated;
use App\Domain\Task\UseCases\CreateColumn;
use App\Domain\Task\UseCases\ListColumns;
use App\Domain\Task\UseCases\ReorderColumns;
use App\Domain\Workspace\ResolveWorkspace;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Task\ReorderColumnsRequest;
use App\Http\Requests\Api\Task\StoreTaskColumnRequest;
use App\Http\Requests\Api\Task\UpdateTaskColumnRequest;
use App\Http\Resources\TaskColumnResource;
use App\Models\TaskColumn;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskColumnController extends Controller
{
    public function index(
        Request $request,
        ListColumns $listColumns,
        ResolveWorkspace $resolveWorkspace
    ): JsonResponse
    {
        $workspace = $resolveWorkspace(
            $request->user(),
            $request->filled('workspace_id') ? (int) $request->query('workspace_id') : null
        );
        $columns = $listColumns($request->user(), $workspace->id);

        return response()->json([
            'workspace_id' => $workspace->id,
            'columns' => TaskColumnResource::collection($columns),
        ]);
    }

    public function store(
        StoreTaskColumnRequest $request,
        CreateColumn $createColumn,
        ResolveWorkspace $resolveWorkspace
    ): JsonResponse
    {
        $workspace = $resolveWorkspace(
            $request->user(),
            $request->filled('workspace_id') ? (int) $request->validated('workspace_id') : null
        );
        $column = $createColumn($request->user(), $workspace->id, $request->validated());
        WorkspaceBoardUpdated::dispatch($workspace->id, $request->user()->id, 'column.created');

        return response()->json([
            'column' => TaskColumnResource::make($column),
        ], 201);
    }

    public function update(
        UpdateTaskColumnRequest $request,
        TaskColumn $column,
        ResolveWorkspace $resolveWorkspace
    ): JsonResponse
    {
        $actor = $request->user();
        $workspace = $resolveWorkspace(
            $actor,
            $request->filled('workspace_id') ? (int) $request->validated('workspace_id') : null
        );

        $canManageWorkspace = $workspace->owner_id === $actor->id
            || $workspace->members()->where('users.id', $actor->id)->exists();

        if (! $canManageWorkspace || $column->workspace_id !== $workspace->id) {
            abort(403);
        }

        $column->fill($request->validated());
        $column->save();
        WorkspaceBoardUpdated::dispatch($workspace->id, $actor->id, 'column.updated');

        return response()->json([
            'column' => TaskColumnResource::make($column->fresh()),
        ]);
    }

    public function reorder(
        ReorderColumnsRequest $request,
        ReorderColumns $reorderColumns,
        ResolveWorkspace $resolveWorkspace
    ): JsonResponse
    {
        $workspace = $resolveWorkspace(
            $request->user(),
            $request->filled('workspace_id') ? (int) $request->validated('workspace_id') : null
        );
        $orderedIds = $request->input('orderedIds', []);
        $reorderColumns($request->user(), $workspace->id, is_array($orderedIds) ? $orderedIds : []);
        WorkspaceBoardUpdated::dispatch($workspace->id, $request->user()->id, 'column.reordered');

        return response()->json([
            'message' => 'Порядок колонок обновлён.',
        ]);
    }

    public function destroy(Request $request, TaskColumn $column, ResolveWorkspace $resolveWorkspace): JsonResponse
    {
        $actor = $request->user();
        $workspace = $resolveWorkspace(
            $actor,
            $request->filled('workspace_id') ? (int) $request->query('workspace_id') : null
        );

        $canManageWorkspace = $workspace->owner_id === $actor->id
            || $workspace->members()->where('users.id', $actor->id)->exists();

        if (! $canManageWorkspace || $column->workspace_id !== $workspace->id) {
            abort(403);
        }

        if ($column->tasks()->exists()) {
            return response()->json([
                'message' => 'Нельзя удалить колонку, пока в ней есть карточки.',
            ], 422);
        }

        $ownerColumnsCount = TaskColumn::query()
            ->where('workspace_id', $workspace->id)
            ->count();

        if ($ownerColumnsCount <= 1) {
            return response()->json([
                'message' => 'Должна остаться хотя бы одна колонка.',
            ], 422);
        }

        $removedPosition = $column->position;
        $column->delete();

        TaskColumn::query()
            ->where('workspace_id', $workspace->id)
            ->where('position', '>', $removedPosition)
            ->decrement('position');
        WorkspaceBoardUpdated::dispatch($workspace->id, $actor->id, 'column.deleted');

        return response()->json([
            'message' => 'Колонка удалена.',
        ]);
    }
}


<?php

namespace App\Http\Controllers\Api;

use App\Events\WorkspaceBoardUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Task\StoreTaskCommentRequest;
use App\Http\Resources\TaskCommentResource;
use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskCommentController extends Controller
{
    public function index(Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        $comments = $task->comments()
            ->with('user:id,name,role')
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'comments' => TaskCommentResource::collection($comments),
        ]);
    }

    public function store(StoreTaskCommentRequest $request, Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        $comment = $task->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $request->validated('body'),
        ]);

        $comment->load('user:id,name,role');
        WorkspaceBoardUpdated::dispatch((int) $task->workspace_id, $request->user()->id, 'comment.created');

        return response()->json([
            'comment' => TaskCommentResource::make($comment),
        ], 201);
    }

    public function destroy(Request $request, Task $task, TaskComment $comment): JsonResponse
    {
        $this->authorize('view', $task);

        if ($comment->task_id !== $task->id) {
            abort(404);
        }

        $user = $request->user();
        $canDelete = $user->isAdmin()
            || $comment->user_id === $user->id
            || $task->user_id === $user->id;

        if (! $canDelete) {
            abort(403);
        }

        $comment->delete();
        WorkspaceBoardUpdated::dispatch((int) $task->workspace_id, $request->user()->id, 'comment.deleted');

        return response()->json([
            'message' => 'Comment deleted.',
        ]);
    }
}


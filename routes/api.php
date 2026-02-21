<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TaskColumnController;
use App\Http\Controllers\Api\TaskCommentController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WorkspaceController;
use Illuminate\Support\Facades\Route;

Route::middleware('web')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
        Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    });

    Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/workspaces', [WorkspaceController::class, 'index']);
        Route::post('/workspaces', [WorkspaceController::class, 'store']);
        Route::post('/workspaces/join', [WorkspaceController::class, 'join'])->middleware('throttle:10,1');
        Route::patch('/workspaces/{workspace}', [WorkspaceController::class, 'update'])->whereNumber('workspace');
        Route::post('/workspaces/{workspace}/switch', [WorkspaceController::class, 'switch'])->whereNumber('workspace');
        Route::get('/workspaces/{workspace}/members', [WorkspaceController::class, 'members'])->whereNumber('workspace');
        Route::get('/tasks', [TaskController::class, 'index']);
        Route::post('/tasks', [TaskController::class, 'store']);
        Route::get('/columns', [TaskColumnController::class, 'index']);
        Route::post('/columns', [TaskColumnController::class, 'store']);
        Route::patch('/columns/reorder', [TaskColumnController::class, 'reorder']);
        Route::patch('/columns/{column}', [TaskColumnController::class, 'update'])->whereNumber('column');
        Route::delete('/columns/{column}', [TaskColumnController::class, 'destroy'])->whereNumber('column');
        Route::patch('/tasks/reorder', [TaskController::class, 'reorder']);
        Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus']);
        Route::get('/tasks/{task}/comments', [TaskCommentController::class, 'index']);
        Route::post('/tasks/{task}/comments', [TaskCommentController::class, 'store']);
        Route::delete('/tasks/{task}/comments/{comment}', [TaskCommentController::class, 'destroy']);
        Route::patch('/tasks/{task}', [TaskController::class, 'update']);
        Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);
    });
});


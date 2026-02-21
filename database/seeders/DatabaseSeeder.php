<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
        ]);
        $admin->forceFill(['role' => 'admin'])->saveOrFail();

        $user = User::factory()->create([
            'name' => 'Demo User',
            'email' => 'user@example.com',
        ]);
        $user->forceFill(['role' => 'user'])->saveOrFail();

        $task = new Task();
        $task->forceFill([
            'user_id' => $user->id,
            'title' => 'Prepare API endpoints',
            'description' => 'Create base REST endpoints for tasks',
            'status' => Task::STATUS_TODO,
            'position' => 0,
        ]);
        $task->saveOrFail();

        $task = new Task();
        $task->forceFill([
            'user_id' => $user->id,
            'title' => 'Build board UI',
            'description' => 'Render columns and cards in Vue',
            'status' => Task::STATUS_IN_PROGRESS,
            'position' => 0,
        ]);
        $task->saveOrFail();

        $task = new Task();
        $task->forceFill([
            'user_id' => $user->id,
            'title' => 'Project bootstrap',
            'description' => 'Starter configured',
            'status' => Task::STATUS_DONE,
            'position' => 0,
        ]);
        $task->saveOrFail();
    }
}

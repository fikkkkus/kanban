<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_columns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('color', 32)->default('#64748b');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'position']);
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('column_id')->nullable()->after('user_id')->constrained('task_columns')->cascadeOnDelete();
            $table->index(['user_id', 'column_id', 'position']);
        });

        $defaultColumns = [
            ['name' => 'To Do', 'color' => '#64748b', 'position' => 0, 'status' => 'TODO'],
            ['name' => 'In Progress', 'color' => '#f59e0b', 'position' => 1, 'status' => 'IN_PROGRESS'],
            ['name' => 'Done', 'color' => '#10b981', 'position' => 2, 'status' => 'DONE'],
        ];

        $users = DB::table('users')->select('id')->get();

        foreach ($users as $user) {
            $columnIdsByStatus = [];
            $now = now();

            foreach ($defaultColumns as $column) {
                $columnId = DB::table('task_columns')->insertGetId([
                    'user_id' => $user->id,
                    'name' => $column['name'],
                    'color' => $column['color'],
                    'position' => $column['position'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                $columnIdsByStatus[$column['status']] = $columnId;
            }

            foreach ($columnIdsByStatus as $status => $columnId) {
                DB::table('tasks')
                    ->where('user_id', $user->id)
                    ->where('status', $status)
                    ->update(['column_id' => $columnId]);
            }

            $fallbackColumnId = $columnIdsByStatus['TODO'] ?? null;
            if ($fallbackColumnId) {
                DB::table('tasks')
                    ->where('user_id', $user->id)
                    ->whereNull('column_id')
                    ->update(['column_id' => $fallbackColumnId]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'column_id', 'position']);
            $table->dropConstrainedForeignId('column_id');
        });

        Schema::dropIfExists('task_columns');
    }
};


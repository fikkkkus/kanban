<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workspaces', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('name', 120);
            $table->string('color', 32)->default('#7c3aed');
            $table->timestamps();

            $table->index(['owner_id', 'created_at']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('current_workspace_id')->nullable()->after('role')->constrained('workspaces')->nullOnDelete();
        });

        Schema::table('task_columns', function (Blueprint $table) {
            $table->foreignId('workspace_id')->nullable()->after('user_id')->constrained('workspaces')->cascadeOnDelete();
            $table->index(['user_id', 'workspace_id', 'position']);
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('workspace_id')->nullable()->after('user_id')->constrained('workspaces')->cascadeOnDelete();
            $table->index(['user_id', 'workspace_id', 'column_id', 'position']);
        });

        $users = DB::table('users')->select('id', 'name')->get();

        foreach ($users as $user) {
            $now = now();
            $workspaceId = DB::table('workspaces')->insertGetId([
                'owner_id' => $user->id,
                'name' => 'Workspace',
                'color' => '#7c3aed',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            DB::table('users')
                ->where('id', $user->id)
                ->update(['current_workspace_id' => $workspaceId]);

            DB::table('task_columns')
                ->where('user_id', $user->id)
                ->whereNull('workspace_id')
                ->update(['workspace_id' => $workspaceId]);

            DB::table('tasks')
                ->where('user_id', $user->id)
                ->whereNull('workspace_id')
                ->update(['workspace_id' => $workspaceId]);
        }
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'workspace_id', 'column_id', 'position']);
            $table->dropConstrainedForeignId('workspace_id');
        });

        Schema::table('task_columns', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'workspace_id', 'position']);
            $table->dropConstrainedForeignId('workspace_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('current_workspace_id');
        });

        Schema::dropIfExists('workspaces');
    }
};


<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('workspaces', function (Blueprint $table) {
            $table->string('join_code', 24)->nullable()->after('color');
            $table->unique('join_code');
        });

        Schema::create('workspace_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained('workspaces')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('role', 32)->default('member');
            $table->timestamps();

            $table->unique(['workspace_id', 'user_id']);
        });

        $workspaces = DB::table('workspaces')->select('id', 'owner_id')->get();

        foreach ($workspaces as $workspace) {
            $joinCode = null;
            do {
                $joinCode = strtoupper(Str::random(10));
                $exists = DB::table('workspaces')->where('join_code', $joinCode)->exists();
            } while ($exists);

            DB::table('workspaces')->where('id', $workspace->id)->update(['join_code' => $joinCode]);

            DB::table('workspace_user')->updateOrInsert(
                ['workspace_id' => $workspace->id, 'user_id' => $workspace->owner_id],
                ['role' => 'owner', 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('workspace_user');

        Schema::table('workspaces', function (Blueprint $table) {
            $table->dropUnique(['join_code']);
            $table->dropColumn('join_code');
        });
    }
};


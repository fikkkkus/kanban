<?php

use App\Models\Workspace;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('workspace.{workspaceId}', function ($user, int $workspaceId) {
    return Workspace::query()
        ->whereKey($workspaceId)
        ->where(function ($query) use ($user) {
            $query->where('owner_id', $user->id)
                ->orWhereHas('members', fn ($members) => $members->where('users.id', $user->id));
        })
        ->exists();
});


<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WorkspaceBoardUpdated implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        public int $workspaceId,
        public ?int $actorId = null,
        public string $action = 'updated',
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("workspace.{$this->workspaceId}")];
    }

    public function broadcastAs(): string
    {
        return 'board.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'workspace_id' => $this->workspaceId,
            'actor_id' => $this->actorId,
            'action' => $this->action,
            'at' => now()->toISOString(),
        ];
    }
}


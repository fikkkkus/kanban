<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'workspace_id' => $this->workspace_id,
            'column_id' => $this->column_id,
            'title' => $this->title,
            'description' => $this->description,
            'due_date' => optional($this->due_date)->format('Y-m-d'),
            'participant_ids' => $this->participant_ids ?? [],
            'status' => $this->status,
            'position' => $this->position,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}


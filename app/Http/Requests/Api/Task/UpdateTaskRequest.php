<?php

namespace App\Http\Requests\Api\Task;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $workspaceId = $this->input('workspace_id');
        $columnRule = Rule::exists('task_columns', 'id');
        if (is_numeric($workspaceId)) {
            $columnRule = $columnRule->where(fn ($query) => $query->where('workspace_id', (int) $workspaceId));
        }

        return [
            'workspace_id' => ['sometimes', 'integer', Rule::exists('workspaces', 'id')],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'due_date' => ['sometimes', 'nullable', 'date'],
            'participant_ids' => ['sometimes', 'nullable', 'array'],
            'participant_ids.*' => ['integer', 'distinct', 'exists:users,id'],
            'column_id' => ['sometimes', 'integer', $columnRule],
        ];
    }
}


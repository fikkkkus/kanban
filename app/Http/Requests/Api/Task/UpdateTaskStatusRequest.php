<?php

namespace App\Http\Requests\Api\Task;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskStatusRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $task = $this->route('task');
        if ($task && isset($task->workspace_id)) {
            $this->merge(['workspace_id' => $task->workspace_id]);
        }
    }

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
            'column_id' => ['required', 'integer', $columnRule],
        ];
    }
}


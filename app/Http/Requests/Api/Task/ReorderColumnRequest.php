<?php

namespace App\Http\Requests\Api\Task;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReorderColumnRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $json = $this->json()->all();

        $orderedIds = $this->input('orderedIds');
        if ($orderedIds === null) {
            $orderedIds = $this->input('ordered_ids');
        }
        if ($orderedIds === null && is_array($json)) {
            $orderedIds = $json['orderedIds'] ?? $json['ordered_ids'] ?? null;
        }

        $this->merge([
            'orderedIds' => is_array($orderedIds) ? $orderedIds : [],
        ]);
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
            'orderedIds' => ['sometimes', 'array'],
            'orderedIds.*' => ['integer', 'distinct'],
            'ordered_ids' => ['sometimes', 'array'],
            'ordered_ids.*' => ['integer', 'distinct'],
        ];
    }
}


<?php

namespace App\Http\Requests\Api\Task;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReorderColumnsRequest extends FormRequest
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
        return [
            'workspace_id' => ['sometimes', 'integer', Rule::exists('workspaces', 'id')],
            'orderedIds' => ['required', 'array', 'min:1'],
            'orderedIds.*' => ['integer', 'distinct'],
            'ordered_ids' => ['sometimes', 'array'],
            'ordered_ids.*' => ['integer', 'distinct'],
        ];
    }
}


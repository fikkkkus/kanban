<?php

namespace App\Http\Requests\Api\Task;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskColumnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'workspace_id' => ['sometimes', 'integer', Rule::exists('workspaces', 'id')],
            'name' => ['required', 'string', 'max:80'],
            'color' => ['required', 'regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/'],
        ];
    }
}


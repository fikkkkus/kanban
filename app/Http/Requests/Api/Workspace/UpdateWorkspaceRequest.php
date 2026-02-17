<?php

namespace App\Http\Requests\Api\Workspace;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWorkspaceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'color' => ['sometimes', 'required', 'regex:/^#(?:[0-9a-fA-F]{3}){1,2}$/'],
        ];
    }
}


<?php

namespace App\Http\Requests\Api\Workspace;

use Illuminate\Foundation\Http\FormRequest;

class JoinWorkspaceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'join_code' => ['required', 'string', 'max:24'],
        ];
    }
}


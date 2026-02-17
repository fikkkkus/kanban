export type TaskStatus = string;

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'admin';
    current_workspace_id: number | null;
}

export interface TaskItem {
    id: number;
    user_id: number;
    workspace_id: number | null;
    column_id: number;
    title: string;
    description: string | null;
    due_date: string | null;
    participant_ids: number[];
    status: TaskStatus;
    position: number;
    created_at: string;
    updated_at: string;
}

export interface KanbanUser {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'admin';
}

export interface TaskColumn {
    id: number;
    user_id: number;
    workspace_id: number | null;
    name: string;
    color: string;
    position: number;
    tasks: TaskItem[];
}

export interface TaskComment {
    id: number;
    task_id: number;
    user_id: number | null;
    body: string;
    user: {
        id: number;
        name: string;
        role: 'user' | 'admin';
    } | null;
    created_at: string;
    updated_at: string;
}

export interface TasksResponse {
    workspace_id?: number;
    columns: TaskColumn[];
}

export interface Workspace {
    id: number;
    owner_id: number;
    name: string;
    color: string;
    join_code: string | null;
    created_at: string;
    updated_at: string;
}

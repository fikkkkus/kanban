import { reactive } from 'vue';
import { api, ApiError } from '@/lib/api';
import type {
    KanbanUser,
    TaskColumn,
    TaskComment,
    TaskItem,
    TasksResponse,
    Workspace,
} from '@/types/kanban';

type TaskPayload = {
    title: string;
    description?: string | null;
    due_date?: string | null;
    participant_ids?: number[];
    column_id?: number;
};

const state = reactive({
    columns: [] as TaskColumn[],
    workspaceId: null as number | null,
    workspaces: [] as Workspace[],
    loading: false,
    errors: {} as Record<string, string[]>,
    message: '',
    users: [] as KanbanUser[],
    commentsByTask: {} as Record<number, TaskComment[]>,
});

export function useKanbanApi() {
    function withWorkspaceQuery(base = ''): string {
        if (!state.workspaceId) return base;
        const join = base.includes('?') ? '&' : '?';
        return `${base}${join}workspace_id=${state.workspaceId}`;
    }

    function withWorkspacePayload<T extends Record<string, unknown>>(payload: T): T {
        if (!state.workspaceId) return payload;
        return {
            ...payload,
            workspace_id: state.workspaceId,
        };
    }

    function setWorkspace(workspaceId: number | null): void {
        state.workspaceId = workspaceId;
    }

    async function loadWorkspaces(): Promise<void> {
        const response = await api<{ workspaces: Workspace[]; current_workspace_id: number | null }>(
            '/api/workspaces',
        );
        state.workspaces = response.workspaces ?? [];
        state.workspaceId = response.current_workspace_id ?? state.workspaces[0]?.id ?? null;
    }

    async function createWorkspace(payload: { name: string; color: string }): Promise<boolean> {
        state.errors = {};
        state.message = '';

        try {
            const response = await api<{ workspace: Workspace }>('/api/workspaces', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            state.workspaces.push(response.workspace);
            return true;
        } catch (error) {
            if (error instanceof ApiError) {
                state.errors = error.errors ?? {};
                state.message = error.message;
            }
            return false;
        }
    }

    async function updateWorkspace(
        workspaceId: number,
        payload: { name?: string; color?: string },
    ): Promise<boolean> {
        state.errors = {};
        state.message = '';
        try {
            const response = await api<{ workspace: Workspace }>(`/api/workspaces/${workspaceId}`, {
                method: 'PATCH',
                body: JSON.stringify(payload),
            });
            const idx = state.workspaces.findIndex((item) => item.id === workspaceId);
            if (idx >= 0) state.workspaces[idx] = response.workspace;
            return true;
        } catch (error) {
            if (error instanceof ApiError) {
                state.errors = error.errors ?? {};
                state.message = error.message;
            }
            return false;
        }
    }

    async function switchWorkspace(workspaceId: number): Promise<boolean> {
        state.errors = {};
        state.message = '';
        try {
            await api<{ message: string }>(`/api/workspaces/${workspaceId}/switch`, {
                method: 'POST',
            });
            state.workspaceId = workspaceId;
            return true;
        } catch (error) {
            if (error instanceof ApiError) {
                state.errors = error.errors ?? {};
                state.message = error.message;
            }
            return false;
        }
    }

    async function joinWorkspace(joinCode: string): Promise<boolean> {
        state.errors = {};
        state.message = '';
        try {
            const response = await api<{ workspace: Workspace; message: string }>('/api/workspaces/join', {
                method: 'POST',
                body: JSON.stringify({ join_code: joinCode }),
            });
            state.workspaceId = response.workspace.id;
            await loadWorkspaces();
            return true;
        } catch (error) {
            if (error instanceof ApiError) {
                state.errors = error.errors ?? {};
                state.message = error.message;
            }
            return false;
        }
    }

    async function loadUsers(): Promise<void> {
        const response = await api<{ users: KanbanUser[] }>(withWorkspaceQuery('/api/users'));
        state.users = response.users;
    }

    async function loadComments(taskId: number): Promise<void> {
        const response = await api<{ comments: TaskComment[] }>(
            `/api/tasks/${taskId}/comments`,
        );

        state.commentsByTask[taskId] = response.comments;
    }

    async function addComment(taskId: number, body: string): Promise<boolean> {
        state.errors = {};
        state.message = '';

        try {
            await api<{ comment: TaskComment }>(`/api/tasks/${taskId}/comments`, {
                method: 'POST',
                body: JSON.stringify({ body }),
            });
            await loadComments(taskId);
            return true;
        } catch (error) {
            if (error instanceof ApiError) {
                state.errors = error.errors ?? {};
                state.message = error.message;
            }
            return false;
        }
    }

    async function deleteComment(taskId: number, commentId: number): Promise<void> {
        await api<{ message: string }>(
            `/api/tasks/${taskId}/comments/${commentId}`,
            { method: 'DELETE' },
        );
        await loadComments(taskId);
    }

    async function loadTasks(search = ''): Promise<void> {
        state.loading = true;
        state.message = '';
        const searchQuery = search ? `?search=${encodeURIComponent(search)}` : '';
        const query = withWorkspaceQuery(searchQuery);

        try {
            const response = await api<TasksResponse>(`/api/tasks${query}`);
            state.columns = response.columns ?? [];
            if (response.workspace_id) state.workspaceId = response.workspace_id;
        } finally {
            state.loading = false;
        }
    }

    async function createTask(payload: TaskPayload): Promise<boolean> {
        state.errors = {};
        try {
            await api<{ task: TaskItem }>('/api/tasks', {
                method: 'POST',
                body: JSON.stringify(withWorkspacePayload(payload)),
            });
            await loadTasks();
            return true;
        } catch (error) {
            if (error instanceof ApiError) {
                state.errors = error.errors ?? {};
                state.message = error.message;
            }
            return false;
        }
    }

    async function updateTask(taskId: number, payload: TaskPayload): Promise<boolean> {
        state.errors = {};
        try {
            await api<{ task: TaskItem }>(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                body: JSON.stringify(withWorkspacePayload(payload)),
            });
            await loadTasks();
            return true;
        } catch (error) {
            if (error instanceof ApiError) {
                state.errors = error.errors ?? {};
                state.message = error.message;
            }
            return false;
        }
    }

    async function deleteTask(taskId: number): Promise<void> {
        await api<{ message: string }>(withWorkspaceQuery(`/api/tasks/${taskId}`), { method: 'DELETE' });
        await loadTasks();
    }

    async function moveTask(taskId: number, columnId: number): Promise<void> {
        await api<{ task: TaskItem }>(`/api/tasks/${taskId}/status`, {
            method: 'PATCH',
            body: JSON.stringify(withWorkspacePayload({ column_id: columnId })),
        });
    }

    async function reorder(columnId: number, orderedIds: number[] = []): Promise<void> {
        const safeOrderedIds = Array.isArray(orderedIds)
            ? orderedIds.filter((id): id is number => Number.isInteger(id))
            : [];
        const payload: Record<string, unknown> = {
            column_id: columnId,
            orderedIds: safeOrderedIds,
            ordered_ids: safeOrderedIds,
        };
        if (state.workspaceId) payload.workspace_id = state.workspaceId;

        await api<{ message: string }>('/api/tasks/reorder', {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
    }

    async function createColumn(payload: { name: string; color: string }): Promise<boolean> {
        state.errors = {};
        state.message = '';
        try {
            await api<{ column: TaskColumn }>('/api/columns', {
                method: 'POST',
                body: JSON.stringify(withWorkspacePayload(payload)),
            });
            await loadTasks();
            return true;
        } catch (error) {
            if (error instanceof ApiError) {
                state.errors = error.errors ?? {};
                state.message = error.message;
            }
            return false;
        }
    }

    async function updateColumn(
        columnId: number,
        payload: { name?: string; color?: string },
    ): Promise<boolean> {
        state.errors = {};
        state.message = '';
        try {
            await api<{ column: TaskColumn }>(`/api/columns/${columnId}`, {
                method: 'PATCH',
                body: JSON.stringify(withWorkspacePayload(payload)),
            });
            await loadTasks();
            return true;
        } catch (error) {
            if (error instanceof ApiError) {
                state.errors = error.errors ?? {};
                state.message = error.message;
            }
            return false;
        }
    }

    async function reorderColumns(orderedIds: number[]): Promise<void> {
        const safeOrderedIds = Array.isArray(orderedIds)
            ? orderedIds.filter((id): id is number => Number.isInteger(id))
            : [];
        const payload: Record<string, unknown> = {
            orderedIds: safeOrderedIds,
            ordered_ids: safeOrderedIds,
        };
        if (state.workspaceId) payload.workspace_id = state.workspaceId;

        await api<{ message: string }>('/api/columns/reorder', {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
    }

    async function deleteColumn(columnId: number): Promise<void> {
        await api<{ message: string }>(withWorkspaceQuery(`/api/columns/${columnId}`), { method: 'DELETE' });
        await loadTasks();
    }

    return {
        state,
        setWorkspace,
        loadWorkspaces,
        createWorkspace,
        joinWorkspace,
        updateWorkspace,
        switchWorkspace,
        loadUsers,
        loadComments,
        addComment,
        deleteComment,
        loadTasks,
        createTask,
        updateTask,
        deleteTask,
        moveTask,
        reorder,
        createColumn,
        updateColumn,
        reorderColumns,
        deleteColumn,
    };
}


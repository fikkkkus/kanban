<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import draggable from 'vuedraggable';
import { useAuthApi } from '@/composables/useAuthApi';
import { useKanbanApi } from '@/composables/useKanbanApi';
import { ApiError } from '@/lib/api';
import echo from '@/lib/echo';
import type { KanbanUser, TaskColumn, TaskComment, TaskItem, Workspace } from '@/types/kanban';

type CreateCardForm = { title: string };

const auth = useAuthApi();
const kanban = useKanbanApi();

const search = ref('');
const syncing = ref(false);
const boardError = ref('');
const initializing = ref(true);
const addingColumnId = ref<number | null>(null);
const columns = ref<TaskColumn[]>([]);

const newColumnOpen = ref(false);
const newColumnForm = reactive({ name: '', color: '#64748b' });
const editingColumnId = ref<number | null>(null);
const editColumnForm = reactive({ name: '', color: '#64748b' });
const createForms = reactive<Record<number, CreateCardForm>>({});

const editTargetTask = ref<TaskItem | null>(null);
const commentsLoading = ref(false);
const commentsError = ref('');
const commentDraft = ref('');
const commentSubmitting = ref(false);
const participantSearch = ref('');

const inlineTitleTaskId = ref<number | null>(null);
const inlineTitleValue = ref('');
const inlineTitleSaving = ref(false);
const inlineTitleTextarea = ref<HTMLTextAreaElement | HTMLTextAreaElement[] | null>(null);
const activeRealtimeChannel = ref<string | null>(null);
let fallbackSyncTimer: ReturnType<typeof setInterval> | null = null;

const editForm = reactive({
    title: '',
    description: '',
    dueDate: '',
    participantIds: [] as number[],
});

const pageTitle = computed(() =>
    auth.state.user ? `Board - ${auth.state.user.name}` : 'Board',
);

const userInitial = computed(() =>
    (auth.state.user?.name?.trim()?.charAt(0) || '?').toUpperCase(),
);

const users = computed<KanbanUser[]>(() => kanban.state.users);
const workspaces = computed<Workspace[]>(() => kanban.state.workspaces);
const activeWorkspaceId = ref<number | null>(null);

const filteredUsers = computed<KanbanUser[]>(() => {
    const query = participantSearch.value.trim().toLowerCase();
    if (!query) return users.value;
    return users.value.filter((user) => {
        const name = user.name.toLowerCase();
        const email = user.email.toLowerCase();
        return name.includes(query) || email.includes(query);
    });
});

const activeComments = computed<TaskComment[]>(() => {
    if (!editTargetTask.value) return [];
    return kanban.state.commentsByTask[editTargetTask.value.id] ?? [];
});

const selectedParticipants = computed<KanbanUser[]>(() => {
    const ids = new Set(editForm.participantIds);
    return users.value.filter((user) => ids.has(user.id));
});

function ensureCreateForm(columnId: number): CreateCardForm {
    if (!createForms[columnId]) createForms[columnId] = { title: '' };
    return createForms[columnId];
}

function initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
    if (parts.length === 0) return '?';
    return parts.map((part) => part.charAt(0).toUpperCase()).join('');
}

function formatDueDate(date: string | null): string {
    if (!date) return '';
    try { return new Date(date).toLocaleDateString('ru-RU'); } catch { return date; }
}

function formatDateTime(date: string): string {
    try { return new Date(date).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' }); } catch { return date; }
}

function participantUsers(task: TaskItem): KanbanUser[] {
    if (!Array.isArray(task.participant_ids) || task.participant_ids.length === 0) return [];
    const ids = new Set(task.participant_ids);
    return users.value.filter((user) => ids.has(user.id));
}

function syncFromApi(): void {
    columns.value = (kanban.state.columns ?? []).map((column) => ({
        ...column,
        tasks: Array.isArray(column.tasks) ? [...column.tasks] : [],
    }));
}

function subscribeToWorkspaceChannel(workspaceId: number | null): void {
    if (activeRealtimeChannel.value) {
        echo.leave(activeRealtimeChannel.value);
        activeRealtimeChannel.value = null;
    }

    if (!workspaceId) return;

    const channelName = `workspace.${workspaceId}`;
    activeRealtimeChannel.value = channelName;
    echo.private(channelName).listen('.board.updated', () => {
        if (initializing.value) return;
        void loadBoard();
    });
}

function startFallbackSync(): void {
    if (fallbackSyncTimer) return;
    fallbackSyncTimer = setInterval(() => {
        if (document.hidden || initializing.value || syncing.value) return;
        void loadBoard();
    }, 4000);
}

function stopFallbackSync(): void {
    if (!fallbackSyncTimer) return;
    clearInterval(fallbackSyncTimer);
    fallbackSyncTimer = null;
}

function handleVisibilityChange(): void {
    if (!document.hidden && !initializing.value) {
        void loadBoard();
    }
}

async function ensureAuth(): Promise<boolean> {
    const user = await auth.loadMe();
    if (!user) {
        window.location.href = '/kanban/login';
        return false;
    }
    return true;
}

async function loadBoard(): Promise<void> {
    boardError.value = '';
    if (activeWorkspaceId.value) {
        kanban.setWorkspace(activeWorkspaceId.value);
    }
    await Promise.all([
        kanban.loadUsers(),
        kanban.loadTasks(search.value),
    ]);
    syncFromApi();
}

async function switchWorkspace(workspaceId: number): Promise<void> {
    if (syncing.value || workspaceId === kanban.state.workspaceId) return;

    boardError.value = '';
    syncing.value = true;

    try {
        const ok = await kanban.switchWorkspace(workspaceId);
        if (!ok) {
            boardError.value = kanban.state.message || 'Не удалось переключить пространство.';
            return;
        }
        activeWorkspaceId.value = workspaceId;
        const url = new URL(window.location.href);
        url.searchParams.set('workspace', String(workspaceId));
        window.history.replaceState({}, '', url.toString());
        await loadBoard();
    } finally {
        syncing.value = false;
    }
}

async function loadTaskComments(taskId: number): Promise<void> {
    commentsLoading.value = true;
    commentsError.value = '';
    try {
        await kanban.loadComments(taskId);
    } catch {
        commentsError.value = 'Не удалось загрузить комментарии.';
    } finally {
        commentsLoading.value = false;
    }
}
function startAddCard(columnId: number): void {
    addingColumnId.value = columnId;
    void nextTick(() => {
        const input = document.querySelector<HTMLTextAreaElement>(`[data-add-card-input="${columnId}"]`);
        input?.focus();
    });
}

function cancelAddCard(): void {
    if (!addingColumnId.value) return;
    createForms[addingColumnId.value] = { title: '' };
    addingColumnId.value = null;
}

function handleDocumentMouseDown(event: MouseEvent): void {
    if (addingColumnId.value === null) return;
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (target.closest('[data-add-card-form]') || target.closest('[data-add-card-trigger]')) return;
    cancelAddCard();
}

async function createTask(columnId: number): Promise<void> {
    boardError.value = '';
    const form = ensureCreateForm(columnId);
    const title = form.title.trim();
    if (!title) {
        boardError.value = 'Введите название карточки.';
        return;
    }

    const ok = await kanban.createTask({ title, column_id: columnId });
    if (!ok) {
        boardError.value = kanban.state.message || 'Не удалось создать карточку.';
        return;
    }

    createForms[columnId] = { title: '' };
    addingColumnId.value = null;
    await loadBoard();
}

async function createColumn(): Promise<void> {
    boardError.value = '';
    const name = newColumnForm.name.trim();
    if (!name) {
        boardError.value = 'Введите название колонки.';
        return;
    }

    const ok = await kanban.createColumn({ name, color: newColumnForm.color });
    if (!ok) {
        boardError.value = kanban.state.message || 'Не удалось создать колонку.';
        return;
    }

    newColumnForm.name = '';
    newColumnForm.color = '#64748b';
    newColumnOpen.value = false;
    await loadBoard();
}

function startEditColumn(column: TaskColumn): void {
    editingColumnId.value = column.id;
    editColumnForm.name = column.name;
    editColumnForm.color = column.color;
}

function cancelEditColumn(): void {
    editingColumnId.value = null;
    editColumnForm.name = '';
    editColumnForm.color = '#64748b';
}

async function saveColumn(column: TaskColumn): Promise<void> {
    boardError.value = '';

    const name = editColumnForm.name.trim();
    if (!name) {
        boardError.value = 'Введите название колонки.';
        return;
    }

    const ok = await kanban.updateColumn(column.id, {
        name,
        color: editColumnForm.color,
    });

    if (!ok) {
        boardError.value = kanban.state.message || 'Не удалось обновить колонку.';
        return;
    }

    await loadBoard();
    cancelEditColumn();
}

async function removeTask(task: TaskItem): Promise<void> {
    boardError.value = '';
    try {
        await kanban.deleteTask(task.id);
        await loadBoard();
    } catch {
        boardError.value = 'Не удалось удалить карточку.';
    }
}

async function removeColumn(column: TaskColumn): Promise<void> {
    boardError.value = '';

    try {
        await kanban.deleteColumn(column.id);
        await loadBoard();
    } catch (error) {
        if (error instanceof ApiError) {
            boardError.value = error.message || 'Не удалось удалить колонку.';
        } else {
            boardError.value = 'Не удалось удалить колонку.';
        }
    }
}

function startInlineTitleEdit(task: TaskItem): void {
    inlineTitleTaskId.value = task.id;
    inlineTitleValue.value = task.title;
    void nextTick(() => {
        const textarea = getInlineTitleTextarea();
        if (!textarea) return;
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        resizeInlineTitleTextarea();
    });
}

function cancelInlineTitleEdit(): void {
    inlineTitleTaskId.value = null;
    inlineTitleValue.value = '';
}

function resizeInlineTitleTextarea(): void {
    const textarea = getInlineTitleTextarea();
    if (!textarea) return;
    textarea.style.height = '0px';
    textarea.style.height = `${textarea.scrollHeight}px`;
}

function getInlineTitleTextarea(): HTMLTextAreaElement | null {
    const target = inlineTitleTextarea.value;
    if (!target) return null;
    return Array.isArray(target) ? (target[0] ?? null) : target;
}

watch(inlineTitleValue, () => {
    void nextTick(() => resizeInlineTitleTextarea());
});

async function saveInlineTitle(task: TaskItem): Promise<void> {
    const title = inlineTitleValue.value.trim();
    if (!title || inlineTitleSaving.value) return;

    inlineTitleSaving.value = true;
    boardError.value = '';

    try {
        const ok = await kanban.updateTask(task.id, { title });
        if (!ok) {
            boardError.value = kanban.state.message || 'Не удалось обновить название.';
            return;
        }

        await loadBoard();
        cancelInlineTitleEdit();
    } finally {
        inlineTitleSaving.value = false;
    }
}

function openTaskDetails(task: TaskItem): void {
    editTargetTask.value = task;
    editForm.title = task.title;
    editForm.description = task.description ?? '';
    editForm.dueDate = task.due_date ?? '';
    editForm.participantIds = [...(task.participant_ids ?? [])];
    participantSearch.value = '';
    commentDraft.value = '';
    commentsError.value = '';
    void loadTaskComments(task.id);
}

function cancelEdit(): void {
    editTargetTask.value = null;
    editForm.title = '';
    editForm.description = '';
    editForm.dueDate = '';
    editForm.participantIds = [];
    participantSearch.value = '';
    commentDraft.value = '';
    commentsError.value = '';
}
function toggleEditParticipant(userId: number): void {
    const idx = editForm.participantIds.indexOf(userId);
    if (idx >= 0) editForm.participantIds.splice(idx, 1);
    else editForm.participantIds.push(userId);
}

function isEditParticipantSelected(userId: number): boolean {
    return editForm.participantIds.includes(userId);
}

async function saveEdit(): Promise<void> {
    if (!editTargetTask.value) return;

    boardError.value = '';

    const taskId = editTargetTask.value.id;
    const ok = await kanban.updateTask(taskId, {
        title: editForm.title,
        description: editForm.description,
        due_date: editForm.dueDate || null,
        participant_ids: editForm.participantIds,
    });

    if (!ok) {
        boardError.value = kanban.state.message || 'Не удалось обновить карточку.';
        return;
    }

    await loadBoard();
    cancelEdit();
}

async function submitComment(): Promise<void> {
    if (!editTargetTask.value || commentSubmitting.value) return;

    const body = commentDraft.value.trim();
    if (!body) return;

    commentSubmitting.value = true;
    commentsError.value = '';

    try {
        const ok = await kanban.addComment(editTargetTask.value.id, body);
        if (!ok) {
            commentsError.value = kanban.state.message || 'Не удалось добавить комментарий.';
            return;
        }
        commentDraft.value = '';
    } finally {
        commentSubmitting.value = false;
    }
}

function canDeleteComment(comment: TaskComment): boolean {
    const user = auth.state.user;
    if (!user || !editTargetTask.value) return false;
    return user.role === 'admin' || comment.user_id === user.id || editTargetTask.value.user_id === user.id;
}

async function deleteComment(comment: TaskComment): Promise<void> {
    if (!editTargetTask.value) return;

    commentsError.value = '';
    try {
        await kanban.deleteComment(editTargetTask.value.id, comment.id);
    } catch {
        commentsError.value = 'Не удалось удалить комментарий.';
    }
}

async function persistColumnsDnD(): Promise<void> {
    if (syncing.value) return;

    syncing.value = true;
    boardError.value = '';

    try {
        await kanban.reorderColumns(columns.value.map((column) => column.id));
        await loadBoard();
    } catch (error) {
        if (error instanceof ApiError) boardError.value = error.message || 'Не удалось сохранить порядок колонок.';
        else boardError.value = 'Не удалось сохранить порядок колонок.';
    } finally {
        syncing.value = false;
    }
}

async function persistTasksDnD(): Promise<void> {
    if (syncing.value) return;

    boardError.value = '';
    syncing.value = true;

    try {
        for (const column of columns.value) {
            for (const task of column.tasks ?? []) {
                if (task.column_id !== column.id) {
                    await kanban.moveTask(task.id, column.id);
                }
            }

            const orderedIds = Array.isArray(column.tasks) ? column.tasks.map((task) => task.id) : [];
            await kanban.reorder(column.id, orderedIds);
        }

        await loadBoard();
    } catch (error) {
        if (error instanceof ApiError) boardError.value = error.message || 'Не удалось сохранить порядок карточек.';
        else boardError.value = 'Не удалось сохранить порядок карточек.';
    } finally {
        syncing.value = false;
    }
}

async function logout(): Promise<void> {
    await auth.logout();
    window.location.href = '/kanban/login';
}

function goToWorkspaces(): void {
    window.location.href = '/kanban/workspaces';
}

async function initBoard(): Promise<void> {
    try {
        const authenticated = await ensureAuth();
        if (!authenticated) return;
        await kanban.loadWorkspaces();

        const params = new URLSearchParams(window.location.search);
        const workspaceParam = params.get('workspace');
        const requestedWorkspaceId = workspaceParam && /^\d+$/.test(workspaceParam) ? Number(workspaceParam) : null;
        activeWorkspaceId.value = requestedWorkspaceId ?? kanban.state.workspaceId;

        if (activeWorkspaceId.value && activeWorkspaceId.value !== kanban.state.workspaceId) {
            const switched = await kanban.switchWorkspace(activeWorkspaceId.value);
            if (!switched) {
                boardError.value = kanban.state.message || 'Не удалось открыть выбранное пространство.';
                activeWorkspaceId.value = kanban.state.workspaceId;
            }
        }

        await loadBoard();
    } catch {
        boardError.value = 'Не удалось загрузить доску.';
    } finally {
        initializing.value = false;
    }
}

onMounted(() => {
    document.addEventListener('mousedown', handleDocumentMouseDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    startFallbackSync();
    void initBoard();
});

onUnmounted(() => {
    document.removeEventListener('mousedown', handleDocumentMouseDown);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    stopFallbackSync();
    if (activeRealtimeChannel.value) {
        echo.leave(activeRealtimeChannel.value);
    }
});

watch(activeWorkspaceId, (workspaceId) => {
    subscribeToWorkspaceChannel(workspaceId);
});
</script>

<template>
    <Head :title="pageTitle" />

    <main class="relative min-h-screen overflow-visible bg-gradient-to-br from-indigo-950 via-violet-900 to-fuchsia-900 px-4 pt-0 pb-0 text-slate-900 md:px-6 md:pt-0 md:pb-0">
        <div class="pointer-events-none absolute inset-0 opacity-70">
            <div class="wave wave-1" />
            <div class="wave wave-2" />
            <div class="wave wave-3" />
        </div>
        <section class="relative mx-auto flex min-h-screen max-w-[1600px] flex-col gap-4">
            <header class="relative -mx-4 border-y border-white/25 bg-white/15 px-3 py-3 text-white shadow-[0_18px_45px_rgba(0,0,0,0.15)] backdrop-blur-xl md:-mx-6 md:px-4 md:py-4">
                <div class="flex flex-wrap items-center gap-3 md:grid md:grid-cols-[auto_minmax(520px,760px)_auto] md:items-center md:gap-4">
                    <div class="flex items-center gap-3">
                        <button
                            type="button"
                            class="inline-flex items-center rounded-md border border-white/25 bg-white/10 px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] text-white/85 transition hover:bg-white/20"
                            @click="goToWorkspaces"
                        >
                            WORKSPACE
                        </button>
                        <select
                            v-model.number="activeWorkspaceId"
                            class="rounded-md border border-white/30 bg-white/10 px-2 py-1 text-xs font-medium text-white outline-none"
                            @change="activeWorkspaceId && switchWorkspace(activeWorkspaceId)"
                        >
                            <option v-for="workspace in workspaces" :key="workspace.id" :value="workspace.id" class="text-slate-900">
                                {{ workspace.name }}
                            </option>
                        </select>
                    </div>
                    <div class="flex w-full min-w-[280px] items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 md:w-full md:max-w-[760px] md:justify-self-center">
                        <span class="text-sm text-white/70">⌕</span>
                        <input
                            v-model="search"
                            placeholder="Поиск карточек"
                            class="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/65 focus:outline-none"
                            @keydown.enter.prevent="loadBoard"
                        />
                        <button
                            class="rounded-md bg-violet-500 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-violet-600"
                            @click="loadBoard"
                        >
                            Найти
                        </button>
                    </div>

                    <div class="ml-auto flex items-center gap-2 md:ml-0 md:justify-self-end">
                        <div class="grid h-8 w-8 place-items-center rounded-full bg-white text-sm font-semibold text-violet-700">{{ userInitial }}</div>
                        <button class="rounded-lg border border-white/25 bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-white/20" @click="logout">
                            Выйти
                        </button>
                    </div>
                </div>

                <div class="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <span v-for="column in columns" :key="`summary-${column.id}`" class="inline-flex items-center gap-2 rounded-lg bg-white/20 px-3 py-1">
                        <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: column.color }" />
                        {{ column.name }}: {{ column.tasks.length }}
                    </span>
                </div>
            </header>
            <p v-if="initializing" class="rounded-xl border border-white/35 bg-white/20 px-3 py-2 text-sm text-white">Loading board...</p>
            <p v-if="boardError" class="rounded-xl border border-red-300/60 bg-red-500/20 px-3 py-2 text-sm text-white">{{ boardError }}</p>

            <draggable v-model="columns" item-key="id" class="board-horizontal-scroll flex min-h-0 flex-1 items-start gap-4 overflow-x-auto px-3 pb-0 pt-1 md:px-4" handle=".column-drag-handle" @end="persistColumnsDnD">
                <template #item="{ element: column }">
                    <article
                        class="group/column relative w-[340px] shrink-0 self-start rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-3 shadow-sm"
                    >
                        <div class="mb-3 rounded-xl bg-white/70 px-3 py-2">
                            <div
                                v-if="editingColumnId === column.id"
                                class="relative z-40 space-y-2 rounded-lg bg-white p-2 shadow-2xl ring-2 ring-violet-300"
                            >
                                <input
                                    v-model="editColumnForm.name"
                                    class="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900"
                                    placeholder="Название колонки"
                                />
                                <div class="flex items-center justify-between gap-2">
                                    <input
                                        v-model="editColumnForm.color"
                                        type="color"
                                        class="h-9 w-12 rounded-md border border-slate-300 bg-white p-1"
                                    />
                                    <div class="flex items-center gap-1.5">
                                        <button
                                            class="rounded-md bg-violet-600 px-2 py-1 text-xs font-medium text-white hover:bg-violet-700"
                                            @click.stop="saveColumn(column)"
                                        >
                                            Save
                                        </button>
                                        <button
                                            class="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                                            @click.stop="cancelEditColumn"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <button class="column-drag-handle cursor-grab rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" title="Перетащить колонку" @click.stop>⋮⋮</button>
                                    <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: column.color }" />
                                    <h2 class="font-semibold text-slate-800">{{ column.name }}</h2>
                                </div>
                                <div class="flex items-center gap-1.5">
                                    <button
                                        class="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-500 opacity-0 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 group-hover/column:opacity-100"
                                        title="Изменить колонку"
                                        @click.stop="startEditColumn(column)"
                                    >
                                        ✎
                                    </button>
                                <button
                                    class="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-500 opacity-0 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 group-hover/column:opacity-100"
                                    title="Удалить колонку"
                                    @click.stop="removeColumn(column)"
                                >
                                    🗑
                                </button>
                            </div>
                            </div>
                        </div>

                        <draggable v-model="column.tasks" item-key="id" group="tasks" class="max-h-[calc(100vh-320px)] space-y-3 overflow-y-auto px-1 pb-3 pr-1.5 pt-1" @end="persistTasksDnD">
                            <template #item="{ element }">
                                <div class="group block h-auto w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md" :class="inlineTitleTaskId === element.id ? 'relative' : ''" @click="openTaskDetails(element)">
                                    <div class="flex items-start justify-between gap-2">
                                        <div class="min-w-0 flex-1">
                                            <template v-if="inlineTitleTaskId === element.id">
                                                <div class="relative z-30 rounded-lg bg-white p-1 shadow-xl ring-2 ring-violet-300">
                                                    <textarea ref="inlineTitleTextarea" v-model="inlineTitleValue" rows="1" class="min-h-[38px] w-full resize-none overflow-hidden whitespace-pre-wrap rounded-md border border-slate-300 px-2 py-1 text-sm font-medium leading-5 text-slate-900 [overflow-wrap:anywhere]" @click.stop @focus="resizeInlineTitleTextarea" @input="resizeInlineTitleTextarea" @keydown.enter.exact.prevent.stop="saveInlineTitle(element)" @keydown.enter.shift.stop />
                                                    <div class="mt-1 flex">
                                                        <button class="rounded border border-slate-300 px-2 py-0.5 text-xs font-medium leading-5 text-slate-700" :disabled="inlineTitleSaving" @click.stop="saveInlineTitle(element)">OK</button>
                                                    </div>
                                                </div>
                                            </template>
                                            <p v-else class="whitespace-pre-wrap font-medium text-slate-800 [overflow-wrap:anywhere]">{{ element.title }}</p>
                                        </div>
                                        <div class="flex flex-col gap-1">
                                            <button class="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 opacity-0 transition group-hover:opacity-100 hover:bg-slate-100" :class="inlineTitleTaskId === element.id ? 'opacity-100' : ''" title="Изменить название" @click.stop="startInlineTitleEdit(element)">✎</button>
                                            <button class="rounded-md border border-red-300 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 opacity-0 transition group-hover:opacity-100 hover:bg-red-100" title="Удалить" aria-label="Удалить карточку" @click.stop="removeTask(element)">
                                                <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
                                            </button>
                                        </div>
                                    </div>

                                    <div v-if="element.due_date" class="mt-2 text-xs font-medium text-amber-700">Срок: {{ formatDueDate(element.due_date) }}</div>
                                    <div v-if="participantUsers(element).length" class="mt-2 flex flex-wrap gap-1.5">
                                        <span v-for="member in participantUsers(element)" :key="`${element.id}-member-${member.id}`" class="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800">{{ member.name }}</span>
                                    </div>
                                    <div v-if="element.description && element.description.trim().length > 0" class="mt-2 inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600" title="карточка с описанием" aria-label="карточка с описанием"><span aria-hidden="true">📖</span></div>
                                </div>
                            </template>
                            <template #footer>
                                <p v-if="column.tasks.length === 0" class="rounded-xl border border-dashed border-slate-300 bg-white/60 p-3 text-center text-sm text-slate-500">Перетащите карточки сюда</p>

                                <div
                                    v-if="addingColumnId === column.id"
                                    data-add-card-form
                                    class="relative z-30 mt-3 rounded-xl border border-slate-300 bg-white p-3"
                                    @click.stop
                                >
                                    <textarea :data-add-card-input="column.id" v-model="ensureCreateForm(column.id).title" rows="2" placeholder="Введите заголовок карточки..." class="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900 placeholder:text-slate-400" />
                                    <div class="mt-2 flex items-center gap-2">
                                        <button class="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-violet-700" @click="createTask(column.id)">Добавить карточку</button>
                                        <button class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700" @click="cancelAddCard">Отмена</button>
                                    </div>
                                    <p v-if="kanban.state.errors.title" class="mt-2 text-sm text-red-600">{{ kanban.state.errors.title[0] }}</p>
                                </div>

                                <button v-else data-add-card-trigger class="mt-3 w-full rounded-xl border border-dashed border-slate-300 bg-white/70 px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-white" @click="startAddCard(column.id)">+ Добавить карточку</button>
                            </template>
                        </draggable>
                    </article>
                </template>
                <template #footer>
                    <article class="w-[340px] shrink-0 self-start rounded-2xl border border-dashed border-white/45 bg-white/20 p-3 shadow-sm backdrop-blur-sm">
                        <div v-if="!newColumnOpen">
                            <button
                                class="w-full rounded-xl border border-white/50 bg-white/20 px-3 py-3 text-left text-sm font-medium text-white transition hover:bg-white/30"
                                @click="newColumnOpen = true"
                            >
                                + Добавить колонку
                            </button>
                        </div>
                        <div v-else class="space-y-2">
                            <input
                                v-model="newColumnForm.name"
                                placeholder="Название колонки"
                                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                            />
                            <div class="flex items-center gap-2">
                                <input
                                    v-model="newColumnForm.color"
                                    type="color"
                                    class="h-10 w-14 rounded-lg border border-slate-300 bg-white p-1"
                                />
                                <button
                                    class="rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-violet-700"
                                    @click="createColumn"
                                >
                                    Создать
                                </button>
                                <button
                                    class="rounded-lg border border-white/50 bg-white/15 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/25"
                                    @click="newColumnOpen = false"
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    </article>
                </template>
            </draggable>

            <p v-if="syncing" class="text-sm text-white/90">Сохранение...</p>
        </section>

        <div
            v-if="editingColumnId !== null"
            class="fixed inset-0 z-30 bg-slate-950/50"
            @click="cancelEditColumn"
        />

        <div v-if="inlineTitleTaskId !== null" class="fixed inset-0 z-20 bg-slate-950/55" @click="cancelInlineTitleEdit" />

        <div v-if="editTargetTask" class="fixed inset-0 z-50 bg-slate-950/60 p-4" @click.self="cancelEdit">
            <div class="mx-auto mt-2 w-full max-w-6xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl lg:p-5">
                <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
                    <section class="rounded-xl border border-slate-200 bg-white p-4">
                        <header class="mb-4">
                            <h3 class="text-lg font-semibold text-slate-900">Детали карточки</h3>
                            <p class="mt-1 text-xs text-slate-500">Кликните по затемненному фону, чтобы закрыть окно.</p>
                        </header>

                        <div class="space-y-3">
                            <div>
                                <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Название</label>
                                <input v-model="editForm.title" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" />
                            </div>

                            <div>
                                <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Описание</label>
                                <textarea v-model="editForm.description" rows="4" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" />
                            </div>

                            <div>
                                <label class="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Срок</label>
                                <input v-model="editForm.dueDate" type="date" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" />
                            </div>

                            <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <p class="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Участники</p>
                                <div v-if="selectedParticipants.length" class="mb-2 flex flex-wrap gap-1.5">
                                    <button v-for="user in selectedParticipants" :key="`selected-${user.id}`" type="button" class="inline-flex items-center gap-1 rounded-full border border-violet-300 bg-violet-100 px-2 py-1 text-xs font-medium text-violet-800" @click="toggleEditParticipant(user.id)"><span>{{ user.name }}</span><span>×</span></button>
                                </div>
                                <input v-model="participantSearch" placeholder="Поиск участника..." class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" />
                                <div class="mt-2 grid max-h-44 gap-1 overflow-auto pr-1">
                                    <button v-for="user in filteredUsers" :key="`participant-${user.id}`" type="button" class="flex items-center justify-between gap-2 rounded-lg border px-2 py-1.5 text-left text-sm" :class="isEditParticipantSelected(user.id) ? 'border-violet-300 bg-violet-100 text-violet-900' : 'border-slate-300 bg-white text-slate-700'" @click="toggleEditParticipant(user.id)">
                                        <span class="inline-flex items-center gap-2"><span class="grid h-6 w-6 place-items-center rounded-full bg-white/80 text-[11px] font-semibold text-slate-700">{{ initials(user.name) }}</span><span class="truncate">{{ user.name }}</span></span>
                                        <span class="text-xs font-medium">{{ isEditParticipantSelected(user.id) ? 'Выбран' : 'Выбрать' }}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <footer class="mt-4"><button class="w-full rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700" @click="saveEdit">Сохранить</button></footer>
                    </section>
                    <aside class="flex h-[640px] flex-col rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <header class="mb-2 flex items-center justify-between">
                            <h4 class="font-semibold text-slate-800">Комментарии</h4>
                            <span class="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-600">{{ activeComments.length }}</span>
                        </header>

                        <p v-if="commentsError" class="mb-2 rounded-lg border border-red-300 bg-red-50 px-2 py-1 text-xs text-red-700">{{ commentsError }}</p>

                        <div class="flex-1 overflow-auto pr-1">
                            <p v-if="commentsLoading" class="text-sm text-slate-500">Загрузка комментариев...</p>
                            <p v-else-if="activeComments.length === 0" class="text-sm text-slate-500">Комментариев пока нет.</p>

                            <div v-else class="space-y-2">
                                <article v-for="comment in activeComments" :key="comment.id" class="rounded-lg border border-slate-200 bg-white p-2.5">
                                    <div class="mb-1 flex items-start justify-between gap-2">
                                        <div class="text-xs text-slate-500">
                                            <p class="font-medium text-slate-700">{{ comment.user?.name || 'Пользователь' }}</p>
                                            <p>{{ formatDateTime(comment.created_at) }}</p>
                                        </div>
                                        <button v-if="canDeleteComment(comment)" class="rounded border border-red-200 px-1.5 py-0.5 text-[11px] font-medium text-red-600" @click="deleteComment(comment)">×</button>
                                    </div>
                                    <p class="text-sm text-slate-700">{{ comment.body }}</p>
                                </article>
                            </div>
                        </div>

                        <div class="mt-3 border-t border-slate-200 pt-3">
                            <textarea v-model="commentDraft" rows="3" placeholder="Напишите комментарий..." class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" />
                            <button class="mt-2 w-full rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-60" :disabled="commentSubmitting" @click="submitComment">{{ commentSubmitting ? 'Отправка...' : 'Добавить комментарий' }}</button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    </main>
</template>

<style scoped>
.board-horizontal-scroll {
    padding-inline: 6px;
    scroll-padding-inline: 6px;
    scrollbar-width: thin;
    scrollbar-color: rgba(148, 163, 184, 0.55) transparent;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
}

.board-horizontal-scroll::-webkit-scrollbar {
    height: 8px;
}

.board-horizontal-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.board-horizontal-scroll::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.5);
    border-radius: 9999px;
}

.board-horizontal-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(148, 163, 184, 0.7);
}

.wave {
    position: absolute;
    left: -20%;
    right: -20%;
    border-radius: 9999px;
    filter: blur(48px);
    transform: translateZ(0);
}

.wave-1 {
    top: -140px;
    height: 320px;
    background: radial-gradient(ellipse at center, rgba(167, 139, 250, 0.32) 0%, rgba(167, 139, 250, 0) 72%);
    animation: waveFloatA 18s ease-in-out infinite;
}

.wave-2 {
    top: 28%;
    height: 360px;
    background: radial-gradient(ellipse at center, rgba(192, 132, 252, 0.26) 0%, rgba(192, 132, 252, 0) 72%);
    animation: waveFloatB 23s ease-in-out infinite;
}

.wave-3 {
    bottom: -180px;
    height: 340px;
    background: radial-gradient(ellipse at center, rgba(236, 72, 153, 0.2) 0%, rgba(236, 72, 153, 0) 72%);
    animation: waveFloatC 26s ease-in-out infinite;
}

@keyframes waveFloatA {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
    50% { transform: translate3d(4%, 12px, 0) scale(1.04); }
}

@keyframes waveFloatB {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
    50% { transform: translate3d(-5%, -14px, 0) scale(1.05); }
}

@keyframes waveFloatC {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
    50% { transform: translate3d(3%, -10px, 0) scale(1.03); }
}
</style>



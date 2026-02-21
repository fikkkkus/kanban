<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { computed, onMounted, reactive, ref } from 'vue';
import { useAuthApi } from '@/composables/useAuthApi';
import { useKanbanApi } from '@/composables/useKanbanApi';
import type { Workspace } from '@/types/kanban';

const auth = useAuthApi();
const kanban = useKanbanApi();

const loading = ref(true);
const info = ref('');
const error = ref('');

const createForm = reactive({ name: '', color: '#7c3aed' });
const joinForm = reactive({ code: '' });
const editWorkspaceId = ref<number | null>(null);
const editForm = reactive({ name: '', color: '#7c3aed' });

const workspaces = computed<Workspace[]>(() => kanban.state.workspaces);
const currentWorkspaceId = computed<number | null>(() => kanban.state.workspaceId);

async function ensureAuth(): Promise<boolean> {
    const user = await auth.loadMe();
    if (!user) {
        window.location.href = '/kanban/login';
        return false;
    }

    return true;
}

async function initPage(): Promise<void> {
    try {
        const authenticated = await ensureAuth();
        if (!authenticated) return;
        await kanban.loadWorkspaces();
    } catch {
        error.value = 'Не удалось загрузить пространства.';
    } finally {
        loading.value = false;
    }
}

async function createWorkspace(): Promise<void> {
    info.value = '';
    error.value = '';

    const name = createForm.name.trim();
    if (!name) {
        error.value = 'Введите название пространства.';
        return;
    }

    const ok = await kanban.createWorkspace({ name, color: createForm.color });
    if (!ok) {
        error.value = kanban.state.message || 'Не удалось создать пространство.';
        return;
    }

    createForm.name = '';
    createForm.color = '#7c3aed';
    await kanban.loadWorkspaces();
    info.value = 'Пространство создано.';
}

async function joinWorkspace(): Promise<void> {
    info.value = '';
    error.value = '';

    const code = joinForm.code.trim().toUpperCase();
    if (!code) {
        error.value = 'Введите код пространства.';
        return;
    }

    const ok = await kanban.joinWorkspace(code);
    if (!ok) {
        error.value = kanban.state.message || 'Не удалось присоединиться к пространству.';
        return;
    }

    joinForm.code = '';
    await kanban.loadWorkspaces();
    info.value = 'Вы подключились к пространству.';
}

async function copyJoinCode(code: string | null): Promise<void> {
    if (!code) return;
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(code);
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = code;
            textarea.setAttribute('readonly', 'true');
            textarea.style.position = 'fixed';
            textarea.style.top = '-1000px';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            textarea.setSelectionRange(0, textarea.value.length);
            const ok = document.execCommand('copy');
            document.body.removeChild(textarea);
            if (!ok) {
                throw new Error('copy failed');
            }
        }
        info.value = 'Код приглашения скопирован.';
        error.value = '';
    } catch {
        error.value = 'Не удалось скопировать код. Попробуйте вручную.';
    }
}

function startEdit(workspace: Workspace): void {
    editWorkspaceId.value = workspace.id;
    editForm.name = workspace.name;
    editForm.color = workspace.color;
}

function cancelEdit(): void {
    editWorkspaceId.value = null;
    editForm.name = '';
    editForm.color = '#7c3aed';
}

async function saveEdit(workspaceId: number): Promise<void> {
    info.value = '';
    error.value = '';

    const name = editForm.name.trim();
    if (!name) {
        error.value = 'Введите название пространства.';
        return;
    }

    const ok = await kanban.updateWorkspace(workspaceId, {
        name,
        color: editForm.color,
    });

    if (!ok) {
        error.value = kanban.state.message || 'Не удалось обновить пространство.';
        return;
    }

    await kanban.loadWorkspaces();
    cancelEdit();
    info.value = 'Изменения сохранены.';
}

async function openWorkspace(workspaceId: number): Promise<void> {
    info.value = '';
    error.value = '';

    const ok = await kanban.switchWorkspace(workspaceId);
    if (!ok) {
        error.value = kanban.state.message || 'Не удалось переключить пространство.';
        return;
    }

    window.location.href = `/kanban?workspace=${workspaceId}`;
}

async function logout(): Promise<void> {
    await auth.logout();
    window.location.href = '/kanban/login';
}

onMounted(() => {
    void initPage();
});
</script>

<template>
    <Head title="Пространства" />

    <main class="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-950 via-violet-900 to-fuchsia-900 px-4 py-6 text-slate-900 md:px-6">
        <div class="pointer-events-none absolute inset-0 opacity-70">
            <div class="wave wave-1" />
            <div class="wave wave-2" />
            <div class="wave wave-3" />
        </div>

        <section class="relative z-10 mx-auto w-full max-w-5xl space-y-4">
            <header class="rounded-2xl border border-white/25 bg-white/15 px-4 py-4 text-white backdrop-blur-xl">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 class="text-xl font-semibold">Пространства</h1>
                        <p class="text-sm text-white/80">Выберите пространство для работы или создайте новое.</p>
                    </div>
                    <button class="rounded-lg border border-white/30 bg-white/15 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/25" @click="logout">
                        Выйти
                    </button>
                </div>
            </header>

            <p v-if="loading" class="rounded-xl border border-white/35 bg-white/20 px-3 py-2 text-sm text-white">Загрузка...</p>
            <p v-if="error" class="rounded-xl border border-red-300/60 bg-red-500/20 px-3 py-2 text-sm text-white">{{ error }}</p>
            <p v-if="info" class="rounded-xl border border-emerald-300/60 bg-emerald-500/20 px-3 py-2 text-sm text-white">{{ info }}</p>

            <div class="grid gap-4 lg:grid-cols-2">
                <section class="rounded-2xl border border-white/30 bg-white/90 p-4 shadow-xl">
                    <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Новое пространство</h2>
                    <div class="flex flex-wrap items-end gap-2">
                        <div class="min-w-[220px] flex-1">
                            <label class="mb-1 block text-xs font-medium text-slate-600">Название</label>
                            <input v-model="createForm.name" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900" placeholder="Например: Команда продукта" />
                        </div>
                        <div>
                            <label class="mb-1 block text-xs font-medium text-slate-600">Цвет</label>
                            <input v-model="createForm.color" type="color" class="h-10 w-14 rounded-lg border border-slate-300 p-1" />
                        </div>
                        <button class="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700" @click="createWorkspace">Создать</button>
                    </div>
                </section>

                <section class="rounded-2xl border border-white/30 bg-white/90 p-4 shadow-xl">
                    <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Подключиться по коду</h2>
                    <div class="flex flex-wrap items-end gap-2">
                        <div class="min-w-[240px] flex-1">
                            <label class="mb-1 block text-xs font-medium text-slate-600">Код приглашения</label>
                            <input v-model="joinForm.code" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 uppercase" placeholder="Например: A1B2C3D4E5" />
                        </div>
                        <button class="rounded-lg border border-violet-300 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-100" @click="joinWorkspace">Подключиться</button>
                    </div>
                </section>
            </div>

            <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <article v-for="workspace in workspaces" :key="workspace.id" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <template v-if="editWorkspaceId === workspace.id">
                        <div class="space-y-2">
                            <input v-model="editForm.name" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900" />
                            <div class="flex items-center justify-between gap-2">
                                <input v-model="editForm.color" type="color" class="h-9 w-12 rounded border border-slate-300 p-1" />
                                <div class="flex items-center gap-2">
                                    <button class="rounded-md bg-violet-600 px-3 py-1 text-xs font-medium text-white" @click="saveEdit(workspace.id)">Сохранить</button>
                                    <button class="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700" @click="cancelEdit">Отмена</button>
                                </div>
                            </div>
                        </div>
                    </template>

                    <template v-else>
                        <div class="mb-3 flex items-center gap-2">
                            <span class="h-3 w-3 rounded-full" :style="{ backgroundColor: workspace.color }" />
                            <h3 class="truncate font-semibold text-slate-800">{{ workspace.name }}</h3>
                        </div>
                        <p class="mb-3 text-xs text-slate-500">
                            {{ currentWorkspaceId === workspace.id ? 'Текущее пространство' : 'Не активно' }}
                        </p>
                        <div class="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                            <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Код приглашения</p>
                            <div class="mt-1 flex items-center justify-between gap-2">
                                <code class="truncate text-xs font-medium text-slate-700">{{ workspace.join_code || '—' }}</code>
                                <button class="rounded border border-slate-300 px-2 py-0.5 text-[11px] font-medium text-slate-700" @click="copyJoinCode(workspace.join_code)">Копировать</button>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <button class="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white" @click="openWorkspace(workspace.id)">
                                Открыть
                            </button>
                            <button class="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700" @click="startEdit(workspace)">
                                Изменить
                            </button>
                        </div>
                    </template>
                </article>
            </section>
        </section>
    </main>
</template>

<style scoped>
.wave {
    position: absolute;
    left: -20%;
    right: -20%;
    border-radius: 9999px;
    filter: blur(48px);
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



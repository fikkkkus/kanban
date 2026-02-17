<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { reactive } from 'vue';
import { useAuthApi } from '@/composables/useAuthApi';

const auth = useAuthApi();
const form = reactive({
    email: '',
    password: '',
    remember: false,
});

async function submit(): Promise<void> {
    const ok = await auth.login(form);
    if (ok) {
        window.location.href = '/kanban/workspaces';
    }
}
</script>

<template>
    <Head title="Вход" />

    <main class="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-950 via-violet-900 to-fuchsia-900 px-4 text-slate-900">
        <div class="pointer-events-none absolute inset-0 opacity-70">
            <div class="wave wave-1" />
            <div class="wave wave-2" />
            <div class="wave wave-3" />
        </div>

        <div class="relative z-10 mx-auto flex min-h-screen w-full max-w-md items-center">
            <div class="w-full rounded-2xl border border-white/25 bg-white/90 p-6 text-slate-900 shadow-[0_24px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl">
                <div class="mb-5">
                    <h1 class="mt-3 text-2xl font-semibold text-slate-900">Вход в аккаунт</h1>
                    <p class="mt-1 text-sm text-slate-500">Используйте ваш email и пароль</p>
                </div>

                <form class="space-y-4" @submit.prevent="submit">
                    <div>
                        <label class="mb-1 block text-sm font-medium text-slate-900">Email</label>
                        <input
                            v-model="form.email"
                            type="email"
                            required
                            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-violet-300 placeholder:text-slate-400 focus:ring"
                        />
                        <p v-if="auth.state.errors.email" class="mt-1 text-sm text-red-600">
                            {{ auth.state.errors.email[0] }}
                        </p>
                    </div>

                    <div>
                        <label class="mb-1 block text-sm font-medium text-slate-900">Пароль</label>
                        <input
                            v-model="form.password"
                            type="password"
                            required
                            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-violet-300 placeholder:text-slate-400 focus:ring"
                        />
                        <p v-if="auth.state.errors.password" class="mt-1 text-sm text-red-600">
                            {{ auth.state.errors.password[0] }}
                        </p>
                    </div>

                    <label class="flex items-center gap-2 text-sm text-slate-700">
                        <input v-model="form.remember" type="checkbox" />
                        Запомнить меня
                    </label>

                    <p v-if="auth.state.message" class="text-sm text-red-600">{{ auth.state.message }}</p>

                    <button
                        type="submit"
                        class="w-full rounded-lg bg-violet-600 px-4 py-2 font-medium text-white transition hover:bg-violet-700 disabled:opacity-60"
                        :disabled="auth.state.loading"
                    >
                        {{ auth.state.loading ? 'Вход...' : 'Войти' }}
                    </button>
                </form>

                <p class="mt-4 text-sm text-slate-600">
                    Нет аккаунта?
                    <a href="/kanban/register" class="font-medium text-violet-700">Регистрация</a>
                </p>
            </div>
        </div>
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


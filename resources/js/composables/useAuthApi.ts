import { reactive } from 'vue';
import { api, ApiError, csrf } from '@/lib/api';
import type { AuthUser } from '@/types/kanban';

type Credentials = {
    email: string;
    password: string;
    remember?: boolean;
};

type RegisterPayload = Credentials & {
    name: string;
    password_confirmation: string;
};

const state = reactive({
    user: null as AuthUser | null,
    loading: false,
    errors: {} as Record<string, string[]>,
    message: '',
});

export function useAuthApi() {
    async function loadMe(): Promise<AuthUser | null> {
        try {
            const response = await api<{ user: AuthUser }>('/api/me');
            state.user = response.user;
            return state.user;
        } catch {
            state.user = null;
            return null;
        }
    }

    async function login(payload: Credentials): Promise<boolean> {
        state.loading = true;
        state.errors = {};
        state.message = '';

        try {
            await csrf();
            await api<{ user: AuthUser }>('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            await loadMe();
            return true;
        } catch (error) {
            if (error instanceof ApiError) {
                state.errors = error.errors ?? {};
                state.message = error.message;
            }
            return false;
        } finally {
            state.loading = false;
        }
    }

    async function register(payload: RegisterPayload): Promise<boolean> {
        state.loading = true;
        state.errors = {};
        state.message = '';

        try {
            await csrf();
            await api<{ user: AuthUser }>('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            await loadMe();
            return true;
        } catch (error) {
            if (error instanceof ApiError) {
                state.errors = error.errors ?? {};
                state.message = error.message;
            }
            return false;
        } finally {
            state.loading = false;
        }
    }

    async function logout(): Promise<void> {
        await api<{ message: string }>('/api/auth/logout', { method: 'POST' });
        state.user = null;
    }

    return { state, loadMe, login, register, logout };
}


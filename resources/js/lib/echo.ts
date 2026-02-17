import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute('content') ?? '';

const scheme = import.meta.env.VITE_REVERB_SCHEME ?? 'http';
const host = import.meta.env.VITE_REVERB_HOST ?? window.location.hostname;
const port = Number(import.meta.env.VITE_REVERB_PORT ?? 8080);

(window as any).Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS: scheme === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: '/broadcasting/auth',
    auth: {
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': csrfToken,
        },
    },
});

(window as any).Echo = echo;

export default echo;


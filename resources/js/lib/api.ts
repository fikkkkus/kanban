const defaultHeaders: HeadersInit = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
};

export class ApiError extends Error {
    public readonly status: number;
    public readonly errors?: Record<string, string[]>;

    public constructor(
        message: string,
        status: number,
        errors?: Record<string, string[]>,
    ) {
        super(message);
        this.status = status;
        this.errors = errors;
    }
}

async function parseJson(response: Response): Promise<any> {
    const text = await response.text();
    return text ? JSON.parse(text) : {};
}

function getCookie(name: string): string | null {
    const key = `${name}=`;
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
        const item = cookie.trim();
        if (item.startsWith(key)) {
            return decodeURIComponent(item.substring(key.length));
        }
    }

    return null;
}

export async function csrf(): Promise<void> {
    await fetch('/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
    });
}

export async function api<T>(
    url: string,
    options: RequestInit = {},
): Promise<T> {
    const xsrfToken = getCookie('XSRF-TOKEN');

    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            ...defaultHeaders,
            ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
            ...(options.headers ?? {}),
        },
    });

    const data = await parseJson(response);

    if (!response.ok) {
        throw new ApiError(
            data.message ?? 'Request failed',
            response.status,
            data.errors,
        );
    }

    return data as T;
}


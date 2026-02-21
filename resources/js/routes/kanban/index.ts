import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
 * @see routes/web.php:17
 * @route '/kanban/login'
 */
export const login = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

login.definition = {
    methods: ["get","head"],
    url: '/kanban/login',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:17
 * @route '/kanban/login'
 */
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:17
 * @route '/kanban/login'
 */
login.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:17
 * @route '/kanban/login'
 */
login.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: login.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:17
 * @route '/kanban/login'
 */
    const loginForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: login.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:17
 * @route '/kanban/login'
 */
        loginForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: login.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:17
 * @route '/kanban/login'
 */
        loginForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: login.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    login.form = loginForm
/**
 * @see routes/web.php:18
 * @route '/kanban/register'
 */
export const register = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: register.url(options),
    method: 'get',
})

register.definition = {
    methods: ["get","head"],
    url: '/kanban/register',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:18
 * @route '/kanban/register'
 */
register.url = (options?: RouteQueryOptions) => {
    return register.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:18
 * @route '/kanban/register'
 */
register.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: register.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:18
 * @route '/kanban/register'
 */
register.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: register.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:18
 * @route '/kanban/register'
 */
    const registerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: register.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:18
 * @route '/kanban/register'
 */
        registerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: register.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:18
 * @route '/kanban/register'
 */
        registerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: register.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    register.form = registerForm
/**
 * @see routes/web.php:19
 * @route '/kanban/workspaces'
 */
export const workspaces = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: workspaces.url(options),
    method: 'get',
})

workspaces.definition = {
    methods: ["get","head"],
    url: '/kanban/workspaces',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:19
 * @route '/kanban/workspaces'
 */
workspaces.url = (options?: RouteQueryOptions) => {
    return workspaces.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:19
 * @route '/kanban/workspaces'
 */
workspaces.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: workspaces.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:19
 * @route '/kanban/workspaces'
 */
workspaces.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: workspaces.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:19
 * @route '/kanban/workspaces'
 */
    const workspacesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: workspaces.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:19
 * @route '/kanban/workspaces'
 */
        workspacesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: workspaces.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:19
 * @route '/kanban/workspaces'
 */
        workspacesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: workspaces.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    workspaces.form = workspacesForm
/**
 * @see routes/web.php:20
 * @route '/kanban'
 */
export const board = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: board.url(options),
    method: 'get',
})

board.definition = {
    methods: ["get","head"],
    url: '/kanban',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:20
 * @route '/kanban'
 */
board.url = (options?: RouteQueryOptions) => {
    return board.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:20
 * @route '/kanban'
 */
board.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: board.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:20
 * @route '/kanban'
 */
board.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: board.url(options),
    method: 'head',
})

    /**
 * @see routes/web.php:20
 * @route '/kanban'
 */
    const boardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: board.url(options),
        method: 'get',
    })

            /**
 * @see routes/web.php:20
 * @route '/kanban'
 */
        boardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: board.url(options),
            method: 'get',
        })
            /**
 * @see routes/web.php:20
 * @route '/kanban'
 */
        boardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: board.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    board.form = boardForm
const kanban = {
    login: Object.assign(login, login),
register: Object.assign(register, register),
workspaces: Object.assign(workspaces, workspaces),
board: Object.assign(board, board),
}

export default kanban
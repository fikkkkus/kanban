import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\WorkspaceController::index
 * @see app/Http/Controllers/Api/WorkspaceController.php:27
 * @route '/api/workspaces'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/workspaces',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\WorkspaceController::index
 * @see app/Http/Controllers/Api/WorkspaceController.php:27
 * @route '/api/workspaces'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\WorkspaceController::index
 * @see app/Http/Controllers/Api/WorkspaceController.php:27
 * @route '/api/workspaces'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\WorkspaceController::index
 * @see app/Http/Controllers/Api/WorkspaceController.php:27
 * @route '/api/workspaces'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\WorkspaceController::index
 * @see app/Http/Controllers/Api/WorkspaceController.php:27
 * @route '/api/workspaces'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\WorkspaceController::index
 * @see app/Http/Controllers/Api/WorkspaceController.php:27
 * @route '/api/workspaces'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\WorkspaceController::index
 * @see app/Http/Controllers/Api/WorkspaceController.php:27
 * @route '/api/workspaces'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\Api\WorkspaceController::store
 * @see app/Http/Controllers/Api/WorkspaceController.php:46
 * @route '/api/workspaces'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/workspaces',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\WorkspaceController::store
 * @see app/Http/Controllers/Api/WorkspaceController.php:46
 * @route '/api/workspaces'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\WorkspaceController::store
 * @see app/Http/Controllers/Api/WorkspaceController.php:46
 * @route '/api/workspaces'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\WorkspaceController::store
 * @see app/Http/Controllers/Api/WorkspaceController.php:46
 * @route '/api/workspaces'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\WorkspaceController::store
 * @see app/Http/Controllers/Api/WorkspaceController.php:46
 * @route '/api/workspaces'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\WorkspaceController::join
 * @see app/Http/Controllers/Api/WorkspaceController.php:93
 * @route '/api/workspaces/join'
 */
export const join = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: join.url(options),
    method: 'post',
})

join.definition = {
    methods: ["post"],
    url: '/api/workspaces/join',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\WorkspaceController::join
 * @see app/Http/Controllers/Api/WorkspaceController.php:93
 * @route '/api/workspaces/join'
 */
join.url = (options?: RouteQueryOptions) => {
    return join.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\WorkspaceController::join
 * @see app/Http/Controllers/Api/WorkspaceController.php:93
 * @route '/api/workspaces/join'
 */
join.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: join.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\WorkspaceController::join
 * @see app/Http/Controllers/Api/WorkspaceController.php:93
 * @route '/api/workspaces/join'
 */
    const joinForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: join.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\WorkspaceController::join
 * @see app/Http/Controllers/Api/WorkspaceController.php:93
 * @route '/api/workspaces/join'
 */
        joinForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: join.url(options),
            method: 'post',
        })
    
    join.form = joinForm
/**
* @see \App\Http\Controllers\Api\WorkspaceController::update
 * @see app/Http/Controllers/Api/WorkspaceController.php:79
 * @route '/api/workspaces/{workspace}'
 */
export const update = (args: { workspace: number | { id: number } } | [workspace: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/api/workspaces/{workspace}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Api\WorkspaceController::update
 * @see app/Http/Controllers/Api/WorkspaceController.php:79
 * @route '/api/workspaces/{workspace}'
 */
update.url = (args: { workspace: number | { id: number } } | [workspace: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { workspace: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { workspace: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    workspace: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        workspace: typeof args.workspace === 'object'
                ? args.workspace.id
                : args.workspace,
                }

    return update.definition.url
            .replace('{workspace}', parsedArgs.workspace.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\WorkspaceController::update
 * @see app/Http/Controllers/Api/WorkspaceController.php:79
 * @route '/api/workspaces/{workspace}'
 */
update.patch = (args: { workspace: number | { id: number } } | [workspace: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\WorkspaceController::update
 * @see app/Http/Controllers/Api/WorkspaceController.php:79
 * @route '/api/workspaces/{workspace}'
 */
    const updateForm = (args: { workspace: number | { id: number } } | [workspace: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\WorkspaceController::update
 * @see app/Http/Controllers/Api/WorkspaceController.php:79
 * @route '/api/workspaces/{workspace}'
 */
        updateForm.patch = (args: { workspace: number | { id: number } } | [workspace: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\Api\WorkspaceController::switchMethod
 * @see app/Http/Controllers/Api/WorkspaceController.php:61
 * @route '/api/workspaces/{workspace}/switch'
 */
export const switchMethod = (args: { workspace: number | { id: number } } | [workspace: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: switchMethod.url(args, options),
    method: 'post',
})

switchMethod.definition = {
    methods: ["post"],
    url: '/api/workspaces/{workspace}/switch',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\WorkspaceController::switchMethod
 * @see app/Http/Controllers/Api/WorkspaceController.php:61
 * @route '/api/workspaces/{workspace}/switch'
 */
switchMethod.url = (args: { workspace: number | { id: number } } | [workspace: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { workspace: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { workspace: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    workspace: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        workspace: typeof args.workspace === 'object'
                ? args.workspace.id
                : args.workspace,
                }

    return switchMethod.definition.url
            .replace('{workspace}', parsedArgs.workspace.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\WorkspaceController::switchMethod
 * @see app/Http/Controllers/Api/WorkspaceController.php:61
 * @route '/api/workspaces/{workspace}/switch'
 */
switchMethod.post = (args: { workspace: number | { id: number } } | [workspace: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: switchMethod.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\WorkspaceController::switchMethod
 * @see app/Http/Controllers/Api/WorkspaceController.php:61
 * @route '/api/workspaces/{workspace}/switch'
 */
    const switchMethodForm = (args: { workspace: number | { id: number } } | [workspace: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: switchMethod.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\WorkspaceController::switchMethod
 * @see app/Http/Controllers/Api/WorkspaceController.php:61
 * @route '/api/workspaces/{workspace}/switch'
 */
        switchMethodForm.post = (args: { workspace: number | { id: number } } | [workspace: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: switchMethod.url(args, options),
            method: 'post',
        })
    
    switchMethod.form = switchMethodForm
/**
* @see \App\Http\Controllers\Api\WorkspaceController::members
 * @see app/Http/Controllers/Api/WorkspaceController.php:115
 * @route '/api/workspaces/{workspace}/members'
 */
export const members = (args: { workspace: number | { id: number } } | [workspace: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: members.url(args, options),
    method: 'get',
})

members.definition = {
    methods: ["get","head"],
    url: '/api/workspaces/{workspace}/members',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\WorkspaceController::members
 * @see app/Http/Controllers/Api/WorkspaceController.php:115
 * @route '/api/workspaces/{workspace}/members'
 */
members.url = (args: { workspace: number | { id: number } } | [workspace: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { workspace: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { workspace: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    workspace: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        workspace: typeof args.workspace === 'object'
                ? args.workspace.id
                : args.workspace,
                }

    return members.definition.url
            .replace('{workspace}', parsedArgs.workspace.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\WorkspaceController::members
 * @see app/Http/Controllers/Api/WorkspaceController.php:115
 * @route '/api/workspaces/{workspace}/members'
 */
members.get = (args: { workspace: number | { id: number } } | [workspace: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: members.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\WorkspaceController::members
 * @see app/Http/Controllers/Api/WorkspaceController.php:115
 * @route '/api/workspaces/{workspace}/members'
 */
members.head = (args: { workspace: number | { id: number } } | [workspace: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: members.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\WorkspaceController::members
 * @see app/Http/Controllers/Api/WorkspaceController.php:115
 * @route '/api/workspaces/{workspace}/members'
 */
    const membersForm = (args: { workspace: number | { id: number } } | [workspace: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: members.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\WorkspaceController::members
 * @see app/Http/Controllers/Api/WorkspaceController.php:115
 * @route '/api/workspaces/{workspace}/members'
 */
        membersForm.get = (args: { workspace: number | { id: number } } | [workspace: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: members.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\WorkspaceController::members
 * @see app/Http/Controllers/Api/WorkspaceController.php:115
 * @route '/api/workspaces/{workspace}/members'
 */
        membersForm.head = (args: { workspace: number | { id: number } } | [workspace: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: members.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    members.form = membersForm
const WorkspaceController = { index, store, join, update, switchMethod, members, switch: switchMethod }

export default WorkspaceController
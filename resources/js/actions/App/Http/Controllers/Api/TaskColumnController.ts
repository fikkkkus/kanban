import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\TaskColumnController::index
 * @see app/Http/Controllers/Api/TaskColumnController.php:21
 * @route '/api/columns'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/columns',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\TaskColumnController::index
 * @see app/Http/Controllers/Api/TaskColumnController.php:21
 * @route '/api/columns'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TaskColumnController::index
 * @see app/Http/Controllers/Api/TaskColumnController.php:21
 * @route '/api/columns'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\TaskColumnController::index
 * @see app/Http/Controllers/Api/TaskColumnController.php:21
 * @route '/api/columns'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\TaskColumnController::index
 * @see app/Http/Controllers/Api/TaskColumnController.php:21
 * @route '/api/columns'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\TaskColumnController::index
 * @see app/Http/Controllers/Api/TaskColumnController.php:21
 * @route '/api/columns'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\TaskColumnController::index
 * @see app/Http/Controllers/Api/TaskColumnController.php:21
 * @route '/api/columns'
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
* @see \App\Http\Controllers\Api\TaskColumnController::store
 * @see app/Http/Controllers/Api/TaskColumnController.php:39
 * @route '/api/columns'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/columns',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\TaskColumnController::store
 * @see app/Http/Controllers/Api/TaskColumnController.php:39
 * @route '/api/columns'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TaskColumnController::store
 * @see app/Http/Controllers/Api/TaskColumnController.php:39
 * @route '/api/columns'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\TaskColumnController::store
 * @see app/Http/Controllers/Api/TaskColumnController.php:39
 * @route '/api/columns'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\TaskColumnController::store
 * @see app/Http/Controllers/Api/TaskColumnController.php:39
 * @route '/api/columns'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\TaskColumnController::reorder
 * @see app/Http/Controllers/Api/TaskColumnController.php:85
 * @route '/api/columns/reorder'
 */
export const reorder = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: reorder.url(options),
    method: 'patch',
})

reorder.definition = {
    methods: ["patch"],
    url: '/api/columns/reorder',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Api\TaskColumnController::reorder
 * @see app/Http/Controllers/Api/TaskColumnController.php:85
 * @route '/api/columns/reorder'
 */
reorder.url = (options?: RouteQueryOptions) => {
    return reorder.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TaskColumnController::reorder
 * @see app/Http/Controllers/Api/TaskColumnController.php:85
 * @route '/api/columns/reorder'
 */
reorder.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: reorder.url(options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\TaskColumnController::reorder
 * @see app/Http/Controllers/Api/TaskColumnController.php:85
 * @route '/api/columns/reorder'
 */
    const reorderForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: reorder.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\TaskColumnController::reorder
 * @see app/Http/Controllers/Api/TaskColumnController.php:85
 * @route '/api/columns/reorder'
 */
        reorderForm.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: reorder.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    reorder.form = reorderForm
/**
* @see \App\Http\Controllers\Api\TaskColumnController::update
 * @see app/Http/Controllers/Api/TaskColumnController.php:57
 * @route '/api/columns/{column}'
 */
export const update = (args: { column: number | { id: number } } | [column: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/api/columns/{column}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Api\TaskColumnController::update
 * @see app/Http/Controllers/Api/TaskColumnController.php:57
 * @route '/api/columns/{column}'
 */
update.url = (args: { column: number | { id: number } } | [column: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { column: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { column: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    column: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        column: typeof args.column === 'object'
                ? args.column.id
                : args.column,
                }

    return update.definition.url
            .replace('{column}', parsedArgs.column.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TaskColumnController::update
 * @see app/Http/Controllers/Api/TaskColumnController.php:57
 * @route '/api/columns/{column}'
 */
update.patch = (args: { column: number | { id: number } } | [column: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\TaskColumnController::update
 * @see app/Http/Controllers/Api/TaskColumnController.php:57
 * @route '/api/columns/{column}'
 */
    const updateForm = (args: { column: number | { id: number } } | [column: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\TaskColumnController::update
 * @see app/Http/Controllers/Api/TaskColumnController.php:57
 * @route '/api/columns/{column}'
 */
        updateForm.patch = (args: { column: number | { id: number } } | [column: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Api\TaskColumnController::destroy
 * @see app/Http/Controllers/Api/TaskColumnController.php:104
 * @route '/api/columns/{column}'
 */
export const destroy = (args: { column: number | { id: number } } | [column: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/columns/{column}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\TaskColumnController::destroy
 * @see app/Http/Controllers/Api/TaskColumnController.php:104
 * @route '/api/columns/{column}'
 */
destroy.url = (args: { column: number | { id: number } } | [column: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { column: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { column: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    column: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        column: typeof args.column === 'object'
                ? args.column.id
                : args.column,
                }

    return destroy.definition.url
            .replace('{column}', parsedArgs.column.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TaskColumnController::destroy
 * @see app/Http/Controllers/Api/TaskColumnController.php:104
 * @route '/api/columns/{column}'
 */
destroy.delete = (args: { column: number | { id: number } } | [column: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\TaskColumnController::destroy
 * @see app/Http/Controllers/Api/TaskColumnController.php:104
 * @route '/api/columns/{column}'
 */
    const destroyForm = (args: { column: number | { id: number } } | [column: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\TaskColumnController::destroy
 * @see app/Http/Controllers/Api/TaskColumnController.php:104
 * @route '/api/columns/{column}'
 */
        destroyForm.delete = (args: { column: number | { id: number } } | [column: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const TaskColumnController = { index, store, reorder, update, destroy }

export default TaskColumnController
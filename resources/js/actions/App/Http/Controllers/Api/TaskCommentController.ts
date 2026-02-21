import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\TaskCommentController::index
 * @see app/Http/Controllers/Api/TaskCommentController.php:16
 * @route '/api/tasks/{task}/comments'
 */
export const index = (args: { task: number | { id: number } } | [task: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/tasks/{task}/comments',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\TaskCommentController::index
 * @see app/Http/Controllers/Api/TaskCommentController.php:16
 * @route '/api/tasks/{task}/comments'
 */
index.url = (args: { task: number | { id: number } } | [task: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { task: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { task: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    task: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        task: typeof args.task === 'object'
                ? args.task.id
                : args.task,
                }

    return index.definition.url
            .replace('{task}', parsedArgs.task.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TaskCommentController::index
 * @see app/Http/Controllers/Api/TaskCommentController.php:16
 * @route '/api/tasks/{task}/comments'
 */
index.get = (args: { task: number | { id: number } } | [task: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\TaskCommentController::index
 * @see app/Http/Controllers/Api/TaskCommentController.php:16
 * @route '/api/tasks/{task}/comments'
 */
index.head = (args: { task: number | { id: number } } | [task: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\TaskCommentController::index
 * @see app/Http/Controllers/Api/TaskCommentController.php:16
 * @route '/api/tasks/{task}/comments'
 */
    const indexForm = (args: { task: number | { id: number } } | [task: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\TaskCommentController::index
 * @see app/Http/Controllers/Api/TaskCommentController.php:16
 * @route '/api/tasks/{task}/comments'
 */
        indexForm.get = (args: { task: number | { id: number } } | [task: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\TaskCommentController::index
 * @see app/Http/Controllers/Api/TaskCommentController.php:16
 * @route '/api/tasks/{task}/comments'
 */
        indexForm.head = (args: { task: number | { id: number } } | [task: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\Api\TaskCommentController::store
 * @see app/Http/Controllers/Api/TaskCommentController.php:30
 * @route '/api/tasks/{task}/comments'
 */
export const store = (args: { task: number | { id: number } } | [task: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/tasks/{task}/comments',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\TaskCommentController::store
 * @see app/Http/Controllers/Api/TaskCommentController.php:30
 * @route '/api/tasks/{task}/comments'
 */
store.url = (args: { task: number | { id: number } } | [task: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { task: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { task: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    task: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        task: typeof args.task === 'object'
                ? args.task.id
                : args.task,
                }

    return store.definition.url
            .replace('{task}', parsedArgs.task.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TaskCommentController::store
 * @see app/Http/Controllers/Api/TaskCommentController.php:30
 * @route '/api/tasks/{task}/comments'
 */
store.post = (args: { task: number | { id: number } } | [task: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\TaskCommentController::store
 * @see app/Http/Controllers/Api/TaskCommentController.php:30
 * @route '/api/tasks/{task}/comments'
 */
    const storeForm = (args: { task: number | { id: number } } | [task: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\TaskCommentController::store
 * @see app/Http/Controllers/Api/TaskCommentController.php:30
 * @route '/api/tasks/{task}/comments'
 */
        storeForm.post = (args: { task: number | { id: number } } | [task: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\TaskCommentController::destroy
 * @see app/Http/Controllers/Api/TaskCommentController.php:47
 * @route '/api/tasks/{task}/comments/{comment}'
 */
export const destroy = (args: { task: number | { id: number }, comment: number | { id: number } } | [task: number | { id: number }, comment: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/tasks/{task}/comments/{comment}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\TaskCommentController::destroy
 * @see app/Http/Controllers/Api/TaskCommentController.php:47
 * @route '/api/tasks/{task}/comments/{comment}'
 */
destroy.url = (args: { task: number | { id: number }, comment: number | { id: number } } | [task: number | { id: number }, comment: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
                    task: args[0],
                    comment: args[1],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        task: typeof args.task === 'object'
                ? args.task.id
                : args.task,
                                comment: typeof args.comment === 'object'
                ? args.comment.id
                : args.comment,
                }

    return destroy.definition.url
            .replace('{task}', parsedArgs.task.toString())
            .replace('{comment}', parsedArgs.comment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TaskCommentController::destroy
 * @see app/Http/Controllers/Api/TaskCommentController.php:47
 * @route '/api/tasks/{task}/comments/{comment}'
 */
destroy.delete = (args: { task: number | { id: number }, comment: number | { id: number } } | [task: number | { id: number }, comment: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\TaskCommentController::destroy
 * @see app/Http/Controllers/Api/TaskCommentController.php:47
 * @route '/api/tasks/{task}/comments/{comment}'
 */
    const destroyForm = (args: { task: number | { id: number }, comment: number | { id: number } } | [task: number | { id: number }, comment: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\TaskCommentController::destroy
 * @see app/Http/Controllers/Api/TaskCommentController.php:47
 * @route '/api/tasks/{task}/comments/{comment}'
 */
        destroyForm.delete = (args: { task: number | { id: number }, comment: number | { id: number } } | [task: number | { id: number }, comment: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const TaskCommentController = { index, store, destroy }

export default TaskCommentController
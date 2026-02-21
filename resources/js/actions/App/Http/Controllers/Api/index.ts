import AuthController from './AuthController'
import UserController from './UserController'
import WorkspaceController from './WorkspaceController'
import TaskController from './TaskController'
import TaskColumnController from './TaskColumnController'
import TaskCommentController from './TaskCommentController'
const Api = {
    AuthController: Object.assign(AuthController, AuthController),
UserController: Object.assign(UserController, UserController),
WorkspaceController: Object.assign(WorkspaceController, WorkspaceController),
TaskController: Object.assign(TaskController, TaskController),
TaskColumnController: Object.assign(TaskColumnController, TaskColumnController),
TaskCommentController: Object.assign(TaskCommentController, TaskCommentController),
}

export default Api
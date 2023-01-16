export type Task = {
  readonly id: number,
  title: string,
  isFinished?: boolean,
  isArchived?: boolean,
  isDeleted?: boolean,
}
export type TaskContent = {
  readonly id?: Task['id'],
  title: Task['title'],
}
export type PartialTask = Partial<Task>
export type TaskList = Task[]

export interface TaskModel {
  taskList: TaskList
  createTask: (taskContent: TaskContent) => void
  pushTask: (updatedTask: PartialTask) => void
  finishTask: (id: Task['id']) => void
  unfinishTask: (id: Task['id']) => void
  archiveTask: (id: Task['id']) => void
  unarchiveTask: (id: Task['id']) => void
  deleteTask: (id: Task['id']) => void
  undeleteTask: (id: Task['id']) => void
}
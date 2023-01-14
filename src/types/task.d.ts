export type TaskContent = {
  readonly id?: number,
  readonly title: string,
}

export type Task = {
  readonly id: number,
  readonly title: string,
  readonly isFinished?: boolean,
  readonly isArchived?: boolean,
  readonly isDeleted?: boolean,
}

export type PartialTask = Partial<Task>

export type TaskList = Task[]
export type Tasks = Task[]

// export interface Todo extends Task {
//   readonly isFinished?: false,
//   readonly isArchived?: false,
//   readonly isDeleted?: false,
// }

// export interface FinishedTodo extends Todo {
//   readonly isFinished: true,
//   readonly isArchived?: false,
//   readonly isDeleted?: false,
// }

// export interface ArchivedTodo extends Todo {
//   readonly isFinished?: boolean,
//   readonly isArchived: true,
//   readonly isDeleted?: false,
// }

// export interface DeletedTodo extends Todo {
//   readonly isFinished?: boolean,
//   readonly isArchived?: boolean,
//   readonly isDeleted: true,
// }

// export type TodoList = Todo[]
// export type FinishedTodoList = FinishedTodo[]
// export type ArchivedTodoList = ArchivedTodo[]
// export type DeletedTodoList = DeletedTodo[]
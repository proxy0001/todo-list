export type Todo = {
  id: number,
  title: string,
  isDeleted?: boolean,
  isFinished?: boolean,
  isArchived?: boolean,
}

export type TodoList = Todo[]
import { z } from "zod"
export const userId = z.string()
export type UserId = z.infer<typeof userId>

export const task = z.object({
  id: z.number(),
  userId,
  title: z.string(),
  isFinished: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})
export type Task = z.infer<typeof task>

export const noHeadTask = task.omit({ id: true })
export type NoHeadTask = z.infer<typeof noHeadTask>
export const taskList = task.array()
export type TaskList = z.infer<typeof taskList>

export const todo = task.extend({
  isFinished: z.literal(false).optional(),
  isArchived: z.literal(false).optional(),
})
export type Todo = z.infer<typeof todo>
export const todoList = todo.array()
export type TodoList = z.infer<typeof todoList>

export const finish = task.extend({
  isFinished: z.literal(true),
  isArchived: z.literal(false),
})
export type Finish = z.infer<typeof finish>
export const finishList = finish.array()
export type FinishList = z.infer<typeof finishList>

export const archive = task.extend({
  isArchived: z.literal(true),
})
export type Archive = z.infer<typeof archive>
export const archiveList = archive.array()
export type ArchiveList = z.infer<typeof archiveList>

export const taskModel = z.object({
  userId,
  todoList: taskList,
  finishList: taskList,
  archiveList: taskList,
  createTask: z.function().args(task).returns(z.void()),
  pushTask: z.function().args(task).returns(z.void()),
  finishTask: z.function().args(task).returns(z.void()),
  unfinishTask: z.function().args(task).returns(z.void()),
  archiveTask: z.function().args(task).returns(z.void()),
  unarchiveTask: z.function().args(task).returns(z.void()),
  deleteTask: z.function().args(task).returns(z.void()),
})
export type TaskModel = z.infer<typeof taskModel>

export const taskSchema = {
  userId,
  task,
  noHeadTask,
  todo,
  finish,
  archive,
  todoList: taskList,
  finishList: taskList,
  archiveList: taskList,
  taskModel,
}
export default taskSchema

// TRPCClientErrorLike
const errorMessage = z.string()

export const refetchMethodOption = z.object({
  onSuccess: z.function().args(taskList).returns(z.void()).optional(),
  onError: z.function().args(errorMessage).returns(z.void()).optional(),
})

export type RefetchMethodOption = z.infer<typeof refetchMethodOption>

export const createMethodOption = z.object({
  onMutate: z.function().args(noHeadTask).returns(z.void()).optional(),
  onSuccess: z.function().args(task).returns(z.void()).optional(),
  onError: z.function().args(errorMessage).returns(z.void()).optional(),
})
export type CreateMethodOption = z.infer<typeof createMethodOption>

export const methodOption = z.object({
  onMutate: z.function().args(task).returns(z.void()).optional(),
  onSuccess: z.function().args(task).returns(z.void()).optional(),
  onError: z.function().args(errorMessage).returns(z.void()).optional(),
})
export type MethodOption = z.infer<typeof methodOption>

// FIXME: How to make optional args of function ?
export const listModel = z.object({
  userId,
  taskList,
  isLoading: z.boolean(),
  isError: z.boolean(),
  refetchList: z.function().args(refetchMethodOption.optional()).returns(z.void()).optional(),
  createTask: z.function().args(noHeadTask, createMethodOption.optional()).returns(z.void()).optional(),
  pushTask: z.function().args(task, methodOption.optional()).returns(z.void()).optional(),
  finishTask: z.function().args(task, methodOption.optional()).returns(z.void()).optional(),
  unfinishTask: z.function().args(task, methodOption.optional()).returns(z.void()).optional(),
  archiveTask: z.function().args(task, methodOption.optional()).returns(z.void()).optional(),
  unarchiveTask: z.function().args(task, methodOption.optional()).returns(z.void()).optional(),
  deleteTask: z.function().args(task, methodOption.optional()).returns(z.void()).optional(),
  optimisticAddTask: z.function().args(task).returns(z.void()).optional(),
})

export type ListModel = z.infer<typeof listModel>
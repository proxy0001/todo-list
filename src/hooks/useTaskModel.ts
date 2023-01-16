import type { TaskList, TaskModel } from '../types/task'

export type UseTaskModelProps = { initTaskList?: TaskList }
export type UseTaskModel = (modelProps?: UseTaskModelProps) => TaskModel
export type UesTaskModelOptions = {
  [key in TaskModelType]: UseTaskModel
}

export enum TaskModelType {
  Demo = 'DEMO',
  Prisma = 'PRISMA',
}
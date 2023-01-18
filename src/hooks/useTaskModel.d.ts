import type { TaskList, TaskModel } from '../types/task'

export type UseTaskModelProps = {
  userId?: string
}
export type UseTaskModel = (modelProps?: UseTaskModelProps) => TaskModel
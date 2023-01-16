import type { TaskList, TaskModel } from '../types/task'

export type UseTaskModelProps = {
  userId?: string
  initTaskList?: TaskList
}
export type UseTaskModel = (modelProps?: UseTaskModelProps) => TaskModel
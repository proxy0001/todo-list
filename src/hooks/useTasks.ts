import useDemoTaskModel from './useDemoTaskModel'
import usePrismaTaskModel from './usePrismaTaskModel'

import { TaskModelType } from './useTaskModel'
import type { UseTaskModelProps, UseTaskModel } from './useTaskModel'
export { TaskModelType } from './useTaskModel'

export interface UseTasksProps {
  modelType?: TaskModelType,
  modelProps?: UseTaskModelProps,
}

export type UesTaskModelOptions = {
  [key in TaskModelType]: UseTaskModel
}
const options: UesTaskModelOptions = {
  DEMO: useDemoTaskModel,
  PRISMA: usePrismaTaskModel,
}

export const useTasks = ({ modelType = TaskModelType.Prisma, modelProps }: UseTasksProps) => {
  return options[modelType](modelProps)
}

export default useTasks
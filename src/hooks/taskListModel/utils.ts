import type { UserId, Task } from '../../types/task'
import * as O from 'fp-ts/Option'
import * as B from 'fp-ts/boolean'
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/lib/function'
import { api } from '../../utils/api'

export type Api = typeof api
export type ApiMethods = 
  typeof api.task.create |
  typeof api.task.delete |
  typeof api.task.push

export type Utils = ReturnType<typeof api.useContext>
export type UtilLists =
  Utils['task']['todoList'] |
  Utils['task']['finishList'] |
  Utils['task']['archiveList']

export type OnMutateArgs =
  Parameters<NonNullable<NonNullable<Parameters<Api['task']['create']['useMutation']>[0]>['onMutate']>>[0] |
  Parameters<NonNullable<NonNullable<Parameters<Api['task']['delete']['useMutation']>[0]>['onMutate']>>[0] |
  Parameters<NonNullable<NonNullable<Parameters<Api['task']['push']['useMutation']>[0]>['onMutate']>>[0]

export type UtilListUpdaters =
  ((arg: OnMutateArgs) => NonNullable<Parameters<Utils['task']['todoList']['setData']>[1]>) |
  ((arg: OnMutateArgs) => NonNullable<Parameters<Utils['task']['finishList']['setData']>[1]>) |
  ((arg: OnMutateArgs) => NonNullable<Parameters<Utils['task']['archiveList']['setData']>[1]>)

export type UpdaterCurry<A> = (filterCondition: (arg: A) => boolean) => UtilListUpdaters
export type FilterCondition = (task: Task) => boolean

export type CreateMutation = ReturnType<Api['task']['create']['useMutation']>
export type DeleteMutation = ReturnType<Api['task']['delete']['useMutation']>
export type PushMutation = ReturnType<Api['task']['push']['useMutation']>
export type Mutations = 
  CreateMutation |
  DeleteMutation |
  PushMutation

export type OnMutate = (arg: OnMutateArgs) => void
export type GenMutationProps = {
  userId: UserId,
  apiMethod: ApiMethods,
  utilList: UtilLists,
  updater: UtilListUpdaters,
  onMutate?: OnMutate,
}

export const genMutation = <R extends Mutations>({userId, apiMethod, utilList, updater}: GenMutationProps): R => {
  return apiMethod.useMutation({
    // type ListName = keyof typeof utils.task
    async onMutate (mutatedData) {
      console.log('mutate')
      // Cancel outgoing fetches (so they don't overwrite our optimistic update)
      await utilList.cancel()
      console.log('mutate canceled')
      // // Get the data from the queryCache
      const prevData = utilList.getData()
      // // Optimistically update the data with our new post
      const newData = utilList.setData({ userId }, updater(mutatedData))
      // // Return the previous data so we can revert if something goes wrong
      return { prevData }
    },
    async onSettled () {
      // Sync with server once mutation has settled
      await utilList.invalidate()
    }
  }) as R
}

export const createUpdater: UtilListUpdaters = (noHeadTask) => {
  const tmpNewTaskForDisplay = { ...noHeadTask, id: Math.random() * -1 }
  return (oldList) => oldList ? [tmpNewTaskForDisplay, ...oldList] : []
}
export const deleteUpdater: UtilListUpdaters = (deletedTask) => {
  const id = (deletedTask as Task).id
  return (oldList) => oldList ? oldList.filter(task => task.id !==  id): []
}
export const pushUpdater: UpdaterCurry<Task> = (filterCondition) => (updatedTask) => {
  const f = (task: Task): O.Option<Task> => pipe(
    task.id === (updatedTask as Task).id,
    B.match(
      () => O.some(task),
      () => O.some(updatedTask as Task)
    ),
    O.filterMap(t => filterCondition(t) ? O.some(t) : O.none),
  )

  return (oldList) => pipe(
    O.fromNullable(oldList),
    O.match(
      () => [],
      oldList => pipe(
        oldList,
        A.filterMap(f),
      )
    )
  )
}
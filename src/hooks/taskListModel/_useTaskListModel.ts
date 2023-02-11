/**
 * TODO:
 * Consolidate three hooks: useTodoListModel, useFinishListModel, useArchiveListModel
 * to useTaskListModel by passing parameters.
 * By doing so, we can reduce the number of unnecessary generated functions
 * 
 * The difference between them are these
 * - const utilList = utils.task.todoList
 * - const apiList = api.task.todoList
 * - const filterCondition: FilterCondition = task => task.isFinished !== true && task.isArchived !== true
 */

import type { UserId, ListModel, Task, TaskList, CreateMethodOption } from '../../types/task'
import { useState, useLayoutEffect } from 'react'
import * as O from 'fp-ts/Option'
import * as B from 'fp-ts/boolean'
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/lib/function'
import { api } from '../../utils/api'
import { genMutation, createUpdater, deleteUpdater, pushUpdater } from './utils'
import type { CreateMutation, DeleteMutation, PushMutation, UtilLists, FilterCondition } from './utils'
export type UseTaskListModelProps = {
  userId?: UserId,
}
export type UseTaskListModel = (modelProps?: UseTaskListModelProps) => ListModel

type GenCreateMethod = (createMutation: CreateMutation) => NonNullable<ListModel['createTask']>
type GenDeleteMethod = (deleteMutation: DeleteMutation) => NonNullable<ListModel['deleteTask']>
type GenPushMethod = (taskList: TaskList, pushMutation: PushMutation, createMutation: CreateMutation) => NonNullable<ListModel['pushTask']>
type GenFinishMethod = (pushTask: ReturnType<GenPushMethod>) => NonNullable<ListModel['finishTask']>
type GenUnfinishMethod = (pushTask: ReturnType<GenPushMethod>) => NonNullable<ListModel['unfinishTask']>
type GenArchiveMethod = (pushTask: ReturnType<GenPushMethod>) => NonNullable<ListModel['archiveTask']>
type GenUnarchiveMethod = (pushTask: ReturnType<GenPushMethod>) => NonNullable<ListModel['unarchiveTask']>

type AllMutations = {
  createMutation: CreateMutation,
  deleteMutation: DeleteMutation,
  pushMutation: PushMutation,
}
type AllMethods = Pick<ListModel, 'createTask' | 'deleteTask' | 'pushTask' | 'finishTask' | 'unfinishTask' | 'archiveTask' | 'unarchiveTask'>

type GenAllMutationsProps = {
  userId: UserId,
  utilList: UtilLists,
  filterCondition: (task: Task) => boolean,
}
type GenAllMutations = (props: GenAllMutationsProps) => AllMutations
type GenAllMethods = (taskList: TaskList, allMutations: AllMutations) => AllMethods

const genCreateMethod: GenCreateMethod = createMutation => (noHeadTask, options = {}) => {
  createMutation.mutate(noHeadTask, {
    onSuccess: (data, variables, context) => {
      options.onSuccess && options.onSuccess(data)
    },
    onError: (error, variables, context) => {
      options.onError && options.onError(error.message)
    },
  })
  options.onMutate && options.onMutate(noHeadTask)
}

const genDeleteMethod: GenDeleteMethod = deleteMutation => (task, options = {}) => {
  deleteMutation.mutate(task, {
    onSuccess: (data, variables, context) => {
      options.onSuccess && options.onSuccess(data)
    },
    onError: (error, variables, context) => {
      options.onError && options.onError(error.message)
    },
  })
  options.onMutate && options.onMutate(task)
}

const genPushMethod: GenPushMethod = (taskList, pushMutation, createMutation) => (updatedTask, options = {}) => {
  const isExist = taskList.some(task => task.id === updatedTask.id)
  const { id, ...noHeadTask } = updatedTask
  pipe(
    O.some(isExist),
    O.map(
      B.match(
        () => genCreateMethod(createMutation)(noHeadTask, options as CreateMethodOption),
        () => pushMutation.mutate(updatedTask, {
          onSuccess: (data, variables, context) => {
            options.onSuccess && options.onSuccess(data)
          },
          onError: (error, variables, context) => {
            options.onError && options.onError(error.message)
          },
        })
      ),
    ),
  )
  options.onMutate && options.onMutate(updatedTask)
}

const genFinishMethod: GenFinishMethod = (pushTask) => (task, options = {}) => {
  pushTask({ ...task, isFinished: true }, options)
}

const genUnfinishMethod: GenUnfinishMethod = (pushTask) => (task, options = {}) => {
  pushTask({ ...task, isFinished: false }, options)
}

const genArchiveMethod: GenArchiveMethod = (pushTask) => (task, options = {}) => {
  pushTask({ ...task, isArchived: true }, options)
}

const genUnarchiveMethod: GenUnarchiveMethod = (pushTask) => (task, options = {}) => {
  pushTask({ ...task, isArchived: false }, options)
}

const genAllMutations: GenAllMutations = ({ userId, utilList, filterCondition }) => {
  const baseProps = { userId, utilList }
  return {
    createMutation: genMutation<CreateMutation>({...baseProps, apiMethod: api.task.create, updater: createUpdater}),
    deleteMutation: genMutation<DeleteMutation>({...baseProps, apiMethod: api.task.delete, updater: deleteUpdater}),
    pushMutation: genMutation<PushMutation>({...baseProps, apiMethod: api.task.push, updater: pushUpdater(filterCondition)}),
  }
}

const genAllMethods: GenAllMethods = (taskList, allMutations) => {
  const {createMutation, deleteMutation, pushMutation } = allMutations
  const createTask = genCreateMethod(createMutation)
  const deleteTask = genDeleteMethod(deleteMutation)
  const pushTask = genPushMethod(taskList, pushMutation, createMutation)
  const finishTask = genFinishMethod(pushTask)
  const unfinishTask = genUnfinishMethod(pushTask)
  const archiveTask = genArchiveMethod(pushTask)
  const unarchiveTask = genUnarchiveMethod(pushTask)
  return {
    createTask,
    deleteTask,
    pushTask,
    finishTask,
    unfinishTask,
    archiveTask,
    unarchiveTask,
  }
}

export const useTodoListModel: UseTaskListModel = ({ userId = '' } = {}) => {
  const utils = api.useContext()
  const [ taskList, setTaskList ] = useState<TaskList>([])

  // differenses between useTodoListModel, useFinishListModel, useArchiveListModel
  const utilList = utils.task.todoList
  const apiList = api.task.todoList
  const filterCondition: FilterCondition = task => task.isFinished !== true && task.isArchived !== true
  
  // fetch data
  const { data: newTaskList, refetch, isLoading, isError } = apiList.useQuery({ userId })
  useLayoutEffect(() => {
    setTaskList(newTaskList || [] as TaskList)
  }, [newTaskList])

  // generate all mutations
  const allMutations = genAllMutations({
    userId,
    utilList,
    filterCondition,
  })
  // generate all methods
  const allMethods = genAllMethods(taskList, allMutations)

  const refetchList: ListModel['refetchList'] = (options) => {
    const run = async () => {
      await utilList.cancel()
      return await refetch()
    }
    run().then(({ data }) => {
      options && options.onSuccess && options.onSuccess(data || [])
    }).catch((error) => {
      const message = 'refetch unknown error'
      options && options.onError && options.onError(message)
    })
  }

  const optimisticAddTask: ListModel['optimisticAddTask'] = (task) => {
    const newTaskList = [task, ...taskList].sort((a, b) => a.id < b.id ? 1 : -1)
    setTaskList(newTaskList)
  }

  return {
    userId,
    taskList,
    isLoading,
    isError,
    ...allMethods,
    refetchList,
    optimisticAddTask,
  }
}

export const useFinishListModel: UseTaskListModel = ({ userId = '' } = {}) => {
  const utils = api.useContext()
  const [ taskList, setTaskList ] = useState<TaskList>([])

  // differenses between useTodoListModel, useFinishListModel, useArchiveListModel
  const utilList = utils.task.finishList
  const apiList = api.task.finishList
  const filterCondition: FilterCondition = task => task.isFinished === true && task.isArchived !== true
  
  // fetch data
  const { data: newTaskList, refetch, isLoading, isError } = apiList.useQuery({ userId })
  useLayoutEffect(() => {
    setTaskList(newTaskList || [] as TaskList)
  }, [newTaskList])

  // generate all mutations
  const allMutations = genAllMutations({
    userId,
    utilList,
    filterCondition,
  })
  // generate all methods
  const allMethods = genAllMethods(taskList, allMutations)

  const refetchList: ListModel['refetchList'] = (options) => {
    const run = async () => {
      await utilList.cancel()
      return await refetch()
    }
    run().then(({ data }) => {
      options && options.onSuccess && options.onSuccess(data || [])
    }).catch((error) => {
      const message = 'refetch unknown error'
      options && options.onError && options.onError(message)
    })
  }

  const optimisticAddTask: ListModel['optimisticAddTask'] = (task) => {
    const newTaskList = [task, ...taskList].sort((a, b) => a.id < b.id ? 1 : -1)
    setTaskList(newTaskList)
  }

  return {
    userId,
    taskList,
    isLoading,
    isError,
    ...allMethods,
    refetchList,
    optimisticAddTask,
  }
}

export const useArchiveListModel: UseTaskListModel = ({ userId = '' } = {}) => {
  const utils = api.useContext()
  const [ taskList, setTaskList ] = useState<TaskList>([])

  // differenses between useTodoListModel, useFinishListModel, useArchiveListModel
  const utilList = utils.task.archiveList
  const apiList = api.task.archiveList
  const filterCondition: FilterCondition = task => task.isArchived === true
  
  // fetch data
  const { data: newTaskList, refetch, isLoading, isError } = apiList.useQuery({ userId })
  useLayoutEffect(() => {
    setTaskList(newTaskList || [] as TaskList)
  }, [newTaskList])

  // generate all mutations
  const allMutations = genAllMutations({
    userId,
    utilList,
    filterCondition,
  })
  // generate all methods
  const allMethods = genAllMethods(taskList, allMutations)

  const refetchList: ListModel['refetchList'] = (options) => {
    const run = async () => {
      await utilList.cancel()
      return await refetch()
    }
    run().then(({ data }) => {
      options && options.onSuccess && options.onSuccess(data || [])
    }).catch((error) => {
      const message = 'refetch unknown error'
      options && options.onError && options.onError(message)
    })
  }

  const optimisticAddTask: ListModel['optimisticAddTask'] = (task) => {
    const newTaskList = [task, ...taskList].sort((a, b) => a.id < b.id ? 1 : -1)
    setTaskList(newTaskList)
  }

  return {
    userId,
    taskList,
    isLoading,
    isError,
    ...allMethods,
    refetchList,
    optimisticAddTask,
  }
}
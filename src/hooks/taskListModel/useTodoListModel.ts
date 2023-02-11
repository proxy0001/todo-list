import type { ListModel, TaskList, CreateMethodOption } from '../../types/task'
import { useState, useLayoutEffect } from 'react'
import * as O from 'fp-ts/Option'
import * as B from 'fp-ts/boolean'
import { pipe } from 'fp-ts/lib/function'
import { api } from '../../utils/api'
import type { UseTaskListModel } from './_useTaskListModel'
import type { CreateMutation, DeleteMutation, PushMutation, FilterCondition } from './utils'
import { genMutation, createUpdater, deleteUpdater, pushUpdater } from './utils'

export const useTodoListModel: UseTaskListModel = ({ userId = '' } = {}) => {
  const utils = api.useContext()
  const [ taskList, setTaskList ] = useState<TaskList>([])

  // the differense between useTodoListModel, useFinishListModel, useArchiveListModel
  const utilList = utils.task.todoList
  const apiList = api.task.todoList
  const filterCondition: FilterCondition = task => task.isFinished !== true && task.isArchived !== true
  
  // fetch data
  const { data: newTaskList, refetch, isLoading, isError } = apiList.useQuery({ userId })
  useLayoutEffect(() => {
    setTaskList(newTaskList || [] as TaskList)
  }, [newTaskList])

  // generate all mutations
  const createMutation = genMutation<CreateMutation>({
    userId,
    utilList: utilList,
    apiMethod: api.task.create,
    updater: createUpdater,
  })
  const deleteMutation = genMutation<DeleteMutation>({
    userId,
    utilList: utilList,
    apiMethod: api.task.delete,
    updater: deleteUpdater
  })
  const pushMutation = genMutation<PushMutation>({
    userId,
    utilList: utilList,
    apiMethod: api.task.push,
    updater: pushUpdater(filterCondition)
  })

  // methods
  const createTask: ListModel['createTask'] = (noHeadTask, options = {}) => {
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

  const deleteTask: ListModel['deleteTask'] = (task, options = {}) => {
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

  const pushTask: ListModel['pushTask'] = (updatedTask, options = {}) => {
    const isExist = taskList.some(task => task.id === updatedTask.id)
    const { id, ...noHeadTask } = updatedTask
    pipe(
      O.some(isExist),
      O.map(
        B.match(
          () => createTask(noHeadTask, options as CreateMethodOption),
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

  const finishTask: ListModel['finishTask'] = (task, options = {}) => {
    pushTask({ ...task, isFinished: true }, options)
  }

  const unfinishTask: ListModel['unfinishTask'] = (task, options = {}) => {
    pushTask({ ...task, isFinished: false }, options)
  }  

  const archiveTask: ListModel['archiveTask'] = (task, options = {}) => {
    pushTask({ ...task, isArchived: true }, options)
  }

  const unarchiveTask: ListModel['unarchiveTask'] = (task, options = {}) => {
    pushTask({ ...task, isArchived: false }, options)
  }

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
    createTask,
    deleteTask,
    pushTask,
    finishTask,
    unfinishTask,
    archiveTask,
    unarchiveTask,
    refetchList,
    optimisticAddTask,
  }
}

export default useTodoListModel
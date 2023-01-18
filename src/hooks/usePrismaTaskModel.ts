import type { TaskList, TaskModel, Task } from '../types/task'
import { useLayoutEffect, useState } from 'react'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/Array'
import * as B from 'fp-ts/boolean'
import { pipe } from 'fp-ts/lib/function'
import type { UseTaskModel } from './useTaskModel'
import { api } from "../utils/api"

export const usePrismaTaskModel: UseTaskModel = ({ userId = '' } = {}) => {
  const utils = api.useContext()

  const [todoList, setTodoList] = useState<TaskList>([])
  const [finishList, setFinishList] = useState<TaskList>([])
  const [archiveList, setArchiveList] = useState<TaskList>([])

  const { data: newTodoList } = api.task.todoList.useQuery({ userId })
  const { data: newFinishList } = api.task.finishList.useQuery({ userId })
  const { data: newArchiveList } = api.task.archiveList.useQuery({ userId })

  useLayoutEffect(() => {
    setTodoList(newTodoList || [])
  }, [newTodoList])

  useLayoutEffect(() => {
    setFinishList(newFinishList || [])
  }, [newFinishList])
  
  useLayoutEffect(() => {
    setArchiveList(newArchiveList || [])
  }, [newArchiveList])

  const createTaskMutation = api.task.create.useMutation({
    async onMutate (newTask) {
      // Cancel outgoing fetches (so they don't overwrite our optimistic update)
      await utils.task.todoList.cancel();
      // // Get the data from the queryCache
      const prevData = utils.task.todoList.getData();
      // // Optimistically update the data with our new post
      const tmpNewTaskForDisplay = { ...newTask, id: -2 }
      utils.task.todoList.setData({ userId }, (old) => old ? [tmpNewTaskForDisplay, ...old] : []);
      // // Return the previous data so we can revert if something goes wrong
      return { prevData };
    },
    async onSettled () {
      // Sync with server once mutation has settled
      await utils.task.todoList.invalidate();
    }
  })
  
  enum ListNames {
    TodoList = 'todoList',
    FinishList = 'finishList',
    ArchiveList = 'archiveList',
  }
  type UtilsTaskLists = typeof utils.task.todoList | typeof utils.task.finishList | typeof utils.task.archiveList
  const checkList = (oldTask: Task): ListNames | undefined => {
    const isTodo = oldTask.isFinished !== true && oldTask.isArchived !== true
    const isFinish = oldTask.isFinished === true && oldTask.isArchived !== true
    const isArchive = oldTask.isArchived === true
    const whichList = isTodo ? ListNames.TodoList :
                isFinish ? ListNames.FinishList :
                isArchive ? ListNames.ArchiveList :
                undefined
    return whichList
  }
  type WhichListRes = {
    fromWhich: ListNames | undefined
    toWhich: ListNames | undefined
  }
  const fromWhichToWich = (oldTask: Task | undefined, newTask: Task | undefined): WhichListRes => {
    const fromWhich = oldTask && checkList(oldTask)
    const toWhich = newTask && checkList(newTask)
    return { fromWhich, toWhich }
  }
  const whichListName = (task: Task | undefined): ListNames | undefined => {
    const which = task && checkList(task)
    return which
  }

  const whichUtilsList = (listName: ListNames | undefined): UtilsTaskLists | undefined => {
    return !listName ? undefined :
      listName === ListNames.TodoList ? utils.task.todoList :
      listName === ListNames.FinishList ? utils.task.finishList :
      listName === ListNames.ArchiveList ? utils.task.archiveList :
      undefined
  }

  const pushTaskMutation = api.task.push.useMutation({
    async onMutate (newTask) {      
      // TODO: don't know why getData() always return undefined
      // const prevTodoList = utils.task.todoList.getData()
      // const prevFinishList = utils.task.finishList.getData()
      // const prevArchiveList = utils.task.archiveList.getData()
      // const oldTaskList: TaskList = [...prevTodoList || [], ...prevFinishList || [], ...prevArchiveList || []]
      const oldTaskList: TaskList = [...todoList, ...finishList, ...archiveList]
      const oldTask = oldTaskList.find(task => task.id === newTask.id)
      const { fromWhich, toWhich } = fromWhichToWich(oldTask, newTask)

      if (fromWhich === toWhich) {
        const utilsList = whichUtilsList(toWhich)
        utilsList && await utilsList.cancel()

        pipe(
          O.fromNullable(whichUtilsList(toWhich)),
          O.match(
            () => undefined,
            oldUtilsList => {
              oldUtilsList.setData({ userId }, (list): TaskList => pipe(
                O.fromNullable(list),
                O.match(
                  () => [],
                  A.filterMap((task) => task.id === newTask.id ? O.some(newTask) : O.some(task)),
                ),
              ))
            }
          )
        )
      } else {
        const fromUtilsList = whichUtilsList(fromWhich)
        const toUtilsList = whichUtilsList(toWhich)
        fromUtilsList && await fromUtilsList.cancel()
        toUtilsList && await toUtilsList.cancel()

        pipe(
          O.fromNullable(whichUtilsList(fromWhich)),
          O.match(
            () => undefined,
            oldUtilsList => {
              oldUtilsList.setData({ userId }, (list): TaskList => pipe(
                O.fromNullable(list),
                O.match(
                  () => [],
                  A.filter((task) => task.id !== newTask.id)
                ),
              ))
            }
          )
        )
        pipe(
          O.fromNullable(whichUtilsList(toWhich)),
          O.match(
            () => undefined,
            newUtilsList => {
              newUtilsList.setData({ userId }, (old): TaskList => pipe(
                O.fromNullable(old),
                O.match(
                  () => [],
                  list => [...list, newTask].sort((a, b) => b.id - a.id)
                ),
              ))
            }
          )
        )
      }
      return { todoList, finishList, archiveList }
    },
    async onSettled (newTask) {
      const oldTaskList: TaskList = [...todoList, ...finishList, ...archiveList]
      const oldTask = oldTaskList.find(task => newTask && task.id === newTask.id)
      const { fromWhich, toWhich } = fromWhichToWich(oldTask, newTask)
      if (fromWhich === toWhich) {
        const utilsList = whichUtilsList(fromWhich)
        utilsList && await utilsList.invalidate()
      } else {
        const fromUtilsList = whichUtilsList(fromWhich)
        const toUtilsList = whichUtilsList(toWhich)
        fromUtilsList && await fromUtilsList.invalidate()
        toUtilsList && await toUtilsList.invalidate()
      }
    }
  })
  
  const deleteTaskMutation = api.task.delete.useMutation({
    async onMutate (newTask) {
      const utilsList = whichUtilsList(whichListName(newTask))
      if (utilsList === undefined) return
      // Cancel outgoing fetches (so they don't overwrite our optimistic update)
      await utilsList.cancel();
      // // Get the data from the queryCache
      const prevData = utilsList.getData();
      // // Optimistically update the data with our new post
      utilsList.setData({ userId }, (old): TaskList => pipe(
        O.fromNullable(old),
        O.match(
          () => [],
          A.filter(
            (task) => task.id !== newTask.id
          )
        ),
      ));
      // // Return the previous data so we can revert if something goes wrong
      return { prevData };
    },
    async onSettled (newTask) {
      const utilsList = newTask && whichUtilsList(whichListName(newTask))
      if (utilsList === undefined) return
      // Sync with server once mutation has settled
      await utilsList.invalidate();
    }
  })

  const createTask: TaskModel['createTask'] = task => {
    const { id, ...noHeadTask } = task
    createTaskMutation.mutate(noHeadTask, {
      onSuccess: (data, variables, context) => {
        console.log(`created`, data)
      },
      onError: (error, variables, context) => {
        console.log(`An error happened! ${error.message}`)
      },
    })
  }

  
  const pushTask: TaskModel['pushTask'] = (updatedTask: Task): void => {
    const isExist = [...todoList, ...finishList, ...archiveList]
      .some(task => task.id === updatedTask.id)

    pipe(
      O.some(isExist),
      O.map(
        B.match(
          () => createTask(updatedTask),
          () => pushTaskMutation.mutate(updatedTask)
        ),
      ),
    )
  }

  const finishTask: TaskModel['finishTask'] = task => {
    pushTask({ ...task, isFinished: true })
  }

  const unfinishTask: TaskModel['unfinishTask'] = task => {
    pushTask({ ...task, isFinished: false })
  }

  const archiveTask: TaskModel['archiveTask'] = task => {
    pushTask({ ...task, isArchived: true })
  }

  const unarchiveTask: TaskModel['unarchiveTask'] = task => {
    pushTask({ ...task, isArchived: false })
  }

  const deleteTask: TaskModel['deleteTask'] = task => {
    deleteTaskMutation.mutate(task)
  }

  const taskModel: TaskModel = {
    userId,
    todoList,
    finishList,
    archiveList,
    createTask,
    pushTask,
    finishTask,
    unfinishTask,
    archiveTask,
    unarchiveTask,
    deleteTask,
  }
  return taskModel
}

export default usePrismaTaskModel
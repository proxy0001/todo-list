import type { Task, TaskList, TaskModel } from '../types/task'
import { useState, useLayoutEffect } from "react"
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/Array'
import * as B from 'fp-ts/boolean'
import { pipe } from 'fp-ts/lib/function'
import type { UseTaskModel } from './useTaskModel'

// demo data
const defaultTaskList: TaskList = [
  { id: 1, userId: '', title: 'task X', isFinished: false, isArchived: false },
  { id: 2, userId: '', title: 'task B', isFinished: false, isArchived: true },
  { id: 3, userId: '', title: 'task C', isFinished: true, isArchived: false },
]

const filterGenerator = (condition: (task: Task) => boolean) => (taskList: TaskList): TaskList => {
  return pipe(
    taskList,
    A.filter(condition),
  )
}
const todosFilter = filterGenerator(task => !task.isFinished && !task.isArchived)
const finishesFilter = filterGenerator(task => task.isFinished === true && !task.isArchived)
const archivesFilter = filterGenerator(task => task.isArchived === true)

export const useDemoTaskModel: UseTaskModel = ({ userId = '' } = {}) => {
  const [taskList, setTaskList] = useState(defaultTaskList)
  const [todoList, setTodoList] = useState(todosFilter(taskList))
  const [finishList, setFinishList] = useState(finishesFilter(taskList))
  const [archiveList, setArchiveList] = useState(archivesFilter(taskList))

  useLayoutEffect(() => {
    const sorted = [...taskList].sort((a: Task, b: Task): number => a.id < 0 ? -1 : b.id - a.id)
    setTodoList(todosFilter(sorted))
    setFinishList(finishesFilter(sorted))
    setArchiveList(archivesFilter(sorted))
  }, [taskList])

  const createTask: TaskModel['createTask'] = task => {
    const { id, ...noHeadTask } = task
    const newTask = { ...noHeadTask, id: taskList.length + 1}
    setTaskList([...taskList, newTask])
    return newTask
  }

  const pushTask: TaskModel['pushTask'] = (updatedTask: Task): void => {
    const isExist = taskList.some(task => task.id === updatedTask.id)
    pipe(
      O.some(isExist),
      O.map(
        B.match(
          () => createTask(updatedTask),
          () => {
            const updatedList: TaskList = pipe(taskList, A.filterMap(task => 
              task.id === updatedTask?.id ? O.some({...task, ...updatedTask}) : O.some(task)
            ))
            setTaskList(updatedList)
            return updatedTask
          }
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
    const { id: deletedId } = task
    const updatedList = taskList.filter(task => task.id !== deletedId)
    setTaskList(updatedList)
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

export default useDemoTaskModel
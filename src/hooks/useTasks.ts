import type { PartialTask, TaskContent, Task, TaskList } from '../types/task'
import { useState } from 'react'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/Array'

import { pipe } from 'fp-ts/lib/function'

// demo data
const defaultTaskList: TaskList = [
  { id: 1, title: 'task A', isFinished: false, isArchived: false },
  { id: 2, title: 'task B', isFinished: false, isArchived: true },
  { id: 3, title: 'task C', isFinished: true, isArchived: false },
]

export const useTasks = (initTaskList: TaskList = defaultTaskList) => {
  const [taskList, setTaskList] = useState(initTaskList)

  const addTask = (taskContent: TaskContent): void => {
    const taskId = taskList.length + 1
    setTaskList([...taskList, { id: taskId, ...taskContent}])
  }

  const updateTask = (updatedTask: Partial<Task>): void => {
    const f: (task: Task) => O.Option<Task> = task => task.id === updatedTask.id ? O.some({...task, ...updatedTask}) : O.some(task)
    const updatedList: TaskList = pipe(taskList, A.filterMap(f))
    setTaskList(updatedList)
  }

  const finishTask = (id: Task['id']): void => {
    updateTask({ id, isFinished: true } as Partial<Task>)
  }

  const unfinishTask = (id: Task['id']): void => {
    updateTask({ id, isFinished: false } as Partial<Task>)
  }

  const archiveTask = (id: Task['id']): void => {
    updateTask({ id, isArchived: true } as Partial<Task>)
  }

  const unarchiveTask = (id: Task['id']): void => {
    updateTask({ id, isArchived: false } as Partial<Task>)
  }

  const deleteTask = (id: Task['id']): void => {
    updateTask({ id, isDeleted: true } as Partial<Task>)
  }

  const undeleteTask = (id: Task['id']): void => {
    updateTask({ id, isDeleted: false } as Partial<Task>)
  }

  return {
    taskList,
    addTask,
    updateTask,
    finishTask,
    unfinishTask,
    archiveTask,
    unarchiveTask,
    deleteTask,
    undeleteTask,
  }
}
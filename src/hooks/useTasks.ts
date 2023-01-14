import type { PartialTask, TaskContent, Task, TaskList } from '../types/task'
import { useState } from 'react'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/Array'
import * as B from 'fp-ts/boolean'

import { pipe } from 'fp-ts/lib/function'

// demo data
const defaultTaskList: TaskList = [
  { id: 1, title: 'task A', isFinished: false, isArchived: false },
  { id: 2, title: 'task B', isFinished: false, isArchived: true },
  { id: 3, title: 'task C', isFinished: true, isArchived: false },
]

export const useTasks = (initTaskList: TaskList = defaultTaskList) => {
  const [taskList, setTaskList] = useState(initTaskList)

  const createTask = (taskContent: TaskContent): void => {
    const taskId = taskList.length + 1
    setTaskList([...taskList, { id: taskId, ...taskContent}])
  }

  const pushTask = (updatedTask: Partial<Task>): void => {
    const isExist = updatedTask?.id !== undefined && taskList.some(task => task.id === updatedTask?.id)
    pipe(
      O.some(isExist),
      O.map(
        B.match(
          () => {
            const { title = '' } = updatedTask
            createTask({ title })
          },
          () => {
            const updatedList: TaskList = pipe(taskList, A.filterMap(task => 
              task.id === updatedTask?.id ? O.some({...task, ...updatedTask}) : O.some(task)
            ))
            setTaskList(updatedList)
          }
        )
      ),
    )
  }

  const finishTask = (id: Task['id']): void => {
    pushTask({ id, isFinished: true })
  }

  const unfinishTask = (id: Task['id']): void => {
    pushTask({ id, isFinished: false })
  }

  const archiveTask = (id: Task['id']): void => {
    pushTask({ id, isArchived: true })
  }

  const unarchiveTask = (id: Task['id']): void => {
    pushTask({ id, isArchived: false })
  }

  const deleteTask = (id: Task['id']): void => {
    pushTask({ id, isDeleted: true })
  }

  const undeleteTask = (id: Task['id']): void => {
    pushTask({ id, isDeleted: false })
  }

  return {
    taskList,
    createTask,
    pushTask,
    finishTask,
    unfinishTask,
    archiveTask,
    unarchiveTask,
    deleteTask,
    undeleteTask,
  }
}
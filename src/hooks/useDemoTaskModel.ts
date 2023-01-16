import type { PartialTask, TaskContent, TaskList, TaskModel } from '../types/task'
import { useState } from 'react'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/Array'
import * as B from 'fp-ts/boolean'
import { pipe } from 'fp-ts/lib/function'
import type { UseTaskModel } from './useTaskModel'

// demo data
const defaultTaskList: TaskList = [
  { id: 1, title: 'task X', isFinished: false, isArchived: false },
  { id: 2, title: 'task B', isFinished: false, isArchived: true },
  { id: 3, title: 'task C', isFinished: true, isArchived: false },
]

export const useDemoTaskModel: UseTaskModel = ({ initTaskList = defaultTaskList } = {}) => {
  const [taskList, setTaskList] = useState(initTaskList)

  const createTask: TaskModel['createTask'] = taskContent => {
    const taskId = taskList.length + 1
    setTaskList([...taskList, { id: taskId, ...taskContent}])
  }

  const pushTask: TaskModel['pushTask'] = (updatedTask: PartialTask): void => {
    const isExist = updatedTask?.id !== undefined && taskList.some(task => task.id === updatedTask?.id)
    const { title = '' } = updatedTask
    const taskContent: TaskContent = { title }
    pipe(
      O.some(isExist),
      O.map(
        B.match(
          () => createTask(taskContent),
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

  const finishTask: TaskModel['finishTask'] = id => {
    pushTask({ id, isFinished: true })
  }

  const unfinishTask: TaskModel['unfinishTask'] = id => {
    pushTask({ id, isFinished: false })
  }

  const archiveTask: TaskModel['archiveTask'] = id => {
    pushTask({ id, isArchived: true })
  }

  const unarchiveTask: TaskModel['unarchiveTask'] = id => {
    pushTask({ id, isArchived: false })
  }

  const deleteTask: TaskModel['deleteTask'] = id => {
    pushTask({ id, isDeleted: true })
  }

  const undeleteTask: TaskModel['undeleteTask'] = id => {
    pushTask({ id, isDeleted: false })
  }

  const taskModel: TaskModel = {
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
  return taskModel
}

export default useDemoTaskModel
import { pipe } from 'fp-ts/function'
import * as B from 'fp-ts/boolean'
import { useTodoListModel } from '../../hooks/taskListModel/useTodoListModel'
import { useFinishListModel } from '../../hooks/taskListModel/useFinishListModel'
import { useArchiveListModel } from '../../hooks/taskListModel/useArchiveListModel'
import type { UserId, Task, RefetchMethodOption } from '../../types/task'
import { Tabs, TabList, TabPanels, Text, Item } from '@adobe/react-spectrum'
import TaskListIcon from '@spectrum-icons/workflow/TaskList'
import ArchiveIcon from '@spectrum-icons/workflow/Archive'
import { TaskList } from './TaskList'

export interface TaskManagerProps {
  userId: UserId
}
export const TaskManager = ({
  userId = '',
}: TaskManagerProps) => {
  const todoListModel = useTodoListModel({ userId })
  const finishListModel = useFinishListModel({ userId })
  const archiveListModel = useArchiveListModel({ userId })
  
  const refetchTodoList = (updatedTask: Task) => {
    const options: RefetchMethodOption = {
      onSuccess: (taskList) => {
        console.log('todo list refetch success')
      },
      onError: (error) => {
        console.log('todo list refetch error')
      }
    }
    todoListModel.refetchList && todoListModel.refetchList(options)
  }
  const refetchFinishList = (updatedTask: Task) => {
    const options: RefetchMethodOption = {
      onSuccess: (taskList) => {
        console.log('finish list refetch success')
      },
      onError: (error) => {
        console.log('finish list refetch error')
      }
    }
    finishListModel.refetchList && finishListModel.refetchList(options)
  }
  const refetchArchiveList = (updatedTask: Task) => {
    const options: RefetchMethodOption = {
      onSuccess: (taskList) => {
        console.log('archive list refetch success')
      },
      onError: (error) => {
        console.log('archive list refetch error')
      }
    }
    archiveListModel.refetchList && archiveListModel.refetchList(options)
  }

  const onTodoListFinishMutate = (updatedTask: Task) => {
    console.log('onTodoListFinishMutate')
    finishListModel.optimisticAddTask && finishListModel.optimisticAddTask(updatedTask)
  }
  const onTodoListArchiveMutate = (updatedTask: Task) => {
    console.log('onTodoListArchiveMutate')
    archiveListModel.optimisticAddTask && archiveListModel.optimisticAddTask(updatedTask)
  }
  const onFinishListUnfinishMutate = (updatedTask: Task) => {
    console.log('onFinishListUnfinishMutate')
    todoListModel.optimisticAddTask && todoListModel.optimisticAddTask(updatedTask)
  }
  const onFinishListArchiveMutate = (updatedTask: Task) => {
    console.log('onFinishListArchiveMutate')
    archiveListModel.optimisticAddTask && archiveListModel.optimisticAddTask(updatedTask)
  }
  const onArchiveListUnarchiveMutate = (updatedTask: Task) => {
    console.log('onArchiveListUnarchiveMutate')
    pipe(
      updatedTask?.isFinished === true ? true : false,
      B.match(
        () => todoListModel.optimisticAddTask && todoListModel.optimisticAddTask(updatedTask),
        () => finishListModel.optimisticAddTask && finishListModel.optimisticAddTask(updatedTask),
      )
    )
  }
  const afterTodoListFinished = (updatedTask: Task) => {
    console.log('afterTodoListFinished')
    refetchFinishList(updatedTask)
  }
  const afterTodoListArchived = (updatedTask: Task) => {
    console.log('afterTodoListArchived')
    refetchArchiveList(updatedTask)
  }
  const afterFinishListUnfinished = (updatedTask: Task) => {
    console.log('afterFinishListUnfinished')
    refetchTodoList(updatedTask)
  }
  const afterFinishListArchived = (updatedTask: Task) => {
    console.log('afterFinishListArchived')
    refetchArchiveList(updatedTask)
  }
  const afterArchiveListUnarchived = (updatedTask: Task) => {
    console.log('afterArchiveListUnarchived')
    pipe(
      updatedTask?.isFinished === true ? true : false,
      B.match(
        () => refetchTodoList(updatedTask),
        () => refetchFinishList(updatedTask),
      )
    )
  }

  return (
    <Tabs aria-label="History of Ancient Rome">
      <TabList>
        <Item key="tasklist" textValue="Task List Tab">
          <TaskListIcon />
          <Text>Task List</Text>
        </Item>
        <Item key="archives" textValue="Archived Tab">
          <ArchiveIcon />
          <Text>Archived</Text>
        </Item>
      </TabList>
      <TabPanels>
        <Item key="tasklist" textValue="Task List Panel">
          <TaskList title="Today's Task"
            model={todoListModel}
            activeUnarchive={false}
            onFinishMutate={onTodoListFinishMutate}
            onArchiveMutate={onTodoListArchiveMutate}
            afterFinished={afterTodoListFinished}
            afterArchived={afterTodoListArchived}
          />
          <TaskList title="Finished" 
            model={finishListModel}
            activeUnarchive={false}
            activeCreate={false}
            onUnfinishMutate={onFinishListUnfinishMutate}
            onArchiveMutate={onFinishListArchiveMutate}
            afterUnfinished={afterFinishListUnfinished}
            afterArchived={afterFinishListArchived}
          />
        </Item>
        <Item key="archives" textValue="Archived Panel">
          <TaskList title="Archived"
            model={archiveListModel}
            activeArchive={false}
            activeCreate={false}
            onUnarchiveMutate={onArchiveListUnarchiveMutate}
            afterUnarchived={afterArchiveListUnarchived}
          />
        </Item>
      </TabPanels>
    </Tabs>
  )
}
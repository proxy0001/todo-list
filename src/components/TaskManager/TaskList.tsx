import { View, ActionButton, ButtonGroup, Header, Content, Heading, Flex, Checkbox } from '@adobe/react-spectrum'
import ArchiveIcon from '@spectrum-icons/workflow/Archive'
import ArchiveRemoveIcon from '@spectrum-icons/workflow/ArchiveRemove'
import DeleteIcon from '@spectrum-icons/workflow/Delete'
import AddIcon from '@spectrum-icons/workflow/Add'
import EditIcon from '@spectrum-icons/workflow/Edit'
import type { ListModel, NoHeadTask, Task, CreateMethodOption, MethodOption } from '../../types/task'
import { useState } from 'react'
import { EditTask } from './EditTask'
import type { SpectrumCheckboxProps } from '@adobe/react-spectrum'
import IsShow from '../IsShow'

interface TaskListProps {
  title?: string,
  model: ListModel,
  activeCreate?: boolean,
  activeEdit?: boolean,
  activeArchive?: boolean,
  activeUnarchive?: boolean,
  activeDelete?: boolean,
  activeSwitchFinish?: boolean,
  onCreateMutate?: (noHeadTask: NoHeadTask) => void,
  onEditMutate?: (task: Task) => void,
  onDeleteMutate?: (task: Task) => void,
  onArchiveMutate?: (task: Task) => void,
  onUnarchiveMutate?: (task: Task) => void,
  onFinishMutate?: (task: Task) => void,
  onUnfinishMutate?: (task: Task) => void,
  afterCreated?: (noHeadTask: NoHeadTask) => void,
  afterEdited?: (task: Task) => void,
  afterDeleted?: (task: Task) => void,
  afterArchived?: (task: Task) => void,
  afterUnarchived?: (task: Task) => void,
  afterFinished?: (task: Task) => void,
  afterUnfinished?: (task: Task) => void,
}

export const TaskList = ({
  title = '',
  model,
  activeCreate = true,
  activeEdit = true,
  activeArchive = true,
  activeUnarchive = true,
  activeDelete = true,
  activeSwitchFinish = true,
  onCreateMutate,
  onEditMutate,
  onDeleteMutate,
  onArchiveMutate,
  onUnarchiveMutate,
  onFinishMutate,
  onUnfinishMutate,
  afterCreated,
  afterEdited,
  afterDeleted,
  afterArchived,
  afterUnarchived,
  afterFinished,
  afterUnfinished,
}: TaskListProps) => {
  const { userId, taskList, createTask, pushTask, archiveTask, unarchiveTask, deleteTask, finishTask, unfinishTask } = model
  const [ newTask, setNewTask ] = useState<NoHeadTask | null>(null)
  const [ editingTask, setEditingTask ] = useState<Task | null>(null)

  const activeCreateAction = activeCreate && createTask !== undefined
  const activeEditAction = activeEdit && pushTask !== undefined
  const activeArchiveAction = activeArchive && archiveTask !== undefined
  const activeUnarchiveAction = activeUnarchive && unarchiveTask !== undefined
  const activeDeleteAction = activeDelete && deleteTask !== undefined
  const activeSwitchFinishAction = activeSwitchFinish && finishTask !== undefined && unfinishTask !== undefined

  const activeNewTaskComp = activeCreateAction && newTask !== null
  const activeEditingTaskComp = (task: Task) => activeEditAction && editingTask !== null && editingTask.id === task.id
  
  const onCreate = () => {
    setNewTask({ title: '', userId })
  }

  const onSubmitCreate = (noHeadTask: NoHeadTask) => {
    const options: CreateMethodOption = {
      onMutate: noHeadTask => {
        onCreateMutate && onCreateMutate(noHeadTask)
        console.log('create onMutate')
      },
      onSuccess: task => {
        afterCreated && afterCreated(task)
        console.log('create onSuccess')
      },
      onError: error => {
        console.log('create onError')
      },
    }
    createTask && createTask(noHeadTask, options)
    setNewTask(null)
  }

  const onCanselCreate = () => {
    setNewTask(null)
  }

  const onEdit = (editingTask: Task) => () => {
    setEditingTask(editingTask)
  }

  const onSubmitEdit = (updatedTask: Task) => {
    const options: MethodOption = {
      onMutate: task => {
        onEditMutate && onEditMutate(task)
        console.log('edit onMutate')
      },
      onSuccess: task => {
        afterEdited && afterEdited(task)
        console.log('edit onSuccess')
      },
      onError: error => {
        console.log('edit onError')
      },
    }
    pushTask && pushTask(updatedTask, options)
    setEditingTask(null)
  }

  const onCanselEdit = () => {
    setEditingTask(null)
  }

  const onDelete = (task: Task) => () => {
    const options: MethodOption = {
      onMutate: task => {
        onDeleteMutate && onDeleteMutate(task)
        console.log('delete onMutate')
      },
      onSuccess: task => {
        afterDeleted && afterDeleted(task)
        console.log('delete onSuccess')
      },
      onError: error => {
        console.log('delete onError')
      },
    }
    deleteTask && deleteTask(task, options)
  }

  const onArchive = (task: Task) => () => {
    const options: MethodOption = {
      onMutate: task => {
        onArchiveMutate && onArchiveMutate(task)
        console.log('archive onMutate')
      },
      onSuccess: task => {
        afterArchived && afterArchived(task)
        console.log('archive onSuccess')
      },
      onError: error => {
        console.log('archive onError')
      },
    }
    archiveTask && archiveTask(task, options)
  }

  const onUnarchive = (task: Task) => () => {
    const options: MethodOption = {
      onMutate: task => {
        onUnarchiveMutate && onUnarchiveMutate(task)
        console.log('unarchive onMutate')
      },
      onSuccess: task => {
        afterUnarchived && afterUnarchived(task)
        console.log('unarchive onSuccess')
      },
      onError: error => {
        console.log('unarchive onError')
      },
    }
    unarchiveTask && unarchiveTask(task, options)
  }

  const onFinish = (task: Task) => {
    const options: MethodOption = {
      onMutate: task => {
        onFinishMutate && onFinishMutate(task)
        console.log('finish onMutate')
      },
      onSuccess: task => {
        afterFinished && afterFinished(task)
        console.log('finish onSuccess')
      },
      onError: error => {
        console.log('finish onError')
      },
    }
    finishTask && finishTask(task, options)
  }

  const onUnfinish = (task: Task) => {
    const options: MethodOption = {
      onMutate: task => {
        onUnfinishMutate && onUnfinishMutate(task)
        console.log('unfinish onMutate')
      },
      onSuccess: task => {
        afterUnfinished && afterUnfinished(task)
        console.log('unfinish onSuccess')
      },
      onError: error => {
        console.log('unfinish onError')
      },
    }
    unfinishTask && unfinishTask(task, options)
  }

  const onSwichFinished = (task: Task): SpectrumCheckboxProps['onChange'] => isSelected => {
    isSelected ? onFinish(task) : onUnfinish(task)
  }

  return (
    <View minWidth="size-6000">
      <Header>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading level={3}>{title}</Heading>
          <ButtonGroup>
            <IsShow active={activeCreateAction}>
              <ActionButton onPress={onCreate} aria-label="Add task"><AddIcon /></ActionButton> :
            </IsShow>
          </ButtonGroup>
        </Flex>
      </Header>
      <Content margin="size-200" marginBottom="size-800">
        <IsShow active={activeNewTaskComp}>
          <EditTask
            task={newTask}
            onSubmit={onSubmitCreate}
            onCansel={onCanselCreate}
          />
        </IsShow>
        
        {
          taskList.map(task => activeEditingTaskComp(task) ?
            <EditTask
              key={`editing-${task.id}`}
              task={editingTask}
              onSubmit={onSubmitEdit}
              onCansel={onCanselEdit}
            /> :
            <Flex key={task.id} justifyContent="space-between">
              <Checkbox isDisabled={!activeSwitchFinishAction} marginEnd="size-200" flexGrow={1} isSelected={task.isFinished} onChange={onSwichFinished(task)}>
                <span className={task.isFinished ? 'line-through' : ''}>{task.title}</span>
              </Checkbox>
              <ButtonGroup>
                <IsShow active={activeEditAction}>
                  <ActionButton isQuiet onPress={onEdit(task)} aria-label="Edit task"><EditIcon /></ActionButton>
                </IsShow>
                <IsShow active={activeArchiveAction}>
                  <ActionButton isQuiet onPress={onArchive(task)} aria-label="Archive task"><ArchiveIcon /></ActionButton>
                </IsShow>
                <IsShow active={activeUnarchiveAction}>
                  <ActionButton isQuiet onPress={onUnarchive(task)} aria-label="Unarchive task"><ArchiveRemoveIcon /></ActionButton>
                </IsShow>
                <IsShow active={activeDeleteAction}>
                  <ActionButton isQuiet onPress={onDelete(task)} aria-label="Delete task"><DeleteIcon /></ActionButton>
                </IsShow>
              </ButtonGroup>
            </Flex>)
        }
      </Content>
    </View>
  )
}

export default TaskList
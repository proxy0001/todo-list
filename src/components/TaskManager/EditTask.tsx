import { TextField, ActionButton, ButtonGroup, Flex } from '@adobe/react-spectrum'
import type { NoHeadTask, Task } from "../../types/task"
import { useState } from "react"
import CheckmarkIcon from '@spectrum-icons/workflow/Checkmark'
import CloseIcon from '@spectrum-icons/workflow/Close'

export interface EditTaskProps {
  task: Task | NoHeadTask | null,
  onSubmit?: (task: Task) => void,
  onCansel?: () => void,
}

export enum EditActions {
  Submit = 'EDIT_SUBMIT',
  Cancel = 'EDIT_CANCEL',
}

export type EditCommands = {
  [EditActions.Submit]: (task: Task) => void
  [EditActions.Cancel]: () => void
}

export const NULL_EDITING_TASK = null
export const NEW_EDITING_TASK_TITLE = ''
export const GUEST_USERID = ''
export const NEW_EDITING_TASK: NoHeadTask = { title: NEW_EDITING_TASK_TITLE, userId: GUEST_USERID }

export const EditTask = ({
  task = NEW_EDITING_TASK,
  onSubmit,
  onCansel,
}: EditTaskProps) => {
  const [updatedTask, setUpdatedTask] = useState({ ...task } as Task)
  
  const editCommands: EditCommands = {
    EDIT_SUBMIT: newTask => onSubmit ? onSubmit(newTask) : undefined,
    EDIT_CANCEL: () => onCansel ? onCansel() : undefined,
  }
  const onTitleChange = (title: string) => setUpdatedTask(prev => ({...prev, title} as Task))

  return (
    <Flex justifyContent="space-between" alignItems="center">
      <TextField defaultValue={updatedTask?.title} marginEnd="size-200" flexGrow={1} inputMode="text" onChange={onTitleChange} aria-label="title" />
      <ButtonGroup>
        <ActionButton isQuiet={true} onPress={e => updatedTask && editCommands[EditActions.Submit](updatedTask)}><CheckmarkIcon /></ActionButton>
        <ActionButton isQuiet={true} onPress={e => editCommands[EditActions.Cancel]()}><CloseIcon /></ActionButton>
      </ButtonGroup>
    </Flex>
  )
}

export default EditTask
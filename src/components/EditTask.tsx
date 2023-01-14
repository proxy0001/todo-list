import { TextField, ActionButton, ButtonGroup, Flex } from '@adobe/react-spectrum';
import type { PartialTask, TaskContent } from "../types/task";
import { useState } from "react";
import CheckmarkIcon from '@spectrum-icons/workflow/Checkmark';
import CloseIcon from '@spectrum-icons/workflow/Close';

export interface EditTaskProps {
  editingObj?: EditingObj,
  onSubmit?: (partialTask: PartialTask | TaskContent) => void,
  onCansel?: () => void,
}

export enum EditActions {
  Submit = 'EDIT_SUBMIT',
  Cancel = 'EDIT_CANCEL',
}

export type EditCommands = {
  [EditActions.Submit]: (partialTask: PartialTask) => void
  [EditActions.Cancel]: () => void
}

export type EditingObj = ({ editingId: number } & TaskContent) | null

export const NULL_EDITING_OBJ = null
export const NEW_EDITING_OBJ_ID = -1
export const NEW_EDITING_OBJ: EditingObj = { editingId: NEW_EDITING_OBJ_ID, title: '' }

export const EditTask = ({
  editingObj = NEW_EDITING_OBJ,
  onSubmit,
  onCansel,
}: EditTaskProps) => {
  const { editingId, ...initPartialTask } = editingObj || NEW_EDITING_OBJ
  const [partialTask, setPartialTask] = useState(initPartialTask)
  
  const editCommands: EditCommands = {
    EDIT_SUBMIT: partialTask => onSubmit ? onSubmit(partialTask) : undefined,
    EDIT_CANCEL: () => onCansel ? onCansel() : undefined,
  }
  const onTitleChange = (title: string) => setPartialTask(prev => ({...prev, title}))

  return (
    <Flex justifyContent="space-between" alignItems="center">
      <TextField defaultValue={initPartialTask.title} marginEnd="size-200" flexGrow={1} inputMode="text" onChange={onTitleChange} aria-label="title" />
      <ButtonGroup>
        <ActionButton isQuiet={true} onPress={e => editCommands[EditActions.Submit](partialTask)}><CheckmarkIcon /></ActionButton>
        <ActionButton isQuiet={true} onPress={e => editCommands[EditActions.Cancel]()}><CloseIcon /></ActionButton>
      </ButtonGroup>
    </Flex>
  )
}

export default EditTask
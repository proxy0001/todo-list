import { ActionButton, ButtonGroup, Header, Content, Heading, Flex, Tabs, TabList, TabPanels, Checkbox, Text, Item } from '@adobe/react-spectrum';
import type { Task, TaskList, PartialTask, TaskModel } from "../types/task";
import { useState, useLayoutEffect } from "react";
import TaskListIcon from '@spectrum-icons/workflow/TaskList';
import ArchiveIcon from '@spectrum-icons/workflow/Archive';
import ArchiveRemoveIcon from '@spectrum-icons/workflow/ArchiveRemove';
import DeleteIcon from '@spectrum-icons/workflow/Delete';
import AddIcon from '@spectrum-icons/workflow/Add';
import EditIcon from '@spectrum-icons/workflow/Edit';
import { EditTask, NULL_EDITING_OBJ, NEW_EDITING_OBJ_ID, NEW_EDITING_OBJ } from './EditTask';
import type { EditingObj } from './EditTask';
import type { SpectrumCheckboxProps } from '@adobe/react-spectrum';
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'


export interface TaskManagerProps {
  model: TaskModel
}

enum Actions {
  Cancel = 'CANCEL',
  Create = 'CREATE',
  Update = 'UPDATE',
  Submit = 'SUBMIT',
  Finish = 'FINISH',
  Unfinish = 'UNFINISH',
  Archive = 'ARCHIVE',
  Unarchive = 'UNARCHIVE',
  Delete = 'DELETE',
}

type StateActions = Exclude<Actions, Actions.Cancel | Actions.Create | Actions.Submit>
type Commands = {
  [Actions.Cancel]: () => void
  [Actions.Create]: (editingObj: EditingObj) => void
  [Actions.Submit]: (partialTask: PartialTask) => void
} & {
  [key in StateActions]: (task: Task) => void
}

const filterGenerator = (condition: (task: Task) => boolean) => (taskList: TaskList): TaskList => {
  return pipe(
    taskList,
    A.filter(condition),
  )
}
const todosFilter = filterGenerator(task => !task.isFinished && !task.isArchived && !task.isDeleted)
const finishesFilter = filterGenerator(task => task.isFinished === true && !task.isArchived && !task.isDeleted)
const archivesFilter = filterGenerator(task => task.isArchived === true && !task.isDeleted)

export const TaskManager = ({ model }: TaskManagerProps) => {
  const { taskList, pushTask, finishTask, unfinishTask, archiveTask, unarchiveTask, deleteTask } = model
  const [todos, setTodos] = useState(todosFilter(taskList))
  const [finishes, setFinishes] = useState(finishesFilter(taskList))
  const [archives, setArchives] = useState(archivesFilter(taskList))
  
  const [editingObj, setEditingObj] = useState<EditingObj>(NULL_EDITING_OBJ)
  const isNewEditing = (editingObj: EditingObj): boolean => editingObj?.editingId === NEW_EDITING_OBJ_ID
  const isEditing = (editingObj: EditingObj, task: Task): boolean => editingObj?.editingId === task.id

  useLayoutEffect(() => {
    const sorted = [...taskList].sort((a: Task, b: Task): number => b.id - a.id)
    setTodos(todosFilter(sorted))
    setFinishes(finishesFilter(sorted))
    setArchives(archivesFilter(sorted))
  }, [taskList])

  const commands: Commands = {
    CANCEL: () => setEditingObj(NULL_EDITING_OBJ),
    CREATE: (editingObj = NEW_EDITING_OBJ) => setEditingObj(editingObj),
    SUBMIT: task => {
      pushTask(task)
      setEditingObj(NULL_EDITING_OBJ)
    },
    UPDATE: task => setEditingObj({ editingId: task.id, ...task } as EditingObj),
    FINISH: task => finishTask(task.id),
    UNFINISH: task => unfinishTask(task.id),
    ARCHIVE: task => archiveTask(task.id),
    UNARCHIVE: task => unarchiveTask(task.id),
    DELETE: task => deleteTask(task.id),
  }

  const onCheckboxChange = (task: Task): SpectrumCheckboxProps['onChange'] => {
    return isSelected => isSelected ?
      commands[Actions.Finish](task) :
      commands[Actions.Unfinish](task)
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
          <Header>
            <Flex justifyContent="space-between" alignItems="center">
              <Heading level={3}>{`Today's Tasks`}</Heading>
              <ButtonGroup>
                <ActionButton onPress={e => commands[Actions.Create](NEW_EDITING_OBJ)} aria-label="Add task"><AddIcon /></ActionButton>
              </ButtonGroup>
            </Flex>
          </Header>
          <Content margin="size-200" marginBottom="size-800">
            {
              isNewEditing(editingObj) ?
                <EditTask
                  editingObj={editingObj}
                  onSubmit={commands[Actions.Submit]}
                  onCansel={commands[Actions.Cancel]}
                /> :
                null
            }
            
            {todos.map(task => {
              return (
                isEditing(editingObj, task) ?
                  <EditTask
                    key={`editing-${task.id}`}
                    editingObj={editingObj}
                    onSubmit={commands[Actions.Submit]}
                    onCansel={commands[Actions.Cancel]}
                  /> :
                  <Flex key={task.id} justifyContent="space-between">
                    <Checkbox marginEnd="size-200" flexGrow={1} isSelected={task.isFinished === true} onChange={onCheckboxChange(task)}>
                      {task.title}
                    </Checkbox>
                    <ButtonGroup>
                      <ActionButton isQuiet onPress={e => commands[Actions.Update](task)} aria-label="Edit task"><EditIcon /></ActionButton>
                      <ActionButton isQuiet onPress={e => commands[Actions.Archive](task)} aria-label="Archive task"><ArchiveIcon /></ActionButton>
                      <ActionButton isQuiet onPress={e => commands[Actions.Delete](task)} aria-label="Delete task"><DeleteIcon /></ActionButton>
                    </ButtonGroup>
                  </Flex>
              )
            })}
          </Content>
          <Heading level={3}>Finished</Heading>
          <Content margin="size-200" marginBottom="size-800">
            {finishes.map(task => {
              return (
                isEditing(editingObj, task) ?
                  <EditTask
                    key={`editing-${task.id}`}
                    editingObj={editingObj}
                    onSubmit={commands[Actions.Submit]}
                    onCansel={commands[Actions.Cancel]}
                  /> :
                  <Flex key={task.id} justifyContent="space-between">
                    <Checkbox marginEnd="size-200" flexGrow={1} isSelected={task.isFinished === true} onChange={onCheckboxChange(task)}>
                      <span className="line-through">{task.title}</span>
                    </Checkbox>
                    <ButtonGroup>
                      <ActionButton isQuiet onPress={e => commands[Actions.Update](task)} aria-label="Edit task"><EditIcon /></ActionButton>
                      <ActionButton isQuiet onPress={e => commands[Actions.Archive](task)} aria-label="Archive task"><ArchiveIcon /></ActionButton>
                      <ActionButton isQuiet onPress={e => commands[Actions.Delete](task)} aria-label="Delete task"><DeleteIcon /></ActionButton>
                    </ButtonGroup>
                  </Flex>
              )
            })}
          </Content>
        </Item>
        <Item key="archives" textValue="Archived Panel">
          <Heading level={3}>Archived</Heading>
          <Content margin="size-200">
            {archives.map(task => {
              return (
                isEditing(editingObj, task) ?
                  <EditTask
                    key={`editing-${task.id}`}
                    editingObj={editingObj}
                    onSubmit={commands[Actions.Submit]}
                    onCansel={commands[Actions.Cancel]}
                  /> :
                  <Flex key={task.id} justifyContent="space-between">
                    <Checkbox marginEnd="size-200" flexGrow={1} isSelected={task.isFinished === true} onChange={onCheckboxChange(task)}>
                      <span className={task.isFinished ? 'line-through' : ''}>{task.title}</span>
                    </Checkbox>
                    <ButtonGroup>
                      <ActionButton isQuiet onPress={e => commands[Actions.Update](task)} aria-label="Edit task"><EditIcon /></ActionButton>
                      <ActionButton isQuiet onPress={e => commands[Actions.Unarchive](task)} aria-label="Unarchive task"><ArchiveRemoveIcon /></ActionButton>
                      <ActionButton isQuiet onPress={e => commands[Actions.Delete](task)} aria-label="Delete task"><DeleteIcon /></ActionButton>
                    </ButtonGroup>
                  </Flex>
              )
            })}
          </Content>
        </Item>
      </TabPanels>
    </Tabs>
  );
};

export default TaskManager;
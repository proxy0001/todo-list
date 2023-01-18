import { ActionButton, ButtonGroup, Header, Content, Heading, Flex, Tabs, TabList, TabPanels, Checkbox, Text, Item } from '@adobe/react-spectrum';
import type { Task, TaskModel } from "../types/task";
import { useState } from "react";
import TaskListIcon from '@spectrum-icons/workflow/TaskList';
import ArchiveIcon from '@spectrum-icons/workflow/Archive';
import ArchiveRemoveIcon from '@spectrum-icons/workflow/ArchiveRemove';
import DeleteIcon from '@spectrum-icons/workflow/Delete';
import AddIcon from '@spectrum-icons/workflow/Add';
import EditIcon from '@spectrum-icons/workflow/Edit';
import { EditTask, NULL_EDITING_TASK, NEW_EDITING_TASK_ID, NEW_EDITING_TASK } from './EditTask';
import type { SpectrumCheckboxProps } from '@adobe/react-spectrum';


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

type StateActions = Exclude<Actions, Actions.Cancel>
type Commands = {
  [Actions.Cancel]: () => void
} & {
  [key in StateActions]: (task: Task) => void
}

export const TaskManager = ({ model }: TaskManagerProps) => {
  const { todoList, finishList, archiveList, pushTask, finishTask, unfinishTask, archiveTask, unarchiveTask, deleteTask } = model

  const [editingTask, setEditingTask] = useState<Task | null>(NULL_EDITING_TASK)
  const isNewEditing = (editingTask: Task): boolean => editingTask.id === NEW_EDITING_TASK_ID
  const isEditing = (editingTask: Task, task: Task): boolean => editingTask?.id === task.id
  const newEditingTask = {...NEW_EDITING_TASK, userId: model.userId }

  const commands: Commands = {
    CANCEL: () => setEditingTask(NULL_EDITING_TASK),
    CREATE: (task = NEW_EDITING_TASK) => setEditingTask(task),
    SUBMIT: task => {
      task && pushTask(task)
      setEditingTask(NULL_EDITING_TASK)
    },
    UPDATE: task => setEditingTask({ ...task } as Task),
    FINISH: task => finishTask(task),
    UNFINISH: task => unfinishTask(task),
    ARCHIVE: task => archiveTask(task),
    UNARCHIVE: task => unarchiveTask(task),
    DELETE: task => deleteTask(task),
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
                <ActionButton onPress={e => commands[Actions.Create](newEditingTask)} aria-label="Add task"><AddIcon /></ActionButton>
              </ButtonGroup>
            </Flex>
          </Header>
          <Content margin="size-200" marginBottom="size-800">
            {
              editingTask && isNewEditing(editingTask) ?
                <EditTask
                  task={editingTask}
                  onSubmit={commands[Actions.Submit]}
                  onCansel={commands[Actions.Cancel]}
                /> :
                null
            }
            
            {todoList.map(task => {
              return (
                editingTask && isEditing(editingTask, task) ?
                  <EditTask
                    key={`editing-${task.id}`}
                    task={editingTask}
                    onSubmit={commands[Actions.Submit]}
                    onCansel={commands[Actions.Cancel]}
                  /> :
                  <Flex key={task.id} justifyContent="space-between">
                    <Checkbox marginEnd="size-200" flexGrow={1} isSelected={task.isFinished} onChange={onCheckboxChange(task)}>
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
            {finishList.map(task => {
              return (
                editingTask && isEditing(editingTask, task) ?
                  <EditTask
                    key={`editing-${task.id}`}
                    task={editingTask}
                    onSubmit={commands[Actions.Submit]}
                    onCansel={commands[Actions.Cancel]}
                  /> :
                  <Flex key={task.id} justifyContent="space-between">
                    <Checkbox marginEnd="size-200" flexGrow={1} isSelected={task.isFinished} onChange={onCheckboxChange(task)}>
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
            {archiveList.map(task => {
              return (
                editingTask && isEditing(editingTask, task) ?
                  <EditTask
                    key={`editing-${task.id}`}
                    task={editingTask}
                    onSubmit={commands[Actions.Submit]}
                    onCansel={commands[Actions.Cancel]}
                  /> :
                  <Flex key={task.id} justifyContent="space-between">
                    <Checkbox marginEnd="size-200" flexGrow={1} isSelected={task.isFinished} onChange={onCheckboxChange(task)}>
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
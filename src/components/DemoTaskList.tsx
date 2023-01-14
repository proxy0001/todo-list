import { Header, ActionGroup, Content, Heading, Flex, Tabs, TabList, TabPanels, Checkbox, Text, Item } from '@adobe/react-spectrum';
import type { Task, TaskList, PartialTask } from "../types/task";
import { useTasks } from "../hooks/useTasks";
import { useEffect, useState } from "react";
import TaskListIcon from '@spectrum-icons/workflow/TaskList';
import CheckmarkIcon from '@spectrum-icons/workflow/Checkmark';
import ArchiveIcon from '@spectrum-icons/workflow/Archive';
import ArchiveRemoveIcon from '@spectrum-icons/workflow/ArchiveRemove';
import DeleteIcon from '@spectrum-icons/workflow/Delete';
import AddIcon from '@spectrum-icons/workflow/Add';
import type { SpectrumCheckboxProps } from '@adobe/react-spectrum';
import type { Key } from 'react';
import { some, none, match, getEq, Option } from 'fp-ts/Option';
import * as B from 'fp-ts/Boolean'
import * as O from 'fp-ts/Option'
import * as R from 'fp-ts/Record'
import * as A from 'fp-ts/Array'
import { pipe, flow, identity } from 'fp-ts/function'
import { filterMap, filter, map } from 'fp-ts/Array'
import { contramap, Eq } from 'fp-ts/Eq'
import { log } from 'fp-ts/Console'
import * as IO from "fp-ts/lib/IO";

type Condition = (task: Task) => boolean
const filterGenerator = (condition: Condition) => (taskList: TaskList): TaskList => {
  return pipe(
    taskList,
    A.filter(condition),
  )
}
const todosFilter = filterGenerator(task => !task.isFinished && !task.isArchived && !task.isDeleted)
const finishesFilter = filterGenerator(task => task.isFinished === true && !task.isArchived && !task.isDeleted)
const archivesFilter = filterGenerator(task => task.isArchived === true && !task.isDeleted)


enum Actions {
  Add = 'ADD',
  Finish = 'FINISH',
  Unfinish = 'UNFINISH',
  Archive = 'ARCHIVE',
  Unarchive = 'UNARCHIVE',
  Delete = 'DELETE',
}

type ActionHandler = (key: Key) => void
type ContentActions = Extract<Actions, Actions.Add>
type StateActions = Exclude<Actions, Actions.Add>
type StateCommands<I> = (item: I) => void
type ContentCommands = () => void
type Commands<I> = {
  [key in ContentActions]: ContentCommands
} & {
  [key in StateActions]: StateCommands<I>
}

export const DemoTaskList = () => {
  // const { data: taskList = [], isError, isLoading } = api.task.list.useQuery();
  const { taskList, addTask, updateTask, finishTask, unfinishTask, archiveTask, unarchiveTask, deleteTask, undeleteTask } = useTasks()
  const [todos, setTodos] = useState(todosFilter(taskList))
  const [finishes, setFinishes] = useState(finishesFilter(taskList))
  const [archives, setArchives] = useState(archivesFilter(taskList))

  useEffect(() => {
    setTodos(todosFilter(taskList))
    setFinishes(finishesFilter(taskList))
    setArchives(archivesFilter(taskList))
  }, [taskList])

  const actionCommands: Commands<Task> = {
    ADD: () => console.log('add'),
    FINISH: task => finishTask(task.id),
    UNFINISH: task => unfinishTask(task.id),
    ARCHIVE: task => archiveTask(task.id),
    UNARCHIVE: task => unarchiveTask(task.id),
    DELETE: task => deleteTask(task.id),
  }

  const onAction = ((action: ContentActions) => actionCommands[action]()) as ActionHandler
  const toAction = (task: Task) => ((action: StateActions) => actionCommands[action](task)) as ActionHandler
  const onCheckboxChange = (task: Task): SpectrumCheckboxProps['onChange'] => {
    return isSelected => isSelected ?
      actionCommands[Actions.Finish](task) :
      actionCommands[Actions.Unfinish](task)
  }
  
  return (
    <Tabs aria-label="History of Ancient Rome">
      <TabList>
        <Item key="tasklist" textValue="Task List Tab">
          <TaskListIcon />
          <Text>Task List</Text>
        </Item>
        <Item key="archives" textValue="Archived Tab">
          <CheckmarkIcon />
          <Text>Archived</Text>
        </Item>
      </TabList>
      <TabPanels>
        <Item key="tasklist" textValue="Task List Panel">
          <Header>
            <Flex justifyContent="space-between" alignItems="center">
              <Heading level={3}>{`Today's Tasks`}</Heading>
              <ActionGroup onAction={onAction}>
                <Item key={Actions['Add']} aria-label="Add task"><AddIcon /></Item>
              </ActionGroup>
            </Flex>
          </Header>
          <Content margin="size-200" marginBottom="size-800">
            {todos.map(task => {
              return (
                <Flex key={task.id} justifyContent="space-between">
                  <Checkbox isSelected={task.isFinished === true} onChange={onCheckboxChange(task)}>
                    {task.title}
                  </Checkbox>
                  <ActionGroup isQuiet onAction={toAction(task)}>
                    <Item key={Actions['Archive']} aria-label="Archive task" textValue="Archive"><ArchiveIcon /></Item>
                    <Item key={Actions['Delete']} aria-label="Delete task" textValue="Delete"><DeleteIcon /></Item>
                  </ActionGroup>
                </Flex>
              )
            })}
          </Content>
          <Heading level={3}>Finished</Heading>
          <Content margin="size-200" marginBottom="size-800">
            {finishes.map(task => {
              return (
                <Flex key={task.id} justifyContent="space-between">
                  <Checkbox isSelected={task.isFinished === true} onChange={onCheckboxChange(task)}>
                    <span className="line-through">{task.title}</span>
                  </Checkbox>
                  <ActionGroup isQuiet onAction={toAction(task)}>
                    <Item key={Actions['Archive']} aria-label="Archive task" textValue="Archive"><ArchiveIcon /></Item>
                    <Item key={Actions['Delete']} aria-label="Delete task" textValue="Delete"><DeleteIcon /></Item>
                  </ActionGroup>
                </Flex>
              )
            })}
          </Content>
        </Item>
        <Item key="archives" textValue="Archived Panel">
          <Heading level={2}>Archived</Heading>
          <Content margin="size-200">
            {archives.map(task => {
              return (
                <Flex key={task.id} justifyContent="space-between">
                  <Checkbox isSelected={task.isFinished === true} onChange={onCheckboxChange(task)}>
                    <span className={task.isFinished ? 'line-through' : ''}>{task.title}</span>
                  </Checkbox>
                  <ActionGroup isQuiet onAction={toAction(task)}>
                    <Item key={Actions['Unarchive']} aria-label="Unarchive task" textValue="Unarchive"><ArchiveRemoveIcon /></Item>
                    <Item key={Actions['Delete']} aria-label="Delete task" textValue="Delete"><DeleteIcon /></Item>
                  </ActionGroup>
                </Flex>
              )
            })}
          </Content>
        </Item>
      </TabPanels>
    </Tabs>
  );
};

export default DemoTaskList;
import { Header, ActionGroup, Content, Heading, Flex, Tabs, TabList, TabPanels, Checkbox, Text, Item } from '@adobe/react-spectrum';
import type { Todo, TodoList } from "../types/todos";
import { useDemoTodoList } from "../hooks/useDemoTodoList";
import { useEffect, useState } from "react";
import TaskList from '@spectrum-icons/workflow/TaskList';
import Checkmark from '@spectrum-icons/workflow/Checkmark';
import Archive from '@spectrum-icons/workflow/Archive';
import ArchiveRemove from '@spectrum-icons/workflow/ArchiveRemove';
import Delete from '@spectrum-icons/workflow/Delete';
import Add from '@spectrum-icons/workflow/Add';
import type { SpectrumCheckboxProps } from '@adobe/react-spectrum';
import type { Key } from 'react';

type Condition<I> = (item: I) => boolean
type FilterGenerator<L, I> = (condition: Condition<I>) => (list: L) => L
const filterGenerator: FilterGenerator<TodoList, Todo> = condition => todoList => todoList.filter(condition)
const filterTasks = filterGenerator(todo => !todo.isFinished && !todo.isArchived && !todo.isDeleted)
const filterFinished = filterGenerator(todo => todo.isFinished === true && !todo.isArchived && !todo.isDeleted)
const filterArchived = filterGenerator(todo => todo.isArchived === true && !todo.isDeleted)

enum Actions {
  Add = 'ADD',
  Archive = 'ARCHIVE',
  Delete = 'DELETE',
  Unarchive = 'UNARCHIVE'
}

type ActionEventHandler<I> = (item?: I) => void
type OnAction<I> = (item?: I) => (action: Key) => void
type ActionProcessor<I> = {
  [key in Actions]: ActionEventHandler<I>
}

export const DemoTodoList = () => {
  // const { data: todoList = [], isError, isLoading } = api.todo.list.useQuery();
  const { todoList, addTodo, deleteTodo, updateTodo, archiveTodo, unarchiveTodo, undeleteTodo } = useDemoTodoList()
  const [tasks, setTasks] = useState(filterTasks(todoList))
  const [finished, setFinished] = useState(filterFinished(todoList))
  const [archived, setArchived] = useState(filterArchived(todoList))
  
  useEffect(() => {
    setTasks(filterTasks(todoList))
    setFinished(filterFinished(todoList))
    setArchived(filterArchived(todoList))
  }, [todoList])

  const onCheckboxChange = (todo: Todo): SpectrumCheckboxProps['onChange'] => {
    return isSelected => updateTodo({...todo, isFinished: isSelected})
  }
  const actionProcessor: ActionProcessor<Todo> = {
    ARCHIVE: todo => todo && archiveTodo(todo.id),
    DELETE: todo => todo && deleteTodo(todo.id),
    UNARCHIVE: todo => todo && unarchiveTodo(todo.id),
    ADD: todo => console.log('add'),
  }
  const onAction: OnAction<Todo> = todo => action => actionProcessor[action as Actions](todo)
  
  return (
    <Tabs aria-label="History of Ancient Rome">
      <TabList>
        <Item key="todolist" textValue="Todo List Tab">
          <TaskList />
          <Text>Todo List</Text>
        </Item>
        <Item key="archived" textValue="Archived Tab">
          <Checkmark />
          <Text>Archived</Text>
        </Item>
      </TabList>
      <TabPanels>
        <Item key="todolist" textValue="Todo List Panel">
          <Header>
            <Flex justifyContent="space-between" alignItems="center">
              <Heading level={3}>{`Today's Tasks`}</Heading>
              <ActionGroup onAction={onAction()}>
                <Item key={Actions['Add']} aria-label="Add todo"><Add /></Item>
              </ActionGroup>
            </Flex>
          </Header>
          <Content margin="size-200" marginBottom="size-800">
            {tasks.map(todo => {
              return (
                <Flex key={todo.id} justifyContent="space-between">
                  <Checkbox isSelected={todo.isFinished} onChange={onCheckboxChange(todo)}>{todo.title}</Checkbox>
                  <ActionGroup isQuiet onAction={onAction(todo)}>
                    <Item key={Actions['Archive']} aria-label="Archive todo" textValue="Archive"><Archive /></Item>
                    <Item key={Actions['Delete']} aria-label="Delete todo" textValue="Delete"><Delete /></Item>
                  </ActionGroup>
                </Flex>
              )
            })}
          </Content>
          <Heading level={3}>Finished</Heading>
          <Content margin="size-200" marginBottom="size-800">
            {finished.map(todo => {
              return (
                <Flex key={todo.id} justifyContent="space-between">
                  <Checkbox isSelected={todo.isFinished} onChange={onCheckboxChange(todo)}>{todo.title}</Checkbox>
                  <ActionGroup isQuiet onAction={onAction(todo)}>
                    <Item key={Actions['Archive']} aria-label="Archive todo" textValue="Archive"><Archive /></Item>
                    <Item key={Actions['Delete']} aria-label="Delete todo" textValue="Delete"><Delete /></Item>
                  </ActionGroup>
                </Flex>
              )
            })}
          </Content>
        </Item>
        <Item key="archived" textValue="Archived Panel">
          <Heading level={2}>Archived</Heading>
          <Content margin="size-200">
            {archived.map(todo => {
              return (
                <Flex key={todo.id} justifyContent="space-between">
                  <Checkbox isSelected={todo.isFinished} onChange={onCheckboxChange(todo)}>{todo.title}</Checkbox>
                  <ActionGroup isQuiet onAction={onAction(todo)}>
                    <Item key={Actions['Unarchive']} aria-label="Unarchive todo" textValue="Unarchive"><ArchiveRemove /></Item>
                    <Item key={Actions['Delete']} aria-label="Delete todo" textValue="Delete"><Delete /></Item>
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

export default DemoTodoList;
import type { Todo, TodoList } from '../types/todos'
import { useState } from 'react'

const defaultInit: TodoList = [
  { id: 1, title: 'todo A', isFinished: true, isArchived: false },
  { id: 2, title: 'todo B', isFinished: false, isArchived: false },
  { id: 3, title: 'todo C', isFinished: false, isArchived: false },
]

export const useDemoTodoList = (initTodoList: TodoList = defaultInit) => {
  const [todoList, setTodoList] = useState(initTodoList)

  const addTodo = (todo: Todo): void => {
    const todoId = todoList.length + 1
    setTodoList([...todoList, {...todo, id: todoId}])
  }

  const deleteTodo = (id: Todo['id']): void => {
    setTodoList(todoList.map(todo => todo.id === id ? {...todo, isDeleted: true} : todo))
  }
  
  const archiveTodo = (id: Todo['id']): void => {
    setTodoList(todoList.map(todo => todo.id === id ? {...todo, isArchived: true} : todo))
  }

  const undeleteTodo = (id: Todo['id']): void => {
    setTodoList(todoList.map(todo => todo.id === id ? {...todo, isDeleted: false} : todo))
  }

  const unarchiveTodo = (id: Todo['id']): void => {
    setTodoList(todoList.map(todo => todo.id === id ? {...todo, isArchived: false} : todo))
  }

  const updateTodo = (updatedTodo: Todo): void => {
    setTodoList(todoList.map(todo => todo.id === updatedTodo.id ? updatedTodo : todo))
  }

  return { todoList, addTodo, deleteTodo, updateTodo, archiveTodo, undeleteTodo, unarchiveTodo }
}
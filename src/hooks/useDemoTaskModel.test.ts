import { renderHook, act } from '@testing-library/react'
import { useDemoTaskModel } from './useDemoTaskModel';

/**
 * useDemoTaskModel has default data 👇
 * const defaultTaskList: TaskList = [
 *   { id: 1, userId: '', title: 'task X', isFinished: false, isArchived: false },
 *   { id: 2, userId: '', title: 'task B', isFinished: false, isArchived: true },
 *   { id: 3, userId: '', title: 'task C', isFinished: true, isArchived: false },
 * ]
 * so by default
 * dotoList.length === 1 // { id: 1, userId: '', title: 'task X', isFinished: false, isArchived: false }
 * finishList.length === 1 // { id: 3, userId: '', title: 'task C', isFinished: true, isArchived: false }
 * archiveList.length === 1 // { id: 2, userId: '', title: 'task B', isFinished: false, isArchived: true }
 */
describe('Test useDemoTaskModel', () => {
  const setup = () => renderHook(() => useDemoTaskModel({ userId: 'tester'}))

  describe('set userId into model', () => {
    it('should have userId', () => {
       const { result } = setup()
       expect(result.current.userId).toBe('tester')
    })
  })

  describe('default data is ready', () => {
    it('should have default data in three lists', () => {
       const { result } = setup()
       const todoTask = { id: 1, userId: '', title: 'task X', isFinished: false, isArchived: false }
       const archivedTask = { id: 2, userId: '', title: 'task B', isFinished: false, isArchived: true }
       const finishedTask = { id: 3, userId: '', title: 'task C', isFinished: true, isArchived: false }
       expect(result.current.todoList.length).toBe(1)
       expect(result.current.finishList.length).toBe(1)
       expect(result.current.archiveList.length).toBe(1)
       expect(result.current.todoList[0]).toMatchObject(todoTask)
       expect(result.current.finishList[0]).toMatchObject(finishedTask)
       expect(result.current.archiveList[0]).toMatchObject(archivedTask)
    })
  })

  describe('create task', () => {
     it('add a new task in todo list', () => {
        const { result } = setup()
        const newTask = { id: 0, title: 'create task', userId: result.current.userId }
        
        act(() => {
          result.current.createTask(newTask)
        })

        expect(result.current.todoList.length).toBe(2)
        expect(result.current.todoList[0]).toMatchObject({ ...newTask, id: 4 })
    })
  })

  describe('delete task', () => {
    it('delete a task in todo list', () => {
       const { result } = setup()
       const todoTask = { id: 1, userId: '', title: 'task X', isFinished: false, isArchived: false }

       act(() => {
         result.current.deleteTask(todoTask)
       })

       expect(result.current.todoList.length).toBe(0)
   })

   it('delete a task in finished list', () => {
      const { result } = setup()
      const finishedTask = { id: 3, userId: '', title: 'task C', isFinished: true, isArchived: false }

      act(() => {
        result.current.deleteTask(finishedTask)
      })

      expect(result.current.finishList.length).toBe(0)
    })

    it('delete a task in archived list', () => {
      const { result } = setup()
      const archivedTask = { id: 2, userId: '', title: 'task B', isFinished: false, isArchived: true }

      act(() => {
        result.current.deleteTask(archivedTask)
      })

      expect(result.current.archiveList.length).toBe(0)
    })
  })

  describe('push task, most use to change content', () => {
    it('update a exist task in todo list to change title text', () => {
      const { result } = setup()
      const todoTask = { id: 1, userId: '', title: 'task X', isFinished: false, isArchived: false }

      act(() => {
        result.current.pushTask({...todoTask, title: 'success'})
      })

      expect(result.current.todoList.length).toBe(1)
      expect(result.current.todoList[0]).toMatchObject({...todoTask, title: 'success'})
    })
  })

  describe('finish task', () => {
    it('update a exist task in todo list to be finished', () => {
      const { result } = setup()
      const todoTask = { id: 1, userId: '', title: 'task X', isFinished: false, isArchived: false }

      act(() => {
        result.current.finishTask(todoTask)
      })

      expect(result.current.todoList.length).toBe(0)
      expect(result.current.finishList.length).toBe(2)
      expect(result.current.finishList[1]).toMatchObject({ ...todoTask, isFinished: true })
    })

    it('update a exist task in archived list to be finished', () => {
      const { result } = setup()
      const archivedTask = { id: 2, userId: '', title: 'task B', isFinished: false, isArchived: true }

      act(() => {
        result.current.finishTask(archivedTask)
      })

      expect(result.current.archiveList.length).toBe(1)
      expect(result.current.archiveList[0]).toMatchObject({ ...archivedTask, isFinished: true })
    })
  })

 describe('unfinish task', () => {
  it('update a exist task in finish list to be todo', () => {
    const { result } = setup()
    const finishedTask = { id: 3, userId: '', title: 'task C', isFinished: true, isArchived: false }

    act(() => {
      result.current.unfinishTask(finishedTask)
    })

    expect(result.current.todoList.length).toBe(2)
    expect(result.current.finishList.length).toBe(0)
    expect(result.current.todoList[0]).toMatchObject({ ...finishedTask, isFinished: false })
  })

 it('update a exist task in archived list to be unfinished', () => {
    const { result } = setup()
    const archivedTask = { id: 2, userId: '', title: 'task B', isFinished: false, isArchived: true }

    act(() => {
      result.current.unfinishTask(archivedTask)
    })

    expect(result.current.archiveList.length).toBe(1)
    expect(result.current.archiveList[0]).toMatchObject({ ...archivedTask, isFinished: false })
  })
})

 describe('archive task', () => {
    it('update a exist task in todo list to be archived', () => {
      const { result } = setup()
      const todoTask = { id: 1, userId: '', title: 'task X', isFinished: false, isArchived: false }

      act(() => {
        result.current.archiveTask(todoTask)
      })

      expect(result.current.todoList.length).toBe(0)
      expect(result.current.archiveList.length).toBe(2)
      expect(result.current.archiveList[1]).toMatchObject({...todoTask, isArchived: true})
    })

    it('update a exist task in finished list to be archived', () => {
      const { result } = setup()
      const finishedTask = { id: 3, userId: '', title: 'task C', isFinished: true, isArchived: false }

      act(() => {
        result.current.archiveTask(finishedTask)
      })

      expect(result.current.finishList.length).toBe(0)
      expect(result.current.archiveList.length).toBe(2)
      expect(result.current.archiveList[0]).toMatchObject({...finishedTask, isArchived: true})
    })
  })

  describe('unarchive task', () => {
    it('update a exist task in archived list to be unarchived', () => {
      const { result } = setup()
      const archivedTask = { id: 2, userId: '', title: 'task B', isFinished: false, isArchived: true }

      act(() => {
        result.current.unarchiveTask(archivedTask)
      })

      expect(result.current.archiveList.length).toBe(0)
      expect(result.current.todoList.length).toBe(2)
      expect(result.current.todoList[0]).toMatchObject({...archivedTask, isArchived: false})
    })
  })

})
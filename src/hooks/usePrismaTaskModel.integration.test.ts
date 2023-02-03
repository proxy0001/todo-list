/**
 * NOTE: 
 * This is a integration testing will really call Backend APIs,
 * make sure you have http://localhost:3005/api/trpc on.
 * 
 * run `npm run server:test` before start testing
 * 
 * REVIEW: [Issue] Import Node Code in Front-end Testing
 * Referred to many ways to study how to conduct the test in create-t3-app.
 * Main problem is how to let these functions still work well in testing env
 * - api.task.todoList.useQuery()
 * - api.task.create.useMutation()
 * - createTaskMutation.mutate()
 * ...
 * 
 * create-t3-app integrates features such as tRPC and reactQuery, and integrates an Api util of its own to be used on the front-end.
 * The current approach introduces a number of related implementations and leads to a number of compatibility issues in the test environment, 
 * as many Server Side related programs are introduced.
 * 
 * @see jest.config.ts
 * @see https://github.com/trpc/trpc/discussions/3612
 * @see https://github.com/briangwaltney/t3-testing-example
 * 
 * FIXME: [Issue] sometimes will have TRPCError BAD_REQUEST when calling APIs
 * This is an issue with usePrismaTaskModel and is not caused by the test code.
 * the reason is when we display updated task before API callback, we don't know the id it is.
 * at that time, we will git it a temp id.
 * If someone get the task in list is not just for display but use to do CRUD, it will find nothing in db.
 * 
 * TODO: Need refactor.
 * Find a way to have each test method not share the state of the hook and reset data eachtime.
 * We can use beforeEach and afterEach to reset data in db,
 * but the state of hook is still not reset.
 * 
 * TODO: Find a way to mock tRPC APIs and implement unit test not calling real APIs for hook.
 */

import { act } from '@testing-library/react'
import { usePrismaTaskModel } from './usePrismaTaskModel'
import { cleanup } from "@testing-library/react"
import { hookWrapper, renderHook, waitFor } from "../utils/testWrapper"
import type { Task } from "@prisma/client"
import { mockData, mockNextAuth } from '../utils/testUtils'
import { prisma } from '../server/db'

/**
 * mock Next Auth to prevent this issue
 * @see https://github.com/nextauthjs/next-auth/issues/4866
 */
mockNextAuth()

beforeAll(async () => {
  await prisma.user.create({
    data: mockData.userData
  })
  await prisma.task.createMany({
    data: mockData.taskData
  })
})

afterAll(async () => {
  await prisma.$transaction([
    prisma.task.deleteMany(),
    prisma.user.deleteMany(),
  ])

  await prisma.$disconnect()
})

describe('Test usePrismaTaskModel', () => {
  const setup = () => renderHook(() => usePrismaTaskModel({ userId: mockData.userId}), {
    wrapper: hookWrapper(mockData.userData),
  })

  describe('set userId into model', () => {
    it('should have userId', async () => {
      const { result } = setup()
      await waitFor(() => expect(result.current.userId).toBe(mockData.userId))
    })
  })

  describe('fetch data of three lists', () => {
    it('should have data in three lists', async () => {
      const { result } = setup()

      await waitFor(() => expect(result.current.todoList.length).toBe(1))
      await waitFor(() => expect(result.current.todoList[0]).toStrictEqual(mockData.todoTask))

      await waitFor(() => expect(result.current.finishList.length).toBe(1))
      await waitFor(() => expect(result.current.finishList[0]).toStrictEqual(mockData.finishedTask))

      await waitFor(() => expect(result.current.archiveList.length).toBe(1))      
      await waitFor(() => expect(result.current.archiveList[0]).toStrictEqual(mockData.archivedTask))
    })
  })

  describe('create task', () => {
     it('should add a new task in todo list', async () => {
        const { result } = setup()
        const originLength = result.current.todoList.length

        result.current.createTask(mockData.newTodoTask)
             
        await waitFor(() => {
          expect(result.current.todoList.length).toBe(originLength + 1)
          const newTask = {
            ...mockData.newTodoTask,
            id: result.current.todoList[0]?.id
          }
          expect(result.current.todoList).toContainEqual(newTask)
        })
    })
  })

  describe('push task, most use to change content', () => {
    it('should update a exist task in todo list to change title text', async () => {
      const { result } = setup()
      const updatedTask = {
        ...result.current.todoList[0],
        title: mockData.updatedTodoTask.title,
      } as Task
      
      result.current.pushTask(updatedTask)
      
      await waitFor(() => {
        expect(result.current.todoList).toContainEqual(updatedTask)
      })
    })
  })

  describe('finish task', () => {
    it('should update a exist task in todo list to be finished', async () => {
      const { result } = setup()
      const originTodoLength = result.current.todoList.length
      const originFinishLength = result.current.finishList.length

      const updatedTask = {
        ...result.current.todoList[0],
        isFinished: true,
      } as Task
      
      result.current.finishTask(updatedTask)

      await waitFor(() => {
        expect(result.current.todoList.length).toBe(originTodoLength - 1)
        expect(result.current.finishList.length).toBe(originFinishLength + 1)
        expect(result.current.finishList).toContainEqual(updatedTask)
      })
    })

    it('should update a exist task in archived list to be finished', async () => {
      const { result } = setup()
      const originArchiveLength = result.current.archiveList.length

      const updatedTask = {
        ...result.current.archiveList[0],
        isFinished: true,
      } as Task
      
      result.current.finishTask(updatedTask)

      await waitFor(() => {
        expect(result.current.archiveList.length).toBe(originArchiveLength)
        expect(result.current.archiveList).toContainEqual(updatedTask)
      })
    })
  })

  describe('unfinish task', () => {
    it('should update a exist task in finish list to be todo', async () => {
      const { result } = setup()
      const originTodoLength = result.current.todoList.length
      const originFinishLength = result.current.finishList.length

      const updatedTask = {
        ...result.current.finishList[0],
        isFinished: false,
      } as Task

      result.current.unfinishTask(updatedTask)
      
      await waitFor(() => {
        expect(result.current.todoList.length).toBe(originTodoLength + 1)
        expect(result.current.finishList.length).toBe(originFinishLength - 1)
        expect(result.current.todoList).toContainEqual(updatedTask)
      })
    })

    it('should update a exist task in archived list to be unfinished', async () => {
      const { result } = setup()
      const originArchiveLength = result.current.archiveList.length

      const updatedTask = {
        ...result.current.archiveList[0],
        isFinished: false,
      } as Task

      result.current.unfinishTask(updatedTask)

      await waitFor(() => {
        expect(result.current.archiveList.length).toBe(originArchiveLength)
        expect(result.current.archiveList).toContainEqual(updatedTask)
      })
    })
  })

 describe('archive task', () => {
    it('should update a exist task in todo list to be archived', async () => {
      const { result } = setup()
      const originTodoLength = result.current.todoList.length
      const originArchiveLength = result.current.archiveList.length

      const updatedTask = {
        ...result.current.todoList[0],
        isArchived: true,
      } as Task

      result.current.archiveTask(updatedTask)
      
      await waitFor(() => {
        expect(result.current.todoList.length).toBe(originTodoLength - 1)
        expect(result.current.archiveList.length).toBe(originArchiveLength + 1)
        expect(result.current.archiveList).toContainEqual(updatedTask)
      })
    })

    it('should update a exist task in finished list to be archived', async () => {
      const { result } = setup()
      const originfinishLength = result.current.finishList.length
      const originArchiveLength = result.current.archiveList.length

      const updatedTask = {
        ...result.current.finishList[0],
        isArchived: true,
      } as Task

      result.current.archiveTask(updatedTask)
      
      await waitFor(() => {
        expect(result.current.finishList.length).toBe(originfinishLength - 1)
        expect(result.current.archiveList.length).toBe(originArchiveLength + 1)
        expect(result.current.archiveList).toContainEqual(updatedTask)
      })
    })
  })

  describe('unarchive task', () => {
    it('should update a exist task in archived list to be unarchived', async () => {
      const { result } = setup()
      const targetListName = result.current.archiveList[0]?.isFinished ? 'finishList' : 'todoList'
      const originTargetListLength = result.current[targetListName].length
      const originArchiveLength = result.current.archiveList.length

      const updatedTask = {
        ...result.current.archiveList[0],
        isArchived: false,
      } as Task
      result.current.unarchiveTask(updatedTask)
      
      await waitFor(() => {
        expect(result.current.archiveList.length).toBe(originArchiveLength - 1)
        expect(result.current[targetListName].length).toBe(originTargetListLength + 1)
        expect(result.current[targetListName]).toContainEqual(updatedTask)
      })
    })
  })

  describe('delete task', () => {
    /**
     * FIXME: after refactor, this should be removed.
     * Now the test methods will share the state of hook,
     * resulting in finishList with no tasks in it after the data is changed, 
     * so it will be handled manually for the time being. 
     * When the test method does not share state, we can remove it.
     */
    beforeAll(async () => {
      const { result } = setup()
      act(() => {
        const target = result.current.archiveList.find(task => task.isFinished)
        const updatedTask = {
          ...target,
          isArchived: false,
        } as Task
        result.current.unarchiveTask(updatedTask)
      })
    })

    it('should delete a task in todo list', async () => {
      const { result } = setup()
      const originLength = result.current.todoList.length
      const targetTask = result.current.todoList[0] as Task

      result.current.deleteTask(targetTask)
        
      await waitFor(() => {
        expect(result.current.todoList.length).toBe(originLength - 1)
      })
    })

   it('should delete a task in finished list', async () => {
      const { result } = setup()
      const originLength = result.current.finishList.length
      const targetTask = result.current.finishList[0] as Task

      result.current.deleteTask(targetTask)
        
      await waitFor(() => {
        expect(result.current.finishList.length).toBe(originLength - 1)
      })
    })

    it('should delete a task in archived list', async () => {
      const { result } = setup()
      const originLength = result.current.archiveList.length
      const targetTask = result.current.archiveList[0] as Task

      result.current.deleteTask(targetTask)
        
      await waitFor(() => {
        expect(result.current.archiveList.length).toBe(originLength - 1)
      })
    })
  })
})
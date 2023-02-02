import { appRouter } from '../server/api/root'
import { mockDeep } from 'jest-mock-extended'
import { prisma } from '../server/db'
import type { DeepMockProxy } from 'jest-mock-extended'
import type { User, Task } from '@prisma/client'
import type { Session } from 'next-auth'
import type { PrismaClient } from '@prisma/client'

/**
 * prepare mock data
 */
export const mockData = (() => {
  const userId = 'test-user-id'
  const userData: User = {
    id: userId,
    name: 'Test User',
    email: 'test-user@test.com',
    emailVerified: null,
    image: null,
  }
  const todoTask: Task = { id: 1, title: 'todo task 1', userId: 'test-user-id', isFinished: false, isArchived: false, createdAt: new Date(), updatedAt: new Date(), }
  const finishedTask: Task = { id: 2, title: 'finished task 1', userId: 'test-user-id', isFinished: true, isArchived: false, createdAt: new Date(), updatedAt: new Date(), }
  const archivedTask: Task = { id: 3, title: 'archived task 1', userId: 'test-user-id', isFinished: false, isArchived: true, createdAt: new Date(), updatedAt: new Date(), }
  const newTodoTask: Task = { id: 4, title: 'new todo title', userId: 'test-user-id', isFinished: false, isArchived: false, createdAt: new Date(), updatedAt: new Date(), }
  const updatedTodoTask: Task = { id: 4, title: 'updated todo title', userId: 'test-user-id', isFinished: false, isArchived: false, createdAt: new Date(), updatedAt: new Date(), }
  
  const taskData: Task[] = [
    todoTask,
    finishedTask,
    archivedTask,
  ]
  const todoList = [ todoTask ]
  const finishedList = [ finishedTask ]
  const archivedList = [ archivedTask ]
  
  return { userId, userData, taskData, todoTask, finishedTask, archivedTask, newTodoTask, updatedTodoTask, todoList, finishedList, archivedList }
})()

/**
 * prepare caller to call tRPC APIs with real prisma
 */
export const setupCaller = () => {
  const mockSession: Session = {
    expires: new Date().toISOString(),
    user: mockData.userData as Session['user'],
  }
  const mockCtx = { session: mockSession, prisma: prisma }
  return appRouter.createCaller(mockCtx)
}


export type SetupCallerWithMockPrismaReturn = {
  caller: ReturnType<typeof appRouter.createCaller>,
  prisma: DeepMockProxy<PrismaClient>,
  session: Session
}
export type MockPrismaResponse = (mockPrisma: DeepMockProxy<PrismaClient>) => DeepMockProxy<PrismaClient>
export type SetupCallerWithMockPrisma = (mockPrismaResponse: MockPrismaResponse) => SetupCallerWithMockPrismaReturn

/**
 * prepare caller to call tRPC APIs with mock prisma
 */
export const setupCallerWithMockPrisma: SetupCallerWithMockPrisma = mockPrismaResponse => {
  const mockPrisma = mockDeep<PrismaClient>()
  const mockSession: Session = {
    expires: new Date().toISOString(),
    user: mockData.userData as Session['user'],
  }
  const mockCtx = { session: mockSession, prisma: mockPrismaResponse(mockPrisma) }
  return {
    caller: appRouter.createCaller(mockCtx),
    ...mockCtx,
  }
}


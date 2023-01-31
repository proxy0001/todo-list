import { appRouter } from '../root'
import { mockDeep } from 'jest-mock-extended'
import type { DeepMockProxy } from 'jest-mock-extended'
import type { inferProcedureInput } from '@trpc/server'
import type { AppRouter } from '../root'
import type { Task, PrismaClient } from '@prisma/client'
import type { Session } from 'next-auth'

/**
 * how to test tRPC APIs with Prisma
 * @see https://www.youtube.com/watch?v=YRGo1H-qNQs
 * @see https://www.prisma.io/docs/guides/testing/unit-testing
 */

type SetupCallerReturn = {
  caller: ReturnType<typeof appRouter.createCaller>,
  prisma: DeepMockProxy<PrismaClient>,
  session: Session
}
type mockPrismaResponse = (mockPrisma: DeepMockProxy<PrismaClient>) => DeepMockProxy<PrismaClient>
const setupCaller = (mockPrismaResponse: mockPrismaResponse): SetupCallerReturn => {
  const mockPrisma = mockDeep<PrismaClient>()
  const mockSession: Session = {
    expires: new Date().toISOString(),
    user: { id: 'test-user-id', name: 'Test User' },
  }
  const mockCtx = { session: mockSession, prisma: mockPrismaResponse(mockPrisma) }
  return {
    caller: appRouter.createCaller(mockCtx),
    ...mockCtx,
  }
}

describe('test task APIs', () => {
  it('should return all todos of the user', async () => {
    type Input = inferProcedureInput<AppRouter['task']['todoList']>
    const input: Input = {
      userId: 'test-user-id'
    }
    const mockOutput: Task[] = [
      {
        id: 1,
        userId: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        title: 'test todo title',
        isFinished: false,
        isArchived: false,
      }
    ]
    const { caller, prisma } = setupCaller(mockPrisma => {
      mockPrisma.task.findMany.mockResolvedValue(mockOutput)
      return mockPrisma
    })
    const result = await caller.task.todoList(input)
    expect(prisma.task.findMany).toHaveBeenCalled()
    expect(result).toHaveLength(mockOutput.length)
    expect(result).toStrictEqual(mockOutput)
  })

  it('should return all finished tasks of the user', async () => {
    type Input = inferProcedureInput<AppRouter['task']['finishList']>
    const input: Input = {
      userId: 'test-user-id'
    }
    const mockOutput: Task[] = [
      {
        id: 1,
        userId: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        title: 'test finished task title',
        isFinished: true,
        isArchived: false,
      }
    ]
    const { caller, prisma } = setupCaller(mockPrisma => {
      mockPrisma.task.findMany.mockResolvedValue(mockOutput)
      return mockPrisma
    })
    const result = await caller.task.finishList(input)
    expect(prisma.task.findMany).toHaveBeenCalled()
    expect(result).toHaveLength(mockOutput.length)
    expect(result).toStrictEqual(mockOutput)
  })

  it('should return all archived tasks of the user', async () => {
    type Input = inferProcedureInput<AppRouter['task']['archiveList']>
    const input: Input = {
      userId: 'test-user-id'
    }
    const mockOutput: Task[] = [
      {
        id: 1,
        userId: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        title: 'test archived task title',
        isFinished: false,
        isArchived: true,
      }
    ]
    const { caller, prisma } = setupCaller(mockPrisma => {
      mockPrisma.task.findMany.mockResolvedValue(mockOutput)
      return mockPrisma
    })
    const result = await caller.task.archiveList(input)
    expect(prisma.task.findMany).toHaveBeenCalled()
    expect(result).toHaveLength(mockOutput.length)
    expect(result).toStrictEqual(mockOutput)
  })

  it('should create a new task and return it', async () => {
    type Input = inferProcedureInput<AppRouter['task']['create']>
    const input: Input = {
      userId: 'test-user-id',
      title: 'test new task title',
    }
    const mockOutput: Task = {
      id: 1,
      userId: 'test-user-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      title: 'test new task title',
      isFinished: false,
      isArchived: false,
    }
    const { caller, prisma } = setupCaller(mockPrisma => {
      mockPrisma.task.create.mockResolvedValue(mockOutput)
      return mockPrisma
    })
    const result = await caller.task.create(input)
    expect(prisma.task.create).toHaveBeenCalled()
    expect(result).toStrictEqual(mockOutput)
  })

  it('should update the task and return it', async () => {
    type Input = inferProcedureInput<AppRouter['task']['push']>
    const input: Input = {
      id: 1,
      userId: 'test-user-id',
      title: 'updated title',
    }
    const mockOutput: Task = {
      id: 1,
      userId: 'test-user-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      title: 'updated title',
      isFinished: false,
      isArchived: false,
    }
    const { caller, prisma } = setupCaller(mockPrisma => {
      mockPrisma.task.update.mockResolvedValue(mockOutput)
      return mockPrisma
    })
    const result = await caller.task.push(input)
    expect(prisma.task.update).toHaveBeenCalled()
    expect(result).toStrictEqual(mockOutput)
  })

  it('should delete the task', async () => {
    type Input = inferProcedureInput<AppRouter['task']['delete']>
    const input: Input = {
      id: 1,
      userId: 'test-user-id',
      title: 'will be deleted',
    }
    const mockOutput: Task = {
      id: 1,
      userId: 'test-user-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      title: 'will be deleted',
      isFinished: false,
      isArchived: false,
    }
    const { caller, prisma } = setupCaller(mockPrisma => {
      mockPrisma.task.delete.mockResolvedValue(mockOutput)
      return mockPrisma
    })
    const result = await caller.task.delete(input)
    expect(prisma.task.delete).toHaveBeenCalled()
    expect(result).toStrictEqual(mockOutput)
  })
})
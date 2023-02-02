import type { inferProcedureInput } from '@trpc/server'
import type { AppRouter } from '../root'
import { mockData, setupCallerWithMockPrisma} from '../../../utils/testUtils.server'

/**
 * how to test tRPC APIs with Mock Prisma
 * @see https://www.youtube.com/watch?v=YRGo1H-qNQs
 * @see https://www.prisma.io/docs/guides/testing/unit-testing
 */

describe('test task APIs with mock Prisma', () => {
  it('should return all todos of the user', async () => {
    type Input = inferProcedureInput<AppRouter['task']['todoList']>
    const input: Input = {
      userId: mockData.userId
    }
    
    const mockOutput = mockData.todoList
    const { caller, prisma } = setupCallerWithMockPrisma(mockPrisma => {
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
      userId: mockData.userId
    }

    const mockOutput = mockData.finishedList
    const { caller, prisma } = setupCallerWithMockPrisma(mockPrisma => {
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
      userId: mockData.userId
    }

    const mockOutput = mockData.finishedList
    const { caller, prisma } = setupCallerWithMockPrisma(mockPrisma => {
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
    const input: Input = mockData.newTodoTask as Input

    const mockOutput = mockData.newTodoTask
    const { caller, prisma } = setupCallerWithMockPrisma(mockPrisma => {
      mockPrisma.task.create.mockResolvedValue(mockOutput)
      return mockPrisma
    })

    const result = await caller.task.create(input)
    expect(prisma.task.create).toHaveBeenCalled()
    expect(result).toStrictEqual(mockOutput)
  })

  it('should update the task and return it', async () => {
    type Input = inferProcedureInput<AppRouter['task']['push']>
    const input: Input = mockData.updatedTodoTask as Input

    const mockOutput = mockData.updatedTodoTask
    const { caller, prisma } = setupCallerWithMockPrisma(mockPrisma => {
      mockPrisma.task.update.mockResolvedValue(mockOutput)
      return mockPrisma
    })
    const result = await caller.task.push(input)
    expect(prisma.task.update).toHaveBeenCalled()
    expect(result).toStrictEqual(mockOutput)
  })

  it('should delete the task', async () => {
    type Input = inferProcedureInput<AppRouter['task']['delete']>
    const input: Input = mockData.newTodoTask as Input

    const mockOutput = mockData.newTodoTask
    const { caller, prisma } = setupCallerWithMockPrisma(mockPrisma => {
      mockPrisma.task.delete.mockResolvedValue(mockOutput)
      return mockPrisma
    })
    const result = await caller.task.delete(input)
    expect(prisma.task.delete).toHaveBeenCalled()
    expect(result).toStrictEqual(mockOutput)
  })
})
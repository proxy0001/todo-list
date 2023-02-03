import { prisma } from '../../db'
import type { inferProcedureInput } from '@trpc/server'
import type { AppRouter } from '../root'
import { mockData, setupCaller} from '../../../utils/testUtils'
/**
 * how to do integration test with real Prisma
 * @see https://www.prisma.io/docs/guides/testing/integration-testing
 */

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

describe('test task APIs with real db', () => {
  const caller = setupCaller()

  it('should return all todos of the user', async () => {
    type Input = inferProcedureInput<AppRouter['task']['todoList']>
    const input: Input = {
      userId: mockData.userId
    }
    const result = await caller.task.todoList(input)
    expect(result).toHaveLength(mockData.todoList.length)
    expect(result).toMatchObject(mockData.todoList)
  })

  it('should return all finished tasks of the user', async () => {
    type Input = inferProcedureInput<AppRouter['task']['finishList']>
    const input: Input = {
      userId: mockData.userId
    }

    const result = await caller.task.finishList(input)
    expect(result).toHaveLength(mockData.finishedList.length)
    expect(result).toMatchObject(mockData.finishedList)
  })

  it('should return all archived tasks of the user', async () => {
    type Input = inferProcedureInput<AppRouter['task']['archiveList']>
    const input: Input = {
      userId: mockData.userId
    }

    const result = await caller.task.archiveList(input)
    expect(result).toHaveLength(mockData.archivedList.length)
    expect(result).toMatchObject(mockData.archivedList)
  })

  it('should create a new task and return it', async () => {
    type Input = inferProcedureInput<AppRouter['task']['create']>
    const input: Input = mockData.newTodoTask as Input
    
    const result = await caller.task.create(input)
    const expected = { ...mockData.newTodoTask, id: result.id }
    expect(result).toMatchObject(expected)
    
    const countResult = await prisma.task.count()
    expect(countResult).toBe(4)
    
    const selectLatest = await prisma.task.findFirstOrThrow({ orderBy: { id: 'desc' }})
    expect(selectLatest).toMatchObject(expected)
  })

  it('should update title with the latest task and return it', async () => {
    const selectLatest = await prisma.task.findFirstOrThrow({ orderBy: { id: 'desc' }})
    const expected = {
      ...selectLatest,
      title: mockData.updatedTodoTask.title,
    }

    type Input = inferProcedureInput<AppRouter['task']['push']>
    const input: Input = expected
    
    const result = await caller.task.push(input)
    expect(result).toMatchObject(expected)
  })

  it('should delete the task', async () => {
    const selectLatest = await prisma.task.findFirstOrThrow({ orderBy: { id: 'desc' }})
    const expected = {
      ...selectLatest,
      title: mockData.updatedTodoTask.title,
    }

    type Input = inferProcedureInput<AppRouter['task']['delete']>
    const input: Input = expected
    
    const result = await caller.task.delete(input)
    expect(result).toMatchObject(expected)

    const countResult = await prisma.task.count()
    expect(countResult).toBe(3)
  })
})
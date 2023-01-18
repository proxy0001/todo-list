import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import taskSchema from '../../../types/task'


export const taskRouter = createTRPCRouter({
  todoList: protectedProcedure
    .meta({ openapi: {
      method: 'GET',
      path: '/todoList',
      tags: ['task'],
      summary: 'Read all tasks of the user.',
    }})
    .input(taskSchema.task.pick({ userId: true }))
    .output(taskSchema.todoList)
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.task.findMany({
        where: {
          userId: input.userId,
          isFinished: false,
          isArchived: false,
        },
        orderBy: {
          id: 'desc'
        }
      })
    }),
  finishList: protectedProcedure
    .meta({ openapi: {
      method: 'GET',
      path: '/finishList',
      tags: ['task'],
      summary: 'Read all tasks of the user.',
    }})
    .input(taskSchema.task.pick({ userId: true }))
    .output(taskSchema.finishList)
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.task.findMany({
        where: {
          userId: input.userId,
          isFinished: true,
          isArchived: false,
        },
        orderBy: {
          id: 'desc'
        }
      })
    }),
  archiveList: protectedProcedure
    .meta({ openapi: {
      method: 'GET',
      path: '/archiveList',
      tags: ['task'],
      summary: 'Read all tasks of the user.',
    }})
    .input(taskSchema.task.pick({ userId: true }))
    .output(taskSchema.archiveList)
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.task.findMany({
        where: {
          userId: input.userId,
          isArchived: true,
        },
        orderBy: {
          id: 'desc'
        }
      })
    }),
  create: protectedProcedure
    .meta({ openapi: {
        method: 'POST',
        path: '/tasks',
        tags: ['task'],
        summary: 'Create a task.',
    }})
    .input(taskSchema.noHeadTask)
    .output(taskSchema.task)
    .mutation(async ({ ctx, input }) => {
      console.log('input', input)
      return await ctx.prisma.task.create({
        data: input
      })
    }),
  push: protectedProcedure
    .meta({ openapi: {
      method: 'PUT',
      path: '/tasks',
      tags: ['task'],
      summary: 'Update a task.',
    }})
    .input(taskSchema.task)
    .output(taskSchema.task)
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.task.update({
        where: {
          id: input.id,
        },
        data: input
      })
    }),
  delete: protectedProcedure
    .meta({ openapi: {
      method: 'DELETE',
      path: '/tasks',
      tags: ['task'],
      summary: 'Delete a task.',
    }})
    .input(taskSchema.task)
    .output(taskSchema.task)
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.task.delete({
        where: {
          id: input.id,
        },
      })
    }),
});

console.log(taskSchema)

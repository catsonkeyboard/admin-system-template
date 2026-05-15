import { z } from 'zod'
import { TrpcService } from '../../trpc/trpc.service'
import { DepartmentService } from './department.service'

export function createDepartmentRouter(trpc: TrpcService, departmentService: DepartmentService) {
  return trpc.router({
    tree: trpc.protectedProcedure.query(async ({ ctx }) => {
      return departmentService.tree(ctx.lang)
    }),

    list: trpc.protectedProcedure.query(async ({ ctx }) => {
      return departmentService.list(ctx.lang)
    }),

    getById: trpc.protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input, ctx }) => departmentService.getById(input.id, ctx.lang)),

    create: trpc.protectedProcedure
      .input(
        z.object({
          name: z.string().min(1, '部门名称不能为空'),
          nameEn: z.string().optional(),
          code: z.string().min(1, '部门代码不能为空'),
          parentId: z.string().optional(),
          sort: z.number().default(0),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => departmentService.create(input)),

    update: trpc.protectedProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().optional(),
          nameEn: z.string().optional(),
          code: z.string().optional(),
          parentId: z.string().optional(),
          sort: z.number().optional(),
          status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => departmentService.update(input)),

    delete: trpc.protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => departmentService.delete(input.id)),
  })
}

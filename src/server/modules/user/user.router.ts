import { z } from 'zod'
import { TrpcService } from '../../trpc/trpc.service'
import { UserService } from './user.service'

export function createUserRouter(trpc: TrpcService, userService: UserService) {
  return trpc.router({
    list: trpc.protectedProcedure
      .input(
        z.object({
          page: z.number().default(1),
          pageSize: z.number().default(10),
          keyword: z.string().optional(),
          departmentId: z.string().optional(),
          status: z.enum(['ACTIVE', 'INACTIVE', 'LOCKED']).optional(),
        })
      )
      .query(async ({ input }) => userService.list(input)),

    getById: trpc.protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => userService.getById(input.id)),

    create: trpc.protectedProcedure
      .input(
        z.object({
          username: z.string().min(2, '用户名至少2个字符'),
          realName: z.string().min(1, '姓名不能为空'),
          password: z.string().min(6, '密码至少6个字符'),
          phone: z.string().optional(),
          departmentId: z.string().optional(),
          position: z.string().optional(),
          accountExpiry: z.date().optional(),
          roleIds: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input }) => userService.create(input)),

    update: trpc.protectedProcedure
      .input(
        z.object({
          id: z.string(),
          username: z.string().optional(),
          realName: z.string().optional(),
          phone: z.string().optional(),
          departmentId: z.string().optional(),
          position: z.string().optional(),
          accountExpiry: z.date().optional(),
          status: z.enum(['ACTIVE', 'INACTIVE', 'LOCKED']).optional(),
          roleIds: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input }) => userService.update(input)),

    delete: trpc.protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => userService.delete(input.id)),

    resetPassword: trpc.protectedProcedure
      .input(
        z.object({
          id: z.string(),
          newPassword: z.string().min(6, '密码至少6个字符'),
        })
      )
      .mutation(async ({ input }) => userService.resetPassword(input.id, input.newPassword)),
  })
}

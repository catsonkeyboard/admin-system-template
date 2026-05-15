import { z } from 'zod'
import { TrpcService } from '../../trpc/trpc.service'
import { RoleService } from './role.service'

export function createRoleRouter(trpc: TrpcService, roleService: RoleService) {
  return trpc.router({
    list: trpc.protectedProcedure
      .input(
        z.object({
          page: z.number().default(1),
          pageSize: z.number().default(10),
          keyword: z.string().optional(),
        })
      )
      .query(async ({ input, ctx }) => roleService.list(input, ctx.lang)),

    getById: trpc.protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input, ctx }) => roleService.getById(input.id, ctx.lang)),

    create: trpc.protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          nameEn: z.string().optional(),
          code: z.string().min(1),
          status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
          description: z.string().optional(),
          permissionIds: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input }) => roleService.create(input)),

    update: trpc.protectedProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().optional(),
          nameEn: z.string().optional(),
          code: z.string().optional(),
          status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => roleService.update(input)),

    updatePermissions: trpc.protectedProcedure
      .input(
        z.object({
          roleId: z.string(),
          permissionIds: z.array(z.string()),
        })
      )
      .mutation(async ({ input }) => roleService.updatePermissions(input.roleId, input.permissionIds)),

    delete: trpc.protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => roleService.delete(input.id)),
  })
}

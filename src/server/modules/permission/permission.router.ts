import { z } from 'zod'
import { TrpcService } from '../../trpc/trpc.service'
import { PermissionService } from './permission.service'

export function createPermissionRouter(trpc: TrpcService, permissionService: PermissionService) {
  return trpc.router({
    list: trpc.protectedProcedure
      .input(
        z.object({
          page: z.number().default(1),
          pageSize: z.number().default(50),
          menuId: z.string().optional(),
          type: z.enum(['MENU', 'BUTTON', 'DATA']).optional(),
          keyword: z.string().optional(),
        })
      )
      .query(async ({ input, ctx }) => permissionService.list(input, ctx.lang)),

    create: trpc.protectedProcedure
      .input(
        z.object({
          code: z.string().min(1),
          name: z.string().min(1),
          nameEn: z.string().optional(),
          menuId: z.string().optional(),
          type: z.enum(['MENU', 'BUTTON', 'DATA']),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => permissionService.create(input)),

    update: trpc.protectedProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().optional(),
          nameEn: z.string().optional(),
          code: z.string().optional(),
          menuId: z.string().optional(),
          type: z.enum(['MENU', 'BUTTON', 'DATA']).optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => permissionService.update(input)),

    delete: trpc.protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => permissionService.delete(input.id)),
  })
}

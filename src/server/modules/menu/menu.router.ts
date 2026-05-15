import { z } from 'zod'
import { TrpcService } from '../../trpc/trpc.service'
import { MenuService } from './menu.service'

export function createMenuRouter(trpc: TrpcService, menuService: MenuService) {
  return trpc.router({
    list: trpc.protectedProcedure.query(async ({ ctx }) => {
      return menuService.list(ctx.lang)
    }),

    tree: trpc.protectedProcedure
      .input(
        z.object({
          includeInactive: z.boolean().default(false),
        })
      )
      .query(async ({ input, ctx }) => menuService.tree(input.includeInactive, ctx.lang)),

    getUserMenus: trpc.protectedProcedure.query(async ({ ctx }) => {
      return menuService.getUserMenus(ctx.user.userId, ctx.lang)
    }),

    create: trpc.protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          nameEn: z.string().optional(),
          code: z.string().min(1),
          type: z.enum(['DIRECTORY', 'MENU']),
          path: z.string().optional(),
          parentId: z.string().optional(),
          icon: z.string().optional(),
          sort: z.number().default(0),
          status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => menuService.create(input)),

    update: trpc.protectedProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().optional(),
          nameEn: z.string().optional(),
          code: z.string().optional(),
          type: z.enum(['DIRECTORY', 'MENU']).optional(),
          path: z.string().optional(),
          parentId: z.string().optional(),
          icon: z.string().optional(),
          sort: z.number().optional(),
          status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => menuService.update(input)),

    delete: trpc.protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => menuService.delete(input.id)),
  })
}

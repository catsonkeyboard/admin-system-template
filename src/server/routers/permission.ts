import { z } from 'zod'
import { router, protectedProcedure, prisma } from '../trpc'

export const permissionRouter = router({
  // 获取权限列表
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(50),
        menuId: z.string().optional(),
        type: z.enum(['MENU', 'BUTTON', 'DATA']).optional(),
        keyword: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, pageSize, menuId, type, keyword } = input
      const skip = (page - 1) * pageSize

      const where = {
        ...(menuId && { menuId }),
        ...(type && { type }),
        ...(keyword && {
          OR: [
            { name: { contains: keyword } },
            { code: { contains: keyword } },
            { description: { contains: keyword } },
          ],
        }),
      }

      const [total, items] = await Promise.all([
        prisma.permission.count({ where }),
        prisma.permission.findMany({
          where,
          skip,
          take: pageSize,
          include: {
            menu: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
      ])

      const translatedItems = items.map((perm) => ({
        ...perm,
        name: (ctx.lang === 'en' ? perm.nameEn : perm.name) || perm.name,
      }))

      return {
        items: translatedItems,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    }),

  // 创建权限
  create: protectedProcedure
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
    .mutation(async ({ input }) => {
      return prisma.permission.create({
        data: input,
      })
    }),

  // 更新权限
  update: protectedProcedure
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
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input
      return prisma.permission.update({
        where: { id },
        data: updateData,
      })
    }),

  // 删除权限
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.permission.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),
})

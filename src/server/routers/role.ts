import { z } from 'zod'
import { router, protectedProcedure, prisma } from '../trpc'

export const roleRouter = router({
  // 获取角色列表
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(10),
        keyword: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, pageSize, keyword } = input
      const skip = (page - 1) * pageSize

      const where = {
        ...(keyword && {
          OR: [
            { name: { contains: keyword } },
            { code: { contains: keyword } },
            { description: { contains: keyword } },
          ],
        }),
      }

      const [total, items] = await Promise.all([
        prisma.role.count({ where }),
        prisma.role.findMany({
          where,
          skip,
          take: pageSize,
          include: {
            _count: {
              select: {
                userRoles: true,
                rolePermissions: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
      ])

      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    }),

  // 获取角色详情（包含权限）
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return prisma.role.findUnique({
        where: { id: input.id },
        include: {
          rolePermissions: {
            include: {
              permission: {
                include: {
                  menu: true,
                },
              },
            },
          },
        },
      })
    }),

  // 创建角色
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        code: z.string().min(1),
        status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
        description: z.string().optional(),
        permissionIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { permissionIds, ...roleData } = input

      const role = await prisma.role.create({
        data: roleData,
      })

      // 分配权限
      if (permissionIds && permissionIds.length > 0) {
        await prisma.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId: role.id,
            permissionId,
          })),
        })
      }

      return role
    }),

  // 更新角色
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        code: z.string().optional(),
        status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input
      return prisma.role.update({
        where: { id },
        data: updateData,
      })
    }),

  // 更新角色权限
  updatePermissions: protectedProcedure
    .input(
      z.object({
        roleId: z.string(),
        permissionIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const { roleId, permissionIds } = input

      // 删除现有权限
      await prisma.rolePermission.deleteMany({
        where: { roleId },
      })

      // 添加新权限
      if (permissionIds.length > 0) {
        await prisma.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId,
            permissionId,
          })),
        })
      }

      return { success: true }
    }),

  // 删除角色
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // 检查是否有用户使用该角色
      const userCount = await prisma.userRole.count({
        where: { roleId: input.id },
      })

      if (userCount > 0) {
        throw new Error('该角色下还有用户，无法删除')
      }

      await prisma.role.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})

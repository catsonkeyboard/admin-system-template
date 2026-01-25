import { z } from 'zod'
import { router, protectedProcedure, prisma } from '../trpc'

export const menuRouter = router({
  // 获取所有菜单（平铺列表）
  list: protectedProcedure.query(async ({ ctx }) => {
    const menus = await prisma.menu.findMany({
      include: {
        parent: true,
        _count: {
          select: {
            children: true,
            permissions: true,
          },
        },
      },
      orderBy: { sort: 'asc' },
    })

    return menus.map((menu) => ({
      ...menu,
      name: (ctx.lang === 'en' ? menu.nameEn : menu.name) || menu.name,
    }))
  }),
  // 获取菜单树
  tree: protectedProcedure
    .input(
      z.object({
        includeInactive: z.boolean().default(false),
      })
    )
    .query(async ({ input, ctx }) => {
      const menus = await prisma.menu.findMany({
        where: input.includeInactive
          ? {}
          : { status: 'ACTIVE' },
        include: {
          children: {
            include: {
              children: true,
            },
          },
          _count: {
            select: {
              permissions: true,
            },
          },
        },
        orderBy: { sort: 'asc' },
      })

      // 翻译菜单名称
      const translatedMenus = menus.map((menu) => ({
        ...menu,
        name: (ctx.lang === 'en' ? menu.nameEn : menu.name) || menu.name,
      }))

      // 递归构建树形结构
      const buildTree = (parentId: string | null): any[] => {
        return translatedMenus
          .filter((menu) => menu.parentId === parentId)
          .map((menu) => ({
            ...menu,
            children: buildTree(menu.id),
          }))
      }

      return buildTree(null)
    }),

  // 获取用户可访问的菜单
  getUserMenus: protectedProcedure.query(async ({ ctx }) => {
    // 获取用户的所有角色
    const userWithRoles = await prisma.user.findUnique({
      where: { id: ctx.user.userId },
      include: {
        userRoles: {
          include: {
            role: {
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
            },
          },
        },
      },
    })

    if (!userWithRoles) return []

    // 收集所有有权限访问的菜单 ID
    const menuIds = new Set<string>()
    userWithRoles.userRoles.forEach((ur) => {
      ur.role.rolePermissions.forEach((rp) => {
        if (rp.permission.menuId) {
          menuIds.add(rp.permission.menuId)
        }
      })
    })

    // 获取这些菜单及其所有父菜单
    const allMenuIds = new Set(menuIds)
    const getParentMenuIds = async (menuId: string) => {
      const menu = await prisma.menu.findUnique({
        where: { id: menuId },
      })
      if (menu?.parentId && !allMenuIds.has(menu.parentId)) {
        allMenuIds.add(menu.parentId)
        await getParentMenuIds(menu.parentId)
      }
    }

    for (const menuId of menuIds) {
      await getParentMenuIds(menuId)
    }

    // 获取所有菜单数据
    const menus = await prisma.menu.findMany({
      where: {
        id: { in: Array.from(allMenuIds) },
        status: 'ACTIVE',
      },
      orderBy: { sort: 'asc' },
    })

    // 翻译菜单名称
    const translatedMenus = menus.map((menu) => ({
      ...menu,
      name: (ctx.lang === 'en' ? menu.nameEn : menu.name) || menu.name,
    }))

    // 构建树形结构
    const buildTree = (parentId: string | null): any[] => {
      return translatedMenus
        .filter((menu) => menu.parentId === parentId)
        .map((menu) => ({
          ...menu,
          children: buildTree(menu.id),
        }))
    }

    return buildTree(null)
  }),

  // 创建菜单
  create: protectedProcedure
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
    .mutation(async ({ input }) => {
      const existing = await prisma.menu.findUnique({
        where: { code: input.code },
      })

      if (existing) {
        throw new Error('菜单代码已存在')
      }

      return prisma.menu.create({
        data: input,
      })
    }),

  // 更新菜单
  update: protectedProcedure
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
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input

      return prisma.menu.update({
        where: { id },
        data: updateData,
      })
    }),

  // 删除菜单
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const children = await prisma.menu.count({
        where: { parentId: input.id },
      })

      if (children > 0) {
        throw new Error('请先删除子菜单')
      }

      await prisma.menu.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})

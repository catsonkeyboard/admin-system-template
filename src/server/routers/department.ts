import { z } from 'zod'
import { router, protectedProcedure, prisma } from '../trpc'

export const departmentRouter = router({
  // 获取部门树
  tree: protectedProcedure.query(async () => {
    const departments = await prisma.department.findMany({
      include: {
        children: {
          include: {
            children: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: { sort: 'asc' },
    })

    // 递归构建树形结构
    const buildTree = (parentId: string | null): any[] => {
      return departments
        .filter((dept) => dept.parentId === parentId)
        .map((dept) => ({
          ...dept,
          children: buildTree(dept.id),
        }))
    }

    return buildTree(null)
  }),

  // 获取所有部门（平铺列表）
  list: protectedProcedure.query(async () => {
    return prisma.department.findMany({
      include: {
        parent: true,
        _count: {
          select: {
            users: true,
            children: true,
          },
        },
      },
      orderBy: [{ level: 'asc' }, { sort: 'asc' }],
    })
  }),

  // 获取单个部门
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return prisma.department.findUnique({
        where: { id: input.id },
        include: {
          parent: true,
          children: true,
        },
      })
    }),

  // 创建部门
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, '部门名称不能为空'),
        code: z.string().min(1, '部门代码不能为空'),
        parentId: z.string().optional(),
        sort: z.number().default(0),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // 检查代码是否已存在
      const existing = await prisma.department.findUnique({
        where: { code: input.code },
      })

      if (existing) {
        throw new Error('部门代码已存在')
      }

      // 计算层级
      let level = 1
      if (input.parentId) {
        const parent = await prisma.department.findUnique({
          where: { id: input.parentId },
        })
        level = parent ? parent.level + 1 : 1
      }

      return prisma.department.create({
        data: {
          ...input,
          level,
        },
      })
    }),

  // 更新部门
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        code: z.string().optional(),
        parentId: z.string().optional(),
        sort: z.number().optional(),
        status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input

      // 如果修改了父节点，重新计算层级
      if (updateData.parentId !== undefined) {
        let level = 1
        if (updateData.parentId) {
          const parent = await prisma.department.findUnique({
            where: { id: updateData.parentId },
          })
          level = parent ? parent.level + 1 : 1
        }
        return prisma.department.update({
          where: { id },
          data: {
            ...updateData,
            level,
          },
        })
      }

      return prisma.department.update({
        where: { id },
        data: updateData,
      })
    }),

  // 删除部门
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // 检查是否有子部门
      const children = await prisma.department.count({
        where: { parentId: input.id },
      })

      if (children > 0) {
        throw new Error('请先删除子部门')
      }

      // 检查是否有用户
      const users = await prisma.user.count({
        where: { departmentId: input.id },
      })

      if (users > 0) {
        throw new Error('该部门下还有用户，无法删除')
      }

      await prisma.department.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})

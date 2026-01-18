import { z } from 'zod'
import { router, protectedProcedure, prisma } from '../trpc'
import { hashPassword } from '../utils/password'

export const userRouter = router({
  // 获取用户列表（分页）
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(10),
        keyword: z.string().optional(),
        departmentId: z.string().optional(),
        status: z.enum(['ACTIVE', 'INACTIVE', 'LOCKED']).optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, pageSize, keyword, departmentId, status } = input
      const skip = (page - 1) * pageSize

      const where = {
        ...(keyword && {
          OR: [
            { username: { contains: keyword } },
            { realName: { contains: keyword } },
            { phone: { contains: keyword } },
          ],
        }),
        ...(departmentId && { departmentId }),
        ...(status && { status }),
      }

      const [total, items] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
          where,
          skip,
          take: pageSize,
          include: {
            department: true,
            userRoles: {
              include: {
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
      ])

      // 移除密码字段
      const sanitizedItems = items.map(({ password, ...user }) => user)

      return {
        items: sanitizedItems,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    }),

  // 获取单个用户
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { id: input.id },
        include: {
          department: true,
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      })

      if (!user) return null

      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    }),

  // 创建用户
  create: protectedProcedure
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
    .mutation(async ({ input }) => {
      const { roleIds, ...userData } = input

      // 检查用户名是否已存在
      const existing = await prisma.user.findUnique({
        where: { username: userData.username },
      })

      if (existing) {
        throw new Error('用户名已存在')
      }

      // 加密密码
      const hashedPassword = await hashPassword(userData.password)

      // 创建用户
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
        },
      })

      // 分配角色
      if (roleIds && roleIds.length > 0) {
        await prisma.userRole.createMany({
          data: roleIds.map((roleId) => ({
            userId: user.id,
            roleId,
          })),
        })
      }

      return user
    }),

  // 更新用户
  update: protectedProcedure
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
    .mutation(async ({ input }) => {
      const { id, roleIds, ...updateData } = input

      // 更新用户信息
      const user = await prisma.user.update({
        where: { id },
        data: updateData,
      })

      // 更新角色（先删除旧的，再创建新的）
      if (roleIds !== undefined) {
        await prisma.userRole.deleteMany({
          where: { userId: id },
        })

        if (roleIds.length > 0) {
          await prisma.userRole.createMany({
            data: roleIds.map((roleId) => ({
              userId: id,
              roleId,
            })),
          })
        }
      }

      return user
    }),

  // 删除用户
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.user.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),

  // 重置密码
  resetPassword: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        newPassword: z.string().min(6, '密码至少6个字符'),
      })
    )
    .mutation(async ({ input }) => {
      const hashedPassword = await hashPassword(input.newPassword)

      await prisma.user.update({
        where: { id: input.id },
        data: { password: hashedPassword },
      })

      return { success: true }
    }),
})

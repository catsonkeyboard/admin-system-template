import { z } from 'zod'
import { router, publicProcedure, protectedProcedure, prisma } from '../trpc'
import { TRPCError } from '@trpc/server'
import { verifyPassword } from '../utils/password'
import { signToken } from '../utils/jwt'

export const authRouter = router({
  login: publicProcedure
    .input(
      z.object({
        username: z.string().min(1, '用户名不能为空'),
        password: z.string().min(1, '密码不能为空'),
      })
    )
    .mutation(async ({ input }) => {
      const { username, password } = input

      // 查找用户
      const user = await prisma.user.findUnique({
        where: { username },
        include: {
          department: true,
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '用户名或密码错误',
        })
      }

      // 验证密码
      const isValid = await verifyPassword(password, user.password)
      if (!isValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: '用户名或密码错误',
        })
      }

      // 检查账号状态
      if (user.status !== 'ACTIVE') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '账号已被停用或锁定',
        })
      }

      // 检查账号期限
      if (user.accountExpiry && user.accountExpiry < new Date()) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '账号已过期',
        })
      }

      // 生成 token
      const token = signToken({
        userId: user.id,
        username: user.username,
      })

      // 获取用户权限码
      const permissions = user.userRoles.flatMap((ur) =>
        ur.role.rolePermissions.map((rp) => rp.permission.code)
      )

      // 返回用户信息（不包含密码）
      const { password: _, ...userWithoutPassword } = user

      return {
        token,
        user: userWithoutPassword,
        permissions: Array.from(new Set(permissions)), // 去重
      }
    }),

  // 获取当前用户信息
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.user.userId },
      include: {
        department: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    })

    if (!user) {
      return null
    }

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }),
})

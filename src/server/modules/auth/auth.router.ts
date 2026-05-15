import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { TrpcService } from '../../trpc/trpc.service'
import { AuthService } from './auth.service'

export function createAuthRouter(trpc: TrpcService, authService: AuthService) {
  return trpc.router({
    login: trpc.publicProcedure
      .input(
        z.object({
          username: z.string().min(1, '用户名不能为空'),
          password: z.string().min(1, '密码不能为空'),
        })
      )
      .mutation(async ({ input }) => {
        try {
          return await authService.login(input.username, input.password)
        } catch (error: any) {
          throw new TRPCError({
            code: error.message === '用户名或密码错误' ? 'NOT_FOUND' : 'FORBIDDEN',
            message: error.message,
          })
        }
      }),

    me: trpc.protectedProcedure.query(async ({ ctx }) => {
      return authService.me(ctx.user.userId)
    }),
  })
}

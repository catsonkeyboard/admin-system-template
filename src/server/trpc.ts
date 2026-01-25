import { initTRPC, TRPCError } from '@trpc/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken, JWTPayload } from './utils/jwt'
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'

export const prisma = new PrismaClient()

export interface Context {
  user?: JWTPayload
  prisma: typeof prisma
  lang?: string
}

export const createContext = async ({
  req,
}: CreateExpressContextOptions): Promise<Context> => {
  // 从 header 获取 token
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '')

  // 获取语言
  const acceptLanguage = req.headers['accept-language'] || 'en'
  // 简化的语言提取逻辑：如果包含 zh 则默认为 zh，否则为 en
  const lang = acceptLanguage.includes('zh') ? 'zh' : 'en'

  if (!token) {
    return { prisma, lang }
  }

  try {
    const user = verifyToken(token)
    return { user, prisma, lang }
  } catch (error) {
    return { prisma, lang }
  }
}

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: '请先登录' })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      lang: ctx.lang,
    },
  })
})

import { Injectable, Inject } from '@nestjs/common'
import { initTRPC, TRPCError } from '@trpc/server'
import { verifyToken, JWTPayload } from '../utils/jwt'
import { DRIZZLE } from '../database/database.module'
import type { DB } from '../database/database.module'
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'

export interface Context {
  user?: JWTPayload
  db: DB
  lang?: string
}

// 在模块级别创建 tRPC 实例，用于类型推导
const t = initTRPC.context<Context>().create()

@Injectable()
export class TrpcService {
  public readonly router = t.router
  public readonly publicProcedure = t.procedure

  public readonly protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
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

  constructor(@Inject(DRIZZLE) private db: DB) {}

  async createContext({ req }: CreateExpressContextOptions): Promise<Context> {
    // 从 header 获取 token
    const authHeader = req.headers.authorization
    const token = authHeader?.replace('Bearer ', '')

    // 获取语言
    const acceptLanguage = req.headers['accept-language'] || 'en'
    const lang = acceptLanguage.includes('zh') ? 'zh' : 'en'

    if (!token) {
      return { db: this.db, lang }
    }

    try {
      const user = verifyToken(token)
      return { user, db: this.db, lang }
    } catch {
      return { db: this.db, lang }
    }
  }
}

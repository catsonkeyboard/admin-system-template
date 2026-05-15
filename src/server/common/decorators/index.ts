import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common'
import { IS_PUBLIC_KEY } from '../guards/jwt-auth.guard'
import type { JWTPayload } from '../../utils/jwt'

/**
 * 标记接口为公开（不需要认证）
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)

/**
 * 获取当前登录用户信息
 * @example
 * @Get('me')
 * getProfile(@CurrentUser() user: JWTPayload) { ... }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JWTPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user as JWTPayload
    return data ? user?.[data] : user
  },
)

/**
 * 获取请求语言
 */
export const Lang = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest()
    const acceptLanguage = request.headers['accept-language'] || 'en'
    return acceptLanguage.includes('zh') ? 'zh' : 'en'
  },
)

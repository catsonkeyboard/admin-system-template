import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { verifyToken, JWTPayload } from '../../utils/jwt'

export const IS_PUBLIC_KEY = 'isPublic'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 检查是否标记为公开接口
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers.authorization
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      throw new UnauthorizedException('请先登录')
    }

    try {
      const user = verifyToken(token)
      request.user = user
      return true
    } catch {
      throw new UnauthorizedException('Token 无效或已过期')
    }
  }
}

import { Controller, Post, Get, Body, UnauthorizedException, ForbiddenException } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { LoginDto } from './dto'
import { Public, CurrentUser } from '../../common/decorators'
import type { JWTPayload } from '../../utils/jwt'

@ApiTags('认证')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  async login(@Body() dto: LoginDto) {
    try {
      return await this.authService.login(dto.username, dto.password)
    } catch (error: any) {
      if (error.message === '用户名或密码错误') {
        throw new UnauthorizedException(error.message)
      }
      throw new ForbiddenException(error.message)
    }
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '当前用户信息' })
  async me(@CurrentUser() user: JWTPayload) {
    return this.authService.me(user.userId)
  }
}

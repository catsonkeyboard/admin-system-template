import { ApiProperty } from '@nestjs/swagger'

export class LoginDto {
  @ApiProperty({ description: '用户名', example: 'admin' })
  username!: string

  @ApiProperty({ description: '密码', example: 'admin123' })
  password!: string
}

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT Token' })
  token!: string

  @ApiProperty({ description: '用户信息' })
  user!: Record<string, any>

  @ApiProperty({ description: '权限码列表', type: [String] })
  permissions!: string[]
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'zhangsan', minLength: 2 })
  username!: string

  @ApiProperty({ description: '真实姓名', example: '张三' })
  realName!: string

  @ApiProperty({ description: '密码', example: 'password123', minLength: 6 })
  password!: string

  @ApiPropertyOptional({ description: '手机号', example: '13800138000' })
  phone?: string

  @ApiPropertyOptional({ description: '部门ID' })
  departmentId?: string

  @ApiPropertyOptional({ description: '职位' })
  position?: string

  @ApiPropertyOptional({ description: '账号过期时间' })
  accountExpiry?: Date

  @ApiPropertyOptional({ description: '角色ID列表', type: [String] })
  roleIds?: string[]
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: '用户名' })
  username?: string

  @ApiPropertyOptional({ description: '真实姓名' })
  realName?: string

  @ApiPropertyOptional({ description: '手机号' })
  phone?: string

  @ApiPropertyOptional({ description: '部门ID' })
  departmentId?: string

  @ApiPropertyOptional({ description: '职位' })
  position?: string

  @ApiPropertyOptional({ description: '账号过期时间' })
  accountExpiry?: Date

  @ApiPropertyOptional({ description: '账号状态', enum: ['ACTIVE', 'INACTIVE', 'LOCKED'] })
  status?: 'ACTIVE' | 'INACTIVE' | 'LOCKED'

  @ApiPropertyOptional({ description: '角色ID列表', type: [String] })
  roleIds?: string[]
}

export class UserListQueryDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  page?: number

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  pageSize?: number

  @ApiPropertyOptional({ description: '搜索关键词' })
  keyword?: string

  @ApiPropertyOptional({ description: '部门ID' })
  departmentId?: string

  @ApiPropertyOptional({ description: '账号状态', enum: ['ACTIVE', 'INACTIVE', 'LOCKED'] })
  status?: 'ACTIVE' | 'INACTIVE' | 'LOCKED'
}

export class ResetPasswordDto {
  @ApiProperty({ description: '新密码', minLength: 6 })
  newPassword!: string
}

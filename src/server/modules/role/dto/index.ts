import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称' })
  name!: string

  @ApiPropertyOptional({ description: '角色英文名称' })
  nameEn?: string

  @ApiProperty({ description: '角色代码' })
  code!: string

  @ApiPropertyOptional({ description: '状态', enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  status?: 'ACTIVE' | 'INACTIVE'

  @ApiPropertyOptional({ description: '描述' })
  description?: string

  @ApiPropertyOptional({ description: '权限ID列表', type: [String] })
  permissionIds?: string[]
}

export class UpdateRoleDto {
  @ApiPropertyOptional({ description: '角色名称' })
  name?: string

  @ApiPropertyOptional({ description: '角色英文名称' })
  nameEn?: string

  @ApiPropertyOptional({ description: '角色代码' })
  code?: string

  @ApiPropertyOptional({ description: '状态', enum: ['ACTIVE', 'INACTIVE'] })
  status?: 'ACTIVE' | 'INACTIVE'

  @ApiPropertyOptional({ description: '描述' })
  description?: string
}

export class UpdateRolePermissionsDto {
  @ApiProperty({ description: '权限ID列表', type: [String] })
  permissionIds!: string[]
}

export class RoleListQueryDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  page?: number

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  pageSize?: number

  @ApiPropertyOptional({ description: '搜索关键词' })
  keyword?: string
}

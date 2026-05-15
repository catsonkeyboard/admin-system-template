import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreatePermissionDto {
  @ApiProperty({ description: '权限代码' })
  code!: string

  @ApiProperty({ description: '权限名称' })
  name!: string

  @ApiPropertyOptional({ description: '权限英文名称' })
  nameEn?: string

  @ApiPropertyOptional({ description: '关联菜单ID' })
  menuId?: string

  @ApiProperty({ description: '权限类型', enum: ['MENU', 'BUTTON', 'DATA'] })
  type!: 'MENU' | 'BUTTON' | 'DATA'

  @ApiPropertyOptional({ description: '描述' })
  description?: string
}

export class UpdatePermissionDto {
  @ApiPropertyOptional({ description: '权限名称' })
  name?: string

  @ApiPropertyOptional({ description: '权限英文名称' })
  nameEn?: string

  @ApiPropertyOptional({ description: '权限代码' })
  code?: string

  @ApiPropertyOptional({ description: '关联菜单ID' })
  menuId?: string

  @ApiPropertyOptional({ description: '权限类型', enum: ['MENU', 'BUTTON', 'DATA'] })
  type?: 'MENU' | 'BUTTON' | 'DATA'

  @ApiPropertyOptional({ description: '描述' })
  description?: string
}

export class PermissionListQueryDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  page?: number

  @ApiPropertyOptional({ description: '每页数量', default: 50 })
  pageSize?: number

  @ApiPropertyOptional({ description: '菜单ID' })
  menuId?: string

  @ApiPropertyOptional({ description: '权限类型', enum: ['MENU', 'BUTTON', 'DATA'] })
  type?: 'MENU' | 'BUTTON' | 'DATA'

  @ApiPropertyOptional({ description: '搜索关键词' })
  keyword?: string
}

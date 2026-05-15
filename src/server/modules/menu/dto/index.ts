import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateMenuDto {
  @ApiProperty({ description: '菜单名称' })
  name!: string

  @ApiPropertyOptional({ description: '菜单英文名称' })
  nameEn?: string

  @ApiProperty({ description: '菜单代码' })
  code!: string

  @ApiProperty({ description: '类型', enum: ['DIRECTORY', 'MENU'] })
  type!: 'DIRECTORY' | 'MENU'

  @ApiPropertyOptional({ description: '路由路径' })
  path?: string

  @ApiPropertyOptional({ description: '父菜单ID' })
  parentId?: string

  @ApiPropertyOptional({ description: '图标' })
  icon?: string

  @ApiPropertyOptional({ description: '排序', default: 0 })
  sort?: number

  @ApiPropertyOptional({ description: '状态', enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  status?: 'ACTIVE' | 'INACTIVE'

  @ApiPropertyOptional({ description: '描述' })
  description?: string
}

export class UpdateMenuDto {
  @ApiPropertyOptional({ description: '菜单名称' })
  name?: string

  @ApiPropertyOptional({ description: '菜单英文名称' })
  nameEn?: string

  @ApiPropertyOptional({ description: '菜单代码' })
  code?: string

  @ApiPropertyOptional({ description: '类型', enum: ['DIRECTORY', 'MENU'] })
  type?: 'DIRECTORY' | 'MENU'

  @ApiPropertyOptional({ description: '路由路径' })
  path?: string

  @ApiPropertyOptional({ description: '父菜单ID' })
  parentId?: string

  @ApiPropertyOptional({ description: '图标' })
  icon?: string

  @ApiPropertyOptional({ description: '排序' })
  sort?: number

  @ApiPropertyOptional({ description: '状态', enum: ['ACTIVE', 'INACTIVE'] })
  status?: 'ACTIVE' | 'INACTIVE'

  @ApiPropertyOptional({ description: '描述' })
  description?: string
}

export class MenuTreeQueryDto {
  @ApiPropertyOptional({ description: '是否包含停用菜单', default: false })
  includeInactive?: boolean
}

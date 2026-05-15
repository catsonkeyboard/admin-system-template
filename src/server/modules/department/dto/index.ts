import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateDepartmentDto {
  @ApiProperty({ description: '部门名称' })
  name!: string

  @ApiPropertyOptional({ description: '部门英文名称' })
  nameEn?: string

  @ApiProperty({ description: '部门代码' })
  code!: string

  @ApiPropertyOptional({ description: '父部门ID' })
  parentId?: string

  @ApiPropertyOptional({ description: '排序', default: 0 })
  sort?: number

  @ApiPropertyOptional({ description: '描述' })
  description?: string
}

export class UpdateDepartmentDto {
  @ApiPropertyOptional({ description: '部门名称' })
  name?: string

  @ApiPropertyOptional({ description: '部门英文名称' })
  nameEn?: string

  @ApiPropertyOptional({ description: '部门代码' })
  code?: string

  @ApiPropertyOptional({ description: '父部门ID' })
  parentId?: string

  @ApiPropertyOptional({ description: '排序' })
  sort?: number

  @ApiPropertyOptional({ description: '状态', enum: ['ACTIVE', 'INACTIVE'] })
  status?: 'ACTIVE' | 'INACTIVE'

  @ApiPropertyOptional({ description: '描述' })
  description?: string
}

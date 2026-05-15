import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { PermissionService } from './permission.service'
import { CreatePermissionDto, UpdatePermissionDto, PermissionListQueryDto } from './dto'
import { Lang } from '../../common/decorators'

@ApiTags('权限管理')
@ApiBearerAuth()
@Controller('api/permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @ApiOperation({ summary: '获取权限列表（分页）' })
  @ApiResponse({ status: 200, description: '权限列表' })
  async list(@Query() query: PermissionListQueryDto, @Lang() lang: string) {
    return this.permissionService.list({
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 50,
      menuId: query.menuId,
      type: query.type,
      keyword: query.keyword,
    }, lang)
  }

  @Post()
  @ApiOperation({ summary: '创建权限' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() dto: CreatePermissionDto) {
    return this.permissionService.create(dto)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新权限' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    return this.permissionService.update({ id, ...dto })
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除权限' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async delete(@Param('id') id: string) {
    return this.permissionService.delete(id)
  }
}

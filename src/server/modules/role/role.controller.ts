import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { RoleService } from './role.service'
import { CreateRoleDto, UpdateRoleDto, UpdateRolePermissionsDto, RoleListQueryDto } from './dto'
import { Lang } from '../../common/decorators'

@ApiTags('角色管理')
@ApiBearerAuth()
@Controller('api/roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ApiOperation({ summary: '获取角色列表（分页）' })
  @ApiResponse({ status: 200, description: '角色列表' })
  async list(@Query() query: RoleListQueryDto, @Lang() lang: string) {
    return this.roleService.list({
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      keyword: query.keyword,
    }, lang)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取角色详情（包含权限）' })
  @ApiResponse({ status: 200, description: '角色详情' })
  async getById(@Param('id') id: string, @Lang() lang: string) {
    return this.roleService.getById(id, lang)
  }

  @Post()
  @ApiOperation({ summary: '创建角色' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新角色' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.roleService.update({ id, ...dto })
  }

  @Put(':id/permissions')
  @ApiOperation({ summary: '更新角色权限' })
  @ApiResponse({ status: 200, description: '权限更新成功' })
  async updatePermissions(@Param('id') id: string, @Body() dto: UpdateRolePermissionsDto) {
    return this.roleService.updatePermissions(id, dto.permissionIds)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async delete(@Param('id') id: string) {
    return this.roleService.delete(id)
  }
}

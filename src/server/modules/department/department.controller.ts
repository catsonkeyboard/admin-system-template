import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { DepartmentService } from './department.service'
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto'
import { Lang } from '../../common/decorators'

@ApiTags('部门管理')
@ApiBearerAuth()
@Controller('api/departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get('tree')
  @ApiOperation({ summary: '获取部门树' })
  @ApiResponse({ status: 200, description: '部门树形结构' })
  async tree(@Lang() lang: string) {
    return this.departmentService.tree(lang)
  }

  @Get()
  @ApiOperation({ summary: '获取所有部门（平铺列表）' })
  @ApiResponse({ status: 200, description: '部门列表' })
  async list(@Lang() lang: string) {
    return this.departmentService.list(lang)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取部门详情' })
  @ApiResponse({ status: 200, description: '部门详情' })
  async getById(@Param('id') id: string, @Lang() lang: string) {
    return this.departmentService.getById(id, lang)
  }

  @Post()
  @ApiOperation({ summary: '创建部门' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() dto: CreateDepartmentDto) {
    return this.departmentService.create(dto)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新部门' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    return this.departmentService.update({ id, ...dto })
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除部门' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async delete(@Param('id') id: string) {
    return this.departmentService.delete(id)
  }
}

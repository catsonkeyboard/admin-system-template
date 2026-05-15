import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { UserService } from './user.service'
import { CreateUserDto, UpdateUserDto, UserListQueryDto, ResetPasswordDto } from './dto'

@ApiTags('用户管理')
@ApiBearerAuth()
@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: '获取用户列表（分页）' })
  @ApiResponse({ status: 200, description: '用户列表' })
  async list(@Query() query: UserListQueryDto) {
    return this.userService.list({
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
      keyword: query.keyword,
      departmentId: query.departmentId,
      status: query.status,
    })
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户详情' })
  @ApiResponse({ status: 200, description: '用户详情' })
  async getById(@Param('id') id: string) {
    return this.userService.getById(id)
  }

  @Post()
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新用户' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update({ id, ...dto })
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async delete(@Param('id') id: string) {
    return this.userService.delete(id)
  }

  @Post(':id/reset-password')
  @ApiOperation({ summary: '重置用户密码' })
  @ApiResponse({ status: 200, description: '密码重置成功' })
  async resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
    return this.userService.resetPassword(id, dto.newPassword)
  }
}

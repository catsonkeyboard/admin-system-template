import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { MenuService } from './menu.service'
import { CreateMenuDto, UpdateMenuDto, MenuTreeQueryDto } from './dto'
import { CurrentUser, Lang } from '../../common/decorators'
import type { JWTPayload } from '../../utils/jwt'

@ApiTags('菜单管理')
@ApiBearerAuth()
@Controller('api/menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @ApiOperation({ summary: '获取所有菜单（平铺列表）' })
  @ApiResponse({ status: 200, description: '菜单列表' })
  async list(@Lang() lang: string) {
    return this.menuService.list(lang)
  }

  @Get('tree')
  @ApiOperation({ summary: '获取菜单树' })
  @ApiResponse({ status: 200, description: '菜单树形结构' })
  async tree(@Query() query: MenuTreeQueryDto, @Lang() lang: string) {
    return this.menuService.tree(query.includeInactive ?? false, lang)
  }

  @Get('user-menus')
  @ApiOperation({ summary: '获取当前用户可访问的菜单' })
  @ApiResponse({ status: 200, description: '用户菜单树' })
  async getUserMenus(@CurrentUser() user: JWTPayload, @Lang() lang: string) {
    return this.menuService.getUserMenus(user.userId, lang)
  }

  @Post()
  @ApiOperation({ summary: '创建菜单' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() dto: CreateMenuDto) {
    return this.menuService.create(dto)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新菜单' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.menuService.update({ id, ...dto })
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除菜单' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async delete(@Param('id') id: string) {
    return this.menuService.delete(id)
  }
}

import { Injectable, Inject } from '@nestjs/common'
import { DRIZZLE } from '../../database/database.module'
import type { DB } from '../../database/database.module'
import { menus, permissions, userRoles, rolePermissions } from '../../db/schema'
import { eq, asc, count, inArray } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

export interface CreateMenuInput {
  name: string
  nameEn?: string
  code: string
  type: 'DIRECTORY' | 'MENU'
  path?: string
  parentId?: string
  icon?: string
  sort?: number
  status?: 'ACTIVE' | 'INACTIVE'
  description?: string
}

export interface UpdateMenuInput {
  id: string
  name?: string
  nameEn?: string
  code?: string
  type?: 'DIRECTORY' | 'MENU'
  path?: string
  parentId?: string
  icon?: string
  sort?: number
  status?: 'ACTIVE' | 'INACTIVE'
  description?: string
}

@Injectable()
export class MenuService {
  constructor(@Inject(DRIZZLE) private db: DB) {}

  async list(lang?: string) {
    // 查询所有菜单
    const allMenus = await this.db
      .select()
      .from(menus)
      .orderBy(asc(menus.sort))

    // 计算子菜单数量和权限数量
    const childCountMap = new Map<string, number>()
    allMenus.forEach((menu) => {
      if (menu.parentId) {
        childCountMap.set(menu.parentId, (childCountMap.get(menu.parentId) ?? 0) + 1)
      }
    })

    const permCounts = await this.db
      .select({
        menuId: permissions.menuId,
        count: count(),
      })
      .from(permissions)
      .groupBy(permissions.menuId)

    const permCountMap = new Map(
      permCounts.map((row) => [row.menuId, row.count])
    )

    // 构建父菜单映射
    const menuMap = new Map(allMenus.map((m) => [m.id, m]))

    return allMenus.map((menu) => ({
      ...menu,
      name: (lang === 'en' ? menu.nameEn : menu.name) || menu.name,
      parent: menu.parentId ? menuMap.get(menu.parentId) ?? null : null,
      _count: {
        children: childCountMap.get(menu.id) ?? 0,
        permissions: permCountMap.get(menu.id) ?? 0,
      },
    }))
  }

  async tree(includeInactive: boolean = false, lang?: string) {
    // 查询菜单
    const allMenus = includeInactive
      ? await this.db.select().from(menus).orderBy(asc(menus.sort))
      : await this.db.select().from(menus).where(eq(menus.status, 'ACTIVE')).orderBy(asc(menus.sort))

    // 查权限数量
    const permCounts = await this.db
      .select({
        menuId: permissions.menuId,
        count: count(),
      })
      .from(permissions)
      .groupBy(permissions.menuId)

    const permCountMap = new Map(
      permCounts.map((row) => [row.menuId, row.count])
    )

    const translated = allMenus.map((menu) => ({
      ...menu,
      name: (lang === 'en' ? menu.nameEn : menu.name) || menu.name,
      _count: { permissions: permCountMap.get(menu.id) ?? 0 },
    }))

    const buildTree = (parentId: string | null): any[] => {
      return translated
        .filter((menu) => menu.parentId === parentId)
        .map((menu) => ({
          ...menu,
          children: buildTree(menu.id),
        }))
    }

    return buildTree(null)
  }

  async getUserMenus(userId: string, lang?: string) {
    // 查询用户拥有权限的菜单 ID
    const permRows = await this.db
      .select({ menuId: permissions.menuId })
      .from(userRoles)
      .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(userRoles.userId, userId))

    const menuIds = new Set(
      permRows.map((r) => r.menuId).filter((id): id is string => id !== null)
    )

    if (menuIds.size === 0) return []

    // 查询所有启用的菜单
    const allMenus = await this.db
      .select()
      .from(menus)
      .where(eq(menus.status, 'ACTIVE'))
      .orderBy(asc(menus.sort))

    // 将所有需要的菜单 ID 及其祖先 ID 加入集合
    const allMenuIds = new Set(menuIds)
    const menuMap = new Map(allMenus.map((m) => [m.id, m]))

    const addAncestors = (menuId: string) => {
      const menu = menuMap.get(menuId)
      if (menu?.parentId && !allMenuIds.has(menu.parentId)) {
        allMenuIds.add(menu.parentId)
        addAncestors(menu.parentId)
      }
    }
    menuIds.forEach(addAncestors)

    const accessibleMenus = allMenus
      .filter((m) => allMenuIds.has(m.id))
      .map((menu) => ({
        ...menu,
        name: (lang === 'en' ? menu.nameEn : menu.name) || menu.name,
      }))

    const buildTree = (parentId: string | null): any[] => {
      return accessibleMenus
        .filter((menu) => menu.parentId === parentId)
        .map((menu) => ({
          ...menu,
          children: buildTree(menu.id),
        }))
    }

    return buildTree(null)
  }

  async create(input: CreateMenuInput) {
    // 检查代码是否已存在
    const [existing] = await this.db
      .select({ id: menus.id })
      .from(menus)
      .where(eq(menus.code, input.code))
      .limit(1)
    if (existing) throw new Error('菜单代码已存在')

    const id = createId()
    await this.db.insert(menus).values({ ...input, id })

    const [created] = await this.db
      .select()
      .from(menus)
      .where(eq(menus.id, id))
      .limit(1)
    return created
  }

  async update(input: UpdateMenuInput) {
    const { id, ...updateData } = input
    await this.db
      .update(menus)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(menus.id, id))

    const [updated] = await this.db
      .select()
      .from(menus)
      .where(eq(menus.id, id))
      .limit(1)
    return updated
  }

  async delete(id: string) {
    const [{ value: childCount }] = await this.db
      .select({ value: count() })
      .from(menus)
      .where(eq(menus.parentId, id))
    if (childCount > 0) throw new Error('请先删除子菜单')

    await this.db.delete(menus).where(eq(menus.id, id))
    return { success: true }
  }
}

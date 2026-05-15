import { Injectable, Inject } from '@nestjs/common'
import { DRIZZLE } from '../../database/database.module'
import type { DB } from '../../database/database.module'
import { roles, userRoles, rolePermissions, permissions, menus } from '../../db/schema'
import { eq, or, like, count, desc, and, SQL } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

export interface RoleListInput {
  page: number
  pageSize: number
  keyword?: string
}

export interface CreateRoleInput {
  name: string
  nameEn?: string
  code: string
  status?: 'ACTIVE' | 'INACTIVE'
  description?: string
  permissionIds?: string[]
}

export interface UpdateRoleInput {
  id: string
  name?: string
  nameEn?: string
  code?: string
  status?: 'ACTIVE' | 'INACTIVE'
  description?: string
}

@Injectable()
export class RoleService {
  constructor(@Inject(DRIZZLE) private db: DB) {}

  async list(input: RoleListInput, lang?: string) {
    const { page, pageSize, keyword } = input
    const offset = (page - 1) * pageSize

    const conditions: SQL[] = []
    if (keyword) {
      conditions.push(
        or(
          like(roles.name, `%${keyword}%`),
          like(roles.code, `%${keyword}%`),
          like(roles.description, `%${keyword}%`)
        )!
      )
    }
    const where = conditions.length > 0 ? and(...conditions) : undefined

    // 查总数
    const [countResult] = await this.db.select({ value: count() }).from(roles).where(where)
    const total = countResult?.value ?? 0

    // 查角色列表
    const roleRows = await this.db
      .select()
      .from(roles)
      .where(where)
      .orderBy(desc(roles.createdAt))
      .limit(pageSize)
      .offset(offset)

    // 查每个角色的用户数和权限数
    const roleIds = roleRows.map((r) => r.id)

    const userCountRows = roleIds.length > 0
      ? await this.db
          .select({
            roleId: userRoles.roleId,
            count: count(),
          })
          .from(userRoles)
          .groupBy(userRoles.roleId)
      : []

    const permCountRows = roleIds.length > 0
      ? await this.db
          .select({
            roleId: rolePermissions.roleId,
            count: count(),
          })
          .from(rolePermissions)
          .groupBy(rolePermissions.roleId)
      : []

    const userCountMap = new Map(userCountRows.map((r) => [r.roleId, r.count]))
    const permCountMap = new Map(permCountRows.map((r) => [r.roleId, r.count]))

    const items = roleRows.map((role) => ({
      ...role,
      name: (lang === 'en' ? role.nameEn : role.name) || role.name,
      _count: {
        userRoles: userCountMap.get(role.id) ?? 0,
        rolePermissions: permCountMap.get(role.id) ?? 0,
      },
    }))

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  async getById(id: string, lang?: string) {
    // 查角色基本信息
    const [role] = await this.db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1)

    if (!role) return null

    // 查角色关联的权限（含菜单信息）
    const permRows = await this.db
      .select({
        roleId: rolePermissions.roleId,
        permissionId: rolePermissions.permissionId,
        permission: permissions,
        menu: menus,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .leftJoin(menus, eq(permissions.menuId, menus.id))
      .where(eq(rolePermissions.roleId, id))

    const rolePermissionList = permRows.map((row) => ({
      roleId: row.roleId,
      permissionId: row.permissionId,
      permission: {
        ...row.permission,
        menu: row.menu,
      },
    }))

    return {
      ...role,
      name: (lang === 'en' ? role.nameEn : role.name) || role.name,
      rolePermissions: rolePermissionList,
    }
  }

  async create(input: CreateRoleInput) {
    const { permissionIds, ...roleData } = input
    const id = createId()

    await this.db.insert(roles).values({ ...roleData, id })

    if (permissionIds && permissionIds.length > 0) {
      await this.db.insert(rolePermissions).values(
        permissionIds.map((permissionId) => ({ roleId: id, permissionId }))
      )
    }

    const [created] = await this.db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1)
    return created
  }

  async update(input: UpdateRoleInput) {
    const { id, ...updateData } = input
    await this.db
      .update(roles)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(roles.id, id))

    const [updated] = await this.db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1)
    return updated
  }

  async updatePermissions(roleId: string, permissionIds: string[]) {
    await this.db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId))

    if (permissionIds.length > 0) {
      await this.db.insert(rolePermissions).values(
        permissionIds.map((permissionId) => ({ roleId, permissionId }))
      )
    }

    return { success: true }
  }

  async delete(id: string) {
    const [{ value: userCount }] = await this.db
      .select({ value: count() })
      .from(userRoles)
      .where(eq(userRoles.roleId, id))

    if (userCount > 0) {
      throw new Error('该角色下还有用户，无法删除')
    }

    await this.db.delete(roles).where(eq(roles.id, id))
    return { success: true }
  }
}

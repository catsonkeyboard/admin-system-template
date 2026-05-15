import { Injectable, Inject } from '@nestjs/common'
import { DRIZZLE } from '../../database/database.module'
import type { DB } from '../../database/database.module'
import { permissions, menus } from '../../db/schema'
import { eq, and, or, like, count, desc, SQL } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

export interface PermissionListInput {
  page: number
  pageSize: number
  menuId?: string
  type?: 'MENU' | 'BUTTON' | 'DATA'
  keyword?: string
}

export interface CreatePermissionInput {
  code: string
  name: string
  nameEn?: string
  menuId?: string
  type: 'MENU' | 'BUTTON' | 'DATA'
  description?: string
}

export interface UpdatePermissionInput {
  id: string
  name?: string
  nameEn?: string
  code?: string
  menuId?: string
  type?: 'MENU' | 'BUTTON' | 'DATA'
  description?: string
}

@Injectable()
export class PermissionService {
  constructor(@Inject(DRIZZLE) private db: DB) {}

  async list(input: PermissionListInput, lang?: string) {
    const { page, pageSize, menuId, type, keyword } = input
    const offset = (page - 1) * pageSize

    const conditions: SQL[] = []
    if (menuId) conditions.push(eq(permissions.menuId, menuId))
    if (type) conditions.push(eq(permissions.type, type))
    if (keyword) {
      conditions.push(
        or(
          like(permissions.name, `%${keyword}%`),
          like(permissions.code, `%${keyword}%`),
          like(permissions.description, `%${keyword}%`)
        )!
      )
    }
    const where = conditions.length > 0 ? and(...conditions) : undefined

    // 查总数
    const [countResult] = await this.db.select({ value: count() }).from(permissions).where(where)
    const total = countResult?.value ?? 0

    // 查权限列表（LEFT JOIN 菜单）
    const rows = await this.db
      .select({
        permission: permissions,
        menu: menus,
      })
      .from(permissions)
      .leftJoin(menus, eq(permissions.menuId, menus.id))
      .where(where)
      .orderBy(desc(permissions.createdAt))
      .limit(pageSize)
      .offset(offset)

    const items = rows.map((row) => ({
      ...row.permission,
      name: (lang === 'en' ? row.permission.nameEn : row.permission.name) || row.permission.name,
      menu: row.menu,
    }))

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  async create(input: CreatePermissionInput) {
    const id = createId()
    await this.db.insert(permissions).values({ ...input, id })

    const [created] = await this.db
      .select()
      .from(permissions)
      .where(eq(permissions.id, id))
      .limit(1)
    return created
  }

  async update(input: UpdatePermissionInput) {
    const { id, ...updateData } = input
    await this.db
      .update(permissions)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(permissions.id, id))

    const [updated] = await this.db
      .select()
      .from(permissions)
      .where(eq(permissions.id, id))
      .limit(1)
    return updated
  }

  async delete(id: string) {
    await this.db.delete(permissions).where(eq(permissions.id, id))
    return { success: true }
  }
}

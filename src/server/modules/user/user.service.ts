import { Injectable, Inject } from '@nestjs/common'
import { DRIZZLE } from '../../database/database.module'
import type { DB } from '../../database/database.module'
import { users, userRoles, roles, departments } from '../../db/schema'
import type { Department } from '../../db/schema'
import { eq, and, or, like, count, desc, SQL } from 'drizzle-orm'
import { hashPassword } from '../../utils/password'
import { createId } from '@paralleldrive/cuid2'

export interface UserListInput {
  page: number
  pageSize: number
  keyword?: string
  departmentId?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'LOCKED'
}

export interface CreateUserInput {
  username: string
  realName: string
  password: string
  phone?: string
  departmentId?: string
  position?: string
  accountExpiry?: Date
  roleIds?: string[]
}

export interface UpdateUserInput {
  id: string
  username?: string
  realName?: string
  phone?: string
  departmentId?: string
  position?: string
  accountExpiry?: Date
  status?: 'ACTIVE' | 'INACTIVE' | 'LOCKED'
  roleIds?: string[]
}

@Injectable()
export class UserService {
  constructor(@Inject(DRIZZLE) private db: DB) {}

  /** 查询用户详情（含部门+角色），去除密码 */
  private async getUserDetail(userId: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) return null

    // 查询部门
    let department: Department | null = null
    if (user.departmentId) {
      const [dept] = await this.db
        .select()
        .from(departments)
        .where(eq(departments.id, user.departmentId))
        .limit(1)
      department = dept ?? null
    }

    // 查询角色
    const userRoleRows = await this.db
      .select({
        userId: userRoles.userId,
        roleId: userRoles.roleId,
        role: {
          id: roles.id,
          name: roles.name,
          nameEn: roles.nameEn,
          code: roles.code,
          status: roles.status,
        },
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId))

    const { password, ...userWithoutPassword } = user
    return {
      ...userWithoutPassword,
      department,
      userRoles: userRoleRows,
    }
  }

  async list(input: UserListInput) {
    const { page, pageSize, keyword, departmentId, status } = input
    const offset = (page - 1) * pageSize

    const conditions: SQL[] = []
    if (keyword) {
      conditions.push(
        or(
          like(users.username, `%${keyword}%`),
          like(users.realName, `%${keyword}%`),
          like(users.phone, `%${keyword}%`)
        )!
      )
    }
    if (departmentId) conditions.push(eq(users.departmentId, departmentId))
    if (status) conditions.push(eq(users.status, status))

    const where = conditions.length > 0 ? and(...conditions) : undefined

    // 查总数
    const [countResult] = await this.db.select({ value: count() }).from(users).where(where)
    const total = countResult?.value ?? 0

    // 查用户列表（不含关联）
    const userRows = await this.db
      .select()
      .from(users)
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(pageSize)
      .offset(offset)

    // 批量查部门和角色
    const items = await Promise.all(
      userRows.map(async (user) => {
        let department: Department | null = null
        if (user.departmentId) {
          const [dept] = await this.db
            .select()
            .from(departments)
            .where(eq(departments.id, user.departmentId))
            .limit(1)
          department = dept ?? null
        }

        const roleRows = await this.db
          .select({
            userId: userRoles.userId,
            roleId: userRoles.roleId,
            role: {
              id: roles.id,
              name: roles.name,
              nameEn: roles.nameEn,
              code: roles.code,
              status: roles.status,
            },
          })
          .from(userRoles)
          .innerJoin(roles, eq(userRoles.roleId, roles.id))
          .where(eq(userRoles.userId, user.id))

        const { password, ...userWithoutPassword } = user
        return {
          ...userWithoutPassword,
          department,
          userRoles: roleRows,
        }
      })
    )

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  async getById(id: string) {
    return this.getUserDetail(id)
  }

  async create(input: CreateUserInput) {
    const { roleIds, ...userData } = input

    // 检查用户名是否已存在
    const [existing] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, userData.username))
      .limit(1)
    if (existing) throw new Error('用户名已存在')

    // 加密密码
    const hashedPassword = await hashPassword(userData.password)
    const id = createId()

    await this.db.insert(users).values({
      ...userData,
      id,
      password: hashedPassword,
    })

    // 分配角色
    if (roleIds && roleIds.length > 0) {
      await this.db.insert(userRoles).values(
        roleIds.map((roleId) => ({ userId: id, roleId }))
      )
    }

    return this.getUserDetail(id)
  }

  async update(input: UpdateUserInput) {
    const { id, roleIds, ...updateData } = input

    await this.db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))

    // 更新角色
    if (roleIds !== undefined) {
      await this.db.delete(userRoles).where(eq(userRoles.userId, id))
      if (roleIds.length > 0) {
        await this.db.insert(userRoles).values(
          roleIds.map((roleId) => ({ userId: id, roleId }))
        )
      }
    }

    return this.getUserDetail(id)
  }

  async delete(id: string) {
    await this.db.delete(users).where(eq(users.id, id))
    return { success: true }
  }

  async resetPassword(id: string, newPassword: string) {
    const hashedPassword = await hashPassword(newPassword)
    await this.db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, id))
    return { success: true }
  }
}

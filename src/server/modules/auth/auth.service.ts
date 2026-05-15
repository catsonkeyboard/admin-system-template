import { Injectable, Inject } from '@nestjs/common'
import { DRIZZLE } from '../../database/database.module'
import type { DB } from '../../database/database.module'
import { users, userRoles, roles, rolePermissions, permissions, departments } from '../../db/schema'
import type { Department } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { verifyPassword } from '../../utils/password'
import { signToken } from '../../utils/jwt'

@Injectable()
export class AuthService {
  constructor(@Inject(DRIZZLE) private db: DB) {}

  async login(username: string, password: string) {
    // 查找用户
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1)

    if (!user) {
      throw new Error('用户名或密码错误')
    }

    // 验证密码
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      throw new Error('用户名或密码错误')
    }

    // 检查账号状态
    if (user.status !== 'ACTIVE') {
      throw new Error('账号已被停用或锁定')
    }

    // 检查账号期限
    if (user.accountExpiry && user.accountExpiry < new Date()) {
      throw new Error('账号已过期')
    }

    // 查询用户所属部门
    let department: Department | null = null
    if (user.departmentId) {
      const [dept] = await this.db
        .select()
        .from(departments)
        .where(eq(departments.id, user.departmentId))
        .limit(1)
      department = dept ?? null
    }

    // 查询用户的权限码
    const permissionRows = await this.db
      .select({ code: permissions.code })
      .from(userRoles)
      .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(userRoles.userId, user.id))

    const permissionCodes = Array.from(new Set(permissionRows.map((r) => r.code)))

    // 生成 token
    const token = signToken({
      userId: user.id,
      username: user.username,
    })

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user

    return {
      token,
      user: { ...userWithoutPassword, department },
      permissions: permissionCodes,
    }
  }

  async me(userId: string) {
    // 查询用户
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

    // 查询用户角色
    const userRoleRows = await this.db
      .select({
        roleId: roles.id,
        roleName: roles.name,
        roleCode: roles.code,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId))

    const { password: _, ...userWithoutPassword } = user
    return {
      ...userWithoutPassword,
      department,
      roles: userRoleRows,
    }
  }
}

import { Injectable, Inject } from '@nestjs/common'
import { DRIZZLE } from '../../database/database.module'
import type { DB } from '../../database/database.module'
import { departments, users } from '../../db/schema'
import type { Department } from '../../db/schema'
import { eq, count, asc } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

export interface CreateDepartmentInput {
  name: string
  nameEn?: string
  code: string
  parentId?: string
  sort?: number
  description?: string
}

export interface UpdateDepartmentInput {
  id: string
  name?: string
  nameEn?: string
  code?: string
  parentId?: string
  sort?: number
  status?: 'ACTIVE' | 'INACTIVE'
  description?: string
}

@Injectable()
export class DepartmentService {
  constructor(@Inject(DRIZZLE) private db: DB) {}

  async tree(lang?: string) {
    // 查询所有部门
    const allDepts = await this.db
      .select()
      .from(departments)
      .orderBy(asc(departments.sort))

    // 查询每个部门的用户数量
    const userCounts = await this.db
      .select({
        departmentId: users.departmentId,
        count: count(),
      })
      .from(users)
      .groupBy(users.departmentId)

    const userCountMap = new Map(
      userCounts.map((row) => [row.departmentId, row.count])
    )

    const translated = allDepts.map((dept) => ({
      ...dept,
      name: (lang === 'en' ? dept.nameEn : dept.name) || dept.name,
      _count: { users: userCountMap.get(dept.id) ?? 0 },
    }))

    const buildTree = (parentId: string | null): any[] => {
      return translated
        .filter((dept) => dept.parentId === parentId)
        .map((dept) => ({
          ...dept,
          children: buildTree(dept.id),
        }))
    }

    return buildTree(null)
  }

  async list(lang?: string) {
    // 查询所有部门
    const allDepts = await this.db
      .select()
      .from(departments)
      .orderBy(asc(departments.level), asc(departments.sort))

    // 查询每个部门的用户数量
    const userCounts = await this.db
      .select({
        departmentId: users.departmentId,
        count: count(),
      })
      .from(users)
      .groupBy(users.departmentId)

    const userCountMap = new Map(
      userCounts.map((row) => [row.departmentId, row.count])
    )

    // 计算子部门数量
    const childCountMap = new Map<string, number>()
    allDepts.forEach((dept) => {
      if (dept.parentId) {
        childCountMap.set(dept.parentId, (childCountMap.get(dept.parentId) ?? 0) + 1)
      }
    })

    // 构建父部门映射
    const deptMap = new Map(allDepts.map((d) => [d.id, d]))

    return allDepts.map((dept) => ({
      ...dept,
      name: (lang === 'en' ? dept.nameEn : dept.name) || dept.name,
      parent: dept.parentId ? deptMap.get(dept.parentId) ?? null : null,
      _count: {
        users: userCountMap.get(dept.id) ?? 0,
        children: childCountMap.get(dept.id) ?? 0,
      },
    }))
  }

  async getById(id: string, lang?: string) {
    const [dept] = await this.db
      .select()
      .from(departments)
      .where(eq(departments.id, id))
      .limit(1)

    if (!dept) return null

    // 查询父部门
    let parent: Department | null = null
    if (dept.parentId) {
      const [p] = await this.db
        .select()
        .from(departments)
        .where(eq(departments.id, dept.parentId))
        .limit(1)
      parent = p ?? null
    }

    // 查询子部门
    const children = await this.db
      .select()
      .from(departments)
      .where(eq(departments.parentId, id))
      .orderBy(asc(departments.sort))

    return {
      ...dept,
      name: (lang === 'en' ? dept.nameEn : dept.name) || dept.name,
      parent,
      children,
    }
  }

  async create(input: CreateDepartmentInput) {
    // 检查代码是否已存在
    const [existing] = await this.db
      .select({ id: departments.id })
      .from(departments)
      .where(eq(departments.code, input.code))
      .limit(1)
    if (existing) throw new Error('部门代码已存在')

    let level = 1
    if (input.parentId) {
      const [parent] = await this.db
        .select({ level: departments.level })
        .from(departments)
        .where(eq(departments.id, input.parentId))
        .limit(1)
      level = parent ? parent.level + 1 : 1
    }

    const id = createId()
    await this.db.insert(departments).values({ ...input, id, level })

    const [created] = await this.db
      .select()
      .from(departments)
      .where(eq(departments.id, id))
      .limit(1)
    return created
  }

  async update(input: UpdateDepartmentInput) {
    const { id, ...updateData } = input

    let level: number | undefined
    if (updateData.parentId !== undefined) {
      if (updateData.parentId) {
        const [parent] = await this.db
          .select({ level: departments.level })
          .from(departments)
          .where(eq(departments.id, updateData.parentId))
          .limit(1)
        level = parent ? parent.level + 1 : 1
      } else {
        level = 1
      }
    }

    await this.db
      .update(departments)
      .set({ ...updateData, ...(level !== undefined && { level }), updatedAt: new Date() })
      .where(eq(departments.id, id))

    const [updated] = await this.db
      .select()
      .from(departments)
      .where(eq(departments.id, id))
      .limit(1)
    return updated
  }

  async delete(id: string) {
    const [{ value: childCount }] = await this.db
      .select({ value: count() })
      .from(departments)
      .where(eq(departments.parentId, id))

    if (childCount > 0) throw new Error('请先删除子部门')

    const [{ value: userCount }] = await this.db
      .select({ value: count() })
      .from(users)
      .where(eq(users.departmentId, id))

    if (userCount > 0) throw new Error('该部门下还有用户，无法删除')

    await this.db.delete(departments).where(eq(departments.id, id))
    return { success: true }
  }
}

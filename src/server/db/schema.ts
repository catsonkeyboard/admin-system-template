import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

// ============================================================
// 用户表
// ============================================================
export const users = sqliteTable('users', {
  id:            text('id').primaryKey().$defaultFn(() => createId()),
  username:      text('username').notNull().unique(),
  phone:         text('phone').unique(),
  realName:      text('real_name').notNull(),
  password:      text('password').notNull(),
  departmentId:  text('department_id').references(() => departments.id, { onDelete: 'set null' }),
  position:      text('position'),
  accountExpiry: integer('account_expiry', { mode: 'timestamp' }),
  status:        text('status').notNull().default('ACTIVE'), // ACTIVE | INACTIVE | LOCKED
  createdAt:     integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt:     integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const usersRelations = relations(users, ({ one, many }) => ({
  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id],
  }),
  userRoles: many(userRoles),
}))

// ============================================================
// 部门表（树形结构）
// ============================================================
export const departments = sqliteTable('departments', {
  id:          text('id').primaryKey().$defaultFn(() => createId()),
  name:        text('name').notNull(),
  nameEn:      text('name_en'),
  code:        text('code').notNull().unique(),
  parentId:    text('parent_id'),
  level:       integer('level').notNull().default(1),
  sort:        integer('sort').notNull().default(0),
  status:      text('status').notNull().default('ACTIVE'), // ACTIVE | INACTIVE
  description: text('description'),
  createdAt:   integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt:   integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  parent:   one(departments, {
    fields: [departments.parentId],
    references: [departments.id],
    relationName: 'departmentTree',
  }),
  children: many(departments, { relationName: 'departmentTree' }),
  users:    many(users),
}))

// ============================================================
// 菜单表（树形结构）
// ============================================================
export const menus = sqliteTable('menus', {
  id:          text('id').primaryKey().$defaultFn(() => createId()),
  name:        text('name').notNull(),
  nameEn:      text('name_en'),
  code:        text('code').notNull().unique(),
  type:        text('type').notNull(), // DIRECTORY | MENU
  path:        text('path'),
  parentId:    text('parent_id'),
  icon:        text('icon'),
  sort:        integer('sort').notNull().default(0),
  status:      text('status').notNull().default('ACTIVE'), // ACTIVE | INACTIVE
  description: text('description'),
  createdAt:   integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt:   integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const menusRelations = relations(menus, ({ one, many }) => ({
  parent:      one(menus, {
    fields: [menus.parentId],
    references: [menus.id],
    relationName: 'menuTree',
  }),
  children:    many(menus, { relationName: 'menuTree' }),
  permissions: many(permissions),
}))

// ============================================================
// 权限码表
// ============================================================
export const permissions = sqliteTable('permissions', {
  id:          text('id').primaryKey().$defaultFn(() => createId()),
  code:        text('code').notNull().unique(),
  name:        text('name').notNull(),
  nameEn:      text('name_en'),
  menuId:      text('menu_id').references(() => menus.id, { onDelete: 'cascade' }),
  type:        text('type').notNull(), // MENU | BUTTON | DATA
  description: text('description'),
  createdAt:   integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt:   integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const permissionsRelations = relations(permissions, ({ one, many }) => ({
  menu:            one(menus, {
    fields: [permissions.menuId],
    references: [menus.id],
  }),
  rolePermissions: many(rolePermissions),
}))

// ============================================================
// 角色表
// ============================================================
export const roles = sqliteTable('roles', {
  id:          text('id').primaryKey().$defaultFn(() => createId()),
  name:        text('name').notNull(),
  nameEn:      text('name_en'),
  code:        text('code').notNull().unique(),
  description: text('description'),
  status:      text('status').notNull().default('ACTIVE'), // ACTIVE | INACTIVE
  createdAt:   integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt:   integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles:       many(userRoles),
  rolePermissions: many(rolePermissions),
}))

// ============================================================
// 用户-角色关联表（多对多）
// ============================================================
export const userRoles = sqliteTable('user_roles', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: text('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.roleId] }),
}))

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
}))

// ============================================================
// 角色-权限关联表（多对多）
// ============================================================
export const rolePermissions = sqliteTable('role_permissions', {
  roleId:       text('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: text('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
}))

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role:       one(roles, { fields: [rolePermissions.roleId], references: [roles.id] }),
  permission: one(permissions, { fields: [rolePermissions.permissionId], references: [permissions.id] }),
}))

// ============================================================
// 导出所有类型（供 routers 使用）
// ============================================================
export type User           = typeof users.$inferSelect
export type NewUser        = typeof users.$inferInsert
export type Department     = typeof departments.$inferSelect
export type NewDepartment  = typeof departments.$inferInsert
export type Menu           = typeof menus.$inferSelect
export type NewMenu        = typeof menus.$inferInsert
export type Permission     = typeof permissions.$inferSelect
export type NewPermission  = typeof permissions.$inferInsert
export type Role           = typeof roles.$inferSelect
export type NewRole        = typeof roles.$inferInsert
export type UserRole       = typeof userRoles.$inferSelect
export type RolePermission = typeof rolePermissions.$inferSelect

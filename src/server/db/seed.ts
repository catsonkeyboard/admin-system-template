import bcrypt from 'bcrypt'
import { db } from './index'
import {
  departments,
  menus,
  permissions,
  roles,
  users,
  userRoles,
  rolePermissions,
} from './schema'
import { createId } from '@paralleldrive/cuid2'

async function main() {
  console.log('🌱 开始种子数据...')

  // 先删除所有现有数据（顺序很重要，避免外键约束错误）
  console.log('🔄 清除现有数据...')
  db.delete(rolePermissions).run()
  db.delete(userRoles).run()
  db.delete(permissions).run()
  db.delete(menus).run()
  db.delete(users).run()
  db.delete(roles).run()
  db.delete(departments).run()
  console.log('✅ 现有数据清除完成')

  // 1. 创建部门
  const rootDeptId = createId()
  const techDeptId = createId()
  const hrDeptId   = createId()

  db.insert(departments).values([
    { id: rootDeptId, name: '总公司',    nameEn: 'Headquarters',        code: 'ROOT', level: 1, sort: 1 },
    { id: techDeptId, name: '技术部',    nameEn: 'Technology Department', code: 'TECH', parentId: rootDeptId, level: 2, sort: 1 },
    { id: hrDeptId,   name: '人力资源部', nameEn: 'Human Resources',       code: 'HR',   parentId: rootDeptId, level: 2, sort: 2 },
  ]).run()

  console.log('✅ 部门创建完成')

  // 2. 创建菜单
  const systemMenuId = createId()
  const userMenuId   = createId()
  const deptMenuId   = createId()
  const menuMenuId   = createId()
  const permMenuId   = createId()
  const roleMenuId   = createId()

  db.insert(menus).values([
    { id: systemMenuId, name: '系统管理', nameEn: 'System Management',    code: 'system',     type: 'DIRECTORY', icon: 'Settings',   sort: 1 },
    { id: userMenuId,   name: '用户管理', nameEn: 'User Management',      code: 'user',       type: 'MENU',      path: '/system/user',       parentId: systemMenuId, icon: 'Users',      sort: 1 },
    { id: deptMenuId,   name: '部门管理', nameEn: 'Department Management', code: 'department', type: 'MENU',      path: '/system/department', parentId: systemMenuId, icon: 'Building2',  sort: 2 },
    { id: menuMenuId,   name: '菜单管理', nameEn: 'Menu Management',       code: 'menu',       type: 'MENU',      path: '/system/menu',       parentId: systemMenuId, icon: 'Menu',       sort: 3 },
    { id: permMenuId,   name: '权限管理', nameEn: 'Permission Management', code: 'permission', type: 'MENU',      path: '/system/permission', parentId: systemMenuId, icon: 'ShieldCheck',sort: 4 },
    { id: roleMenuId,   name: '角色管理', nameEn: 'Role Management',       code: 'role',       type: 'MENU',      path: '/system/role',       parentId: systemMenuId, icon: 'UserCog',    sort: 5 },
  ]).run()

  console.log('✅ 菜单创建完成')

  // 3. 创建权限码
  const permissionData = [
    // 用户管理权限
    { id: createId(), code: 'user:view',      name: '查看用户', nameEn: 'View User',        menuId: userMenuId, type: 'MENU'   },
    { id: createId(), code: 'user:create',    name: '创建用户', nameEn: 'Create User',      menuId: userMenuId, type: 'BUTTON' },
    { id: createId(), code: 'user:edit',      name: '编辑用户', nameEn: 'Edit User',        menuId: userMenuId, type: 'BUTTON' },
    { id: createId(), code: 'user:delete',    name: '删除用户', nameEn: 'Delete User',      menuId: userMenuId, type: 'BUTTON' },
    { id: createId(), code: 'user:reset-pwd', name: '重置密码', nameEn: 'Reset Password',   menuId: userMenuId, type: 'BUTTON' },
    // 部门管理权限
    { id: createId(), code: 'dept:view',   name: '查看部门', nameEn: 'View Department',   menuId: deptMenuId, type: 'MENU'   },
    { id: createId(), code: 'dept:create', name: '创建部门', nameEn: 'Create Department', menuId: deptMenuId, type: 'BUTTON' },
    { id: createId(), code: 'dept:edit',   name: '编辑部门', nameEn: 'Edit Department',   menuId: deptMenuId, type: 'BUTTON' },
    { id: createId(), code: 'dept:delete', name: '删除部门', nameEn: 'Delete Department', menuId: deptMenuId, type: 'BUTTON' },
    // 菜单管理权限
    { id: createId(), code: 'menu:view',   name: '查看菜单', nameEn: 'View Menu',   menuId: menuMenuId, type: 'MENU'   },
    { id: createId(), code: 'menu:create', name: '创建菜单', nameEn: 'Create Menu', menuId: menuMenuId, type: 'BUTTON' },
    { id: createId(), code: 'menu:edit',   name: '编辑菜单', nameEn: 'Edit Menu',   menuId: menuMenuId, type: 'BUTTON' },
    { id: createId(), code: 'menu:delete', name: '删除菜单', nameEn: 'Delete Menu', menuId: menuMenuId, type: 'BUTTON' },
    // 权限管理权限
    { id: createId(), code: 'perm:view',   name: '查看权限', nameEn: 'View Permission',   menuId: permMenuId, type: 'MENU'   },
    { id: createId(), code: 'perm:create', name: '创建权限', nameEn: 'Create Permission', menuId: permMenuId, type: 'BUTTON' },
    { id: createId(), code: 'perm:edit',   name: '编辑权限', nameEn: 'Edit Permission',   menuId: permMenuId, type: 'BUTTON' },
    { id: createId(), code: 'perm:delete', name: '删除权限', nameEn: 'Delete Permission', menuId: permMenuId, type: 'BUTTON' },
    // 角色管理权限
    { id: createId(), code: 'role:view',        name: '查看角色', nameEn: 'View Role',        menuId: roleMenuId, type: 'MENU'   },
    { id: createId(), code: 'role:create',      name: '创建角色', nameEn: 'Create Role',      menuId: roleMenuId, type: 'BUTTON' },
    { id: createId(), code: 'role:edit',        name: '编辑角色', nameEn: 'Edit Role',        menuId: roleMenuId, type: 'BUTTON' },
    { id: createId(), code: 'role:delete',      name: '删除角色', nameEn: 'Delete Role',      menuId: roleMenuId, type: 'BUTTON' },
    { id: createId(), code: 'role:assign-perm', name: '分配权限', nameEn: 'Assign Permission',menuId: roleMenuId, type: 'BUTTON' },
  ] as const

  db.insert(permissions).values(permissionData as unknown as any[]).run()
  console.log('✅ 权限码创建完成')

  // 4. 创建角色
  const adminRoleId = createId()
  const userRoleId  = createId()

  db.insert(roles).values([
    { id: adminRoleId, name: '超级管理员', nameEn: 'Super Admin',   code: 'ADMIN', description: '拥有系统所有权限' },
    { id: userRoleId,  name: '普通用户',   nameEn: 'Common User',   code: 'USER',  description: '普通用户角色' },
  ]).run()

  console.log('✅ 角色创建完成')

  // 5. 为管理员角色分配所有权限
  db.insert(rolePermissions).values(
    permissionData.map((perm) => ({ roleId: adminRoleId, permissionId: perm.id }))
  ).run()

  console.log('✅ 管理员权限分配完成')

  // 6. 创建管理员用户
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUserId = createId()

  db.insert(users).values({
    id:           adminUserId,
    username:     'admin',
    realName:     '系统管理员',
    password:     hashedPassword,
    phone:        '13800138000',
    departmentId: rootDeptId,
    position:     '系统管理员',
    status:       'ACTIVE',
  }).run()

  // 7. 分配角色给用户
  db.insert(userRoles).values({ userId: adminUserId, roleId: adminRoleId }).run()

  console.log('✅ 管理员用户创建完成')
  console.log('\n🎉 种子数据创建成功！')
  console.log('📝 默认管理员账号: admin / admin123')
}

main().catch((e) => {
  console.error('❌ 种子数据创建失败:', e)
  process.exit(1)
})

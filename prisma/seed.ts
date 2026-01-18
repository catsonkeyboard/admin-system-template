import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始种子数据...')

  // 先删除所有现有数据（顺序很重要，避免外键约束错误）
  console.log('🔄 清除现有数据...')
  await prisma.rolePermission.deleteMany()
  await prisma.userRole.deleteMany()
  await prisma.permission.deleteMany()
  await prisma.menu.deleteMany()
  await prisma.user.deleteMany()
  await prisma.role.deleteMany()
  await prisma.department.deleteMany()
  console.log('✅ 现有数据清除完成')

  // 1. 创建部门
  const rootDept = await prisma.department.create({
    data: {
      name: '总公司',
      code: 'ROOT',
      level: 1,
      sort: 1,
    },
  })

  const techDept = await prisma.department.create({
    data: {
      name: '技术部',
      code: 'TECH',
      parentId: rootDept.id,
      level: 2,
      sort: 1,
    },
  })

  const hrDept = await prisma.department.create({
    data: {
      name: '人力资源部',
      code: 'HR',
      parentId: rootDept.id,
      level: 2,
      sort: 2,
    },
  })

  console.log('✅ 部门创建完成')

  // 2. 创建菜单
  const systemMenu = await prisma.menu.create({
    data: {
      name: '系统管理',
      code: 'system',
      type: 'DIRECTORY',
      icon: 'Settings',
      sort: 1,
    },
  })

  const userMenu = await prisma.menu.create({
    data: {
      name: '用户管理',
      code: 'user',
      type: 'MENU',
      path: '/system/user',
      parentId: systemMenu.id,
      icon: 'Users',
      sort: 1,
    },
  })

  const deptMenu = await prisma.menu.create({
    data: {
      name: '部门管理',
      code: 'department',
      type: 'MENU',
      path: '/system/department',
      parentId: systemMenu.id,
      icon: 'Building2',
      sort: 2,
    },
  })

  const menuMenu = await prisma.menu.create({
    data: {
      name: '菜单管理',
      code: 'menu',
      type: 'MENU',
      path: '/system/menu',
      parentId: systemMenu.id,
      icon: 'Menu',
      sort: 3,
    },
  })

  const permMenu = await prisma.menu.create({
    data: {
      name: '权限管理',
      code: 'permission',
      type: 'MENU',
      path: '/system/permission',
      parentId: systemMenu.id,
      icon: 'ShieldCheck',
      sort: 4,
    },
  })

  const roleMenu = await prisma.menu.create({
    data: {
      name: '角色管理',
      code: 'role',
      type: 'MENU',
      path: '/system/role',
      parentId: systemMenu.id,
      icon: 'UserCog',
      sort: 5,
    },
  })

  console.log('✅ 菜单创建完成')

  // 3. 创建权限码
  await prisma.permission.createMany({
    data: [
      // 用户管理权限
      { code: 'user:view', name: '查看用户', menuId: userMenu.id, type: 'MENU' },
      { code: 'user:create', name: '创建用户', menuId: userMenu.id, type: 'BUTTON' },
      { code: 'user:edit', name: '编辑用户', menuId: userMenu.id, type: 'BUTTON' },
      { code: 'user:delete', name: '删除用户', menuId: userMenu.id, type: 'BUTTON' },
      { code: 'user:reset-pwd', name: '重置密码', menuId: userMenu.id, type: 'BUTTON' },

      // 部门管理权限
      { code: 'dept:view', name: '查看部门', menuId: deptMenu.id, type: 'MENU' },
      { code: 'dept:create', name: '创建部门', menuId: deptMenu.id, type: 'BUTTON' },
      { code: 'dept:edit', name: '编辑部门', menuId: deptMenu.id, type: 'BUTTON' },
      { code: 'dept:delete', name: '删除部门', menuId: deptMenu.id, type: 'BUTTON' },

      // 菜单管理权限
      { code: 'menu:view', name: '查看菜单', menuId: menuMenu.id, type: 'MENU' },
      { code: 'menu:create', name: '创建菜单', menuId: menuMenu.id, type: 'BUTTON' },
      { code: 'menu:edit', name: '编辑菜单', menuId: menuMenu.id, type: 'BUTTON' },
      { code: 'menu:delete', name: '删除菜单', menuId: menuMenu.id, type: 'BUTTON' },

      // 权限管理权限
      { code: 'perm:view', name: '查看权限', menuId: permMenu.id, type: 'MENU' },
      { code: 'perm:create', name: '创建权限', menuId: permMenu.id, type: 'BUTTON' },
      { code: 'perm:edit', name: '编辑权限', menuId: permMenu.id, type: 'BUTTON' },
      { code: 'perm:delete', name: '删除权限', menuId: permMenu.id, type: 'BUTTON' },

      // 角色管理权限
      { code: 'role:view', name: '查看角色', menuId: roleMenu.id, type: 'MENU' },
      { code: 'role:create', name: '创建角色', menuId: roleMenu.id, type: 'BUTTON' },
      { code: 'role:edit', name: '编辑角色', menuId: roleMenu.id, type: 'BUTTON' },
      { code: 'role:delete', name: '删除角色', menuId: roleMenu.id, type: 'BUTTON' },
      { code: 'role:assign-perm', name: '分配权限', menuId: roleMenu.id, type: 'BUTTON' },
    ],
  })

  console.log('✅ 权限码创建完成')

  // 4. 创建角色
  const adminRole = await prisma.role.create({
    data: {
      name: '超级管理员',
      code: 'ADMIN',
      description: '拥有系统所有权限',
    },
  })

  const userRole = await prisma.role.create({
    data: {
      name: '普通用户',
      code: 'USER',
      description: '普通用户角色',
    },
  })

  console.log('✅ 角色创建完成')

  // 5. 为管理员角色分配所有权限
  const allPermissions = await prisma.permission.findMany()
  await prisma.rolePermission.createMany({
    data: allPermissions.map(perm => ({
      roleId: adminRole.id,
      permissionId: perm.id,
    })),
  })

  console.log('✅ 管理员权限分配完成')

  // 6. 创建管理员用户
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      realName: '系统管理员',
      password: hashedPassword,
      phone: '13800138000',
      departmentId: rootDept.id,
      position: '系统管理员',
      status: 'ACTIVE',
    },
  })

  // 7. 分配角色给用户
  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  })

  console.log('✅ 管理员用户创建完成')
  console.log('\n🎉 种子数据创建成功！')
  console.log('📝 默认管理员账号: admin / admin123')
}

main()
  .catch((e) => {
    console.error('❌ 种子数据创建失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

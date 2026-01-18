# Admin 管理系统完整实现指南

## 目录
1. [项目初始化](#1-项目初始化)
2. [数据库设计](#2-数据库设计)
3. [后端实现](#3-后端实现)
4. [前端基础配置](#4-前端基础配置)
5. [布局与路由](#5-布局与路由)
6. [功能模块实现](#6-功能模块实现)
7. [权限控制](#7-权限控制)
8. [部署指南](#8-部署指南)

---

## 1. 项目初始化

### 1.1 创建项目目录结构

```bash
mkdir admin-system && cd admin-system
npm init -y
```

### 1.2 安装依赖

```bash
# 核心依赖
npm install react react-dom react-router-dom
npm install @tanstack/react-query @trpc/client @trpc/server @trpc/react-query
npm install zustand
npm install @prisma/client
npm install zod
npm install bcrypt jsonwebtoken
npm install date-fns clsx tailwind-merge
npm install lucide-react

# 开发依赖
npm install -D typescript @types/react @types/react-dom @types/node
npm install -D vite @vitejs/plugin-react
npm install -D tailwindcss postcss autoprefixer
npm install -D prisma
npm install -D @types/bcrypt @types/jsonwebtoken
npm install -D tsx

# React Hook Form
npm install react-hook-form @hookform/resolvers
```

### 1.3 项目目录结构

```
admin-system/
├── prisma/
│   ├── schema.prisma           # 数据库 Schema
│   └── seed.ts                 # 种子数据
├── src/
│   ├── server/                 # 后端代码
│   │   ├── routers/           # tRPC 路由
│   │   │   ├── auth.ts
│   │   │   ├── user.ts
│   │   │   ├── department.ts
│   │   │   ├── menu.ts
│   │   │   ├── permission.ts
│   │   │   ├── role.ts
│   │   │   └── index.ts
│   │   ├── middleware/        # 中间件
│   │   │   └── auth.ts
│   │   ├── utils/            # 工具函数
│   │   │   ├── jwt.ts
│   │   │   └── password.ts
│   │   ├── trpc.ts           # tRPC 配置
│   │   └── index.ts          # 服务器入口
│   ├── client/                # 前端代码
│   │   ├── components/       # 组件
│   │   │   ├── ui/          # shadcn 组件
│   │   │   ├── layout/      # 布局组件
│   │   │   │   ├── AppLayout.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── TabBar.tsx
│   │   │   ├── common/      # 通用组件
│   │   │   │   ├── DataTable.tsx
│   │   │   │   ├── TreeSelect.tsx
│   │   │   │   └── FormDialog.tsx
│   │   │   └── modules/     # 业务模块组件
│   │   │       ├── user/
│   │   │       ├── department/
│   │   │       ├── menu/
│   │   │       ├── permission/
│   │   │       └── role/
│   │   ├── pages/           # 页面
│   │   │   ├── Login.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   ├── DepartmentManagement.tsx
│   │   │   ├── MenuManagement.tsx
│   │   │   ├── PermissionManagement.tsx
│   │   │   └── RoleManagement.tsx
│   │   ├── stores/          # Zustand 状态管理
│   │   │   ├── userStore.ts
│   │   │   ├── tabStore.ts
│   │   │   └── menuStore.ts
│   │   ├── hooks/           # 自定义 Hooks
│   │   │   ├── useAuth.ts
│   │   │   └── usePermission.ts
│   │   ├── utils/           # 工具函数
│   │   │   ├── trpc.ts
│   │   │   └── cn.ts
│   │   ├── types/           # 类型定义
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── shared/              # 共享代码
│       └── types.ts
├── .env                     # 环境变量
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

### 1.4 配置文件

**tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/server/*": ["./src/server/*"],
      "@/client/*": ["./src/client/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**vite.config.ts**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/server': path.resolve(__dirname, './src/server'),
      '@/client': path.resolve(__dirname, './src/client'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/trpc': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
```

**tailwind.config.js**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

**.env**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/admin_system"
# 或开发环境使用 SQLite
# DATABASE_URL="file:./dev.db"

JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="2h"
REFRESH_TOKEN_EXPIRES_IN="7d"
```

---

## 2. 数据库设计

### 2.1 Prisma Schema

**prisma/schema.prisma**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 用户状态枚举
enum UserStatus {
  ACTIVE    // 激活
  INACTIVE  // 停用
  LOCKED    // 锁定
}

// 菜单类型枚举
enum MenuType {
  DIRECTORY // 目录
  MENU      // 菜单
}

// 权限类型枚举
enum PermissionType {
  MENU   // 菜单权限
  BUTTON // 按钮权限
  DATA   // 数据权限
}

// 用户表
model User {
  id            String     @id @default(cuid())
  username      String     @unique
  phone         String?    @unique
  realName      String
  password      String
  departmentId  String?
  department    Department? @relation(fields: [departmentId], references: [id])
  position      String?    // 岗位
  accountExpiry DateTime?  // 账号期限
  status        UserStatus @default(ACTIVE)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  // 关联
  userRoles     UserRole[]

  @@index([username])
  @@index([phone])
  @@index([departmentId])
}

// 部门表（树形结构）
model Department {
  id        String       @id @default(cuid())
  name      String
  code      String       @unique
  parentId  String?
  parent    Department?  @relation("DepartmentTree", fields: [parentId], references: [id], onDelete: Cascade)
  children  Department[] @relation("DepartmentTree")
  level     Int          @default(1)
  sort      Int          @default(0)
  status    UserStatus   @default(ACTIVE)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  // 关联
  users     User[]

  @@index([parentId])
  @@index([code])
}

// 菜单表（树形结构）
model Menu {
  id          String       @id @default(cuid())
  name        String
  code        String       @unique
  type        MenuType
  path        String?      // 路由路径
  parentId    String?
  parent      Menu?        @relation("MenuTree", fields: [parentId], references: [id], onDelete: Cascade)
  children    Menu[]       @relation("MenuTree")
  icon        String?      // 图标名称（lucide-react）
  sort        Int          @default(0)
  status      UserStatus   @default(ACTIVE)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  // 关联
  permissions Permission[]

  @@index([parentId])
  @@index([code])
}

// 权限码表
model Permission {
  id          String         @id @default(cuid())
  code        String         @unique
  name        String
  menuId      String?
  menu        Menu?          @relation(fields: [menuId], references: [id], onDelete: Cascade)
  type        PermissionType
  description String?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  // 关联
  rolePermissions RolePermission[]

  @@index([code])
  @@index([menuId])
}

// 角色表
model Role {
  id          String     @id @default(cuid())
  name        String
  code        String     @unique
  description String?
  status      UserStatus @default(ACTIVE)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  // 关联
  userRoles       UserRole[]
  rolePermissions RolePermission[]

  @@index([code])
}

// 用户-角色关联表（多对多）
model UserRole {
  userId String
  roleId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  role   Role   @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@id([userId, roleId])
  @@index([userId])
  @@index([roleId])
}

// 角色-权限关联表（多对多）
model RolePermission {
  roleId       String
  permissionId String
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
  @@index([roleId])
  @@index([permissionId])
}
```

### 2.2 种子数据

**prisma/seed.ts**
```typescript
import { PrismaClient, UserStatus, MenuType, PermissionType } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('开始种子数据...')

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

  // 2. 创建菜单
  const systemMenu = await prisma.menu.create({
    data: {
      name: '系统管理',
      code: 'system',
      type: MenuType.DIRECTORY,
      icon: 'Settings',
      sort: 1,
    },
  })

  const userMenu = await prisma.menu.create({
    data: {
      name: '用户管理',
      code: 'user',
      type: MenuType.MENU,
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
      type: MenuType.MENU,
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
      type: MenuType.MENU,
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
      type: MenuType.MENU,
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
      type: MenuType.MENU,
      path: '/system/role',
      parentId: systemMenu.id,
      icon: 'UserCog',
      sort: 5,
    },
  })

  // 3. 创建权限码
  const permissions = await prisma.permission.createMany({
    data: [
      // 用户管理权限
      { code: 'user:view', name: '查看用户', menuId: userMenu.id, type: PermissionType.MENU },
      { code: 'user:create', name: '创建用户', menuId: userMenu.id, type: PermissionType.BUTTON },
      { code: 'user:edit', name: '编辑用户', menuId: userMenu.id, type: PermissionType.BUTTON },
      { code: 'user:delete', name: '删除用户', menuId: userMenu.id, type: PermissionType.BUTTON },
      { code: 'user:reset-pwd', name: '重置密码', menuId: userMenu.id, type: PermissionType.BUTTON },

      // 部门管理权限
      { code: 'dept:view', name: '查看部门', menuId: deptMenu.id, type: PermissionType.MENU },
      { code: 'dept:create', name: '创建部门', menuId: deptMenu.id, type: PermissionType.BUTTON },
      { code: 'dept:edit', name: '编辑部门', menuId: deptMenu.id, type: PermissionType.BUTTON },
      { code: 'dept:delete', name: '删除部门', menuId: deptMenu.id, type: PermissionType.BUTTON },

      // 菜单管理权限
      { code: 'menu:view', name: '查看菜单', menuId: menuMenu.id, type: PermissionType.MENU },
      { code: 'menu:create', name: '创建菜单', menuId: menuMenu.id, type: PermissionType.BUTTON },
      { code: 'menu:edit', name: '编辑菜单', menuId: menuMenu.id, type: PermissionType.BUTTON },
      { code: 'menu:delete', name: '删除菜单', menuId: menuMenu.id, type: PermissionType.BUTTON },

      // 权限管理权限
      { code: 'perm:view', name: '查看权限', menuId: permMenu.id, type: PermissionType.MENU },
      { code: 'perm:create', name: '创建权限', menuId: permMenu.id, type: PermissionType.BUTTON },
      { code: 'perm:edit', name: '编辑权限', menuId: permMenu.id, type: PermissionType.BUTTON },
      { code: 'perm:delete', name: '删除权限', menuId: permMenu.id, type: PermissionType.BUTTON },

      // 角色管理权限
      { code: 'role:view', name: '查看角色', menuId: roleMenu.id, type: PermissionType.MENU },
      { code: 'role:create', name: '创建角色', menuId: roleMenu.id, type: PermissionType.BUTTON },
      { code: 'role:edit', name: '编辑角色', menuId: roleMenu.id, type: PermissionType.BUTTON },
      { code: 'role:delete', name: '删除角色', menuId: roleMenu.id, type: PermissionType.BUTTON },
      { code: 'role:assign-perm', name: '分配权限', menuId: roleMenu.id, type: PermissionType.BUTTON },
    ],
  })

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

  // 5. 为管理员角色分配所有权限
  const allPermissions = await prisma.permission.findMany()
  await prisma.rolePermission.createMany({
    data: allPermissions.map(perm => ({
      roleId: adminRole.id,
      permissionId: perm.id,
    })),
  })

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
      status: UserStatus.ACTIVE,
    },
  })

  // 7. 分配角色给用户
  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  })

  console.log('种子数据创建完成！')
  console.log('默认管理员账号: admin / admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### 2.3 数据库初始化命令

```bash
# 生成 Prisma Client
npx prisma generate

# 推送数据库 Schema（开发环境）
npx prisma db push

# 或创建迁移（生产环境）
npx prisma migrate dev --name init

# 运行种子数据
npx tsx prisma/seed.ts

# 打开 Prisma Studio 查看数据
npx prisma studio
```

---

## 3. 后端实现

### 3.1 工具函数

**src/server/utils/password.ts**
```typescript
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}
```

**src/server/utils/jwt.ts**
```typescript
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h'

export interface JWTPayload {
  userId: string
  username: string
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload
}
```

### 3.2 tRPC 配置

**src/server/trpc.ts**
```typescript
import { initTRPC, TRPCError } from '@trpc/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken, JWTPayload } from './utils/jwt'

export const prisma = new PrismaClient()

export interface Context {
  user?: JWTPayload
  prisma: typeof prisma
}

export const createContext = async ({
  req,
}: {
  req: Request
}): Promise<Context> => {
  // 从 header 获取 token
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return { prisma }
  }

  try {
    const user = verifyToken(token)
    return { user, prisma }
  } catch (error) {
    return { prisma }
  }
}

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: '请先登录' })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})
```

### 3.3 认证路由

**src/server/routers/auth.ts**
```typescript
import { z } from 'zod'
import { router, publicProcedure, prisma } from '../trpc'
import { TRPCError } from '@trpc/server'
import { verifyPassword } from '../utils/password'
import { signToken } from '../utils/jwt'

export const authRouter = router({
  login: publicProcedure
    .input(
      z.object({
        username: z.string().min(1, '用户名不能为空'),
        password: z.string().min(1, '密码不能为空'),
      })
    )
    .mutation(async ({ input }) => {
      const { username, password } = input

      // 查找用户
      const user = await prisma.user.findUnique({
        where: { username },
        include: {
          department: true,
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '用户名或密码错误',
        })
      }

      // 验证密码
      const isValid = await verifyPassword(password, user.password)
      if (!isValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: '用户名或密码错误',
        })
      }

      // 检查账号状态
      if (user.status !== 'ACTIVE') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '账号已被停用或锁定',
        })
      }

      // 检查账号期限
      if (user.accountExpiry && user.accountExpiry < new Date()) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '账号已过期',
        })
      }

      // 生成 token
      const token = signToken({
        userId: user.id,
        username: user.username,
      })

      // 获取用户权限码
      const permissions = user.userRoles.flatMap((ur) =>
        ur.role.rolePermissions.map((rp) => rp.permission.code)
      )

      // 返回用户信息（不包含密码）
      const { password: _, ...userWithoutPassword } = user

      return {
        token,
        user: userWithoutPassword,
        permissions: Array.from(new Set(permissions)), // 去重
      }
    }),

  // 获取当前用户信息
  me: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: ctx.user.userId },
      include: {
        department: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    })

    if (!user) {
      return null
    }

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }),
})
```

### 3.4 用户管理路由

**src/server/routers/user.ts**
```typescript
import { z } from 'zod'
import { router, protectedProcedure, prisma } from '../trpc'
import { hashPassword } from '../utils/password'
import { UserStatus } from '@prisma/client'

export const userRouter = router({
  // 获取用户列表（分页）
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(10),
        keyword: z.string().optional(),
        departmentId: z.string().optional(),
        status: z.nativeEnum(UserStatus).optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, pageSize, keyword, departmentId, status } = input
      const skip = (page - 1) * pageSize

      const where = {
        ...(keyword && {
          OR: [
            { username: { contains: keyword } },
            { realName: { contains: keyword } },
            { phone: { contains: keyword } },
          ],
        }),
        ...(departmentId && { departmentId }),
        ...(status && { status }),
      }

      const [total, items] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
          where,
          skip,
          take: pageSize,
          include: {
            department: true,
            userRoles: {
              include: {
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
      ])

      // 移除密码字段
      const sanitizedItems = items.map(({ password, ...user }) => user)

      return {
        items: sanitizedItems,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    }),

  // 获取单个用户
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { id: input.id },
        include: {
          department: true,
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      })

      if (!user) return null

      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    }),

  // 创建用户
  create: protectedProcedure
    .input(
      z.object({
        username: z.string().min(2, '用户名至少2个字符'),
        realName: z.string().min(1, '姓名不能为空'),
        password: z.string().min(6, '密码至少6个字符'),
        phone: z.string().optional(),
        departmentId: z.string().optional(),
        position: z.string().optional(),
        accountExpiry: z.date().optional(),
        roleIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { roleIds, ...userData } = input

      // 检查用户名是否已存在
      const existing = await prisma.user.findUnique({
        where: { username: userData.username },
      })

      if (existing) {
        throw new Error('用户名已存在')
      }

      // 加密密码
      const hashedPassword = await hashPassword(userData.password)

      // 创建用户
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
        },
      })

      // 分配角色
      if (roleIds && roleIds.length > 0) {
        await prisma.userRole.createMany({
          data: roleIds.map((roleId) => ({
            userId: user.id,
            roleId,
          })),
        })
      }

      return user
    }),

  // 更新用户
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        username: z.string().optional(),
        realName: z.string().optional(),
        phone: z.string().optional(),
        departmentId: z.string().optional(),
        position: z.string().optional(),
        accountExpiry: z.date().optional(),
        status: z.nativeEnum(UserStatus).optional(),
        roleIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, roleIds, ...updateData } = input

      // 更新用户信息
      const user = await prisma.user.update({
        where: { id },
        data: updateData,
      })

      // 更新角色（先删除旧的，再创建新的）
      if (roleIds !== undefined) {
        await prisma.userRole.deleteMany({
          where: { userId: id },
        })

        if (roleIds.length > 0) {
          await prisma.userRole.createMany({
            data: roleIds.map((roleId) => ({
              userId: id,
              roleId,
            })),
          })
        }
      }

      return user
    }),

  // 删除用户
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.user.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),

  // 重置密码
  resetPassword: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        newPassword: z.string().min(6, '密码至少6个字符'),
      })
    )
    .mutation(async ({ input }) => {
      const hashedPassword = await hashPassword(input.newPassword)

      await prisma.user.update({
        where: { id: input.id },
        data: { password: hashedPassword },
      })

      return { success: true }
    }),
})
```

### 3.5 部门管理路由

**src/server/routers/department.ts**
```typescript
import { z } from 'zod'
import { router, protectedProcedure, prisma } from '../trpc'
import { UserStatus } from '@prisma/client'

export const departmentRouter = router({
  // 获取部门树
  tree: protectedProcedure.query(async () => {
    const departments = await prisma.department.findMany({
      include: {
        children: {
          include: {
            children: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: { sort: 'asc' },
    })

    // 递归构建树形结构
    const buildTree = (parentId: string | null): any[] => {
      return departments
        .filter((dept) => dept.parentId === parentId)
        .map((dept) => ({
          ...dept,
          children: buildTree(dept.id),
        }))
    }

    return buildTree(null)
  }),

  // 获取所有部门（平铺列表）
  list: protectedProcedure.query(async () => {
    return prisma.department.findMany({
      include: {
        parent: true,
        _count: {
          select: {
            users: true,
            children: true,
          },
        },
      },
      orderBy: [{ level: 'asc' }, { sort: 'asc' }],
    })
  }),

  // 获取单个部门
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return prisma.department.findUnique({
        where: { id: input.id },
        include: {
          parent: true,
          children: true,
        },
      })
    }),

  // 创建部门
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, '部门名称不能为空'),
        code: z.string().min(1, '部门代码不能为空'),
        parentId: z.string().optional(),
        sort: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      // 检查代码是否已存在
      const existing = await prisma.department.findUnique({
        where: { code: input.code },
      })

      if (existing) {
        throw new Error('部门代码已存在')
      }

      // 计算层级
      let level = 1
      if (input.parentId) {
        const parent = await prisma.department.findUnique({
          where: { id: input.parentId },
        })
        level = parent ? parent.level + 1 : 1
      }

      return prisma.department.create({
        data: {
          ...input,
          level,
        },
      })
    }),

  // 更新部门
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        code: z.string().optional(),
        parentId: z.string().optional(),
        sort: z.number().optional(),
        status: z.nativeEnum(UserStatus).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input

      // 如果修改了父节点，重新计算层级
      if (updateData.parentId !== undefined) {
        let level = 1
        if (updateData.parentId) {
          const parent = await prisma.department.findUnique({
            where: { id: updateData.parentId },
          })
          level = parent ? parent.level + 1 : 1
        }
        return prisma.department.update({
          where: { id },
          data: {
            ...updateData,
            level,
          },
        })
      }

      return prisma.department.update({
        where: { id },
        data: updateData,
      })
    }),

  // 删除部门
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // 检查是否有子部门
      const children = await prisma.department.count({
        where: { parentId: input.id },
      })

      if (children > 0) {
        throw new Error('请先删除子部门')
      }

      // 检查是否有用户
      const users = await prisma.user.count({
        where: { departmentId: input.id },
      })

      if (users > 0) {
        throw new Error('该部门下还有用户，无法删除')
      }

      await prisma.department.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
```

### 3.6 菜单管理路由

**src/server/routers/menu.ts**
```typescript
import { z } from 'zod'
import { router, protectedProcedure, prisma } from '../trpc'
import { MenuType, UserStatus } from '@prisma/client'

export const menuRouter = router({
  // 获取菜单树
  tree: protectedProcedure
    .input(
      z.object({
        includeInactive: z.boolean().default(false),
      })
    )
    .query(async ({ input }) => {
      const menus = await prisma.menu.findMany({
        where: input.includeInactive
          ? {}
          : { status: UserStatus.ACTIVE },
        include: {
          children: {
            include: {
              children: true,
            },
          },
          _count: {
            select: {
              permissions: true,
            },
          },
        },
        orderBy: { sort: 'asc' },
      })

      // 递归构建树形结构
      const buildTree = (parentId: string | null): any[] => {
        return menus
          .filter((menu) => menu.parentId === parentId)
          .map((menu) => ({
            ...menu,
            children: buildTree(menu.id),
          }))
      }

      return buildTree(null)
    }),

  // 获取用户可访问的菜单
  getUserMenus: protectedProcedure.query(async ({ ctx }) => {
    // 获取用户的所有角色
    const userWithRoles = await prisma.user.findUnique({
      where: { id: ctx.user.userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: {
                      include: {
                        menu: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!userWithRoles) return []

    // 收集所有有权限访问的菜单 ID
    const menuIds = new Set<string>()
    userWithRoles.userRoles.forEach((ur) => {
      ur.role.rolePermissions.forEach((rp) => {
        if (rp.permission.menuId) {
          menuIds.add(rp.permission.menuId)
        }
      })
    })

    // 获取这些菜单及其所有父菜单
    const allMenuIds = new Set(menuIds)
    const getParentMenuIds = async (menuId: string) => {
      const menu = await prisma.menu.findUnique({
        where: { id: menuId },
      })
      if (menu?.parentId && !allMenuIds.has(menu.parentId)) {
        allMenuIds.add(menu.parentId)
        await getParentMenuIds(menu.parentId)
      }
    }

    for (const menuId of menuIds) {
      await getParentMenuIds(menuId)
    }

    // 获取所有菜单数据
    const menus = await prisma.menu.findMany({
      where: {
        id: { in: Array.from(allMenuIds) },
        status: UserStatus.ACTIVE,
      },
      orderBy: { sort: 'asc' },
    })

    // 构建树形结构
    const buildTree = (parentId: string | null): any[] => {
      return menus
        .filter((menu) => menu.parentId === parentId)
        .map((menu) => ({
          ...menu,
          children: buildTree(menu.id),
        }))
    }

    return buildTree(null)
  }),

  // 创建菜单
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        code: z.string().min(1),
        type: z.nativeEnum(MenuType),
        path: z.string().optional(),
        parentId: z.string().optional(),
        icon: z.string().optional(),
        sort: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const existing = await prisma.menu.findUnique({
        where: { code: input.code },
      })

      if (existing) {
        throw new Error('菜单代码已存在')
      }

      return prisma.menu.create({
        data: input,
      })
    }),

  // 更新菜单
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        code: z.string().optional(),
        type: z.nativeEnum(MenuType).optional(),
        path: z.string().optional(),
        parentId: z.string().optional(),
        icon: z.string().optional(),
        sort: z.number().optional(),
        status: z.nativeEnum(UserStatus).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input

      return prisma.menu.update({
        where: { id },
        data: updateData,
      })
    }),

  // 删除菜单
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const children = await prisma.menu.count({
        where: { parentId: input.id },
      })

      if (children > 0) {
        throw new Error('请先删除子菜单')
      }

      await prisma.menu.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
```

**继续下一部分...**

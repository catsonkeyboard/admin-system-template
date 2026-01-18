# Admin System Template

<p align="center">
  <strong>企业级管理系统模板</strong><br>
  基于 React + TypeScript + Prisma + tRPC 的全栈 RBAC 权限管理系统
</p>

<p align="center">
  <a href="./README_CN.md">中文文档</a> •
  <a href="./QUICKSTART.md">快速开始</a> •
  <a href="#features">功能特性</a> •
  <a href="#usage">使用方式</a>
</p>

---

## Overview

**Admin System Template** 是一个生产就绪的企业级管理系统模板，提供完整的 RBAC（基于角色的访问控制）实现。可作为以下项目的起点：

- 企业内部管理系统
- SaaS 后台管理平台
- 多租户权限管理系统
- 任何需要用户和权限管理的应用

## Features

### Core Functionality
- **用户认证** - JWT 登录/登出，bcrypt 密码加密
- **用户管理** - 完整 CRUD，搜索分页，角色分配
- **部门管理** - 树形组织架构
- **菜单管理** - 动态菜单系统
- **角色管理** - 角色 CRUD，权限配置
- **权限管理** - 细粒度权限控制（菜单/按钮/数据）

### Technical Highlights
- **类型安全** - 端到端 TypeScript + tRPC
- **现代技术栈** - React 18, Prisma 5, tRPC 10
- **状态管理** - Zustand (客户端) + React Query (服务端)
- **UI 组件库** - shadcn/ui 风格组件 + Tailwind CSS
- **树形组件** - 可复用的 TreeView 组件

## Tech Stack

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript 5 |
| 状态管理 | Zustand + React Query |
| API 层 | tRPC 10 |
| 样式 | Tailwind CSS + shadcn/ui |
| 路由 | React Router 6 |
| ORM | Prisma 5 |
| 数据库 | SQLite (开发) / PostgreSQL (生产) |
| 认证 | JWT + bcrypt |

## Quick Start

### Prerequisites
- Node.js 18+
- npm 或 yarn

### Installation

```bash
# 1. 克隆模板
git clone <repository-url> my-project
cd my-project

# 2. 安装依赖
npm install

# 3. 生成 Prisma 客户端
npm run db:generate

# 4. 创建数据库
npm run db:push

# 5. 填充初始数据
npm run db:seed

# 6. 启动开发服务器
npm run dev
```

### Access

- **地址**: http://localhost:3000
- **账号**: admin
- **密码**: admin123

## Usage

### 基于模板创建新项目

```bash
# 复制模板
cp -r admin-system-template my-business-system
cd my-business-system

# 修改 package.json 中的项目名
# 修改数据库配置
# 开始开发你的业务功能
```

### 添加新业务模块

1. **定义数据模型** (`prisma/schema.prisma`)
```prisma
model Product {
  id        String   @id @default(cuid())
  name      String
  price     Float
  createdAt DateTime @default(now())
}
```

2. **创建 API 路由** (`src/server/routers/product.ts`)
```typescript
export const productRouter = router({
  list: protectedProcedure.query(async () => {
    return prisma.product.findMany()
  }),
  create: protectedProcedure
    .input(z.object({ name: z.string(), price: z.number() }))
    .mutation(async ({ input }) => {
      return prisma.product.create({ data: input })
    }),
})
```

3. **注册路由** (`src/server/routers/index.ts`)
```typescript
export const appRouter = router({
  // ... existing routers
  product: productRouter,
})
```

4. **创建页面** (`src/client/pages/ProductManagement.tsx`)

5. **添加路由** (`src/client/App.tsx`)
```typescript
<Route path="product" element={<ProductManagement />} />
```

## Project Structure

```
├── prisma/
│   ├── schema.prisma         # 数据模型定义
│   ├── schema.production.prisma  # 生产环境模型 (PostgreSQL)
│   └── seed.ts               # 种子数据
├── src/
│   ├── client/               # 前端代码
│   │   ├── components/
│   │   │   ├── common/       # 通用组件 (DataTable, TreeView)
│   │   │   ├── layout/       # 布局组件 (Sidebar, Header, TabBar)
│   │   │   ├── modules/      # 业务组件 (各模块表单)
│   │   │   └── ui/           # 基础 UI 组件
│   │   ├── hooks/            # 自定义 Hooks
│   │   ├── pages/            # 页面组件
│   │   ├── stores/           # Zustand 状态
│   │   └── utils/            # 工具函数
│   └── server/               # 后端代码
│       ├── routers/          # tRPC 路由
│       └── utils/            # 服务端工具
├── .env                      # 环境变量 (开发)
├── .env.production           # 环境变量 (生产)
└── package.json
```

## Configuration

### Environment Variables

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `NODE_ENV` | 环境模式 | `development` |
| `DATABASE_URL` | 数据库连接 | `file:./dev.db` |
| `JWT_SECRET` | JWT 密钥 | 必填 |
| `JWT_EXPIRES_IN` | Token 有效期 | `2h` |
| `PORT` | 服务端口 | `3001` |

### Database

**开发环境 (SQLite)**
```env
DATABASE_URL="file:./dev.db"
```

**生产环境 (PostgreSQL)**
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

切换生产数据库时，复制 `prisma/schema.production.prisma` 到 `prisma/schema.prisma`。

## Available Scripts

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器 |
| `npm run db:generate` | 生成 Prisma 客户端 |
| `npm run db:push` | 推送数据库结构 |
| `npm run db:migrate` | 运行数据库迁移 |
| `npm run db:seed` | 填充种子数据 |
| `npm run db:studio` | 打开 Prisma Studio |

## UI Components

模板包含以下可复用组件：

| 组件 | 说明 |
|------|------|
| Button | 按钮（多种变体和尺寸）|
| Input | 输入框 |
| Select | 下拉选择 |
| Dialog | 模态对话框 |
| Toast | 消息通知 |
| DataTable | 数据表格（分页、操作列）|
| TreeView | 树形结构展示 |

## API Reference

### Authentication
- `auth.login` - 用户登录

### User Management
- `user.list` / `user.getById` / `user.create` / `user.update` / `user.delete`
- `user.resetPassword` - 重置密码

### Department Management
- `department.tree` / `department.list` / `department.create` / `department.update` / `department.delete`

### Menu Management
- `menu.tree` / `menu.getUserMenus` / `menu.create` / `menu.update` / `menu.delete`

### Role Management
- `role.list` / `role.getById` / `role.create` / `role.update` / `role.delete`
- `role.updatePermissions` - 更新角色权限

### Permission Management
- `permission.list` / `permission.create` / `permission.update` / `permission.delete`

## Extending

### 添加权限控制

```typescript
// 使用 usePermission Hook
const { hasPermission, canCreate, canEdit, canDelete } = usePermission()

// 条件渲染
{canCreate('product') && <Button>新建</Button>}

// 或使用 PermissionGuard 组件
<PermissionGuard permission="product:create">
  <Button>新建</Button>
</PermissionGuard>
```

### 自定义主题

编辑 `tailwind.config.cjs` 自定义颜色、字体等设计令牌。

## Deployment

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
RUN npx prisma generate
EXPOSE 3000 3001
CMD ["npm", "start"]
```

### PM2

```bash
npm run build
pm2 start npm --name "admin-system" -- start
```

## Contributing

欢迎提交 Issue 和 Pull Request！

## License

MIT

---

<p align="center">
  如果这个模板对你有帮助，请给个 Star ⭐
</p>

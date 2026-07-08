# Admin System Template

<p align="center">
  <strong>企业级管理系统模板</strong><br>
  基于 React + TypeScript + NestJS + Drizzle ORM + tRPC 的全栈 RBAC 权限管理系统
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
- **国际化** - 中英文切换（i18next）
- **数据看板** - ECharts 图表仪表盘

### Technical Highlights
- **NestJS 模块化后端** - 每个业务域独立 Module（Service / Controller / Router / DTO）
- **双 API 形态** - tRPC（前端类型安全调用）+ REST（Swagger/OpenAPI 文档，供第三方集成）
- **类型安全** - 端到端 TypeScript + tRPC，前端直接推导后端路由类型
- **现代技术栈** - React 19, NestJS 11, Drizzle ORM, tRPC 11
- **状态管理** - Zustand (客户端) + React Query (服务端)
- **UI 组件库** - shadcn/ui 风格组件 + Tailwind CSS v4
- **树形组件** - 可复用的 TreeView 组件

## Tech Stack

| 层级 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript 5 |
| 状态管理 | Zustand + React Query |
| API 层 | tRPC 11 + REST (Swagger) |
| 后端框架 | NestJS 11 (Express 平台) |
| 样式 | Tailwind CSS v4 + shadcn/ui |
| 路由 | React Router 7 |
| 国际化 | i18next + react-i18next |
| 图表 | ECharts 6 |
| ORM | Drizzle ORM 0.45+ |
| 数据库 | SQLite (开发) / PostgreSQL (生产) |
| 认证 | JWT + bcrypt |

## Architecture

后端采用 NestJS 模块化架构，tRPC 通过 Express 中间件挂载到 NestJS 应用上：

- **tRPC 端点** (`/trpc`)：前端唯一调用入口，`protectedProcedure` 校验 JWT，类型端到端推导
- **REST 端点** (`/api/*`)：每个模块的 Controller 提供等价的 REST API，全局 `JwtAuthGuard` 守卫（`@Public()` 装饰器标记公开接口），Swagger 文档自动生成
- **业务逻辑** 统一收敛在各模块的 Service 中，tRPC Router 与 REST Controller 只做协议适配

```
请求 ──┬── /trpc ──→ TrpcRouter ──→ 各模块 Router ──┐
       │                                            ├──→ Service ──→ Drizzle ──→ DB
       └── /api  ──→ JwtAuthGuard ──→ Controller ───┘
```

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

# 3. 推送数据库结构（首次初始化）
npm run db:push

# 4. 填充初始数据
npm run db:seed

# 5. 启动开发服务器（同时启动 NestJS 后端 + Vite 前端）
npm run dev
```

### Access

- **前端**: http://localhost:3000
- **后端 (NestJS)**: http://localhost:3002
- **tRPC 端点**: http://localhost:3002/trpc （Vite 已配置 `/trpc` 代理）
- **Swagger 文档**: http://localhost:3002/api-docs
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

以 `product` 模块为例：

1. **定义数据模型** (`src/server/db/schema.ts`)
```typescript
export const products = sqliteTable('products', {
  id:        text('id').primaryKey().$defaultFn(() => createId()),
  name:      text('name').notNull(),
  price:     real('price').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})
```

2. **创建 Service** (`src/server/modules/product/product.service.ts`)
```typescript
@Injectable()
export class ProductService {
  constructor(@Inject(DRIZZLE) private db: DB) {}

  async list() {
    return this.db.query.products.findMany()
  }

  async create(input: { name: string; price: number }) {
    const id = createId()
    await this.db.insert(products).values({ ...input, id })
    return this.db.query.products.findFirst({ where: eq(products.id, id) })
  }
}
```

3. **创建 tRPC Router** (`src/server/modules/product/product.router.ts`)
```typescript
export function createProductRouter(trpc: TrpcService, productService: ProductService) {
  return trpc.router({
    list: trpc.protectedProcedure.query(() => productService.list()),
    create: trpc.protectedProcedure
      .input(z.object({ name: z.string(), price: z.number() }))
      .mutation(({ input }) => productService.create(input)),
  })
}
```

4. **（可选）创建 REST Controller** (`src/server/modules/product/product.controller.ts`)，用 `@ApiTags` 等 Swagger 装饰器标注，即可自动出现在 `/api-docs`

5. **创建 Module** (`src/server/modules/product/product.module.ts`)
```typescript
@Module({
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
```

6. **注册模块**
   - 在 `src/server/trpc/trpc.module.ts` 的 `imports` 中加入 `ProductModule`
   - 在 `src/server/trpc/trpc.router.ts` 的 `appRouter` 中挂载 `product: createProductRouter(this.trpc, this.productService)`

7. **创建页面** (`src/client/pages/ProductManagement.tsx`)，并在 `src/client/App.tsx` 中添加路由
```typescript
<Route path="product" element={<ProductManagement />} />
```

## Project Structure

```
├── src/
│   ├── client/                    # 前端代码
│   │   ├── components/
│   │   │   ├── common/            # 通用组件 (DataTable, TreeView)
│   │   │   ├── layout/            # 布局组件 (Sidebar, Header, TabBar)
│   │   │   ├── modules/           # 业务组件 (各模块表单)
│   │   │   └── ui/                # 基础 UI 组件
│   │   ├── hooks/                 # 自定义 Hooks
│   │   ├── i18n/                  # 国际化配置与语言包
│   │   ├── pages/                 # 页面组件 (含 dashboard 图表页)
│   │   ├── stores/                # Zustand 状态
│   │   └── utils/                 # 工具函数
│   └── server/                    # 后端代码 (NestJS)
│       ├── main.ts                # 应用入口 (Swagger + tRPC 中间件挂载)
│       ├── app.module.ts          # 根模块 (全局 JWT 守卫)
│       ├── common/
│       │   ├── decorators/        # 装饰器 (@Public 等)
│       │   └── guards/            # 守卫 (JwtAuthGuard)
│       ├── database/              # DatabaseModule (注入 Drizzle 实例)
│       ├── db/                    # 数据库层
│       │   ├── schema.ts          # 数据模型定义
│       │   ├── index.ts           # Drizzle 实例
│       │   └── seed.ts            # 种子数据
│       ├── modules/               # 业务模块 (auth/user/department/menu/permission/role)
│       │   └── <module>/
│       │       ├── <module>.module.ts       # NestJS 模块
│       │       ├── <module>.service.ts      # 业务逻辑
│       │       ├── <module>.controller.ts   # REST 接口 (Swagger)
│       │       ├── <module>.router.ts       # tRPC 路由工厂
│       │       └── dto/                     # REST DTO
│       ├── routers/               # AppRouter 类型桥接 (供客户端 import type)
│       ├── trpc/                  # TrpcService / TrpcRouter / TrpcModule
│       └── utils/                 # 服务端工具 (jwt, password)
├── .env                           # 环境变量 (开发)
├── nest-cli.json                  # NestJS CLI 配置
├── vite.config.ts                 # Vite 配置 (端口 3000, /trpc 代理到 3002)
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
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh Token 有效期 | `7d` |
| `PORT` | 后端服务端口 | `3002` (dev 脚本中指定) |

### Database

**开发环境 (SQLite)**
```env
DATABASE_URL="file:./dev.db"
```

**生产环境 (PostgreSQL)**
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

切换生产数据库时，将 `drizzle.config.ts` 中的 `dialect` 改为 `postgresql`，并将 `src/server/db/index.ts` 中的驱动改为 `postgres-js`。

## Available Scripts

| 命令 | 说明 |
|------|------|
| `npm run dev` | 同时启动 NestJS 后端 (watch) 和 Vite 前端 |
| `npm run dev:server` | 仅启动 NestJS 后端（端口 3002，热重载） |
| `npm run dev:client` | 仅启动 Vite 前端（端口 3000） |
| `npm run build` | 构建前端生产版本 |
| `npm run build:server` | 构建后端 (`nest build`) |
| `npm run start` | 启动生产服务器 (`node dist/main.js`) |
| `npm run db:push` | 推送数据库结构 |
| `npm run db:generate` | 生成迁移文件 |
| `npm run db:migrate` | 运行数据库迁移 |
| `npm run db:seed` | 填充种子数据 |
| `npm run db:studio` | 打开 Drizzle Studio |

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

所有业务接口同时提供 **tRPC**（`/trpc`，前端使用）和 **REST**（`/api/*`，见 Swagger 文档 `/api-docs`）两种形态。

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

### REST 接口认证

REST 接口默认受全局 `JwtAuthGuard` 保护，请求需携带 `Authorization: Bearer <token>`。公开接口使用 `@Public()` 装饰器标记：

```typescript
@Public()
@Post('login')
async login(@Body() dto: LoginDto) { ... }
```

### 自定义主题

项目使用 Tailwind CSS v4（通过 `@tailwindcss/vite` 插件），在 CSS 中通过 `@theme` 自定义颜色、字体等设计令牌。

## Deployment

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm run build:server
EXPOSE 3002
CMD ["npm", "start"]
```

### PM2

```bash
npm run build && npm run build:server
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

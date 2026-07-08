# Admin System Template

企业级管理系统模板 - 基于 React + TypeScript + NestJS + Drizzle ORM + tRPC 的全栈 RBAC 权限管理系统

[English](./README.md) | 中文文档

---

## 项目简介

**Admin System Template** 是一个生产就绪的企业级管理系统模板，提供完整的 RBAC（基于角色的访问控制）实现。

### 适用场景

- 企业内部管理系统
- SaaS 后台管理平台
- 多租户权限管理系统
- 任何需要用户和权限管理的业务系统

### 如何使用本模板

```bash
# 1. 复制模板到新项目
cp -r admin-system-template my-business-system
cd my-business-system

# 2. 修改 package.json 中的项目名
# 3. 根据业务需求添加新模块
# 4. 开始开发
```

---

## 核心功能

### RBAC 权限系统

| 模块 | 功能 | 状态 |
|------|------|------|
| 用户管理 | CRUD、搜索分页、角色分配 | ✅ |
| 部门管理 | 树形组织架构 | ✅ |
| 菜单管理 | 树形菜单结构 | ✅ |
| 角色管理 | 角色 CRUD、权限配置 | ✅ |
| 权限管理 | 权限 CRUD、分类管理 | ✅ |
| 角色权限配置 | 可视化权限分配 | ✅ |
| 国际化 | 中英文切换（i18next） | ✅ |
| 数据看板 | ECharts 图表仪表盘 | ✅ |

### 技术特性

- **NestJS 模块化后端** - 每个业务域独立 Module（Service / Controller / Router / DTO）
- **双 API 形态** - tRPC（前端类型安全调用）+ REST（Swagger/OpenAPI 文档）
- **类型安全** - 端到端 TypeScript + tRPC
- **现代技术栈** - React 19, NestJS 11, Drizzle ORM, tRPC 11
- **状态管理** - Zustand + React Query
- **UI 组件** - shadcn/ui 风格 + Tailwind CSS v4
- **树形组件** - 可复用的 TreeView 组件

---

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装步骤

```bash
# 安装依赖
npm install

# 推送数据库结构（首次初始化）
npm run db:push

# 填充初始数据
npm run db:seed

# 启动开发服务器（同时启动 NestJS 后端 + Vite 前端）
npm run dev
```

### 访问系统

- **前端**: http://localhost:3000
- **后端 (NestJS)**: http://localhost:3002
- **Swagger 文档**: http://localhost:3002/api-docs
- **账号**: admin
- **密码**: admin123

---

## 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19 | UI 框架 |
| TypeScript | 5 | 类型安全 |
| Zustand | 5 | 状态管理 |
| React Query | 5 | 数据同步 |
| tRPC | 11 | API 层 |
| Tailwind CSS | 4 | 样式 |
| React Router | 7 | 路由 |
| i18next | 25 | 国际化 |
| ECharts | 6 | 图表 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | 运行时 |
| TypeScript | 5 | 类型安全 |
| NestJS | 11 | 后端框架（Express 平台） |
| Drizzle ORM | 0.45+ | ORM |
| tRPC | 11 | 类型安全 API |
| Swagger | - | REST API 文档 |
| JWT | - | 认证 |
| bcrypt | - | 密码加密 |

### 数据库

- **开发环境**: SQLite (better-sqlite3)
- **生产环境**: PostgreSQL

---

## 架构说明

后端采用 NestJS 模块化架构，tRPC 通过 Express 中间件挂载到 NestJS 应用上：

```
请求 ──┬── /trpc ──→ TrpcRouter ──→ 各模块 Router ──┐
       │                                            ├──→ Service ──→ Drizzle ──→ DB
       └── /api  ──→ JwtAuthGuard ──→ Controller ───┘
```

- **tRPC 端点** (`/trpc`)：前端唯一调用入口，`protectedProcedure` 校验 JWT
- **REST 端点** (`/api/*`)：每个模块的 Controller 提供等价 REST API，全局 `JwtAuthGuard` 守卫，`@Public()` 装饰器标记公开接口，Swagger 文档自动生成
- **业务逻辑** 统一收敛在各模块的 Service 中，tRPC Router 与 REST Controller 只做协议适配

---

## 项目结构

```
admin-system-template/
├── src/
│   ├── client/                    # 前端代码
│   │   ├── components/
│   │   │   ├── common/            # 通用组件
│   │   │   ├── layout/            # 布局组件
│   │   │   ├── modules/           # 业务组件
│   │   │   └── ui/                # UI 组件
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

---

## 扩展指南

### 添加新业务模块

以 `product` 模块为例：

#### 1. 定义数据模型

```typescript
// src/server/db/schema.ts
export const products = sqliteTable('products', {
  id:        text('id').primaryKey().$defaultFn(() => createId()),
  name:      text('name').notNull(),
  price:     real('price').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})
```

#### 2. 创建 Service

```typescript
// src/server/modules/product/product.service.ts
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

#### 3. 创建 tRPC Router

```typescript
// src/server/modules/product/product.router.ts
export function createProductRouter(trpc: TrpcService, productService: ProductService) {
  return trpc.router({
    list: trpc.protectedProcedure.query(() => productService.list()),
    create: trpc.protectedProcedure
      .input(z.object({ name: z.string().min(1), price: z.number().positive() }))
      .mutation(({ input }) => productService.create(input)),
  })
}
```

#### 4. （可选）创建 REST Controller

```typescript
// src/server/modules/product/product.controller.ts
@ApiTags('产品管理')
@ApiBearerAuth()
@Controller('api/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: '获取产品列表' })
  async list() {
    return this.productService.list()
  }
}
```

#### 5. 创建 Module 并注册

```typescript
// src/server/modules/product/product.module.ts
@Module({
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
```

然后：
- 在 `src/server/trpc/trpc.module.ts` 的 `imports` 中加入 `ProductModule`
- 在 `src/server/trpc/trpc.router.ts` 的 `appRouter` 中挂载 `product: createProductRouter(this.trpc, this.productService)`

#### 6. 创建页面组件

```typescript
// src/client/pages/ProductManagement.tsx
export function ProductManagement() {
  const { data } = trpc.product.list.useQuery()
  // ... 页面实现
}
```

#### 7. 添加路由

```typescript
// src/client/App.tsx
<Route path="product" element={<ProductManagement />} />
```

#### 8. 添加菜单和权限

在数据库中添加菜单项和对应的权限码。

---

## 配置说明

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `NODE_ENV` | 环境模式 | `development` |
| `DATABASE_URL` | 数据库连接 | `file:./dev.db` |
| `JWT_SECRET` | JWT 密钥 | 必填 |
| `JWT_EXPIRES_IN` | Token 有效期 | `2h` |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh Token 有效期 | `7d` |
| `PORT` | 后端服务端口 | `3002` (dev 脚本中指定) |

### 切换数据库

**开发环境 (SQLite)**
```env
DATABASE_URL="file:./dev.db"
```

**生产环境 (PostgreSQL)**
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

切换时需要：
1. 修改 `.env` 中的 `DATABASE_URL`
2. 将 `drizzle.config.ts` 中的 `dialect` 改为 `postgresql`
3. 将 `src/server/db/index.ts` 中的驱动改为 `postgres-js`
4. 重新运行 `npm run db:generate` 和 `npm run db:push`

---

## 可用命令

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

---

## UI 组件

模板包含以下可复用的 UI 组件：

| 组件 | 文件 | 说明 |
|------|------|------|
| Button | `ui/button.tsx` | 按钮（多种变体） |
| Input | `ui/input.tsx` | 输入框 |
| Select | `ui/select.tsx` | 下拉选择 |
| Dialog | `ui/dialog.tsx` | 模态对话框 |
| Toast | `ui/toast.tsx` | 消息通知 |
| Label | `ui/label.tsx` | 标签 |
| Checkbox | `ui/checkbox.tsx` | 复选框 |
| Badge | `ui/badge.tsx` | 徽章 |
| DataTable | `common/DataTable.tsx` | 数据表格 |
| TreeView | `common/TreeView.tsx` | 树形结构 |

---

## API 参考

所有业务接口同时提供 **tRPC**（`/trpc`，前端使用）和 **REST**（`/api/*`，见 Swagger 文档 `/api-docs`）两种形态。以下为 tRPC 接口列表：

### 认证

| 接口 | 说明 |
|------|------|
| `auth.login` | 用户登录 |

### 用户管理

| 接口 | 说明 |
|------|------|
| `user.list` | 用户列表 |
| `user.getById` | 用户详情 |
| `user.create` | 创建用户 |
| `user.update` | 更新用户 |
| `user.delete` | 删除用户 |
| `user.resetPassword` | 重置密码 |

### 部门管理

| 接口 | 说明 |
|------|------|
| `department.tree` | 部门树 |
| `department.list` | 部门列表 |
| `department.create` | 创建部门 |
| `department.update` | 更新部门 |
| `department.delete` | 删除部门 |

### 菜单管理

| 接口 | 说明 |
|------|------|
| `menu.tree` | 菜单树 |
| `menu.getUserMenus` | 用户菜单 |
| `menu.create` | 创建菜单 |
| `menu.update` | 更新菜单 |
| `menu.delete` | 删除菜单 |

### 角色管理

| 接口 | 说明 |
|------|------|
| `role.list` | 角色列表 |
| `role.getById` | 角色详情 |
| `role.create` | 创建角色 |
| `role.update` | 更新角色 |
| `role.updatePermissions` | 更新权限 |
| `role.delete` | 删除角色 |

### 权限管理

| 接口 | 说明 |
|------|------|
| `permission.list` | 权限列表 |
| `permission.create` | 创建权限 |
| `permission.update` | 更新权限 |
| `permission.delete` | 删除权限 |

---

## 部署

### Docker 部署

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

### PM2 部署

```bash
npm run build && npm run build:server
pm2 start npm --name "admin-system" -- start
```

---

## 常见问题

### Q: 如何添加新的权限控制？

```typescript
// 使用 usePermission Hook
const { hasPermission, canCreate, canEdit, canDelete } = usePermission()

// 条件渲染
{canCreate('product') && <Button>新建</Button>}
```

### Q: 如何自定义主题？

项目使用 Tailwind CSS v4（通过 `@tailwindcss/vite` 插件），在 CSS 中通过 `@theme` 自定义颜色、字体等设计令牌。

### Q: 如何修改登录逻辑？

编辑 `src/server/modules/auth/auth.service.ts`（业务逻辑）和 `src/server/modules/auth/auth.router.ts`（tRPC 接口）。

### Q: REST 接口如何认证？

REST 接口默认受全局 `JwtAuthGuard` 保护，请求需携带 `Authorization: Bearer <token>`。公开接口使用 `@Public()` 装饰器标记。

---

## License

MIT

---

## 贡献

欢迎提交 Issue 和 Pull Request！

如果这个模板对你有帮助，请给个 Star ⭐

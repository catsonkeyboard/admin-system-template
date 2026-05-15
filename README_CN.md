# Admin System Template

企业级管理系统模板 - 基于 React + TypeScript + Drizzle ORM + tRPC 的全栈 RBAC 权限管理系统

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

### 技术特性

- **类型安全** - 端到端 TypeScript + tRPC
- **现代技术栈** - React 18, Prisma 5, tRPC 10
- **状态管理** - Zustand + React Query
- **UI 组件** - shadcn/ui 风格 + Tailwind CSS
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

# 启动开发服务器
npm run dev
```

### 访问系统

- **地址**: http://localhost:3000
- **账号**: admin
- **密码**: admin123

---

## 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18 | UI 框架 |
| TypeScript | 5 | 类型安全 |
| Zustand | 4 | 状态管理 |
| React Query | 4 | 数据同步 |
| tRPC | 10 | API 层 |
| Tailwind CSS | 3 | 样式 |
| React Router | 6 | 路由 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | 运行时 |
| TypeScript | 5 | 类型安全 |
| Drizzle ORM | 0.44+ | ORM |
| Express | 5 | HTTP 服务 |
| JWT | - | 认证 |
| bcrypt | - | 密码加密 |

### 数据库

- **开发环境**: SQLite
- **生产环境**: PostgreSQL

---

## 项目结构

```
admin-system-template/
├── src/server/db/           # 数据库层
│   ├── schema.ts            # 数据模型 (SQLite / PostgreSQL)
│   ├── index.ts             # Drizzle 实例
│   └── seed.ts              # 种子数据
├── src/
│   ├── client/                 # 前端代码
│   │   ├── components/
│   │   │   ├── common/         # 通用组件
│   │   │   ├── layout/         # 布局组件
│   │   │   ├── modules/        # 业务组件
│   │   │   └── ui/             # UI 组件
│   │   ├── hooks/              # 自定义 Hooks
│   │   ├── pages/              # 页面组件
│   │   ├── stores/             # Zustand 状态
│   │   └── utils/              # 工具函数
│   └── server/                 # 后端代码
│       ├── routers/            # tRPC 路由
│       └── utils/              # 服务端工具
├── .env                        # 环境变量 (开发)
├── .env.production             # 环境变量 (生产)
└── package.json
```

---

## 扩展指南

### 添加新业务模块

#### 1. 定义数据模型

```prisma
// prisma/schema.prisma
model Product {
  id        String   @id @default(cuid())
  name      String
  price     Float
  status    String   @default("ACTIVE")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### 2. 创建 API 路由

```typescript
// src/server/routers/product.ts
import { z } from 'zod'
import { router, protectedProcedure, prisma } from '../trpc'

export const productRouter = router({
  list: protectedProcedure.query(async () => {
    return prisma.product.findMany()
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      price: z.number().positive(),
    }))
    .mutation(async ({ input }) => {
      return prisma.product.create({ data: input })
    }),

  // ... 更多操作
})
```

#### 3. 注册路由

```typescript
// src/server/routers/index.ts
import { productRouter } from './product'

export const appRouter = router({
  // ... 已有路由
  product: productRouter,
})
```

#### 4. 创建页面组件

```typescript
// src/client/pages/ProductManagement.tsx
export function ProductManagement() {
  const { data } = trpc.product.list.useQuery()
  // ... 页面实现
}
```

#### 5. 添加路由

```typescript
// src/client/App.tsx
<Route path="product" element={<ProductManagement />} />
```

#### 6. 添加菜单和权限

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
| `PORT` | 服务端口 | `3001` |

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
2. 复制 `prisma/schema.production.prisma` 到 `prisma/schema.prisma`
3. 重新运行 `npm run db:generate` 和 `npm run db:push`

---

## 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器 |
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
RUN npm ci --only=production
COPY . .
RUN npm run build
RUN npx prisma generate
EXPOSE 3000 3001
CMD ["npm", "start"]
```

### PM2 部署

```bash
npm run build
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

编辑 `tailwind.config.cjs` 文件，修改颜色、字体等配置。

### Q: 如何修改登录逻辑？

编辑 `src/server/routers/auth.ts` 文件。

---

## License

MIT

---

## 贡献

欢迎提交 Issue 和 Pull Request！

如果这个模板对你有帮助，请给个 Star ⭐

# 🚀 快速启动指南

本指南帮助你在 5 分钟内跑起来这个项目。技术选型、架构设计等完整说明见 [README.md](./README.md)。

## 📋 技术栈概览

| 层级 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript 5 |
| 状态管理 | Zustand + React Query |
| API 层 | tRPC 11 + REST (Swagger) |
| 后端框架 | NestJS 11 (Express 平台) |
| ORM | Drizzle ORM |
| 数据库 | SQLite (开发，better-sqlite3) / PostgreSQL (生产) |
| 样式 | Tailwind CSS v4 + shadcn/ui |
| 国际化 | i18next + react-i18next |
| 图表 | ECharts 6 |
| 认证 | JWT + bcrypt |

## 📦 安装步骤

### 环境要求
- Node.js 18+
- npm 或 yarn

### 1. 安装依赖
```bash
npm install
```

### 2. 初始化数据库
```bash
# 推送数据库结构（Drizzle 根据 src/server/db/schema.ts 创建表）
npm run db:push

# 填充种子数据（创建默认管理员账号、菜单、角色、权限）
npm run db:seed
```

### 3. 启动项目
```bash
# 同时启动 NestJS 后端 (watch) 和 Vite 前端
npm run dev

# 或分别启动
npm run dev:server  # NestJS 后端 http://localhost:3002（热重载）
npm run dev:client  # Vite 前端 http://localhost:3000
```

### 4. 访问应用
- **前端**: http://localhost:3000
- **后端 (NestJS)**: http://localhost:3002
- **tRPC 端点**: http://localhost:3002/trpc （Vite 已配置 `/trpc` 代理，前端直接调用即可）
- **Swagger 文档**: http://localhost:3002/api-docs
- **默认账号**: **admin** / **admin123**

### 一键启动（首次）
```bash
npm install && npm run db:push && npm run db:seed && npm run dev
```

---

## 🏗️ 架构速览

后端采用 NestJS 模块化架构，tRPC 通过 Express 中间件挂载到 NestJS 应用上：

- **tRPC 端点** (`/trpc`)：前端唯一调用入口，`protectedProcedure` 校验 JWT，类型端到端推导
- **REST 端点** (`/api/*`)：每个模块的 Controller 提供等价的 REST API，全局 `JwtAuthGuard` 守卫（`@Public()` 装饰器标记公开接口），Swagger 文档自动生成于 `/api-docs`
- **业务逻辑** 统一收敛在各模块的 Service 中，tRPC Router 与 REST Controller 只做协议适配

```
请求 ──┬── /trpc ──→ TrpcRouter ──→ 各模块 Router ──┐
       │                                            ├──→ Service ──→ Drizzle ──→ DB
       └── /api  ──→ JwtAuthGuard ──→ Controller ───┘
```

---

## 📂 项目结构

```
admin-system-template/
├── src/
│   ├── server/                    # 后端代码 (NestJS)
│   │   ├── main.ts                # 应用入口 (Swagger + tRPC 中间件挂载)
│   │   ├── app.module.ts          # 根模块 (全局 JWT 守卫)
│   │   ├── common/
│   │   │   ├── decorators/        # 装饰器 (@Public 等)
│   │   │   └── guards/            # 守卫 (JwtAuthGuard)
│   │   ├── database/              # DatabaseModule (注入 Drizzle 实例)
│   │   ├── db/                    # 数据库层
│   │   │   ├── schema.ts          # Drizzle 数据模型定义
│   │   │   ├── index.ts           # Drizzle 实例 (better-sqlite3)
│   │   │   └── seed.ts            # 种子数据
│   │   ├── modules/               # 业务模块
│   │   │   ├── auth/              # 认证
│   │   │   ├── user/              # 用户管理
│   │   │   ├── department/        # 部门管理
│   │   │   ├── menu/              # 菜单管理
│   │   │   ├── permission/        # 权限管理
│   │   │   └── role/              # 角色管理
│   │   │       # 每个模块含:
│   │   │       # <module>.module.ts      NestJS 模块
│   │   │       # <module>.service.ts     业务逻辑
│   │   │       # <module>.controller.ts  REST 接口 (Swagger)
│   │   │       # <module>.router.ts      tRPC 路由工厂
│   │   │       # dto/                    REST DTO
│   │   ├── routers/               # AppRouter 类型桥接 (供客户端 import type)
│   │   ├── trpc/                  # TrpcService / TrpcRouter / TrpcModule
│   │   └── utils/                 # 服务端工具 (jwt, password)
│   └── client/                    # 前端代码
│       ├── components/
│       │   ├── common/            # 通用组件 (DataTable, TreeView)
│       │   ├── layout/            # 布局组件 (Sidebar, Header, TabBar)
│       │   ├── modules/           # 业务组件 (各模块表单)
│       │   └── ui/                # 基础 UI 组件 (shadcn/ui 风格)
│       ├── hooks/                 # 自定义 Hooks (useAuth, usePermission)
│       ├── i18n/                  # 国际化配置与语言包
│       ├── pages/                 # 页面组件 (含 dashboard 图表页)
│       ├── stores/                # Zustand 状态 (user, tab, menu)
│       └── utils/                 # 工具函数
├── .env                           # 环境变量 (开发)
├── drizzle.config.ts              # Drizzle Kit 配置
├── nest-cli.json                  # NestJS CLI 配置
├── vite.config.ts                 # Vite 配置 (端口 3000, /trpc 代理到 3002)
└── package.json
```

---

## 🛠️ 常用命令

```bash
# 开发
npm run dev              # 同时启动 NestJS 后端 + Vite 前端
npm run dev:server       # 仅启动 NestJS 后端（端口 3002，热重载）
npm run dev:client       # 仅启动 Vite 前端（端口 3000）

# 数据库 (Drizzle Kit)
npm run db:push          # 推送 schema 到数据库（开发环境快速同步）
npm run db:generate      # 根据 schema 变更生成迁移文件
npm run db:migrate       # 运行数据库迁移
npm run db:seed          # 运行种子数据 (tsx src/server/db/seed.ts)
npm run db:studio        # 打开 Drizzle Studio（可视化查看/编辑数据）

# 构建与生产
npm run build            # 构建前端生产版本 (vite build)
npm run build:server     # 构建后端 (nest build)
npm start                # 启动生产服务器 (node dist/main.js)
```

---

## 🎯 功能清单

登录后你将看到完整的管理界面：

1. **布局系统**
   - 左侧：可折叠的侧边栏导航（树形菜单）
   - 顶部：用户信息、语言切换（中/英）、明暗主题切换
   - Tab 栏：多页签切换与关闭

2. **首页仪表盘**
   - 统计卡片、快捷操作
   - ECharts 数据看板（dashboard 图表页）

3. **系统管理模块**（每个模块均为完整 CRUD）
   - 用户管理：列表、搜索、分页、角色分配、重置密码
   - 部门管理：树形组织架构
   - 菜单管理：动态菜单配置
   - 角色管理：角色 CRUD、权限配置
   - 权限管理：细粒度权限（菜单/按钮/数据）

4. **国际化**
   - 中英文切换（i18next），语言包位于 `src/client/i18n/`

---

## ➕ 添加新业务模块

以 `product` 模块为例，完整步骤（含代码示例）见 [README.md](./README.md#usage) 的 Usage 章节，概要如下：

1. **定义数据模型** — 在 `src/server/db/schema.ts` 中添加 Drizzle 表定义
2. **创建 Service** — `src/server/modules/product/product.service.ts`，通过 `@Inject(DRIZZLE)` 注入数据库实例
3. **创建 tRPC Router** — `src/server/modules/product/product.router.ts`，用 `trpc.protectedProcedure` 定义受保护接口
4. **（可选）创建 REST Controller** — `product.controller.ts` + `dto/`，用 Swagger 装饰器标注后自动出现在 `/api-docs`
5. **创建 Module** — `product.module.ts`，声明 providers/controllers 并导出 Service
6. **注册模块** — 在 `src/server/trpc/trpc.module.ts` 的 `imports` 中加入 `ProductModule`，在 `src/server/trpc/trpc.router.ts` 的 `appRouter` 中挂载 `product` 路由
7. **创建页面** — `src/client/pages/ProductManagement.tsx`，并在 `src/client/App.tsx` 中添加路由
8. **同步数据库** — `npm run db:push`

---

## 🔐 API 调用方式

### 前端（tRPC，推荐）
```typescript
// 类型安全，自动推导后端路由类型
const { data } = trpc.user.list.useQuery({ page: 1, pageSize: 10 })
```

### 第三方集成（REST）
REST 接口默认受全局 `JwtAuthGuard` 保护，请求需携带 Token：
```bash
curl -H "Authorization: Bearer <token>" http://localhost:3002/api/users
```
完整接口列表和在线调试见 Swagger 文档：http://localhost:3002/api-docs

---

## 🐛 故障排查

### 数据库相关错误（表不存在等）
```bash
# 确保已推送数据库结构并填充种子数据
npm run db:push && npm run db:seed
```

### 端口被占用
- 后端端口 3002 在 `package.json` 的 `dev:server` 脚本中通过 `cross-env PORT=3002` 指定，可修改该脚本或设置环境变量
- 前端端口 3000 在 `vite.config.ts` 中配置；若修改后端端口，需同步更新 `vite.config.ts` 中 `/trpc` 的代理目标

### 依赖安装问题
```bash
# 清除缓存重新安装（better-sqlite3 含原生模块，Node 版本切换后需要重装）
rm -rf node_modules package-lock.json
npm install
```

### 页面空白 / 请求失败
```bash
# 检查浏览器控制台错误
# 确保 NestJS 后端正在运行（前端的 /trpc 请求依赖它）
npm run dev:server
```

### 登录失败（账号不存在）
```bash
# 种子数据未运行，执行：
npm run db:seed
# 默认账号 admin / admin123
```

---

## 📞 获取帮助

### 文档资源
- 📘 **QUICKSTART.md** — 快速启动指南（本文档）
- 📖 **README.md / README_CN.md** — 项目完整说明（架构、扩展、部署）

### 在线资源
- [NestJS 官方文档](https://docs.nestjs.com)
- [tRPC 官方文档](https://trpc.io/docs)
- [Drizzle ORM 官方文档](https://orm.drizzle.team)
- [shadcn/ui 组件库](https://ui.shadcn.com)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Zustand 文档](https://zustand-demo.pmnd.rs)
- [i18next 文档](https://www.i18next.com)
- [ECharts 文档](https://echarts.apache.org)
- [Lucide Icons](https://lucide.dev)

---

**祝您开发愉快！🚀**

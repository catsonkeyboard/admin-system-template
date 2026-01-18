# Notes: Admin 管理系统技术研究

## 技术栈详细说明

### 前端技术

#### React 18 + TypeScript
- 使用函数组件 + Hooks
- 严格类型检查
- 代码分割和懒加载

#### shadcn/ui 组件
**需要的核心组件**:
- Button, Input, Select, Checkbox, Radio
- Table, Dialog, Sheet, Popover
- Form（react-hook-form 集成）
- DropdownMenu, Tabs, Avatar
- Toast/Sonner（消息提示）
- Command（命令面板，可选）

**树形组件方案**:
- 自定义递归 TreeNode 组件
- 或使用 @tanstack/react-table 的 expanding 功能

#### Zustand Store 设计
```typescript
// 用户状态
interface UserStore {
  user: User | null
  token: string | null
  permissions: string[]
  login: (token: string, user: User) => void
  logout: () => void
}

// Tab 状态
interface TabStore {
  tabs: Tab[]
  activeTab: string
  addTab: (tab: Tab) => void
  removeTab: (id: string) => void
  setActiveTab: (id: string) => void
}

// 菜单状态
interface MenuStore {
  collapsed: boolean
  menus: MenuItem[]
  toggleCollapsed: () => void
}
```

#### React Query 配置
- staleTime: 5 * 60 * 1000（5分钟）
- cacheTime: 10 * 60 * 1000（10分钟）
- refetchOnWindowFocus: false
- retry: 1

### 后端技术

#### Prisma Schema 关键点
```prisma
// 枚举类型
enum MenuType {
  DIRECTORY  // 目录
  MENU       // 菜单
}

enum PermissionType {
  MENU    // 菜单权限
  BUTTON  // 按钮权限
  DATA    // 数据权限
}

enum UserStatus {
  ACTIVE
  INACTIVE
  LOCKED
}

// 自关联（树形结构）
model Department {
  id       String       @id @default(cuid())
  parentId String?
  parent   Department?  @relation("DepartmentTree", fields: [parentId], references: [id])
  children Department[] @relation("DepartmentTree")
}
```

#### tRPC Router 组织
```
routers/
├── auth.ts        // 登录、登出、刷新token
├── user.ts        // 用户 CRUD
├── department.ts  // 部门 CRUD（树形）
├── menu.ts        // 菜单 CRUD（树形）
├── permission.ts  // 权限码 CRUD
├── role.ts        // 角色 CRUD
└── index.ts       // 路由合并
```

#### JWT 策略
- Access Token: 2小时过期，存储在 localStorage
- Refresh Token: 7天过期，httpOnly cookie
- Token payload: { userId, username, roles }

#### 权限中间件
```typescript
// 检查用户是否有指定权限
export const hasPermission = (requiredPermissions: string[]) => {
  return middleware(async ({ ctx, next }) => {
    const userPermissions = await getUserPermissions(ctx.userId)
    const hasAccess = requiredPermissions.some(p =>
      userPermissions.includes(p)
    )
    if (!hasAccess) throw new TRPCError({ code: 'FORBIDDEN' })
    return next()
  })
}
```

## UI/UX 设计原则

### 色彩方案
- 主色: Blue-600（#2563eb）
- 成功: Green-500
- 警告: Yellow-500
- 危险: Red-500
- 中性: Slate 系列

### 布局设计
```
┌─────────────────────────────────────────┐
│  Logo    |    Tab1  Tab2  Tab3    [用户] │  ← Header (64px)
├──────────┼─────────────────────────────┤
│          │                              │
│  菜单1   │                              │
│  菜单2   │      Page Content            │
│  ├子菜单 │                              │
│  菜单3   │                              │
│          │                              │
│  (240px) │                              │
└──────────┴──────────────────────────────┘
```

### 交互细节
- 侧边栏可折叠（折叠后显示图标）
- Tab 支持拖拽排序（可选）
- Tab 右键菜单（关闭、关闭其他、关闭所有）
- 表格支持排序、筛选、分页
- 树形组件支持搜索、展开/折叠全部
- 表单验证实时反馈

## 数据流设计

### 登录流程
```
1. 用户输入账号密码
2. 调用 trpc.auth.login
3. 后端验证 → 生成 JWT
4. 前端存储 token + 用户信息到 Zustand
5. 获取用户权限和菜单
6. 跳转到首页
```

### 权限校验流程
```
前端:
1. 路由守卫检查 token
2. 菜单根据权限过滤
3. 按钮根据权限显示/隐藏

后端:
1. tRPC middleware 验证 JWT
2. 检查用户是否有操作权限
3. 数据权限过滤（WHERE 条件）
```

### Tab 切换流程
```
1. 点击菜单项
2. 检查 tab 是否已打开
3. 如已打开 → 激活该 tab
4. 如未打开 → 添加新 tab + 激活
5. 更新路由（React Router）
```

## 开发环境配置

### 依赖包清单

#### 后端依赖
```json
{
  "@trpc/server": "^10.x",
  "@prisma/client": "^5.x",
  "prisma": "^5.x",
  "jsonwebtoken": "^9.x",
  "bcrypt": "^5.x",
  "zod": "^3.x"
}
```

#### 前端依赖
```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "@tanstack/react-query": "^5.x",
  "@trpc/client": "^10.x",
  "@trpc/react-query": "^10.x",
  "zustand": "^4.x",
  "react-router-dom": "^6.x",
  "react-hook-form": "^7.x",
  "@hookform/resolvers": "^3.x",
  "zod": "^3.x",
  "tailwindcss": "^3.x",
  "lucide-react": "^latest",
  "date-fns": "^3.x",
  "clsx": "^2.x",
  "tailwind-merge": "^2.x"
}
```

#### shadcn/ui 安装
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input table form dialog select
npx shadcn-ui@latest add dropdown-menu tabs avatar toast sheet
```

### 开发脚本
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  }
}
```

## 安全性考虑

### 密码安全
- bcrypt 加盐哈希（salt rounds: 10）
- 密码强度要求：最少8位，包含字母数字

### XSS 防护
- React 默认转义
- 富文本使用 DOMPurify

### CSRF 防护
- SameSite cookie
- CSRF token（如需要）

### SQL 注入防护
- Prisma 参数化查询（默认防护）

### 权限控制
- 前后端双重验证
- 最小权限原则
- 定期清理过期 token

## 性能优化策略

### 前端优化
1. **代码分割**: React.lazy() 懒加载页面组件
2. **虚拟滚动**: 大数据表格使用 @tanstack/react-virtual
3. **缓存策略**: React Query 智能缓存
4. **防抖节流**: 搜索输入使用 debounce

### 后端优化
1. **数据库索引**:
   - username, phone 唯一索引
   - departmentId, roleId 外键索引
   - parentId 索引（树形查询）
2. **查询优化**: Prisma include 精确控制关联查询
3. **分页**: 默认分页，避免全量查询

### 网络优化
- 开启 gzip 压缩
- 静态资源 CDN
- API 请求合并（tRPC batch）

## 测试策略

### 单元测试（可选）
- 工具函数测试（Vitest）
- Hooks 测试（@testing-library/react）

### 集成测试（推荐）
- 关键业务流程测试
- 登录流程
- 权限验证

### 手动测试清单
- [ ] 登录/登出功能
- [ ] 菜单权限过滤
- [ ] 用户 CRUD 操作
- [ ] 部门树形展示
- [ ] 角色权限配置
- [ ] Tab 切换功能
- [ ] 表单验证
- [ ] 错误提示

## 部署方案

### 开发环境
- SQLite 数据库（快速启动）
- Vite dev server

### 生产环境
- PostgreSQL 数据库
- Nginx 反向代理
- PM2 进程管理
- Docker 容器化（可选）

```dockerfile
# Dockerfile 示例
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "start"]
```

## 常见问题 FAQ

### Q1: 树形数据如何高效查询？
A: 使用递归 CTE（PostgreSQL）或 Prisma 的 findMany + 前端递归组装

### Q2: 如何处理大量权限码？
A:
- 后端返回用户权限码数组
- 前端使用 Set 快速查找：`permissions.has('user:create')`

### Q3: Tab 数据如何持久化？
A: 可选方案：
- localStorage 存储（简单）
- 后端用户偏好设置（复杂）

### Q4: 如何实现数据权限过滤？
A: Prisma 查询时动态添加 WHERE 条件：
```typescript
const users = await prisma.user.findMany({
  where: {
    departmentId: { in: userAllowedDepartments }
  }
})
```

## 参考资料

### 官方文档
- tRPC: https://trpc.io/docs
- Prisma: https://www.prisma.io/docs
- shadcn/ui: https://ui.shadcn.com
- Zustand: https://zustand-demo.pmnd.rs
- React Query: https://tanstack.com/query

### 设计参考
- Ant Design Pro（布局参考）
- Vue Element Admin（功能参考）

### 代码示例
- tRPC + Next.js: https://github.com/trpc/trpc/tree/main/examples
- Prisma examples: https://github.com/prisma/prisma-examples

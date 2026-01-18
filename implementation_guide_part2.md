# Admin 管理系统 - 前端实现指南（续）

## 3.7 权限和角色路由

**src/server/routers/permission.ts**
```typescript
import { z } from 'zod'
import { router, protectedProcedure, prisma } from '../trpc'
import { PermissionType } from '@prisma/client'

export const permissionRouter = router({
  // 获取权限列表
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(50),
        menuId: z.string().optional(),
        type: z.nativeEnum(PermissionType).optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, pageSize, menuId, type } = input
      const skip = (page - 1) * pageSize

      const where = {
        ...(menuId && { menuId }),
        ...(type && { type }),
      }

      const [total, items] = await Promise.all([
        prisma.permission.count({ where }),
        prisma.permission.findMany({
          where,
          skip,
          take: pageSize,
          include: {
            menu: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
      ])

      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    }),

  // 创建权限
  create: protectedProcedure
    .input(
      z.object({
        code: z.string().min(1),
        name: z.string().min(1),
        menuId: z.string().optional(),
        type: z.nativeEnum(PermissionType),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.permission.create({
        data: input,
      })
    }),

  // 更新权限
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        menuId: z.string().optional(),
        type: z.nativeEnum(PermissionType).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input
      return prisma.permission.update({
        where: { id },
        data: updateData,
      })
    }),

  // 删除权限
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.permission.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),
})
```

**src/server/routers/role.ts**
```typescript
import { z } from 'zod'
import { router, protectedProcedure, prisma } from '../trpc'
import { UserStatus } from '@prisma/client'

export const roleRouter = router({
  // 获取角色列表
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      const { page, pageSize } = input
      const skip = (page - 1) * pageSize

      const [total, items] = await Promise.all([
        prisma.role.count(),
        prisma.role.findMany({
          skip,
          take: pageSize,
          include: {
            _count: {
              select: {
                userRoles: true,
                rolePermissions: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
      ])

      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    }),

  // 获取角色详情（包含权限）
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return prisma.role.findUnique({
        where: { id: input.id },
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
      })
    }),

  // 创建角色
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        code: z.string().min(1),
        description: z.string().optional(),
        permissionIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { permissionIds, ...roleData } = input

      const role = await prisma.role.create({
        data: roleData,
      })

      // 分配权限
      if (permissionIds && permissionIds.length > 0) {
        await prisma.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId: role.id,
            permissionId,
          })),
        })
      }

      return role
    }),

  // 更新角色
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        status: z.nativeEnum(UserStatus).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input
      return prisma.role.update({
        where: { id },
        data: updateData,
      })
    }),

  // 更新角色权限
  updatePermissions: protectedProcedure
    .input(
      z.object({
        roleId: z.string(),
        permissionIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const { roleId, permissionIds } = input

      // 先删除所有旧权限
      await prisma.rolePermission.deleteMany({
        where: { roleId },
      })

      // 创建新权限
      if (permissionIds.length > 0) {
        await prisma.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId,
            permissionId,
          })),
        })
      }

      return { success: true }
    }),

  // 删除角色
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // 检查是否有用户使用该角色
      const userCount = await prisma.userRole.count({
        where: { roleId: input.id },
      })

      if (userCount > 0) {
        throw new Error('该角色下还有用户，无法删除')
      }

      await prisma.role.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
```

### 3.8 合并所有路由

**src/server/routers/index.ts**
```typescript
import { router } from '../trpc'
import { authRouter } from './auth'
import { userRouter } from './user'
import { departmentRouter } from './department'
import { menuRouter } from './menu'
import { permissionRouter } from './permission'
import { roleRouter } from './role'

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  department: departmentRouter,
  menu: menuRouter,
  permission: permissionRouter,
  role: roleRouter,
})

export type AppRouter = typeof appRouter
```

### 3.9 服务器入口

**src/server/index.ts**
```typescript
import express from 'express'
import cors from 'cors'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { appRouter } from './routers'
import { createContext } from './trpc'

const app = express()

app.use(cors())
app.use(express.json())

app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
```

---

## 4. 前端基础配置

### 4.1 tRPC Client

**src/client/utils/trpc.ts**
```typescript
import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@/server/routers'

export const trpc = createTRPCReact<AppRouter>()

export function getTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: 'http://localhost:3001/trpc',
        headers() {
          const token = localStorage.getItem('token')
          return {
            authorization: token ? `Bearer ${token}` : '',
          }
        },
      }),
    ],
  })
}
```

**src/client/utils/cn.ts**
```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 4.2 Zustand Stores

**src/client/stores/userStore.ts**
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  username: string
  realName: string
  phone?: string
  department?: {
    id: string
    name: string
  }
}

interface UserStore {
  user: User | null
  token: string | null
  permissions: string[]
  setUser: (user: User, token: string, permissions: string[]) => void
  logout: () => void
  hasPermission: (permission: string) => boolean
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      permissions: [],

      setUser: (user, token, permissions) => {
        localStorage.setItem('token', token)
        set({ user, token, permissions })
      },

      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, permissions: [] })
      },

      hasPermission: (permission) => {
        return get().permissions.includes(permission)
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        permissions: state.permissions,
      }),
    }
  )
)
```

**src/client/stores/tabStore.ts**
```typescript
import { create } from 'zustand'

export interface Tab {
  id: string
  title: string
  path: string
  closable: boolean
}

interface TabStore {
  tabs: Tab[]
  activeTabId: string | null
  addTab: (tab: Tab) => void
  removeTab: (id: string) => void
  setActiveTab: (id: string) => void
  closeOtherTabs: (id: string) => void
  closeAllTabs: () => void
}

export const useTabStore = create<TabStore>((set, get) => ({
  tabs: [],
  activeTabId: null,

  addTab: (tab) => {
    const { tabs } = get()
    const exists = tabs.find((t) => t.id === tab.id)

    if (exists) {
      set({ activeTabId: tab.id })
    } else {
      set({
        tabs: [...tabs, tab],
        activeTabId: tab.id,
      })
    }
  },

  removeTab: (id) => {
    const { tabs, activeTabId } = get()
    const index = tabs.findIndex((t) => t.id === id)

    if (index === -1) return

    const newTabs = tabs.filter((t) => t.id !== id)

    // 如果关闭的是当前激活的标签
    if (activeTabId === id) {
      const newActiveTab = newTabs[Math.max(0, index - 1)]
      set({
        tabs: newTabs,
        activeTabId: newActiveTab?.id || null,
      })
    } else {
      set({ tabs: newTabs })
    }
  },

  setActiveTab: (id) => {
    set({ activeTabId: id })
  },

  closeOtherTabs: (id) => {
    const { tabs } = get()
    const tab = tabs.find((t) => t.id === id)
    if (!tab) return

    const newTabs = tabs.filter((t) => t.id === id || !t.closable)
    set({
      tabs: newTabs,
      activeTabId: id,
    })
  },

  closeAllTabs: () => {
    const { tabs } = get()
    const newTabs = tabs.filter((t) => !t.closable)
    set({
      tabs: newTabs,
      activeTabId: newTabs[0]?.id || null,
    })
  },
}))
```

**src/client/stores/menuStore.ts**
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MenuItem {
  id: string
  name: string
  code: string
  type: string
  path?: string
  icon?: string
  children?: MenuItem[]
}

interface MenuStore {
  collapsed: boolean
  menus: MenuItem[]
  toggleCollapsed: () => void
  setMenus: (menus: MenuItem[]) => void
}

export const useMenuStore = create<MenuStore>()(
  persist(
    (set) => ({
      collapsed: false,
      menus: [],

      toggleCollapsed: () => {
        set((state) => ({ collapsed: !state.collapsed }))
      },

      setMenus: (menus) => {
        set({ menus })
      },
    }),
    {
      name: 'menu-storage',
      partialize: (state) => ({
        collapsed: state.collapsed,
      }),
    }
  )
)
```

### 4.3 自定义 Hooks

**src/client/hooks/useAuth.ts**
```typescript
import { useUserStore } from '@/client/stores/userStore'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export function useAuth() {
  const navigate = useNavigate()
  const { user, token } = useUserStore()

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true })
    }
  }, [token, navigate])

  return { user, isAuthenticated: !!token }
}
```

**src/client/hooks/usePermission.ts**
```typescript
import { useUserStore } from '@/client/stores/userStore'

export function usePermission() {
  const hasPermission = useUserStore((state) => state.hasPermission)

  return {
    hasPermission,
    canView: (code: string) => hasPermission(`${code}:view`),
    canCreate: (code: string) => hasPermission(`${code}:create`),
    canEdit: (code: string) => hasPermission(`${code}:edit`),
    canDelete: (code: string) => hasPermission(`${code}:delete`),
  }
}
```

---

## 5. 布局与路由

### 5.1 安装 shadcn/ui

```bash
npx shadcn-ui@latest init

# 安装必要的组件
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add table
npx shadcn-ui@latest add form
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add scroll-area
```

### 5.2 登录页面

**src/client/pages/Login.tsx**
```typescript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/client/stores/userStore'
import { useMenuStore } from '@/client/stores/menuStore'
import { trpc } from '@/client/utils/trpc'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/card'
import { Label } from '@/client/components/ui/label'
import { useToast } from '@/client/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

export function Login() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const setUser = useUserStore((state) => state.setUser)
  const setMenus = useMenuStore((state) => state.setMenus)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      setUser(data.user, data.token, data.permissions)

      // 获取用户菜单
      const menus = await trpcClient.menu.getUserMenus.query()
      setMenus(menus)

      toast({
        title: '登录成功',
        description: `欢迎回来，${data.user.realName}`,
      })

      navigate('/')
    },
    onError: (error) => {
      toast({
        title: '登录失败',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate({ username, password })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Admin 管理系统
          </CardTitle>
          <CardDescription className="text-center">
            请输入您的账号密码登录
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                type="text"
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isLoading}
            >
              {loginMutation.isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              登录
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            默认账号: admin / admin123
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 5.3 主布局

**src/client/components/layout/AppLayout.tsx**
```typescript
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { TabBar } from './TabBar'
import { useAuth } from '@/client/hooks/useAuth'

export function AppLayout() {
  useAuth() // 路由守卫

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 顶部栏 */}
        <Header />

        {/* Tab 栏 */}
        <TabBar />

        {/* 页面内容 */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

**src/client/components/layout/Sidebar.tsx**
```typescript
import { useNavigate } from 'react-router-dom'
import { useMenuStore } from '@/client/stores/menuStore'
import { useTabStore } from '@/client/stores/tabStore'
import { ScrollArea } from '@/client/components/ui/scroll-area'
import { Button } from '@/client/components/ui/button'
import { Separator } from '@/client/components/ui/separator'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import * as Icons from 'lucide-react'
import { cn } from '@/client/utils/cn'

export function Sidebar() {
  const navigate = useNavigate()
  const { collapsed, menus, toggleCollapsed } = useMenuStore()
  const addTab = useTabStore((state) => state.addTab)

  const handleMenuClick = (menu: any) => {
    if (menu.type === 'MENU' && menu.path) {
      // 添加 tab
      addTab({
        id: menu.id,
        title: menu.name,
        path: menu.path,
        closable: true,
      })
      // 导航
      navigate(menu.path)
    }
  }

  const renderIcon = (iconName?: string) => {
    if (!iconName) return null
    const Icon = (Icons as any)[iconName]
    return Icon ? <Icon className="h-4 w-4" /> : null
  }

  const renderMenu = (menuItems: any[], level = 0) => {
    return menuItems.map((menu) => {
      const hasChildren = menu.children && menu.children.length > 0

      return (
        <div key={menu.id}>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start gap-2',
              level > 0 && 'pl-8'
            )}
            onClick={() => handleMenuClick(menu)}
          >
            {renderIcon(menu.icon)}
            {!collapsed && <span>{menu.name}</span>}
          </Button>

          {hasChildren && !collapsed && renderMenu(menu.children, level + 1)}
        </div>
      )
    })
  }

  return (
    <div
      className={cn(
        'flex flex-col border-r bg-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b px-4">
        <h1 className={cn('font-bold text-lg', collapsed && 'text-xs')}>
          {collapsed ? 'Admin' : 'Admin 系统'}
        </h1>
      </div>

      {/* 菜单 */}
      <ScrollArea className="flex-1 px-2 py-4">
        {renderMenu(menus)}
      </ScrollArea>

      <Separator />

      {/* 折叠按钮 */}
      <div className="p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={toggleCollapsed}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>收起</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
```

**src/client/components/layout/Header.tsx**
```typescript
import { useUserStore } from '@/client/stores/userStore'
import { useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/client/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/client/components/ui/dropdown-menu'
import { LogOut, User } from 'lucide-react'

export function Header() {
  const navigate = useNavigate()
  const { user, logout } = useUserStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4">
        {/* 面包屑或其他内容 */}
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback>
                  {user ? getInitials(user.realName) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="text-sm font-medium">{user?.realName}</div>
                <div className="text-xs text-muted-foreground">
                  {user?.department?.name}
                </div>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>我的账号</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              个人信息
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
```

**src/client/components/layout/TabBar.tsx**
```typescript
import { useNavigate } from 'react-router-dom'
import { useTabStore } from '@/client/stores/tabStore'
import { Tabs, TabsList, TabsTrigger } from '@/client/components/ui/tabs'
import { Button } from '@/client/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/client/components/ui/dropdown-menu'
import { X, MoreVertical } from 'lucide-react'
import { cn } from '@/client/utils/cn'

export function TabBar() {
  const navigate = useNavigate()
  const { tabs, activeTabId, removeTab, setActiveTab, closeOtherTabs, closeAllTabs } =
    useTabStore()

  if (tabs.length === 0) return null

  const handleTabChange = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId)
    if (tab) {
      setActiveTab(tabId)
      navigate(tab.path)
    }
  }

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeTab(tabId)

    // 如果关闭后还有标签，导航到新的活动标签
    const remainingTabs = tabs.filter((t) => t.id !== tabId)
    if (remainingTabs.length > 0) {
      const newActiveTab = remainingTabs[remainingTabs.length - 1]
      navigate(newActiveTab.path)
    }
  }

  return (
    <div className="flex items-center gap-2 border-b bg-white px-4 py-2">
      <Tabs value={activeTabId || undefined} onValueChange={handleTabChange}>
        <TabsList className="h-auto p-0 bg-transparent">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                'relative gap-2 rounded-none border-b-2 border-transparent',
                'data-[state=active]:border-primary'
              )}
            >
              <span>{tab.title}</span>
              {tab.closable && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => handleCloseTab(tab.id, e)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {tabs.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => activeTabId && closeOtherTabs(activeTabId)}
            >
              关闭其他
            </DropdownMenuItem>
            <DropdownMenuItem onClick={closeAllTabs}>
              关闭所有
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
```

### 5.4 路由配置

**src/client/App.tsx**
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trpc, getTRPCClient } from './utils/trpc'
import { AppLayout } from './components/layout/AppLayout'
import { Login } from './pages/Login'
import { UserManagement } from './pages/UserManagement'
import { DepartmentManagement } from './pages/DepartmentManagement'
import { MenuManagement } from './pages/MenuManagement'
import { PermissionManagement } from './pages/PermissionManagement'
import { RoleManagement } from './pages/RoleManagement'
import { Toaster } from './components/ui/toaster'

const queryClient = new QueryClient()
const trpcClient = getTRPCClient()

export function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/system/user" replace />} />
              <Route path="system/user" element={<UserManagement />} />
              <Route path="system/department" element={<DepartmentManagement />} />
              <Route path="system/menu" element={<MenuManagement />} />
              <Route path="system/permission" element={<PermissionManagement />} />
              <Route path="system/role" element={<RoleManagement />} />
            </Route>
          </Routes>
          <Toaster />
        </BrowserRouter>
      </QueryClientProvider>
    </trpc.Provider>
  )
}
```

---

**继续阅读完整实现指南的剩余部分，包括具体的功能模块实现...**

（由于篇幅限制，完整的实现指南已保存在 `/tmp/admin-system-plan/implementation_guide.md` 文件中）

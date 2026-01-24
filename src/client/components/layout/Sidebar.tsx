import { useNavigate, useLocation } from 'react-router-dom'
import { useMenuStore } from '@/client/stores/menuStore'
import { useTabStore } from '@/client/stores/tabStore'
import { ChevronLeft, ChevronRight, Home, Settings, Users, Building2, Menu as MenuIcon, ShieldCheck, UserCog } from 'lucide-react'
import { cn } from '@/client/utils/cn'
import { Button } from '@/client/components/ui/button'

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { collapsed, toggleCollapsed, menus } = useMenuStore()
  const addTab = useTabStore((state) => state.addTab)

  const handleMenuClick = (menu: any) => {
    if (menu.path) {
      addTab({
        id: menu.code || menu.id,
        title: menu.name,
        path: menu.path,
        closable: true,
      })
      navigate(menu.path)
    }
  }

  const defaultMenus = [
    {
      id: 'home',
      name: '首页',
      code: 'home',
      path: '/',
      icon: 'Home',
    },
    {
      id: 'system',
      name: '系统管理',
      code: 'system',
      icon: 'Settings',
      children: [
        {
          id: 'user',
          name: '用户管理',
          code: 'user',
          path: '/system/user',
          icon: 'Users',
        },
        {
          id: 'department',
          name: '部门管理',
          code: 'department',
          path: '/system/department',
          icon: 'Building2',
        },
        {
          id: 'menu',
          name: '菜单管理',
          code: 'menu',
          path: '/system/menu',
          icon: 'MenuIcon',
        },
        {
          id: 'permission',
          name: '权限管理',
          code: 'permission',
          path: '/system/permission',
          icon: 'ShieldCheck',
        },
        {
          id: 'role',
          name: '角色管理',
          code: 'role',
          path: '/system/role',
          icon: 'UserCog',
        },
      ],
    },
  ]

  const menuItems = menus.length > 0 ? menus : defaultMenus

  const getIcon = (iconName?: string) => {
    const icons: Record<string, any> = {
      Home,
      Settings,
      Users,
      Building2,
      MenuIcon,
      ShieldCheck,
      UserCog,
    }
    const Icon = icons[iconName || 'Home']
    return Icon ? <Icon className="h-4 w-4" /> : <Home className="h-4 w-4" />
  }

  const isActive = (path?: string) => {
    if (!path) return false
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const renderMenuItem = (item: any, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const active = isActive(item.path)

    return (
      <div key={item.id} className="overflow-hidden">
        <button
          onClick={() => handleMenuClick(item)}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-all duration-200 cursor-pointer overflow-hidden',
            level > 0 && 'ml-4',
            active
              ? 'bg-primary text-primary-foreground font-medium shadow-sm'
              : 'text-foreground hover:bg-accent/10 hover:text-accent'
          )}
        >
          <span className="flex-shrink-0">{getIcon(item.icon)}</span>
          {!collapsed && <span className="flex-1 text-left truncate">{item.name}</span>}
        </button>
        {!collapsed && hasChildren && (
          <div className="mt-1 space-y-1">
            {item.children.map((child: any) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col border-r border-border bg-card transition-all duration-300 overflow-hidden',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo - Enterprise Style */}
      <div className="flex h-14 items-center justify-center border-b border-border bg-primary/5 px-4 overflow-hidden">
        <h1 className={cn('font-bold text-base text-primary truncate', collapsed && 'text-xs')}>
          {collapsed ? 'A' : 'Admin'}
        </h1>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
        {menuItems.map((item) => renderMenuItem(item))}
      </div>

      {/* Collapse button */}
      <div className="border-t border-border p-2 overflow-hidden">
        <Button
          variant="ghost"
          onClick={toggleCollapsed}
          className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent/10"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">收起</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

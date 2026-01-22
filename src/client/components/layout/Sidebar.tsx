import { useNavigate } from 'react-router-dom'
import { useMenuStore } from '@/client/stores/menuStore'
import { useTabStore } from '@/client/stores/tabStore'
import { ChevronLeft, ChevronRight, Home, Settings, Users, Building2, Menu as MenuIcon, ShieldCheck, UserCog } from 'lucide-react'
import { cn } from '@/client/utils/cn'
import { Button } from '@/client/components/ui/button'

export function Sidebar() {
  const navigate = useNavigate()
  const { collapsed, toggleCollapsed, menus } = useMenuStore()
  const addTab = useTabStore((state) => state.addTab)

  const handleMenuClick = (menu: any) => {
    if (menu.path) {
      // 添加 tab
      addTab({
        id: menu.code || menu.id,
        title: menu.name,
        path: menu.path,
        closable: true,
      })
      // 导航
      navigate(menu.path)
    }
  }

  // 默认菜单（如果没有从后端获取）
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

  const renderMenuItem = (item: any, level = 0) => {
    const hasChildren = item.children && item.children.length > 0

    return (
      <div key={item.id}>
        <Button
          variant="ghost"
          onClick={() => handleMenuClick(item)}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
            level > 0 && 'ml-4'
          )}
        >
          {getIcon(item.icon)}
          {!collapsed && <span className="flex-1 text-left">{item.name}</span>}
        </Button>
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
        'flex flex-col border-r bg-card transition-all duration-300 overflow-x-hidden',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b px-4">
        <h1 className={cn('font-bold text-lg text-primary', collapsed && 'text-xs')}>
          {collapsed ? 'A' : 'Admin'}
        </h1>
      </div>

      {/* 菜单 */}
      <div className="flex-1 overflow-y-auto p-2">
        {menuItems.map((item) => renderMenuItem(item))}
      </div>

      {/* 折叠按钮 */}
      <div className="border-t p-2">
        <Button
          variant="ghost"
          onClick={toggleCollapsed}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>收起</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

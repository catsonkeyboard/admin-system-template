import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMenuStore } from '@/client/stores/menuStore'
import { useTabStore } from '@/client/stores/tabStore'
import { ChevronLeft, ChevronRight, Home, Settings, Users, Building2, Menu as MenuIcon, ShieldCheck, UserCog, Activity, BarChart, PieChart, LineChart, ScatterChart, Radar, CircleDot, Combine } from 'lucide-react'
import { cn } from '@/client/utils/cn'
import { Button } from '@/client/components/ui/button'

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { collapsed, toggleCollapsed, menus } = useMenuStore()
  const addTab = useTabStore((state) => state.addTab)
  const { t } = useTranslation()

  const handleMenuClick = (menu: any) => {
    if (menu.path) {
      // Map menu code/id to localization key
      // Assuming menu structure matches i18n keys: sidebar.[code] or sidebar.[id]
      // We need to pass the raw key, not the translated string if we want dynamic updates,
      // BUT current Sidebar implementation translates `menu.name` BEFORE passing it here if we use `t()` in `defaultMenus`.
      // However, `defaultMenus` is re-rendered when language changes, so `handleMenuClick` receives translated name.
      // THE PROBLEM: simple `addTab` stores the STATIC string title at the moment of click.
      // SOLUTION: Store the translation key in the tab object.
      
      // We need to reconstruct the key. 
      // Based on my previous Sidebar edit, `defaultMenus` uses keys like 'sidebar.home', 'sidebar.statistics', etc.
      // The `menu` object has `code` or `id`.
      // Let's assume the key is `sidebar.${menu.code || menu.id}`.
      // Special case: `mixed-chart` -> `sidebar.mixedChart` (camelCase in json vs kebab-case in id?)
      // In my JSON: "mixedChart": "Mixed Chart", "lineChart": "Line Chart"
      // In my Sidebar: id: 'mixed-chart', code: 'mixed-chart'.
      // So I need to convert id 'mixed-chart' to 'mixedChart'.
      
      const toCamelCase = (str: string) => {
        return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
      }
      
      const keyId = menu.code || menu.id
      const localizationKey = `sidebar.${toCamelCase(keyId)}`

      addTab({
        id: menu.code || menu.id,
        title: menu.name, // Display title (will be overridden by TabBar if key exists)
        path: menu.path,
        closable: true,
        localizationKey: localizationKey,
      })
      navigate(menu.path)
    }
  }

  const defaultMenus = [
    {
      id: 'home',
      name: t('sidebar.home'),
      code: 'home',
      path: '/',
      icon: 'Home',
    },
    {
      id: 'statistics',
      name: t('sidebar.statistics'),
      code: 'statistics',
      icon: 'Activity',
      children: [
        {
          id: 'line-chart',
          name: t('sidebar.lineChart'),
          code: 'line-chart',
          path: '/dashboard/line',
          icon: 'LineChart',
        },
        {
          id: 'bar-chart',
          name: t('sidebar.barChart'),
          code: 'bar-chart',
          path: '/dashboard/bar',
          icon: 'BarChart',
        },
        {
          id: 'pie-chart',
          name: t('sidebar.pieChart'),
          code: 'pie-chart',
          path: '/dashboard/pie',
          icon: 'PieChart',
        },
        {
          id: 'scatter-chart',
          name: t('sidebar.scatterChart'),
          code: 'scatter-chart',
          path: '/dashboard/scatter',
          icon: 'ScatterChart',
        },
        {
          id: 'radar-chart',
          name: t('sidebar.radarChart'),
          code: 'radar-chart',
          path: '/dashboard/radar',
          icon: 'Radar',
        },
        {
          id: 'sunburst-chart',
          name: t('sidebar.sunburstChart'),
          code: 'sunburst-chart',
          path: '/dashboard/sunburst',
          icon: 'CircleDot',
        },
        {
          id: 'mixed-chart',
          name: t('sidebar.mixedChart'),
          code: 'mixed-chart',
          path: '/dashboard/mixed',
          icon: 'Combine',
        },
      ],
    },
    {
      id: 'system',
      name: t('sidebar.system'),
      code: 'system',
      icon: 'Settings',
      children: [
        {
          id: 'user',
          name: t('sidebar.user'),
          code: 'user',
          path: '/system/user',
          icon: 'Users',
        },
        {
          id: 'department',
          name: t('sidebar.department'),
          code: 'department',
          path: '/system/department',
          icon: 'Building2',
        },
        {
          id: 'menu',
          name: t('sidebar.menu'),
          code: 'menu',
          path: '/system/menu',
          icon: 'MenuIcon',
        },
        {
          id: 'permission',
          name: t('sidebar.permission'),
          code: 'permission',
          path: '/system/permission',
          icon: 'ShieldCheck',
        },
        {
          id: 'role',
          name: t('sidebar.role'),
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
      Activity,
      BarChart,
      PieChart,
      LineChart,
      ScatterChart,
      Radar,
      Sunburst: CircleDot, // CircleDot can act as Sunburst fallback
      CircleDot,
      Combine,
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
              <span className="truncate">{t('sidebar.collapse')}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

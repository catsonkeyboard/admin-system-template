import { Outlet } from 'react-router-dom'
import { useAuth } from '@/client/hooks/useAuth'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { TabBar } from './TabBar'

export function AppLayout() {
  useAuth() // 路由守卫

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      {/* 侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 顶部栏 */}
        <Header />

        {/* Tab 栏 */}
        <TabBar />

        {/* 页面内容 */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

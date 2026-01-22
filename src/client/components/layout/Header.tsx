import { useUserStore } from '@/client/stores/userStore'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, Settings } from 'lucide-react'
import { Button } from '@/client/components/ui/button'
import { ModeToggle } from '@/client/components/mode-toggle'

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
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-foreground">Admin 管理系统</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* 主题切换 */}
        <ModeToggle />
        
        {/* 用户信息下拉菜单 */}
        <div className="group relative">
          <Button variant="ghost" className="flex items-center gap-2 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              {user ? getInitials(user.realName) : 'U'}
            </div>
            <div className="text-left">
              <div className="text-sm font-medium">{user?.realName || '用户'}</div>
              <div className="text-xs text-muted-foreground">
                {user?.department?.name || '未分配部门'}
              </div>
            </div>
          </Button>

          {/* 下拉菜单 */}
          <div className="absolute right-0 top-full mt-2 hidden w-48 rounded-lg border bg-popover py-2 shadow-lg group-hover:block">
            <Button variant="ghost" className="flex w-full items-center gap-2 px-4 py-2 text-sm">
              <User className="h-4 w-4" />
              个人信息
            </Button>
            <Button variant="ghost" className="flex w-full items-center gap-2 px-4 py-2 text-sm">
              <Settings className="h-4 w-4" />
              系统设置
            </Button>
            <div className="my-1 border-t"></div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              退出登录
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

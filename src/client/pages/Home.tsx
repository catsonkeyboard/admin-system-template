import { useUserStore } from '@/client/stores/userStore'
import { Users, Building2, ShieldCheck, UserCog, TrendingUp, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/client/components/ui/card'
import { Button } from '@/client/components/ui/button'
import { useNavigate } from 'react-router-dom'

export function Home() {
  const user = useUserStore((state) => state.user)
  const navigate = useNavigate()

  const stats = [
    {
      name: '总用户数',
      value: '1,234',
      icon: Users,
      change: '+12.5%',
      changeType: 'increase',
    },
    {
      name: '部门数量',
      value: '45',
      icon: Building2,
      change: '+3',
      changeType: 'increase',
    },
    {
      name: '角色数',
      value: '12',
      icon: UserCog,
      change: '0',
      changeType: 'neutral',
    },
    {
      name: '权限码',
      value: '89',
      icon: ShieldCheck,
      change: '+5',
      changeType: 'increase',
    },
  ]

  const quickActions = [
    { name: '新建用户', path: '/system/user', icon: Users },
    { name: '部门管理', path: '/system/department', icon: Building2 },
    { name: '角色配置', path: '/system/role', icon: UserCog },
    { name: '权限设置', path: '/system/permission', icon: ShieldCheck },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-lg bg-gradient-to-r from-accent to-accent/80 p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold">
          欢迎回来，{user?.realName || '管理员'}！
        </h1>
        <p className="mt-2 text-white/90">
          这是您的 Admin 管理系统控制台，开始管理您的系统吧
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name} className="transition-shadow hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.name}</p>
                    <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className="rounded-full bg-accent/10 p-3">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp
                    className={`mr-1 h-4 w-4 ${
                      stat.changeType === 'increase' ? 'text-success' : 'text-muted-foreground'
                    }`}
                  />
                  <span
                    className={
                      stat.changeType === 'increase' ? 'text-success' : 'text-muted-foreground'
                    }
                  >
                    {stat.change}
                  </span>
                  <span className="ml-1 text-muted-foreground">较上月</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>快捷操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.name}
                  variant="ghost"
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-start gap-2 h-auto py-4 text-left"
                >
                  <Icon className="h-5 w-5 text-accent" />
                  <span className="font-medium">{action.name}</span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* System info */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              最近活动
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 border-l-2 border-accent pl-3">
                <div>
                  <p className="text-sm font-medium">新用户注册</p>
                  <p className="text-xs text-muted-foreground">张三 加入了系统</p>
                  <p className="text-xs text-muted-foreground/70">2 分钟前</p>
                </div>
              </div>
              <div className="flex items-start gap-3 border-l-2 border-success pl-3">
                <div>
                  <p className="text-sm font-medium">权限变更</p>
                  <p className="text-xs text-muted-foreground">李四的角色权限已更新</p>
                  <p className="text-xs text-muted-foreground/70">1 小时前</p>
                </div>
              </div>
              <div className="flex items-start gap-3 border-l-2 border-info pl-3">
                <div>
                  <p className="text-sm font-medium">部门调整</p>
                  <p className="text-xs text-muted-foreground">技术部新增了 3 个子部门</p>
                  <p className="text-xs text-muted-foreground/70">3 小时前</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System status */}
        <Card>
          <CardHeader>
            <CardTitle>系统状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">系统运行时间</span>
                  <span className="font-medium">15 天 3 小时</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-2 w-full rounded-full bg-success"></div>
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">数据库使用</span>
                  <span className="font-medium">45.2 MB / 100 MB</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-2 w-[45%] rounded-full bg-accent"></div>
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">API 响应时间</span>
                  <span className="font-medium">平均 120ms</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-2 w-[30%] rounded-full bg-success"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help info */}
      <div className="rounded-lg bg-accent/10 p-6">
        <h3 className="mb-3 text-lg font-semibold text-accent">快速开始</h3>
        <div className="space-y-2 text-sm text-foreground/80">
          <p>后端 API 已完成（tRPC + Prisma）</p>
          <p>数据库设计已完成（7个核心表）</p>
          <p>用户认证和权限系统已实现</p>
          <p>完整的布局系统（侧边栏 + 头部 + Tab）</p>
          <p className="mt-4 rounded bg-accent/10 p-3">
            需要添加更多功能？请参考项目根目录下的{' '}
            <code className="rounded bg-accent/20 px-2 py-1 font-mono text-xs">implementation_guide_part3.md</code>{' '}
            文档，里面有完整的功能模块实现代码。
          </p>
        </div>
      </div>
    </div>
  )
}

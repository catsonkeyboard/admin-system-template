import { useUserStore } from '@/client/stores/userStore'
import { Users, Building2, ShieldCheck, UserCog, TrendingUp, Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/card'
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
      {/* 欢迎区域 */}
      <div className="rounded-lg bg-gradient-to-r from-primary to-primary/80 p-8 text-primary-foreground shadow-lg">
        <h1 className="text-3xl font-bold">
          欢迎回来，{user?.realName || '管理员'}！
        </h1>
        <p className="mt-2 text-primary-foreground/90">
          这是您的 Admin 管理系统控制台，开始管理您的系统吧
        </p>
      </div>

      {/* 统计卡片 */}
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
                  <div className="rounded-full bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp
                    className={`mr-1 h-4 w-4 ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-gray-400'
                    }`}
                  />
                  <span
                    className={
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-gray-600'
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

      {/* 快捷操作 */}
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
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="font-medium">{action.name}</span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 系统信息 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 最近活动 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              最近活动
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 border-l-2 border-primary pl-3">
                <div>
                  <p className="text-sm font-medium">新用户注册</p>
                  <p className="text-xs text-muted-foreground">张三 加入了系统</p>
                  <p className="text-xs text-muted-foreground/70">2 分钟前</p>
                </div>
              </div>
              <div className="flex items-start gap-3 border-l-2 border-green-600 pl-3">
                <div>
                  <p className="text-sm font-medium">权限变更</p>
                  <p className="text-xs text-muted-foreground">李四的角色权限已更新</p>
                  <p className="text-xs text-muted-foreground/70">1 小时前</p>
                </div>
              </div>
              <div className="flex items-start gap-3 border-l-2 border-yellow-600 pl-3">
                <div>
                  <p className="text-sm font-medium">部门调整</p>
                  <p className="text-xs text-muted-foreground">技术部新增了 3 个子部门</p>
                  <p className="text-xs text-muted-foreground/70">3 小时前</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 系统状态 */}
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
                  <div className="h-2 w-full rounded-full bg-green-600"></div>
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">数据库使用</span>
                  <span className="font-medium">45.2 MB / 100 MB</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-2 w-[45%] rounded-full bg-primary"></div>
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">API 响应时间</span>
                  <span className="font-medium">平均 120ms</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-2 w-[30%] rounded-full bg-green-600"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 帮助信息 */}
      <div className="rounded-lg bg-primary/10 p-6">
        <h3 className="mb-3 text-lg font-semibold text-primary">🎯 快速开始</h3>
        <div className="space-y-2 text-sm text-primary/90">
          <p>✅ 后端 API 已完成（tRPC + Prisma）</p>
          <p>✅ 数据库设计已完成（7个核心表）</p>
          <p>✅ 用户认证和权限系统已实现</p>
          <p>✅ 完整的布局系统（侧边栏 + 头部 + Tab）</p>
          <p className="mt-4 rounded bg-primary/20 p-3">
            📝 需要添加更多功能？请参考项目根目录下的{' '}
            <code className="rounded bg-primary/30 px-2 py-1">implementation_guide_part3.md</code>{' '}
            文档，里面有完整的功能模块实现代码。
          </p>
        </div>
      </div>
    </div>
  )
}

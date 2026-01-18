import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/client/stores/userStore'
import { useMenuStore } from '@/client/stores/menuStore'
import { trpc } from '@/client/utils/trpc'
import { Input } from '@/client/components/ui/input'
import { Button } from '@/client/components/ui/button'
import { Label } from '@/client/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/card'

export function Login() {
  const navigate = useNavigate()
  const setUser = useUserStore((state) => state.setUser)
  const setMenus = useMenuStore((state) => state.setMenus)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      setUser(data.user as any, data.token, data.permissions)

      // 获取用户菜单
      try {
        // 注意：这里需要创建一个新的 tRPC 客户端实例来获取菜单
        // 实际项目中应该在登录成功后重新初始化 QueryClient
        setMenus([])
      } catch (e) {
        console.error('获取菜单失败', e)
      }

      navigate('/')
    },
    onError: (error) => {
      setError(error.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    loginMutation.mutate({ username, password })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Admin 管理系统</CardTitle>
          <CardDescription>请输入您的账号密码登录</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full"
            >
              {loginMutation.isPending ? '登录中...' : '登录'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            默认账号: admin / admin123
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

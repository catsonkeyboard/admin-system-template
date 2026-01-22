import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trpc, getTRPCClient } from './utils/trpc'
import { ToastProvider } from './components/ui/toast'
import { ThemeProvider } from './components/theme-provider'
import { AppLayout } from './components/layout/AppLayout'
import { Login } from './pages/Login'
import { Home } from './pages/Home'
import { UserManagement } from './pages/UserManagement'
import { DepartmentManagement } from './pages/DepartmentManagement'
import { MenuManagement } from './pages/MenuManagement'
import { RoleManagement } from './pages/RoleManagement'
import { PermissionManagement } from './pages/PermissionManagement'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const trpcClient = getTRPCClient()

export function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<Home />} />
                  <Route path="system/user" element={<UserManagement />} />
                  <Route path="system/department" element={<DepartmentManagement />} />
                  <Route path="system/menu" element={<MenuManagement />} />
                  <Route path="system/role" element={<RoleManagement />} />
                  <Route path="system/permission" element={<PermissionManagement />} />
                  {/* 其他路由可以在这里添加 */}
                  {/* 参考 implementation_guide.md 添加完整的功能页面 */}
                </Route>
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  )
}

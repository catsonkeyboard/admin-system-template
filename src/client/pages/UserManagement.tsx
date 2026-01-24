import { useState } from 'react'
import { trpc } from '@/client/utils/trpc'
import { DataTable } from '@/client/components/common/DataTable'
import { UserFormDialog } from '@/client/components/modules/UserFormDialog'
import { PermissionGuard } from '@/client/components/common/PermissionGuard'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { useToast } from '@/client/components/ui/toast'
import { usePermission } from '@/client/hooks/usePermission'
import { Plus, Search, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/card'
import { Badge } from '@/client/components/ui/badge'

interface UserFormData {
  id?: string
  username: string
  realName: string
  password?: string
  phone: string
  departmentId: string
  position: string
  roleIds: string[]
}

export function UserManagement() {
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserFormData | null>(null)
  const { showToast } = useToast()
  const { canEdit, canDelete } = usePermission()

  // 查询用户列表
  const { data: usersData, isLoading, refetch } = trpc.user.list.useQuery({
    page,
    pageSize: 10,
    keyword,
  })

  // 删除用户
  const deleteMutation = trpc.user.delete.useMutation({
    onSuccess: () => {
      refetch()
      showToast('用户删除成功', 'success')
    },
    onError: (error) => {
      showToast(`删除失败: ${error.message}`, 'error')
    },
  })

  const columns = [
    {
      key: 'username',
      title: '用户名',
    },
    {
      key: 'realName',
      title: '姓名',
    },
    {
      key: 'phone',
      title: '手机号',
      render: (phone: string) => phone || '-',
    },
    {
      key: 'department',
      title: '部门',
      render: (_: any, record: any) => record.department?.name || '-',
    },
    {
      key: 'position',
      title: '岗位',
      render: (position: string) => position || '-',
    },
    {
      key: 'status',
      title: '状态',
      render: (status: string) => (
        <Badge variant={status === 'ACTIVE' ? 'default' : 'secondary'}>
          {status === 'ACTIVE' ? '正常' : '停用'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      title: '创建时间',
      render: (date: Date) => format(new Date(date), 'yyyy-MM-dd HH:mm'),
    },
  ]

  const handleCreate = () => {
    setEditingUser(null)
    setDialogOpen(true)
  }

  const handleEdit = (user: any) => {
    setEditingUser({
      id: user.id,
      username: user.username,
      realName: user.realName,
      phone: user.phone || '',
      departmentId: user.departmentId || '',
      position: user.position || '',
      roleIds: user.userRoles.map((ur: any) => ur.roleId),
    })
    setDialogOpen(true)
  }

  const handleDelete = (user: any) => {
    if (confirm(`确定删除用户 ${user.realName} 吗？此操作不可恢复。`)) {
      deleteMutation.mutate({ id: user.id })
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>用户管理</CardTitle>
              <CardDescription>管理系统用户，配置角色和权限</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <PermissionGuard permission="user:create">
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  新建用户
                </Button>
              </PermissionGuard>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 搜索栏 */}
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索用户名、姓名、手机号"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* 表格 */}
          <DataTable
            columns={columns}
            data={usersData?.items || []}
            loading={isLoading}
            onEdit={canEdit('user') ? handleEdit : undefined}
            onDelete={canDelete('user') ? handleDelete : undefined}
          />

          {/* 分页 */}
          {usersData && usersData.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                共 {usersData.total} 条记录，第 {page} / {usersData.totalPages} 页
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === usersData.totalPages}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 用户表单对话框 */}
      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editingUser}
        onSuccess={() => {
          refetch()
          showToast(editingUser ? '用户更新成功' : '用户创建成功', 'success')
        }}
      />
    </div>
  )
}

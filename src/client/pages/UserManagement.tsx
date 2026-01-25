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
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()

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
      showToast(t('user.deleteSuccess'), 'success')
    },
    onError: (error) => {
      showToast(`${t('common.actions.delete')} ${t('common.status.fail') || 'failed'}: ${error.message}`, 'error')
    },
  })

  const columns = [
    {
      key: 'username',
      title: t('common.columns.username'),
    },
    {
      key: 'realName',
      title: t('common.columns.realName'),
    },
    {
      key: 'phone',
      title: t('common.columns.phone'),
      render: (phone: string) => phone || '-',
    },
    {
      key: 'department',
      title: t('common.columns.department'),
      render: (_: any, record: any) => record.department?.name || '-',
    },
    {
      key: 'position',
      title: t('common.columns.position'),
      render: (position: string) => position || '-',
    },
    {
      key: 'status',
      title: t('common.columns.status'),
      render: (status: string) => (
        <Badge variant={status === 'ACTIVE' ? 'default' : 'secondary'}>
          {status === 'ACTIVE' ? t('common.status.active') : t('common.status.inactive')}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      title: t('common.columns.createdAt'),
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
    if (confirm(t('user.deleteConfirm', { name: user.realName }))) {
      deleteMutation.mutate({ id: user.id })
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{t('user.title')}</CardTitle>
              <CardDescription>{t('user.description')}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <PermissionGuard permission="user:create">
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('user.create')}
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
                placeholder={t('user.searchPlaceholder')}
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
                {t('common.pagination.total', { total: usersData.total, current: page, totalPage: usersData.totalPages })}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  {t('common.pagination.prev')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === usersData.totalPages}
                >
                  {t('common.pagination.next')}
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
          showToast(editingUser ? t('user.updateSuccess') : t('user.createSuccess'), 'success')
        }}
      />
    </div>
  )
}

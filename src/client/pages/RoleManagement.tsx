import { useState } from 'react'
import { trpc } from '@/client/utils/trpc'
import { RoleFormDialog } from '@/client/components/modules/RoleFormDialog'
import { RolePermissionDialog } from '@/client/components/modules/RolePermissionDialog'
import { PermissionGuard } from '@/client/components/common/PermissionGuard'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Badge } from '@/client/components/ui/badge'
import { useToast } from '@/client/components/ui/toast'
import { usePermission } from '@/client/hooks/usePermission'
import { Plus, Search, RefreshCw, Shield, Users, Key } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/card'
import { useTranslation } from 'react-i18next'

interface RoleFormData {
  id?: string
  name: string
  code: string
  status?: 'ACTIVE' | 'INACTIVE'
  description?: string
}

export function RoleManagement() {
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleFormData | null>(null)
  const [configuringRole, setConfiguringRole] = useState<{ id: string; name: string } | null>(null)
  const { showToast } = useToast()
  const { canEdit, canDelete } = usePermission()
  const { t } = useTranslation()

  // 查询角色列表
  const { data: rolesData, isLoading, refetch } = trpc.role.list.useQuery({
    page,
    pageSize: 10,
    keyword,
  })

  // 删除角色
  const deleteMutation = trpc.role.delete.useMutation({
    onSuccess: () => {
      refetch()
      showToast(t('common.status.success') || 'Success', 'success')
    },
    onError: (error) => {
      showToast(`${t('common.status.fail')}: ${error.message}`, 'error')
    },
  })

  const columns = [
    {
      key: 'name',
      title: t('common.columns.roleName'),
      render: (name: string, record: any) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <Shield className="h-4 w-4 text-accent" />
          </div>
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-muted-foreground">{record.code}</div>
          </div>
        </div>
      ),
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
      key: 'userCount',
      title: t('home.stats.totalUsers'), // Reuse or new key
      render: (_: any, record: any) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{record.userRoles?.length || 0}</span>
        </div>
      ),
    },
    {
      key: 'permissionCount',
      title: t('home.stats.permissions'),
      render: (_: any, record: any) => (
        <div className="text-sm text-muted-foreground">
          {record.rolePermissions?.length || 0}
        </div>
      ),
    },
    {
      key: 'description',
      title: t('common.columns.description'),
      render: (description: string) => (
        <span className="text-sm text-muted-foreground">
          {description || '-'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      title: t('common.columns.createdAt'),
      render: (date: Date) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(date), 'yyyy-MM-dd HH:mm')}
        </span>
      ),
    },
  ]

  const handleCreate = () => {
    setEditingRole(null)
    setDialogOpen(true)
  }

  const handleEdit = (role: any) => {
    setEditingRole({
      id: role.id,
      name: role.name,
      code: role.code,
      status: role.status,
      description: role.description,
    })
    setDialogOpen(true)
  }

  const handleDelete = (role: any) => {
    const userCount = role.userRoles?.length || 0
    if (userCount > 0) {
      showToast(`该角色下有 ${userCount} 个用户，无法删除`, 'error')
      return
    }

    if (confirm(`Are you sure to delete role ${role.name}?`)) {
      deleteMutation.mutate({ id: role.id })
    }
  }

  const handleConfigurePermissions = (role: any) => {
    setConfiguringRole({ id: role.id, name: role.name })
    setPermissionDialogOpen(true)
  }

  // 统计信息
  const stats = rolesData ? {
    total: rolesData.total,
    active: rolesData.items.filter((r: any) => r.status === 'ACTIVE').length,
    inactive: rolesData.items.filter((r: any) => r.status === 'INACTIVE').length,
    totalUsers: rolesData.items.reduce((sum: number, r: any) => sum + (r.userRoles?.length || 0), 0),
  } : null

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{t('role.title')}</CardTitle>
              <CardDescription>{t('role.description')}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <PermissionGuard permission="role:create">
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('role.create')}
                </Button>
              </PermissionGuard>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 统计卡片 */}
          {stats && (
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">{t('role.title')}</div>
              </div>
              <div className="rounded-lg border bg-success/10 p-4">
                <div className="text-2xl font-bold text-success">{stats.active}</div>
                <div className="text-sm text-success">{t('common.status.active')}</div>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="text-2xl font-bold text-muted-foreground">{stats.inactive}</div>
                <div className="text-sm text-muted-foreground">{t('common.status.inactive')}</div>
              </div>
              <div className="rounded-lg border bg-accent/10 p-4">
                <div className="text-2xl font-bold text-accent">{stats.totalUsers}</div>
                <div className="text-sm text-accent">{t('home.stats.totalUsers')}</div>
              </div>
            </div>
          )}

          {/* 搜索栏 */}
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('role.searchPlaceholder')}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* 表格 */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      {column.title}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('common.columns.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : rolesData?.items.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-muted-foreground">
                      No Data
                    </td>
                  </tr>
                ) : (
                  rolesData?.items.map((record: any) => (
                    <tr key={record.id} className="hover:bg-muted/50">
                      {columns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm">
                          {column.render
                            ? column.render((record as any)[column.key], record)
                            : (record as any)[column.key]}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <PermissionGuard permission="role:assign">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleConfigurePermissions(record)}
                            >
                              <Key className="mr-1 h-3 w-3" />
                              {t('role.assignPermissions')}
                            </Button>
                          </PermissionGuard>
                          {canEdit('role') && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(record)}
                            >
                              {t('common.actions.edit')}
                            </Button>
                          )}
                          {canDelete('role') && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(record)}
                              className="text-destructive hover:text-destructive"
                            >
                              {t('common.actions.delete')}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {rolesData && rolesData.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {t('common.pagination.total', { total: rolesData.total, current: page, totalPage: rolesData.totalPages })}
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
                  disabled={page === rolesData.totalPages}
                >
                  {t('common.pagination.next')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 角色表单对话框 */}
      <RoleFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        role={editingRole}
        onSuccess={() => {
          refetch()
          showToast(
            editingRole ? '角色更新成功' : '角色创建成功',
            'success'
          )
        }}
      />

      {/* 角色权限配置对话框 */}
      <RolePermissionDialog
        open={permissionDialogOpen}
        onOpenChange={setPermissionDialogOpen}
        role={configuringRole}
        onSuccess={() => {
          refetch()
          showToast('权限配置成功', 'success')
        }}
      />
    </div>
  )
}

import { useState } from 'react'
import { trpc } from '@/client/utils/trpc'
import { DataTable } from '@/client/components/common/DataTable'
import { PermissionFormDialog } from '@/client/components/modules/PermissionFormDialog'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Badge } from '@/client/components/ui/badge'
import { useToast } from '@/client/components/ui/toast'
import { Plus, Search, RefreshCw, Key, Menu, MousePointer, Database } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/card'
import { useTranslation } from 'react-i18next'

interface PermissionFormData {
  id?: string
  name: string
  code: string
  type: 'MENU' | 'BUTTON' | 'DATA'
  menuId?: string
  description?: string
}

export function PermissionManagement() {
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<PermissionFormData | null>(null)
  const { showToast } = useToast()
  const { t } = useTranslation()

  // 查询权限列表
  const { data: permissionsData, isLoading, refetch } = trpc.permission.list.useQuery({
    page,
    pageSize: 10,
    keyword,
  })

  // 查询菜单列表（用于显示关联菜单名称）
  const { data: menus } = trpc.menu.list.useQuery()

  // 删除权限
  const deleteMutation = trpc.permission.delete.useMutation({
    onSuccess: () => {
      refetch()
      showToast(t('common.status.success') || 'Success', 'success')
    },
    onError: (error) => {
      showToast(`${t('common.status.fail')}: ${error.message}`, 'error')
    },
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'MENU':
        return <Menu className="h-4 w-4 text-accent" />
      case 'BUTTON':
        return <MousePointer className="h-4 w-4 text-success" />
      case 'DATA':
        return <Database className="h-4 w-4 text-accent" />
      default:
        return <Key className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MENU':
        return 'default'
      case 'BUTTON':
        return 'secondary'
      case 'DATA':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const columns = [
    {
      key: 'name',
      title: t('common.columns.permissionName'),
      render: (name: string, record: any) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            {getTypeIcon(record.type)}
          </div>
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-muted-foreground">{record.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      title: t('common.columns.type'),
      render: (type: string) => (
        <Badge variant={getTypeColor(type) as any}>
          {type === 'MENU' && 'Menu'}
          {type === 'BUTTON' && 'Button'}
          {type === 'DATA' && 'Data'}
        </Badge>
      ),
    },
    {
      key: 'menuId',
      title: t('common.columns.menuName'),
      render: (menuId: string) => {
        const menu = menus?.find(m => m.id === menuId)
        return (
          <span className="text-sm text-muted-foreground">
            {menu?.name || '-'}
          </span>
        )
      },
    },
    {
      key: 'roleCount',
      title: 'Roles',
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
    setEditingPermission(null)
    setDialogOpen(true)
  }

  const handleEdit = (permission: any) => {
    setEditingPermission({
      id: permission.id,
      name: permission.name,
      code: permission.code,
      type: permission.type,
      menuId: permission.menuId,
      description: permission.description,
    })
    setDialogOpen(true)
  }

  const handleDelete = (permission: any) => {
    const roleCount = permission.rolePermissions?.length || 0
    if (roleCount > 0) {
      showToast(`This permission is used by ${roleCount} roles, cannot delete`, 'error')
      return
    }

    if (confirm(`Are you sure to delete permission ${permission.name}?`)) {
      deleteMutation.mutate({ id: permission.id })
    }
  }

  // 统计信息
  const stats = permissionsData ? {
    total: permissionsData.total,
    menu: permissionsData.items.filter((p: any) => p.type === 'MENU').length,
    button: permissionsData.items.filter((p: any) => p.type === 'BUTTON').length,
    data: permissionsData.items.filter((p: any) => p.type === 'DATA').length,
  } : null

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{t('permission.title')}</CardTitle>
              <CardDescription>{t('permission.description')}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                {t('permission.create')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 统计卡片 */}
          {stats && (
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Permissions</div>
              </div>
              <div className="rounded-lg border bg-info/10 p-4">
                <div className="text-2xl font-bold text-info">{stats.menu}</div>
                <div className="text-sm text-info">Menu Permissions</div>
              </div>
              <div className="rounded-lg border bg-success/10 p-4">
                <div className="text-2xl font-bold text-success">{stats.button}</div>
                <div className="text-sm text-success">Button Permissions</div>
              </div>
              <div className="rounded-lg border bg-accent/10 p-4">
                <div className="text-2xl font-bold text-accent">{stats.data}</div>
                <div className="text-sm text-accent">Data Permissions</div>
              </div>
            </div>
          )}

          {/* 搜索栏 */}
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('permission.searchPlaceholder')}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* 表格 */}
          <DataTable
            columns={columns}
            data={permissionsData?.items || []}
            loading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* 分页 */}
          {permissionsData && permissionsData.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {t('common.pagination.total', { total: permissionsData.total, current: page, totalPage: permissionsData.totalPages })}
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
                  disabled={page === permissionsData.totalPages}
                >
                   {t('common.pagination.next')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 权限表单对话框 */}
      <PermissionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        permission={editingPermission}
        onSuccess={() => {
          refetch()
          showToast(
            editingPermission ? 'Permission updated' : 'Permission created',
            'success'
          )
        }}
      />
    </div>
  )
}

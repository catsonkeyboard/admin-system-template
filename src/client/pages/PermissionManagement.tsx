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
      showToast('权限删除成功', 'success')
    },
    onError: (error) => {
      showToast(`删除失败: ${error.message}`, 'error')
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
      title: '权限名称',
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
      title: '权限类型',
      render: (type: string) => (
        <Badge variant={getTypeColor(type) as any}>
          {type === 'MENU' && '菜单权限'}
          {type === 'BUTTON' && '按钮权限'}
          {type === 'DATA' && '数据权限'}
        </Badge>
      ),
    },
    {
      key: 'menuId',
      title: '关联菜单',
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
      title: '关联角色',
      render: (_: any, record: any) => (
        <div className="text-sm text-muted-foreground">
          {record.rolePermissions?.length || 0} 个角色
        </div>
      ),
    },
    {
      key: 'description',
      title: '描述',
      render: (description: string) => (
        <span className="text-sm text-muted-foreground">
          {description || '-'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      title: '创建时间',
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
      showToast(`该权限被 ${roleCount} 个角色使用，无法删除`, 'error')
      return
    }

    if (confirm(`确定删除权限 ${permission.name} 吗？此操作不可恢复。`)) {
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
          <CardTitle>权限管理</CardTitle>
          <CardDescription>管理系统权限，配置菜单、按钮和数据访问权限</CardDescription>
          <div className="flex justify-end">
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              新建权限
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 统计卡片 */}
          {stats && (
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">总权限数</div>
              </div>
              <div className="rounded-lg border bg-info/10 p-4">
                <div className="text-2xl font-bold text-info">{stats.menu}</div>
                <div className="text-sm text-info">菜单权限</div>
              </div>
              <div className="rounded-lg border bg-success/10 p-4">
                <div className="text-2xl font-bold text-success">{stats.button}</div>
                <div className="text-sm text-success">按钮权限</div>
              </div>
              <div className="rounded-lg border bg-accent/10 p-4">
                <div className="text-2xl font-bold text-accent">{stats.data}</div>
                <div className="text-sm text-accent">数据权限</div>
              </div>
            </div>
          )}

          {/* 搜索栏 */}
          <div className="mb-4 flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索权限名称、代码"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              刷新
            </Button>
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
                共 {permissionsData.total} 条记录，第 {page} / {permissionsData.totalPages} 页
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
                  disabled={page === permissionsData.totalPages}
                >
                  下一页
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
            editingPermission ? '权限更新成功' : '权限创建成功',
            'success'
          )
        }}
      />
    </div>
  )
}

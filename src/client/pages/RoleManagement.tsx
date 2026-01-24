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
      showToast('角色删除成功', 'success')
    },
    onError: (error) => {
      showToast(`删除失败: ${error.message}`, 'error')
    },
  })

  const columns = [
    {
      key: 'name',
      title: '角色名称',
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
      title: '状态',
      render: (status: string) => (
        <Badge variant={status === 'ACTIVE' ? 'default' : 'secondary'}>
          {status === 'ACTIVE' ? '启用' : '停用'}
        </Badge>
      ),
    },
    {
      key: 'userCount',
      title: '用户数量',
      render: (_: any, record: any) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{record.userRoles?.length || 0} 人</span>
        </div>
      ),
    },
    {
      key: 'permissionCount',
      title: '权限数量',
      render: (_: any, record: any) => (
        <div className="text-sm text-muted-foreground">
          {record.rolePermissions?.length || 0} 个权限
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

    if (confirm(`确定删除角色 ${role.name} 吗？此操作不可恢复。`)) {
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
          <CardTitle>角色管理</CardTitle>
          <CardDescription>管理系统角色，配置角色权限</CardDescription>
          <div className="flex justify-end">
            <PermissionGuard permission="role:create">
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                新建角色
              </Button>
            </PermissionGuard>
          </div>
        </CardHeader>
        <CardContent>
          {/* 统计卡片 */}
          {stats && (
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">总角色数</div>
              </div>
              <div className="rounded-lg border bg-success/10 p-4">
                <div className="text-2xl font-bold text-success">{stats.active}</div>
                <div className="text-sm text-success">启用中</div>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="text-2xl font-bold text-muted-foreground">{stats.inactive}</div>
                <div className="text-sm text-muted-foreground">已停用</div>
              </div>
              <div className="rounded-lg border bg-accent/10 p-4">
                <div className="text-2xl font-bold text-accent">{stats.totalUsers}</div>
                <div className="text-sm text-accent">关联用户</div>
              </div>
            </div>
          )}

          {/* 搜索栏 */}
          <div className="mb-4 flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索角色名称、代码"
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
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-muted-foreground">
                      加载中...
                    </td>
                  </tr>
                ) : rolesData?.items.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-muted-foreground">
                      暂无数据
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
                              配置权限
                            </Button>
                          </PermissionGuard>
                          {canEdit('role') && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(record)}
                            >
                              编辑
                            </Button>
                          )}
                          {canDelete('role') && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(record)}
                              className="text-destructive hover:text-destructive"
                            >
                              删除
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
                共 {rolesData.total} 条记录，第 {page} / {rolesData.totalPages} 页
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
                  disabled={page === rolesData.totalPages}
                >
                  下一页
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

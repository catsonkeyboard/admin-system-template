import { useState, useEffect } from 'react'
import { trpc } from '@/client/utils/trpc'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/client/components/ui/dialog'
import { Button } from '@/client/components/ui/button'
import { Checkbox } from '@/client/components/ui/checkbox'
import { Badge } from '@/client/components/ui/badge'
import { Loader2, Menu, MousePointer, Database } from 'lucide-react'

interface RolePermissionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: { id: string; name: string } | null
  onSuccess: () => void
}

export function RolePermissionDialog({
  open,
  onOpenChange,
  role,
  onSuccess
}: RolePermissionDialogProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 查询所有权限
  const { data: permissionsData } = trpc.permission.list.useQuery({
    page: 1,
    pageSize: 1000,
  })

  // 查询角色当前的权限
  const { data: roleData } = trpc.role.getById.useQuery(
    { id: role?.id || '' },
    { enabled: !!role?.id }
  )

  const updatePermissionsMutation = trpc.role.updatePermissions.useMutation({
    onSuccess: () => {
      onSuccess()
      onOpenChange(false)
      setIsSubmitting(false)
    },
    onError: () => {
      setIsSubmitting(false)
    },
  })

  useEffect(() => {
    if (roleData?.rolePermissions) {
      setSelectedPermissions(roleData.rolePermissions.map(rp => rp.permissionId))
    } else {
      setSelectedPermissions([])
    }
  }, [roleData])

  const handleSubmit = () => {
    if (!role) return

    setIsSubmitting(true)
    updatePermissionsMutation.mutate({
      roleId: role.id,
      permissionIds: selectedPermissions,
    })
  }

  const handleToggle = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const handleSelectAll = (type?: string) => {
    if (!permissionsData?.items) return

    const typePermissions = type
      ? permissionsData.items.filter(p => p.type === type)
      : permissionsData.items

    const typePermissionIds = typePermissions.map(p => p.id)
    const allSelected = typePermissionIds.every(id => selectedPermissions.includes(id))

    if (allSelected) {
      // 取消全选
      setSelectedPermissions(prev => prev.filter(id => !typePermissionIds.includes(id)))
    } else {
      // 全选
      setSelectedPermissions(prev => [...new Set([...prev, ...typePermissionIds])])
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'MENU':
        return <Menu className="h-4 w-4 text-accent" />
      case 'BUTTON':
        return <MousePointer className="h-4 w-4 text-success" />
      case 'DATA':
        return <Database className="h-4 w-4 text-info" />
      default:
        return null
    }
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'MENU':
        return 'info'
      case 'BUTTON':
        return 'success'
      case 'DATA':
        return 'warning'
      default:
        return 'default'
    }
  }

  // 按类型分组权限
  const groupedPermissions = permissionsData?.items.reduce((acc, permission) => {
    if (!acc[permission.type]) {
      acc[permission.type] = []
    }
    acc[permission.type].push(permission)
    return acc
  }, {} as Record<string, any[]>) || {}

  const typeLabels = {
    MENU: '菜单权限',
    BUTTON: '按钮权限',
    DATA: '数据权限',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            配置角色权限 - {role?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {/* 统计信息 */}
          <div className="mb-4 flex items-center justify-between rounded-lg bg-accent/10 p-3">
            <div className="text-sm">
              <span className="font-medium text-foreground">已选择: </span>
              <span className="text-accent">{selectedPermissions.length} / {permissionsData?.items.length || 0} 个权限</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSelectAll()}
            >
              {selectedPermissions.length === permissionsData?.items.length ? '取消全选' : '全选'}
            </Button>
          </div>

          {/* 按类型分组显示权限 */}
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([type, permissions]) => (
              <div key={type} className="rounded-lg border border-border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(type)}
                    <h3 className="font-semibold text-foreground">
                      {typeLabels[type as keyof typeof typeLabels]}
                    </h3>
                    <Badge variant={getTypeBadgeVariant(type) as any}>
                      {permissions.length} 个
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSelectAll(type)}
                  >
                    {permissions.every(p => selectedPermissions.includes(p.id))
                      ? '取消全选'
                      : '全选此类'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-start gap-2 rounded border border-border p-3 hover:bg-foreground/[0.04]"
                    >
                      <Checkbox
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={() => handleToggle(permission.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground text-sm">
                          {permission.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {permission.code}
                        </div>
                        {permission.menu && (
                          <div className="mt-1 text-xs text-muted-foreground/70">
                            📋 {permission.menu.name}
                          </div>
                        )}
                        {permission.description && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {permission.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {permissionsData?.items.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              暂无权限，请先创建权限
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            保存配置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

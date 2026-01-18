# Admin 管理系统 - 功能模块实现（Phase 6-8）

## 6. 功能模块实现

### 6.1 通用数据表格组件

**src/client/components/common/DataTable.tsx**
```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/client/components/ui/table'
import { Button } from '@/client/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/client/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

interface Column<T> {
  key: string
  title: string
  render?: (value: any, record: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  onEdit?: (record: T) => void
  onDelete?: (record: T) => void
  actions?: (record: T) => React.ReactNode
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading,
  onEdit,
  onDelete,
  actions,
}: DataTableProps<T>) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.title}</TableHead>
            ))}
            {(onEdit || onDelete || actions) && (
              <TableHead className="w-[100px]">操作</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="text-center">
                加载中...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="text-center">
                暂无数据
              </TableCell>
            </TableRow>
          ) : (
            data.map((record) => (
              <TableRow key={record.id}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.render
                      ? column.render((record as any)[column.key], record)
                      : (record as any)[column.key]}
                  </TableCell>
                ))}
                {(onEdit || onDelete || actions) && (
                  <TableCell>
                    {actions ? (
                      actions(record)
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(record)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              编辑
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem
                              onClick={() => onDelete(record)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
```

### 6.2 通用表单对话框

**src/client/components/common/FormDialog.tsx**
```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/client/components/ui/dialog'
import { Button } from '@/client/components/ui/button'
import { Loader2 } from 'lucide-react'

interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  onSubmit: (e: React.FormEvent) => void
  loading?: boolean
  submitText?: string
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  loading,
  submitText = '提交',
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="space-y-4 py-4">{children}</div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

### 6.3 用户管理页面

**src/client/pages/UserManagement.tsx**
```typescript
import { useState } from 'react'
import { trpc } from '@/client/utils/trpc'
import { usePermission } from '@/client/hooks/usePermission'
import { useToast } from '@/client/components/ui/use-toast'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Label } from '@/client/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/client/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/client/components/ui/card'
import { Badge } from '@/client/components/ui/badge'
import { DataTable } from '@/client/components/common/DataTable'
import { FormDialog } from '@/client/components/common/FormDialog'
import { Plus, Search } from 'lucide-react'
import { format } from 'date-fns'

interface UserForm {
  id?: string
  username: string
  realName: string
  password?: string
  phone: string
  departmentId: string
  position: string
  accountExpiry?: Date
  roleIds: string[]
}

export function UserManagement() {
  const { toast } = useToast()
  const { canCreate, canEdit, canDelete } = usePermission()
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserForm | null>(null)

  // 查询
  const { data: usersData, isLoading, refetch } = trpc.user.list.useQuery({
    page,
    pageSize: 10,
    keyword,
  })

  const { data: departments } = trpc.department.list.useQuery()
  const { data: roles } = trpc.role.list.useQuery({ page: 1, pageSize: 100 })

  // 创建
  const createMutation = trpc.user.create.useMutation({
    onSuccess: () => {
      toast({ title: '创建成功' })
      setDialogOpen(false)
      refetch()
    },
    onError: (error) => {
      toast({ title: '创建失败', description: error.message, variant: 'destructive' })
    },
  })

  // 更新
  const updateMutation = trpc.user.update.useMutation({
    onSuccess: () => {
      toast({ title: '更新成功' })
      setDialogOpen(false)
      refetch()
    },
    onError: (error) => {
      toast({ title: '更新失败', description: error.message, variant: 'destructive' })
    },
  })

  // 删除
  const deleteMutation = trpc.user.delete.useMutation({
    onSuccess: () => {
      toast({ title: '删除成功' })
      refetch()
    },
    onError: (error) => {
      toast({ title: '删除失败', description: error.message, variant: 'destructive' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    if (editingUser.id) {
      updateMutation.mutate(editingUser)
    } else {
      createMutation.mutate(editingUser as any)
    }
  }

  const handleEdit = (user: any) => {
    setEditingUser({
      id: user.id,
      username: user.username,
      realName: user.realName,
      phone: user.phone || '',
      departmentId: user.departmentId || '',
      position: user.position || '',
      accountExpiry: user.accountExpiry,
      roleIds: user.userRoles.map((ur: any) => ur.roleId),
    })
    setDialogOpen(true)
  }

  const handleDelete = (user: any) => {
    if (confirm(`确定删除用户 ${user.realName} 吗？`)) {
      deleteMutation.mutate({ id: user.id })
    }
  }

  const handleCreate = () => {
    setEditingUser({
      username: '',
      realName: '',
      password: '',
      phone: '',
      departmentId: '',
      position: '',
      roleIds: [],
    })
    setDialogOpen(true)
  }

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
    },
    {
      key: 'department',
      title: '部门',
      render: (_: any, record: any) => record.department?.name || '-',
    },
    {
      key: 'position',
      title: '岗位',
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>用户管理</CardTitle>
            {canCreate('user') && (
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                新建用户
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* 搜索栏 */}
          <div className="mb-4 flex gap-2">
            <Input
              placeholder="搜索用户名、姓名、手机号"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="outline" onClick={() => refetch()}>
              <Search className="h-4 w-4" />
            </Button>
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
            <div className="mt-4 flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                上一页
              </Button>
              <span className="flex items-center px-4">
                第 {page} / {usersData.totalPages} 页
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === usersData.totalPages}
              >
                下一页
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 表单对话框 */}
      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingUser?.id ? '编辑用户' : '新建用户'}
        onSubmit={handleSubmit}
        loading={createMutation.isLoading || updateMutation.isLoading}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="username">用户名 *</Label>
            <Input
              id="username"
              value={editingUser?.username || ''}
              onChange={(e) =>
                setEditingUser({ ...editingUser!, username: e.target.value })
              }
              required
              disabled={!!editingUser?.id}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="realName">姓名 *</Label>
            <Input
              id="realName"
              value={editingUser?.realName || ''}
              onChange={(e) =>
                setEditingUser({ ...editingUser!, realName: e.target.value })
              }
              required
            />
          </div>

          {!editingUser?.id && (
            <div className="space-y-2">
              <Label htmlFor="password">密码 *</Label>
              <Input
                id="password"
                type="password"
                value={editingUser?.password || ''}
                onChange={(e) =>
                  setEditingUser({ ...editingUser!, password: e.target.value })
                }
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone">手机号</Label>
            <Input
              id="phone"
              value={editingUser?.phone || ''}
              onChange={(e) =>
                setEditingUser({ ...editingUser!, phone: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="departmentId">部门</Label>
            <Select
              value={editingUser?.departmentId || ''}
              onValueChange={(value) =>
                setEditingUser({ ...editingUser!, departmentId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="选择部门" />
              </SelectTrigger>
              <SelectContent>
                {departments?.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">岗位</Label>
            <Input
              id="position"
              value={editingUser?.position || ''}
              onChange={(e) =>
                setEditingUser({ ...editingUser!, position: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>角色</Label>
          <div className="flex flex-wrap gap-2">
            {roles?.items.map((role) => (
              <label
                key={role.id}
                className="flex items-center gap-2 rounded border p-2"
              >
                <input
                  type="checkbox"
                  checked={editingUser?.roleIds.includes(role.id)}
                  onChange={(e) => {
                    const roleIds = e.target.checked
                      ? [...(editingUser?.roleIds || []), role.id]
                      : editingUser?.roleIds.filter((id) => id !== role.id) || []
                    setEditingUser({ ...editingUser!, roleIds })
                  }}
                />
                {role.name}
              </label>
            ))}
          </div>
        </div>
      </FormDialog>
    </div>
  )
}
```

### 6.4 部门管理页面（树形展示）

**src/client/components/common/TreeView.tsx**
```typescript
import { ChevronRight, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/client/components/ui/button'

interface TreeNode {
  id: string
  name: string
  children?: TreeNode[]
}

interface TreeViewProps {
  data: TreeNode[]
  onSelect?: (node: TreeNode) => void
  renderActions?: (node: TreeNode) => React.ReactNode
}

function TreeNodeComponent({
  node,
  level = 0,
  onSelect,
  renderActions,
}: {
  node: TreeNode
  level?: number
  onSelect?: (node: TreeNode) => void
  renderActions?: (node: TreeNode) => React.ReactNode
}) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 hover:bg-accent rounded px-2"
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <div className="w-6" />
        )}

        <span
          className="flex-1 cursor-pointer"
          onClick={() => onSelect?.(node)}
        >
          {node.name}
        </span>

        {renderActions && renderActions(node)}
      </div>

      {expanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              renderActions={renderActions}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function TreeView({ data, onSelect, renderActions }: TreeViewProps) {
  return (
    <div className="border rounded-md p-2">
      {data.map((node) => (
        <TreeNodeComponent
          key={node.id}
          node={node}
          onSelect={onSelect}
          renderActions={renderActions}
        />
      ))}
    </div>
  )
}
```

**src/client/pages/DepartmentManagement.tsx**
```typescript
import { useState } from 'react'
import { trpc } from '@/client/utils/trpc'
import { usePermission } from '@/client/hooks/usePermission'
import { useToast } from '@/client/components/ui/use-toast'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Label } from '@/client/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/client/components/ui/card'
import { TreeView } from '@/client/components/common/TreeView'
import { FormDialog } from '@/client/components/common/FormDialog'
import { Plus, Pencil, Trash2 } from 'lucide-react'

interface DeptForm {
  id?: string
  name: string
  code: string
  parentId?: string
  sort: number
}

export function DepartmentManagement() {
  const { toast } = useToast()
  const { canCreate, canEdit, canDelete } = usePermission()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDept, setEditingDept] = useState<DeptForm | null>(null)

  const { data: deptTree, refetch } = trpc.department.tree.useQuery()

  const createMutation = trpc.department.create.useMutation({
    onSuccess: () => {
      toast({ title: '创建成功' })
      setDialogOpen(false)
      refetch()
    },
    onError: (error) => {
      toast({ title: '创建失败', description: error.message, variant: 'destructive' })
    },
  })

  const updateMutation = trpc.department.update.useMutation({
    onSuccess: () => {
      toast({ title: '更新成功' })
      setDialogOpen(false)
      refetch()
    },
    onError: (error) => {
      toast({ title: '更新失败', description: error.message, variant: 'destructive' })
    },
  })

  const deleteMutation = trpc.department.delete.useMutation({
    onSuccess: () => {
      toast({ title: '删除成功' })
      refetch()
    },
    onError: (error) => {
      toast({ title: '删除失败', description: error.message, variant: 'destructive' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDept) return

    if (editingDept.id) {
      updateMutation.mutate(editingDept)
    } else {
      createMutation.mutate(editingDept)
    }
  }

  const handleEdit = (dept: any) => {
    setEditingDept({
      id: dept.id,
      name: dept.name,
      code: dept.code,
      parentId: dept.parentId,
      sort: dept.sort,
    })
    setDialogOpen(true)
  }

  const handleDelete = (dept: any) => {
    if (confirm(`确定删除部门 ${dept.name} 吗？`)) {
      deleteMutation.mutate({ id: dept.id })
    }
  }

  const handleCreateChild = (parentDept: any) => {
    setEditingDept({
      name: '',
      code: '',
      parentId: parentDept.id,
      sort: 0,
    })
    setDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>部门管理</CardTitle>
            {canCreate('dept') && (
              <Button
                onClick={() => {
                  setEditingDept({ name: '', code: '', sort: 0 })
                  setDialogOpen(true)
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                新建顶级部门
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <TreeView
            data={deptTree || []}
            renderActions={(node: any) => (
              <div className="flex gap-1">
                {canCreate('dept') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCreateChild(node)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
                {canEdit('dept') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(node)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {canDelete('dept') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(node)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          />
        </CardContent>
      </Card>

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingDept?.id ? '编辑部门' : '新建部门'}
        onSubmit={handleSubmit}
        loading={createMutation.isLoading || updateMutation.isLoading}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">部门名称 *</Label>
            <Input
              id="name"
              value={editingDept?.name || ''}
              onChange={(e) =>
                setEditingDept({ ...editingDept!, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">部门代码 *</Label>
            <Input
              id="code"
              value={editingDept?.code || ''}
              onChange={(e) =>
                setEditingDept({ ...editingDept!, code: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort">排序</Label>
            <Input
              id="sort"
              type="number"
              value={editingDept?.sort || 0}
              onChange={(e) =>
                setEditingDept({
                  ...editingDept!,
                  sort: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>
        </div>
      </FormDialog>
    </div>
  )
}
```

### 6.5 角色权限管理页面

**src/client/pages/RoleManagement.tsx**
```typescript
import { useState } from 'react'
import { trpc } from '@/client/utils/trpc'
import { usePermission } from '@/client/hooks/usePermission'
import { useToast } from '@/client/components/ui/use-toast'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Label } from '@/client/components/ui/label'
import { Textarea } from '@/client/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/client/components/ui/card'
import { DataTable } from '@/client/components/common/DataTable'
import { FormDialog } from '@/client/components/common/FormDialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/client/components/ui/sheet'
import { Checkbox } from '@/client/components/ui/checkbox'
import { Plus, ShieldCheck } from 'lucide-react'

interface RoleForm {
  id?: string
  name: string
  code: string
  description: string
}

export function RoleManagement() {
  const { toast } = useToast()
  const { canCreate, canEdit, canDelete, hasPermission } = usePermission()
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [permissionSheetOpen, setPermissionSheetOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleForm | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  const { data: rolesData, refetch } = trpc.role.list.useQuery({
    page,
    pageSize: 10,
  })

  const { data: permissions } = trpc.permission.list.useQuery({
    page: 1,
    pageSize: 1000,
  })

  const { data: roleDetail } = trpc.role.getById.useQuery(
    { id: selectedRoleId! },
    { enabled: !!selectedRoleId }
  )

  const createMutation = trpc.role.create.useMutation({
    onSuccess: () => {
      toast({ title: '创建成功' })
      setDialogOpen(false)
      refetch()
    },
  })

  const updateMutation = trpc.role.update.useMutation({
    onSuccess: () => {
      toast({ title: '更新成功' })
      setDialogOpen(false)
      refetch()
    },
  })

  const updatePermissionsMutation = trpc.role.updatePermissions.useMutation({
    onSuccess: () => {
      toast({ title: '权限配置成功' })
      setPermissionSheetOpen(false)
      refetch()
    },
  })

  const deleteMutation = trpc.role.delete.useMutation({
    onSuccess: () => {
      toast({ title: '删除成功' })
      refetch()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRole) return

    if (editingRole.id) {
      updateMutation.mutate(editingRole)
    } else {
      createMutation.mutate(editingRole)
    }
  }

  const handleAssignPermissions = (role: any) => {
    setSelectedRoleId(role.id)
    setPermissionSheetOpen(true)
  }

  const handleSavePermissions = () => {
    if (!selectedRoleId) return

    updatePermissionsMutation.mutate({
      roleId: selectedRoleId,
      permissionIds: selectedPermissions,
    })
  }

  // 当角色详情加载时，设置已选权限
  useState(() => {
    if (roleDetail) {
      const permIds = roleDetail.rolePermissions.map((rp) => rp.permissionId)
      setSelectedPermissions(permIds)
    }
  }, [roleDetail])

  const columns = [
    { key: 'name', title: '角色名称' },
    { key: 'code', title: '角色代码' },
    { key: 'description', title: '描述' },
    {
      key: '_count',
      title: '用户数',
      render: (_: any, record: any) => record._count?.userRoles || 0,
    },
    {
      key: '_count',
      title: '权限数',
      render: (_: any, record: any) => record._count?.rolePermissions || 0,
    },
  ]

  // 按菜单分组权限
  const groupedPermissions = permissions?.items.reduce((acc, perm) => {
    const menuName = perm.menu?.name || '其他'
    if (!acc[menuName]) {
      acc[menuName] = []
    }
    acc[menuName].push(perm)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>角色管理</CardTitle>
            {canCreate('role') && (
              <Button
                onClick={() => {
                  setEditingRole({ name: '', code: '', description: '' })
                  setDialogOpen(true)
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                新建角色
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={rolesData?.items || []}
            onEdit={
              canEdit('role')
                ? (role: any) => {
                    setEditingRole({
                      id: role.id,
                      name: role.name,
                      code: role.code,
                      description: role.description || '',
                    })
                    setDialogOpen(true)
                  }
                : undefined
            }
            onDelete={canDelete('role') ? (role: any) => {
              if (confirm(`确定删除角色 ${role.name} 吗？`)) {
                deleteMutation.mutate({ id: role.id })
              }
            } : undefined}
            actions={
              hasPermission('role:assign-perm')
                ? (role: any) => (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAssignPermissions(role)}
                    >
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      配置权限
                    </Button>
                  )
                : undefined
            }
          />
        </CardContent>
      </Card>

      {/* 角色表单 */}
      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingRole?.id ? '编辑角色' : '新建角色'}
        onSubmit={handleSubmit}
        loading={createMutation.isLoading || updateMutation.isLoading}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>角色名称 *</Label>
            <Input
              value={editingRole?.name || ''}
              onChange={(e) =>
                setEditingRole({ ...editingRole!, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>角色代码 *</Label>
            <Input
              value={editingRole?.code || ''}
              onChange={(e) =>
                setEditingRole({ ...editingRole!, code: e.target.value })
              }
              required
              disabled={!!editingRole?.id}
            />
          </div>

          <div className="space-y-2">
            <Label>描述</Label>
            <Textarea
              value={editingRole?.description || ''}
              onChange={(e) =>
                setEditingRole({ ...editingRole!, description: e.target.value })
              }
            />
          </div>
        </div>
      </FormDialog>

      {/* 权限配置 */}
      <Sheet open={permissionSheetOpen} onOpenChange={setPermissionSheetOpen}>
        <SheetContent className="w-[500px] sm:w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>配置角色权限</SheetTitle>
            <SheetDescription>
              选择该角色可以访问的权限
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {groupedPermissions &&
              Object.entries(groupedPermissions).map(([menuName, perms]) => (
                <div key={menuName} className="space-y-2">
                  <h4 className="font-medium">{menuName}</h4>
                  <div className="space-y-2 pl-4">
                    {perms.map((perm) => (
                      <div key={perm.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={perm.id}
                          checked={selectedPermissions.includes(perm.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPermissions([...selectedPermissions, perm.id])
                            } else {
                              setSelectedPermissions(
                                selectedPermissions.filter((id) => id !== perm.id)
                              )
                            }
                          }}
                        />
                        <label htmlFor={perm.id} className="text-sm">
                          {perm.name} ({perm.code})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setPermissionSheetOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleSavePermissions}
              disabled={updatePermissionsMutation.isLoading}
            >
              保存
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
```

---

## 7. 权限控制实现

### 7.1 路由权限守卫组件

**src/client/components/common/PermissionGuard.tsx**
```typescript
import { usePermission } from '@/client/hooks/usePermission'
import { ReactNode } from 'react'

interface PermissionGuardProps {
  permission: string
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission } = usePermission()

  if (!hasPermission(permission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// 使用示例
// <PermissionGuard permission="user:create">
//   <Button>创建用户</Button>
// </PermissionGuard>
```

### 7.2 高阶组件包装器

**src/client/utils/withPermission.tsx**
```typescript
import { ComponentType } from 'react'
import { usePermission } from '@/client/hooks/usePermission'
import { Navigate } from 'react-router-dom'

export function withPermission<P extends object>(
  Component: ComponentType<P>,
  requiredPermission: string
) {
  return (props: P) => {
    const { hasPermission } = usePermission()

    if (!hasPermission(requiredPermission)) {
      return <Navigate to="/" replace />
    }

    return <Component {...props} />
  }
}

// 使用示例
// export const UserManagement = withPermission(
//   UserManagementComponent,
//   'user:view'
// )
```

---

## 8. 部署与启动

### 8.1 package.json 脚本

```json
{
  "name": "admin-system",
  "version": "1.0.0",
  "scripts": {
    "dev": "concurrently \"npm:dev:server\" \"npm:dev:client\"",
    "dev:server": "tsx watch src/server/index.ts",
    "dev:client": "vite",
    "build": "tsc && vite build",
    "build:server": "tsc --project tsconfig.server.json",
    "start": "NODE_ENV=production node dist/server/index.js",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^5.7.0",
    "@tanstack/react-query": "^5.14.0",
    "@trpc/client": "^10.45.0",
    "@trpc/react-query": "^10.45.0",
    "@trpc/server": "^10.45.0",
    "bcrypt": "^5.1.1",
    "clsx": "^2.0.0",
    "date-fns": "^3.0.0",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "lucide-react": "^0.303.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.49.0",
    "react-router-dom": "^6.21.0",
    "tailwind-merge": "^2.2.0",
    "zod": "^3.22.4",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/node": "^20.10.6",
    "@types/react": "^18.2.46",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "concurrently": "^8.2.2",
    "postcss": "^8.4.32",
    "prisma": "^5.7.0",
    "tailwindcss": "^3.4.0",
    "tailwindcss-animate": "^1.0.7",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.10"
  }
}
```

### 8.2 启动步骤

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置数据库连接和 JWT 密钥

# 3. 初始化数据库
npm run db:generate
npm run db:push
npm run db:seed

# 4. 启动开发服务器
npm run dev

# 访问 http://localhost:3000
# 默认账号: admin / admin123
```

### 8.3 生产环境部署

```bash
# 1. 构建
npm run build

# 2. 数据库迁移
npm run db:migrate

# 3. 启动生产服务器
npm start
```

---

## 9. 功能测试清单

- [ ] **用户认证**
  - [ ] 登录功能
  - [ ] 登出功能
  - [ ] Token 过期自动跳转
  - [ ] 密码错误提示

- [ ] **用户管理**
  - [ ] 用户列表查询
  - [ ] 创建用户
  - [ ] 编辑用户
  - [ ] 删除用户
  - [ ] 重置密码
  - [ ] 用户搜索

- [ ] **部门管理**
  - [ ] 部门树形展示
  - [ ] 创建部门
  - [ ] 编辑部门
  - [ ] 删除部门（含子部门检查）

- [ ] **菜单管理**
  - [ ] 菜单树形展示
  - [ ] 创建菜单/目录
  - [ ] 编辑菜单
  - [ ] 删除菜单

- [ ] **权限管理**
  - [ ] 权限列表
  - [ ] 创建权限码
  - [ ] 编辑权限码
  - [ ] 删除权限码

- [ ] **角色管理**
  - [ ] 角色列表
  - [ ] 创建角色
  - [ ] 编辑角色
  - [ ] 删除角色
  - [ ] 配置角色权限

- [ ] **权限控制**
  - [ ] 菜单权限过滤
  - [ ] 按钮权限控制
  - [ ] 路由权限守卫

- [ ] **UI/UX**
  - [ ] Tab 多页签切换
  - [ ] 侧边栏折叠/展开
  - [ ] 响应式布局
  - [ ] 错误提示
  - [ ] 加载状态

---

## 10. 总结

本实现指南提供了一个完整的企业级 Admin 管理系统的开发蓝图，涵盖：

✅ **技术栈现代化**: React 18 + TypeScript + Prisma + tRPC
✅ **完整的 RBAC 权限系统**: 用户-角色-权限三级管理
✅ **树形数据结构**: 部门和菜单的层级管理
✅ **优雅的 UI**: shadcn/ui + Tailwind CSS
✅ **类型安全**: 端到端类型安全（tRPC）
✅ **良好的代码结构**: 模块化、可维护

后续可扩展功能：
- 数据导入导出
- 操作日志审计
- 数据权限过滤
- 多租户支持
- WebSocket 实时通知
- 文件上传管理

开发愉快！🚀

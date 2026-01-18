import { useState } from 'react'
import { trpc } from '@/client/utils/trpc'
import { TreeView, TreeNode } from '@/client/components/common/TreeView'
import { DepartmentFormDialog } from '@/client/components/modules/DepartmentFormDialog'
import { PermissionGuard } from '@/client/components/common/PermissionGuard'
import { Button } from '@/client/components/ui/button'
import { useToast } from '@/client/components/ui/toast'
import { usePermission } from '@/client/hooks/usePermission'
import { Plus, RefreshCw, Building2 } from 'lucide-react'
import { Badge } from '@/client/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/card'

interface DepartmentFormData {
  id?: string
  name: string
  code: string
  parentId?: string | null
  description?: string
}

export function DepartmentManagement() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<DepartmentFormData | null>(null)
  const [parentDepartment, setParentDepartment] = useState<{ id: string; name: string } | null>(null)
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null)
  const { showToast } = useToast()
  const { canCreate, canEdit, canDelete } = usePermission()

  // 查询部门列表
  const { data: departments, isLoading, refetch } = trpc.department.list.useQuery()

  // 删除部门
  const deleteMutation = trpc.department.delete.useMutation({
    onSuccess: () => {
      refetch()
      showToast('部门删除成功', 'success')
      setSelectedNode(null)
    },
    onError: (error) => {
      showToast(`删除失败: ${error.message}`, 'error')
    },
  })

  // 构建树形结构
  const buildTree = (departments: any[]): TreeNode[] => {
    const map = new Map<string, TreeNode>()
    const roots: TreeNode[] = []

    // 创建节点映射
    departments.forEach(dept => {
      map.set(dept.id, {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        level: dept.level,
        parentId: dept.parentId,
        children: [],
      })
    })

    // 构建树形关系
    departments.forEach(dept => {
      const node = map.get(dept.id)!
      if (dept.parentId) {
        const parent = map.get(dept.parentId)
        if (parent) {
          parent.children!.push(node)
        }
      } else {
        roots.push(node)
      }
    })

    return roots
  }

  const treeData = departments ? buildTree(departments) : []

  const handleCreate = () => {
    setEditingDepartment(null)
    setParentDepartment(null)
    setDialogOpen(true)
  }

  const handleAddChild = (node: TreeNode | null) => {
    setEditingDepartment(null)
    setParentDepartment(node ? { id: node.id, name: node.name } : null)
    setDialogOpen(true)
  }

  const handleEdit = (node: TreeNode) => {
    const dept = departments?.find(d => d.id === node.id)
    if (dept) {
      setEditingDepartment({
        id: dept.id,
        name: dept.name,
        code: dept.code,
        parentId: dept.parentId,
        description: dept.description || undefined,
      })
      setParentDepartment(null)
      setDialogOpen(true)
    }
  }

  const handleDelete = (node: TreeNode) => {
    const hasChildren = node.children && node.children.length > 0
    if (hasChildren) {
      showToast('该部门下有子部门，无法删除', 'error')
      return
    }

    if (confirm(`确定删除部门 ${node.name} 吗？此操作不可恢复。`)) {
      deleteMutation.mutate({ id: node.id })
    }
  }

  // 获取选中部门的详细信息
  const selectedDepartment = selectedNode ? departments?.find(d => d.id === selectedNode.id) : null

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>部门管理</CardTitle>
          <CardDescription>管理组织架构，配置部门层级关系</CardDescription>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              刷新
            </Button>
            <PermissionGuard permission="dept:create">
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                新建部门
              </Button>
            </PermissionGuard>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧树形结构 */}
            <div className="lg:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">组织架构树</h3>
                <Badge variant="secondary">
                  共 {departments?.length || 0} 个部门
                </Badge>
              </div>
              {isLoading ? (
                <div className="flex h-96 items-center justify-center rounded-lg border bg-background">
                  <div className="text-center">
                    <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
                  </div>
                </div>
              ) : (
                <TreeView
                  data={treeData}
                  onAdd={canCreate('dept') ? handleAddChild : undefined}
                  onEdit={canEdit('dept') ? handleEdit : undefined}
                  onDelete={canDelete('dept') ? handleDelete : undefined}
                  selectedId={selectedNode?.id}
                  onSelect={setSelectedNode}
                />
              )}
            </div>

            {/* 右侧详情面板 */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">部门详情</h3>
              <div className="rounded-lg border bg-card p-4">
                {selectedDepartment ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 border-b pb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{selectedDepartment.name}</h4>
                        <p className="text-xs text-muted-foreground">部门代码: {selectedDepartment.code}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">层级</label>
                        <p className="mt-1 text-sm">第 {selectedDepartment.level} 级</p>
                      </div>

                      {selectedDepartment.parentId && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">上级部门</label>
                          <p className="mt-1 text-sm">
                            {departments?.find(d => d.id === selectedDepartment.parentId)?.name || '-'}
                          </p>
                        </div>
                      )}

                      {selectedDepartment.description && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">部门描述</label>
                          <p className="mt-1 text-sm">{selectedDepartment.description}</p>
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-medium text-muted-foreground">子部门数量</label>
                        <p className="mt-1 text-sm">
                          {departments?.filter(d => d.parentId === selectedDepartment.id).length || 0}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-muted-foreground">创建时间</label>
                        <p className="mt-1 text-sm">
                          {new Date(selectedDepartment.createdAt).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleEdit(selectedNode!)}
                      >
                        编辑
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleDelete(selectedNode!)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">请选择一个部门查看详情</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 部门表单对话框 */}
      <DepartmentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        department={editingDepartment}
        parentDepartment={parentDepartment}
        onSuccess={() => {
          refetch()
          showToast(
            editingDepartment ? '部门更新成功' : '部门创建成功',
            'success'
          )
        }}
      />
    </div>
  )
}

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
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()

  // 查询部门列表
  const { data: departments, isLoading, refetch } = trpc.department.list.useQuery()

  // 删除部门
  const deleteMutation = trpc.department.delete.useMutation({
    onSuccess: () => {
      refetch()
      showToast(t('common.status.success') || 'Success', 'success')
      setSelectedNode(null)
    },
    onError: (error) => {
      showToast(`${t('common.status.fail')}: ${error.message}`, 'error')
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
      showToast('Cannot delete department with children', 'error')
      return
    }

    if (confirm(`Are you sure to delete department ${node.name}?`)) {
      deleteMutation.mutate({ id: node.id })
    }
  }

  // 获取选中部门的详细信息
  const selectedDepartment = selectedNode ? departments?.find(d => d.id === selectedNode.id) : null

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{t('department.title')}</CardTitle>
              <CardDescription>{t('department.description')}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <PermissionGuard permission="dept:create">
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('department.create')}
                </Button>
              </PermissionGuard>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧树形结构 */}
            <div className="lg:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">{t('department.title')} Tree</h3>
                <Badge variant="secondary">
                  Total {departments?.length || 0}
                </Badge>
              </div>
              {isLoading ? (
                <div className="flex h-96 items-center justify-center rounded-lg border bg-background">
                  <div className="text-center">
                    <RefreshCw className="mx-auto h-8 w-8 animate-spin text-accent" />
                    <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
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
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">Details</h3>
              <div className="rounded-lg border bg-card p-4">
                {selectedDepartment ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 border-b pb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                        <Building2 className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{selectedDepartment.name}</h4>
                        <p className="text-xs text-muted-foreground">Code: {selectedDepartment.code}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">{t('common.columns.level')}</label>
                        <p className="mt-1 text-sm">Level {selectedDepartment.level}</p>
                      </div>

                      {selectedDepartment.parentId && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Parent Department</label>
                          <p className="mt-1 text-sm">
                            {departments?.find(d => d.id === selectedDepartment.parentId)?.name || '-'}
                          </p>
                        </div>
                      )}

                      {selectedDepartment.description && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">{t('common.columns.description')}</label>
                          <p className="mt-1 text-sm">{selectedDepartment.description}</p>
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Children Count</label>
                        <p className="mt-1 text-sm">
                          {departments?.filter(d => d.parentId === selectedDepartment.id).length || 0}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-muted-foreground">{t('common.columns.createdAt')}</label>
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
                        {t('common.actions.edit')}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleDelete(selectedNode!)}
                      >
                        {t('common.actions.delete')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Select a department to view details</p>
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
            editingDepartment ? 'Department updated' : 'Department created',
            'success'
          )
        }}
      />
    </div>
  )
}

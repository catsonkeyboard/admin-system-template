import { useState } from 'react'
import { trpc } from '@/client/utils/trpc'
import { TreeView, TreeNode } from '@/client/components/common/TreeView'
import { MenuFormDialog } from '@/client/components/modules/MenuFormDialog'
import { Button } from '@/client/components/ui/button'
import { Badge } from '@/client/components/ui/badge'
import { useToast } from '@/client/components/ui/toast'
import { Plus, RefreshCw, Menu, Folder, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/card'

interface MenuFormData {
  id?: string
  name: string
  code: string
  type: 'DIRECTORY' | 'MENU'
  path?: string
  icon?: string
  parentId?: string | null
  sort?: number
  status?: 'ACTIVE' | 'INACTIVE'
  description?: string
}

export function MenuManagement() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<MenuFormData | null>(null)
  const [parentMenu, setParentMenu] = useState<{ id: string; name: string } | null>(null)
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null)
  const { showToast } = useToast()

  // 查询菜单列表
  const { data: menus, isLoading, refetch } = trpc.menu.list.useQuery()

  // 删除菜单
  const deleteMutation = trpc.menu.delete.useMutation({
    onSuccess: () => {
      refetch()
      showToast('菜单删除成功', 'success')
      setSelectedNode(null)
    },
    onError: (error) => {
      showToast(`删除失败: ${error.message}`, 'error')
    },
  })

  // 构建树形结构
  const buildTree = (menus: any[]): TreeNode[] => {
    const map = new Map<string, TreeNode>()
    const roots: TreeNode[] = []

    // 创建节点映射
    menus.forEach(menu => {
      map.set(menu.id, {
        id: menu.id,
        name: menu.name,
        code: menu.code,
        parentId: menu.parentId,
        children: [],
      })
    })

    // 构建树形关系
    menus.forEach(menu => {
      const node = map.get(menu.id)!
      if (menu.parentId) {
        const parent = map.get(menu.parentId)
        if (parent) {
          parent.children!.push(node)
        }
      } else {
        roots.push(node)
      }
    })

    // 按 sort 排序
    const sortNodes = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => {
        const menuA = menus.find(m => m.id === a.id)
        const menuB = menus.find(m => m.id === b.id)
        return (menuA?.sort || 0) - (menuB?.sort || 0)
      })
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          sortNodes(node.children)
        }
      })
    }

    sortNodes(roots)
    return roots
  }

  const treeData = menus ? buildTree(menus) : []

  const handleCreate = () => {
    setEditingMenu(null)
    setParentMenu(null)
    setDialogOpen(true)
  }

  const handleAddChild = (node: TreeNode | null) => {
    setEditingMenu(null)
    setParentMenu(node ? { id: node.id, name: node.name } : null)
    setDialogOpen(true)
  }

  const handleEdit = (node: TreeNode) => {
    const menu = menus?.find(m => m.id === node.id)
    if (menu) {
      setEditingMenu({
        id: menu.id,
        name: menu.name,
        code: menu.code,
        type: menu.type as 'DIRECTORY' | 'MENU',
        path: menu.path || undefined,
        icon: menu.icon || undefined,
        parentId: menu.parentId || undefined,
        sort: menu.sort,
        status: menu.status as 'ACTIVE' | 'INACTIVE',
        description: menu.description || undefined,
      })
      setParentMenu(null)
      setDialogOpen(true)
    }
  }

  const handleDelete = (node: TreeNode) => {
    const hasChildren = node.children && node.children.length > 0
    if (hasChildren) {
      showToast('该菜单下有子菜单，无法删除', 'error')
      return
    }

    if (confirm(`确定删除菜单 ${node.name} 吗？此操作不可恢复。`)) {
      deleteMutation.mutate({ id: node.id })
    }
  }

  // 获取选中菜单的详细信息
  const selectedMenu = selectedNode ? menus?.find(m => m.id === selectedNode.id) : null

  // 统计信息
  const stats = menus ? {
    total: menus.length,
    directories: menus.filter(m => m.type === 'DIRECTORY').length,
    menus: menus.filter(m => m.type === 'MENU').length,
    active: menus.filter(m => m.status === 'ACTIVE').length,
    inactive: menus.filter(m => m.status === 'INACTIVE').length,
  } : null

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>菜单管理</CardTitle>
          <CardDescription>管理系统菜单，配置菜单层级和路由</CardDescription>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              刷新
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              新建菜单
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 统计卡片 */}
          {stats && (
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">总菜单数</div>
              </div>
              <div className="rounded-lg border bg-info/10 p-4">
                <div className="text-2xl font-bold text-info">{stats.directories}</div>
                <div className="text-sm text-info">目录</div>
              </div>
              <div className="rounded-lg border bg-success/10 p-4">
                <div className="text-2xl font-bold text-success">{stats.menus}</div>
                <div className="text-sm text-success">菜单</div>
              </div>
              <div className="rounded-lg border bg-success/10 p-4">
                <div className="text-2xl font-bold text-success">{stats.active}</div>
                <div className="text-sm text-success">启用中</div>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="text-2xl font-bold text-muted-foreground">{stats.inactive}</div>
                <div className="text-sm text-muted-foreground">已停用</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧树形结构 */}
            <div className="lg:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">菜单树</h3>
                <Badge variant="secondary">
                  共 {menus?.length || 0} 个菜单
                </Badge>
              </div>
              {isLoading ? (
                <div className="flex h-96 items-center justify-center rounded-lg border bg-background">
                  <div className="text-center">
                    <RefreshCw className="mx-auto h-8 w-8 animate-spin text-accent" />
                    <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
                  </div>
                </div>
              ) : (
                <TreeView
                  data={treeData}
                  onAdd={handleAddChild}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  selectedId={selectedNode?.id}
                  onSelect={setSelectedNode}
                />
              )}
            </div>

            {/* 右侧详情面板 */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">菜单详情</h3>
              <div className="rounded-lg border bg-card p-4">
                {selectedMenu ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 border-b pb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                        {selectedMenu.type === 'DIRECTORY' ? (
                          <Folder className="h-6 w-6 text-accent" />
                        ) : (
                          <Menu className="h-6 w-6 text-success" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold">{selectedMenu.name}</h4>
                        <p className="text-xs text-muted-foreground">代码: {selectedMenu.code}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">类型</label>
                        <div className="mt-1">
                          <Badge variant={selectedMenu.type === 'DIRECTORY' ? 'secondary' : 'default'}>
                            {selectedMenu.type === 'DIRECTORY' ? '目录' : '菜单'}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-muted-foreground">状态</label>
                        <div className="mt-1">
                          <Badge variant={selectedMenu.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {selectedMenu.status === 'ACTIVE' ? '启用' : '停用'}
                          </Badge>
                        </div>
                      </div>

                      {selectedMenu.path && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">路由路径</label>
                          <p className="mt-1 text-sm flex items-center gap-1">
                            {selectedMenu.path}
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </p>
                        </div>
                      )}

                      {selectedMenu.icon && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">图标</label>
                          <p className="mt-1 text-sm">{selectedMenu.icon}</p>
                        </div>
                      )}

                      {selectedMenu.parentId && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">上级菜单</label>
                          <p className="mt-1 text-sm">
                            {menus?.find(m => m.id === selectedMenu.parentId)?.name || '-'}
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-medium text-muted-foreground">排序号</label>
                        <p className="mt-1 text-sm">{selectedMenu.sort || 0}</p>
                      </div>

                      {selectedMenu.description && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">菜单描述</label>
                          <p className="mt-1 text-sm">{selectedMenu.description}</p>
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-medium text-muted-foreground">子菜单数量</label>
                        <p className="mt-1 text-sm">
                          {menus?.filter(m => m.parentId === selectedMenu.id).length || 0}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-muted-foreground">创建时间</label>
                        <p className="mt-1 text-sm">
                          {format(new Date(selectedMenu.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-muted-foreground">更新时间</label>
                        <p className="mt-1 text-sm">
                          {format(new Date(selectedMenu.updatedAt), 'yyyy-MM-dd HH:mm:ss')}
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
                    <Menu className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">请选择一个菜单查看详情</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 菜单表单对话框 */}
      <MenuFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        menu={editingMenu}
        parentMenu={parentMenu}
        onSuccess={() => {
          refetch()
          showToast(
            editingMenu ? '菜单更新成功' : '菜单创建成功',
            'success'
          )
        }}
      />
    </div>
  )
}

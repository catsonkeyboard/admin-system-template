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
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()

  // 查询菜单列表
  const { data: menus, isLoading, refetch } = trpc.menu.list.useQuery()

  // 删除菜单
  const deleteMutation = trpc.menu.delete.useMutation({
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
      showToast('Cannot delete menu with children', 'error')
      return
    }

    if (confirm(`Are you sure to delete menu ${node.name}?`)) {
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
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{t('menu.title')}</CardTitle>
              <CardDescription>{t('menu.description')}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                {t('menu.create')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 统计卡片 */}
          {stats && (
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">{t('menu.title')}</div>
              </div>
              <div className="rounded-lg border bg-info/10 p-4">
                <div className="text-2xl font-bold text-info">{stats.directories}</div>
                <div className="text-sm text-info">Directory</div>
              </div>
              <div className="rounded-lg border bg-success/10 p-4">
                <div className="text-2xl font-bold text-success">{stats.menus}</div>
                <div className="text-sm text-success">Menu</div>
              </div>
              <div className="rounded-lg border bg-success/10 p-4">
                <div className="text-2xl font-bold text-success">{stats.active}</div>
                <div className="text-sm text-success">{t('common.status.active')}</div>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="text-2xl font-bold text-muted-foreground">{stats.inactive}</div>
                <div className="text-sm text-muted-foreground">{t('common.status.inactive')}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧树形结构 */}
            <div className="lg:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">{t('menu.title')} Tree</h3>
                <Badge variant="secondary">
                  Total {menus?.length || 0}
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
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">Menu Details</h3>
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
                        <p className="text-xs text-muted-foreground">Code: {selectedMenu.code}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">{t('common.columns.type')}</label>
                        <div className="mt-1">
                          <Badge variant={selectedMenu.type === 'DIRECTORY' ? 'secondary' : 'default'}>
                            {selectedMenu.type === 'DIRECTORY' ? 'Directory' : 'Menu'}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-muted-foreground">{t('common.columns.status')}</label>
                        <div className="mt-1">
                          <Badge variant={selectedMenu.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {selectedMenu.status === 'ACTIVE' ? t('common.status.active') : t('common.status.inactive')}
                          </Badge>
                        </div>
                      </div>

                      {selectedMenu.path && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">{t('common.columns.path')}</label>
                          <p className="mt-1 text-sm flex items-center gap-1">
                            {selectedMenu.path}
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </p>
                        </div>
                      )}

                      {selectedMenu.icon && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">{t('common.columns.icon')}</label>
                          <p className="mt-1 text-sm">{selectedMenu.icon}</p>
                        </div>
                      )}

                      {selectedMenu.parentId && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Parent Menu</label>
                          <p className="mt-1 text-sm">
                            {menus?.find(m => m.id === selectedMenu.parentId)?.name || '-'}
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-medium text-muted-foreground">{t('common.columns.sort')}</label>
                        <p className="mt-1 text-sm">{selectedMenu.sort || 0}</p>
                      </div>

                      {selectedMenu.description && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">{t('common.columns.description')}</label>
                          <p className="mt-1 text-sm">{selectedMenu.description}</p>
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Children Count</label>
                        <p className="mt-1 text-sm">
                          {menus?.filter(m => m.parentId === selectedMenu.id).length || 0}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-muted-foreground">{t('common.columns.createdAt')}</label>
                        <p className="mt-1 text-sm">
                          {format(new Date(selectedMenu.createdAt), 'yyyy-MM-dd HH:mm:ss')}
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
                    <Menu className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Select a menu to view details</p>
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
            editingMenu ? 'Menu updated' : 'Menu created',
            'success'
          )
        }}
      />
    </div>
  )
}

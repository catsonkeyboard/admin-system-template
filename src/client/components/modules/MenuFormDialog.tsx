import { useState, useEffect } from 'react'
import { trpc } from '@/client/utils/trpc'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/client/components/ui/dialog'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Label } from '@/client/components/ui/label'
import { Select } from '@/client/components/ui/select'
import { Textarea } from '@/client/components/ui/textarea'
import { Loader2 } from 'lucide-react'

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

interface MenuFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menu: MenuFormData | null
  parentMenu?: { id: string; name: string } | null
  onSuccess: () => void
}

export function MenuFormDialog({
  open,
  onOpenChange,
  menu,
  parentMenu,
  onSuccess
}: MenuFormDialogProps) {
  const [formData, setFormData] = useState<MenuFormData>({
    name: '',
    code: '',
    type: 'MENU',
    path: '',
    icon: '',
    parentId: null,
    sort: 0,
    status: 'ACTIVE',
    description: '',
  })

  const { data: menus } = trpc.menu.list.useQuery()

  const createMutation = trpc.menu.create.useMutation({
    onSuccess: () => {
      onSuccess()
      onOpenChange(false)
    },
  })

  const updateMutation = trpc.menu.update.useMutation({
    onSuccess: () => {
      onSuccess()
      onOpenChange(false)
    },
  })

  useEffect(() => {
    if (menu) {
      setFormData(menu)
    } else if (parentMenu) {
      setFormData({
        name: '',
        code: '',
        type: 'MENU',
        path: '',
        icon: '',
        parentId: parentMenu.id,
        sort: 0,
        status: 'ACTIVE',
        description: '',
      })
    } else {
      setFormData({
        name: '',
        code: '',
        type: 'DIRECTORY',
        path: '',
        icon: '',
        parentId: null,
        sort: 0,
        status: 'ACTIVE',
        description: '',
      })
    }
  }, [menu, parentMenu])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.id) {
      // 更新菜单
      updateMutation.mutate({
        id: formData.id,
        name: formData.name,
        code: formData.code,
        type: formData.type,
        path: formData.path || undefined,
        icon: formData.icon || undefined,
        parentId: formData.parentId || undefined,
        sort: formData.sort || 0,
        status: formData.status,
        description: formData.description,
      })
    } else {
      // 创建菜单
      createMutation.mutate({
        name: formData.name,
        code: formData.code,
        type: formData.type,
        path: formData.path || undefined,
        icon: formData.icon || undefined,
        parentId: formData.parentId || undefined,
        sort: formData.sort || 0,
        status: formData.status,
        description: formData.description,
      })
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  // 构建菜单选项（排除自己和子孙菜单）
  const getMenuOptions = () => {
    if (!menus) return []

    // 递归获取所有子孙菜单ID
    const getDescendantIds = (menuId: string): string[] => {
      const descendants: string[] = [menuId]
      const children = menus.filter(m => m.parentId === menuId)
      children.forEach(child => {
        descendants.push(...getDescendantIds(child.id))
      })
      return descendants
    }

    const excludeIds = formData.id ? getDescendantIds(formData.id) : []

    // 只显示目录类型作为父菜单选项
    return [
      { value: '', label: '无（顶级菜单）' },
      ...menus
        .filter(m => !excludeIds.includes(m.id) && m.type === 'DIRECTORY')
        .map(m => ({
          value: m.id,
          label: m.name,
        }))
    ]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {formData.id ? '编辑菜单' : parentMenu ? `新建子菜单 - ${parentMenu.name}` : '新建菜单'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">菜单名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="请输入菜单名称"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">菜单代码 *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  placeholder="请输入菜单代码（唯一）"
                  disabled={!!formData.id}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">菜单类型 *</Label>
                <Select
                  options={[
                    { value: 'DIRECTORY', label: '目录' },
                    { value: 'MENU', label: '菜单' },
                  ]}
                  value={formData.type}
                  onChange={(value) => setFormData({ ...formData, type: value as 'DIRECTORY' | 'MENU' })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">状态 *</Label>
                <Select
                  options={[
                    { value: 'ACTIVE', label: '启用' },
                    { value: 'INACTIVE', label: '停用' },
                  ]}
                  value={formData.status || 'ACTIVE'}
                  onChange={(value) => setFormData({ ...formData, status: value as 'ACTIVE' | 'INACTIVE' })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="path">路由路径</Label>
                <Input
                  id="path"
                  value={formData.path || ''}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  placeholder="/system/menu"
                />
                <p className="text-xs text-gray-500">
                  {formData.type === 'DIRECTORY' ? '目录可以不填写路径' : '菜单必须填写路由路径'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">图标</Label>
                <Input
                  id="icon"
                  value={formData.icon || ''}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="Menu, Users, Settings"
                />
                <p className="text-xs text-gray-500">使用 lucide-react 图标名称</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentId">上级菜单</Label>
                <Select
                  options={getMenuOptions()}
                  value={formData.parentId || ''}
                  onChange={(value) => setFormData({ ...formData, parentId: value || null })}
                  placeholder="选择上级菜单"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort">排序号</Label>
                <Input
                  id="sort"
                  type="number"
                  value={formData.sort || 0}
                  onChange={(e) => setFormData({ ...formData, sort: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
                <p className="text-xs text-gray-500">数字越小越靠前</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">菜单描述</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请输入菜单描述（可选）"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {formData.id ? '保存' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

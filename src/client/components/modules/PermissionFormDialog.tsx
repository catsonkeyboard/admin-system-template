import { useState, useEffect } from 'react'
import { trpc } from '@/client/utils/trpc'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/client/components/ui/dialog'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Label } from '@/client/components/ui/label'
import { Select } from '@/client/components/ui/select'
import { Textarea } from '@/client/components/ui/textarea'
import { Loader2 } from 'lucide-react'

interface PermissionFormData {
  id?: string
  name: string
  code: string
  type: 'MENU' | 'BUTTON' | 'DATA'
  menuId?: string
  description?: string
}

interface PermissionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  permission: PermissionFormData | null
  onSuccess: () => void
}

export function PermissionFormDialog({
  open,
  onOpenChange,
  permission,
  onSuccess
}: PermissionFormDialogProps) {
  const [formData, setFormData] = useState<PermissionFormData>({
    name: '',
    code: '',
    type: 'MENU',
    menuId: undefined,
    description: '',
  })

  const { data: menus } = trpc.menu.list.useQuery()

  const createMutation = trpc.permission.create.useMutation({
    onSuccess: () => {
      onSuccess()
      onOpenChange(false)
    },
  })

  const updateMutation = trpc.permission.update.useMutation({
    onSuccess: () => {
      onSuccess()
      onOpenChange(false)
    },
  })

  useEffect(() => {
    if (permission) {
      setFormData(permission)
    } else {
      setFormData({
        name: '',
        code: '',
        type: 'MENU',
        menuId: undefined,
        description: '',
      })
    }
  }, [permission])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.id) {
      // 更新权限
      updateMutation.mutate({
        id: formData.id,
        name: formData.name,
        code: formData.code,
        type: formData.type,
        menuId: formData.menuId,
        description: formData.description,
      })
    } else {
      // 创建权限
      createMutation.mutate({
        name: formData.name,
        code: formData.code,
        type: formData.type,
        menuId: formData.menuId,
        description: formData.description,
      })
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  // 获取菜单选项（只显示菜单类型，不显示目录）
  const menuOptions = menus
    ? [
        { value: '', label: '无关联菜单' },
        ...menus
          .filter(m => m.type === 'MENU')
          .map(m => ({
            value: m.id,
            label: m.name,
          }))
      ]
    : [{ value: '', label: '无关联菜单' }]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {formData.id ? '编辑权限' : '新建权限'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">权限名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="请输入权限名称"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">权限代码 *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  placeholder="请输入权限代码（唯一）"
                  disabled={!!formData.id}
                />
                <p className="text-xs text-gray-500">
                  例如：user:view, user:create, user:edit
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">权限类型 *</Label>
                <Select
                  options={[
                    { value: 'MENU', label: '菜单权限' },
                    { value: 'BUTTON', label: '按钮权限' },
                    { value: 'DATA', label: '数据权限' },
                  ]}
                  value={formData.type}
                  onChange={(value) => setFormData({ ...formData, type: value as 'MENU' | 'BUTTON' | 'DATA' })}
                />
                <p className="text-xs text-gray-500">
                  {formData.type === 'MENU' && '控制菜单是否显示'}
                  {formData.type === 'BUTTON' && '控制按钮是否显示'}
                  {formData.type === 'DATA' && '控制数据访问范围'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="menuId">关联菜单</Label>
                <Select
                  options={menuOptions}
                  value={formData.menuId || ''}
                  onChange={(value) => setFormData({ ...formData, menuId: value || undefined })}
                  placeholder="选择关联菜单"
                />
                <p className="text-xs text-gray-500">
                  可选，关联到具体菜单
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">权限描述</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请输入权限描述（可选）"
                rows={4}
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

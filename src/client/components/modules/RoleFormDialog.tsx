import { useState, useEffect } from 'react'
import { trpc } from '@/client/utils/trpc'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/client/components/ui/dialog'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Label } from '@/client/components/ui/label'
import { Select } from '@/client/components/ui/select'
import { Textarea } from '@/client/components/ui/textarea'
import { Loader2 } from 'lucide-react'

interface RoleFormData {
  id?: string
  name: string
  code: string
  status?: 'ACTIVE' | 'INACTIVE'
  description?: string
}

interface RoleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: RoleFormData | null
  onSuccess: () => void
}

export function RoleFormDialog({
  open,
  onOpenChange,
  role,
  onSuccess
}: RoleFormDialogProps) {
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    code: '',
    status: 'ACTIVE',
    description: '',
  })

  const createMutation = trpc.role.create.useMutation({
    onSuccess: () => {
      onSuccess()
      onOpenChange(false)
    },
  })

  const updateMutation = trpc.role.update.useMutation({
    onSuccess: () => {
      onSuccess()
      onOpenChange(false)
    },
  })

  useEffect(() => {
    if (role) {
      setFormData(role)
    } else {
      setFormData({
        name: '',
        code: '',
        status: 'ACTIVE',
        description: '',
      })
    }
  }, [role])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.id) {
      // 更新角色
      updateMutation.mutate({
        id: formData.id,
        name: formData.name,
        code: formData.code,
        status: formData.status,
        description: formData.description,
      })
    } else {
      // 创建角色
      createMutation.mutate({
        name: formData.name,
        code: formData.code,
        status: formData.status,
        description: formData.description,
      })
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {formData.id ? '编辑角色' : '新建角色'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 px-6 py-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">角色名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="请输入角色名称"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">角色代码 *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  placeholder="请输入角色代码（唯一）"
                  disabled={!!formData.id}
                />
                <p className="text-xs text-gray-500">
                  例如：ADMIN, USER, MANAGER
                </p>
              </div>

              <div className="space-y-2 col-span-2">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">角色描述</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请输入角色描述（可选）"
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

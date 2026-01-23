import { useState, useEffect } from 'react'
import { trpc } from '@/client/utils/trpc'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/client/components/ui/dialog'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Label } from '@/client/components/ui/label'
import { Select } from '@/client/components/ui/select'
import { Checkbox } from '@/client/components/ui/checkbox'
import { Loader2 } from 'lucide-react'

interface UserFormData {
  id?: string
  username: string
  realName: string
  password?: string
  phone: string
  departmentId: string
  position: string
  roleIds: string[]
}

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserFormData | null
  onSuccess: () => void
}

export function UserFormDialog({ open, onOpenChange, user, onSuccess }: UserFormDialogProps) {
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    realName: '',
    password: '',
    phone: '',
    departmentId: '',
    position: '',
    roleIds: [],
  })

  const { data: departments } = trpc.department.list.useQuery()
  const { data: roles } = trpc.role.list.useQuery({ page: 1, pageSize: 100 })

  const createMutation = trpc.user.create.useMutation({
    onSuccess: () => {
      onSuccess()
      onOpenChange(false)
    },
  })

  const updateMutation = trpc.user.update.useMutation({
    onSuccess: () => {
      onSuccess()
      onOpenChange(false)
    },
  })

  useEffect(() => {
    if (user) {
      setFormData(user)
    } else {
      setFormData({
        username: '',
        realName: '',
        password: '',
        phone: '',
        departmentId: '',
        position: '',
        roleIds: [],
      })
    }
  }, [user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.id) {
      // 更新用户
      updateMutation.mutate({
        id: formData.id,
        username: formData.username,
        realName: formData.realName,
        phone: formData.phone,
        departmentId: formData.departmentId || undefined,
        position: formData.position || undefined,
        roleIds: formData.roleIds,
      })
    } else {
      // 创建用户
      createMutation.mutate({
        username: formData.username,
        realName: formData.realName,
        password: formData.password || 'password123',
        phone: formData.phone,
        departmentId: formData.departmentId || undefined,
        position: formData.position || undefined,
        roleIds: formData.roleIds,
      })
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  const departmentOptions = departments?.map((dept) => ({
    value: dept.id,
    label: dept.name,
  })) || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{formData.id ? '编辑用户' : '新建用户'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 px-6 py-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名 *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={!!formData.id}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="realName">姓名 *</Label>
                <Input
                  id="realName"
                  value={formData.realName}
                  onChange={(e) => setFormData({ ...formData, realName: e.target.value })}
                  required
                  className="h-10"
                />
              </div>

              {!formData.id && (
                <div className="space-y-2">
                  <Label htmlFor="password">密码 *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="默认: password123"
                    className="h-10"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone">手机号</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="departmentId">部门</Label>
                <Select
                  options={departmentOptions}
                  value={formData.departmentId}
                  onChange={(value) => setFormData({ ...formData, departmentId: value })}
                  placeholder="选择部门"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">岗位</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>角色</Label>
              <div className="grid grid-cols-3 gap-4">
                {roles?.items.map((role) => (
                  <Checkbox
                    key={role.id}
                    label={role.name}
                    checked={formData.roleIds.includes(role.id)}
                    onChange={(e) => {
                      const checked = (e.target as HTMLInputElement).checked
                      const roleIds = checked
                        ? [...formData.roleIds, role.id]
                        : formData.roleIds.filter((id) => id !== role.id)
                      setFormData({ ...formData, roleIds })
                    }}
                  />
                ))}
              </div>
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

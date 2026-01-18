import { useState, useEffect } from 'react'
import { trpc } from '@/client/utils/trpc'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/client/components/ui/dialog'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Label } from '@/client/components/ui/label'
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{formData.id ? '编辑用户' : '新建用户'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名 *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={!!formData.id}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="realName">姓名 *</Label>
                <Input
                  id="realName"
                  value={formData.realName}
                  onChange={(e) => setFormData({ ...formData, realName: e.target.value })}
                  required
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
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone">手机号</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="departmentId">部门</Label>
                <select
                  id="departmentId"
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <option value="">选择部门</option>
                  {departments?.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">岗位</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>角色</Label>
              <div className="flex flex-wrap gap-2">
                {roles?.items.map((role) => (
                  <label
                    key={role.id}
                    className="flex items-center gap-2 rounded border border-gray-300 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.roleIds.includes(role.id)}
                      onChange={(e) => {
                        const roleIds = e.target.checked
                          ? [...formData.roleIds, role.id]
                          : formData.roleIds.filter((id) => id !== role.id)
                        setFormData({ ...formData, roleIds })
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    />
                    <span className="text-sm">{role.name}</span>
                  </label>
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

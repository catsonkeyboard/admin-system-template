import { useState, useEffect } from 'react'
import { trpc } from '@/client/utils/trpc'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/client/components/ui/dialog'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Label } from '@/client/components/ui/label'
import { Select } from '@/client/components/ui/select'
import { Textarea } from '@/client/components/ui/textarea'
import { Loader2 } from 'lucide-react'

interface DepartmentFormData {
  id?: string
  name: string
  code: string
  parentId?: string | null
  description?: string
}

interface DepartmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  department: DepartmentFormData | null
  parentDepartment?: { id: string; name: string } | null
  onSuccess: () => void
}

export function DepartmentFormDialog({
  open,
  onOpenChange,
  department,
  parentDepartment,
  onSuccess
}: DepartmentFormDialogProps) {
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '',
    code: '',
    parentId: null,
    description: '',
  })

  const { data: departments } = trpc.department.list.useQuery()

  const createMutation = trpc.department.create.useMutation({
    onSuccess: () => {
      onSuccess()
      onOpenChange(false)
    },
  })

  const updateMutation = trpc.department.update.useMutation({
    onSuccess: () => {
      onSuccess()
      onOpenChange(false)
    },
  })

  useEffect(() => {
    if (department) {
      setFormData(department)
    } else if (parentDepartment) {
      setFormData({
        name: '',
        code: '',
        parentId: parentDepartment.id,
        description: '',
      })
    } else {
      setFormData({
        name: '',
        code: '',
        parentId: null,
        description: '',
      })
    }
  }, [department, parentDepartment])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.id) {
      // 更新部门
      updateMutation.mutate({
        id: formData.id,
        name: formData.name,
        code: formData.code,
        parentId: formData.parentId || undefined,
        description: formData.description,
      })
    } else {
      // 创建部门
      createMutation.mutate({
        name: formData.name,
        code: formData.code,
        parentId: formData.parentId || undefined,
        description: formData.description,
      })
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  // 构建部门选项（排除自己和子孙部门）
  const getDepartmentOptions = () => {
    if (!departments) return []

    // 递归获取所有子孙部门ID
    const getDescendantIds = (deptId: string): string[] => {
      const descendants: string[] = [deptId]
      const children = departments.filter(d => d.parentId === deptId)
      children.forEach(child => {
        descendants.push(...getDescendantIds(child.id))
      })
      return descendants
    }

    const excludeIds = formData.id ? getDescendantIds(formData.id) : []

    return [
      { value: '', label: '无（顶级部门）' },
      ...departments
        .filter(d => !excludeIds.includes(d.id))
        .map(d => ({
          value: d.id,
          label: d.name,
        }))
    ]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {formData.id ? '编辑部门' : parentDepartment ? `新建子部门 - ${parentDepartment.name}` : '新建部门'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 px-6 py-4">
            <div className="space-y-4">
              <Label htmlFor="name">部门名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="请输入部门名称"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">部门代码 *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                placeholder="请输入部门代码（唯一）"
                disabled={!!formData.id}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentId">上级部门</Label>
              <Select
                options={getDepartmentOptions()}
                value={formData.parentId || ''}
                onChange={(value) => setFormData({ ...formData, parentId: value || null })}
                placeholder="选择上级部门"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">部门描述</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请输入部门描述（可选）"
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

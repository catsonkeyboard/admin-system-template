import { ReactNode } from 'react'
import { usePermission } from '@/client/hooks/usePermission'

interface PermissionGuardProps {
  /** 需要的权限代码 */
  permission?: string
  /** 需要的权限代码数组（满足任意一个即可） */
  anyPermission?: string[]
  /** 需要的权限代码数组（需要全部满足） */
  allPermissions?: string[]
  /** 有权限时显示的内容 */
  children: ReactNode
  /** 无权限时显示的内容（可选） */
  fallback?: ReactNode
}

/**
 * 权限守卫组件
 * 根据用户权限决定是否渲染子组件
 *
 * @example
 * // 单个权限
 * <PermissionGuard permission="user:create">
 *   <Button>新建用户</Button>
 * </PermissionGuard>
 *
 * @example
 * // 任意权限（满足一个即可）
 * <PermissionGuard anyPermission={['user:edit', 'user:delete']}>
 *   <Button>操作</Button>
 * </PermissionGuard>
 *
 * @example
 * // 所有权限（必须全部满足）
 * <PermissionGuard allPermissions={['user:view', 'user:edit']}>
 *   <Button>编辑</Button>
 * </PermissionGuard>
 */
export function PermissionGuard({
  permission,
  anyPermission,
  allPermissions,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission()

  let hasAccess = false

  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (anyPermission && anyPermission.length > 0) {
    hasAccess = hasAnyPermission(anyPermission)
  } else if (allPermissions && allPermissions.length > 0) {
    hasAccess = hasAllPermissions(allPermissions)
  } else {
    // 如果没有指定任何权限，默认允许访问
    hasAccess = true
  }

  return <>{hasAccess ? children : fallback}</>
}

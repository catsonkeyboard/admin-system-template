import { useUserStore } from '@/client/stores/userStore'

export function usePermission() {
  const hasPermission = useUserStore((state) => state.hasPermission)

  const hasAnyPermission = (permissions: string[]) => {
    return permissions.some(hasPermission)
  }

  const hasAllPermissions = (permissions: string[]) => {
    return permissions.every(hasPermission)
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canView: (code: string) => hasPermission(`${code}:view`),
    canCreate: (code: string) => hasPermission(`${code}:create`),
    canEdit: (code: string) => hasPermission(`${code}:edit`),
    canDelete: (code: string) => hasPermission(`${code}:delete`),
  }
}

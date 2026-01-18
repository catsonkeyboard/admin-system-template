import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  username: string
  realName: string
  phone?: string
  department?: {
    id: string
    name: string
  }
}

interface UserStore {
  user: User | null
  token: string | null
  permissions: string[]
  setUser: (user: User, token: string, permissions: string[]) => void
  logout: () => void
  hasPermission: (permission: string) => boolean
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      permissions: [],

      setUser: (user, token, permissions) => {
        localStorage.setItem('token', token)
        set({ user, token, permissions })
      },

      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, permissions: [] })
      },

      hasPermission: (permission) => {
        return get().permissions.includes(permission)
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        permissions: state.permissions,
      }),
    }
  )
)

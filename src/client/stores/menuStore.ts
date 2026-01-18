import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MenuItem {
  id: string
  name: string
  code: string
  type: string
  path?: string
  icon?: string
  children?: MenuItem[]
}

interface MenuStore {
  collapsed: boolean
  menus: MenuItem[]
  toggleCollapsed: () => void
  setMenus: (menus: MenuItem[]) => void
}

export const useMenuStore = create<MenuStore>()(
  persist(
    (set) => ({
      collapsed: false,
      menus: [],

      toggleCollapsed: () => {
        set((state) => ({ collapsed: !state.collapsed }))
      },

      setMenus: (menus) => {
        set({ menus })
      },
    }),
    {
      name: 'menu-storage',
      partialize: (state) => ({
        collapsed: state.collapsed,
      }),
    }
  )
)

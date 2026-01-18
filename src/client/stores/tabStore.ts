import { create } from 'zustand'

export interface Tab {
  id: string
  title: string
  path: string
  closable: boolean
}

interface TabStore {
  tabs: Tab[]
  activeTabId: string | null
  addTab: (tab: Tab) => void
  removeTab: (id: string) => void
  setActiveTab: (id: string) => void
  closeOtherTabs: (id: string) => void
  closeAllTabs: () => void
}

export const useTabStore = create<TabStore>((set, get) => ({
  tabs: [],
  activeTabId: null,

  addTab: (tab) => {
    const { tabs } = get()
    const exists = tabs.find((t) => t.id === tab.id)

    if (exists) {
      set({ activeTabId: tab.id })
    } else {
      set({
        tabs: [...tabs, tab],
        activeTabId: tab.id,
      })
    }
  },

  removeTab: (id) => {
    const { tabs, activeTabId } = get()
    const index = tabs.findIndex((t) => t.id === id)

    if (index === -1) return

    const newTabs = tabs.filter((t) => t.id !== id)

    // 如果关闭的是当前激活的标签
    if (activeTabId === id) {
      const newActiveTab = newTabs[Math.max(0, index - 1)]
      set({
        tabs: newTabs,
        activeTabId: newActiveTab?.id || null,
      })
    } else {
      set({ tabs: newTabs })
    }
  },

  setActiveTab: (id) => {
    set({ activeTabId: id })
  },

  closeOtherTabs: (id) => {
    const { tabs } = get()
    const tab = tabs.find((t) => t.id === id)
    if (!tab) return

    const newTabs = tabs.filter((t) => t.id === id || !t.closable)
    set({
      tabs: newTabs,
      activeTabId: id,
    })
  },

  closeAllTabs: () => {
    const { tabs } = get()
    const newTabs = tabs.filter((t) => !t.closable)
    set({
      tabs: newTabs,
      activeTabId: newTabs[0]?.id || null,
    })
  },
}))

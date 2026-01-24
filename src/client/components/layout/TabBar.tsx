import { useNavigate } from 'react-router-dom'
import { useTabStore } from '@/client/stores/tabStore'
import { X, MoreVertical } from 'lucide-react'
import { cn } from '@/client/utils/cn'

export function TabBar() {
  const navigate = useNavigate()
  const { tabs, activeTabId, removeTab, setActiveTab, closeOtherTabs, closeAllTabs } =
    useTabStore()

  if (tabs.length === 0) return null

  const handleTabClick = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId)
    if (tab) {
      setActiveTab(tabId)
      navigate(tab.path)
    }
  }

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const tab = tabs.find((t) => t.id === tabId)
    if (!tab?.closable) return

    removeTab(tabId)

    const remainingTabs = tabs.filter((t) => t.id !== tabId)
    if (remainingTabs.length > 0) {
      const newActiveTab = remainingTabs[remainingTabs.length - 1]
      navigate(newActiveTab.path)
    }
  }

  return (
    <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2">
      <div className="flex flex-1 items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              'group relative flex cursor-pointer items-center gap-2 rounded-t-lg px-4 py-2 text-sm transition-colors duration-150',
              activeTabId === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span className="whitespace-nowrap">{tab.title}</span>
            {tab.closable && (
              <button
                onClick={(e) => handleCloseTab(tab.id, e)}
                className="rounded p-0.5 opacity-0 hover:bg-foreground/[0.07] group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {tabs.length > 0 && (
        <div className="group relative">
          <button className="rounded p-2 hover:bg-foreground/[0.07]">
            <MoreVertical className="h-4 w-4" />
          </button>

          <div className="absolute right-0 top-full z-10 mt-1 hidden w-32 rounded-lg border border-border bg-popover py-1 shadow-lg group-hover:block">
            <button
              onClick={() => activeTabId && closeOtherTabs(activeTabId)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-foreground/[0.07]"
            >
              关闭其他
            </button>
            <button
              onClick={closeAllTabs}
              className="w-full px-4 py-2 text-left text-sm hover:bg-foreground/[0.07]"
            >
              关闭所有
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/client/components/ui/button'
import { cn } from '@/client/utils/cn'

export interface TreeNode {
  id: string
  name: string
  code?: string
  level?: number
  children?: TreeNode[]
  parentId?: string | null
}

interface TreeViewProps {
  data: TreeNode[]
  onAdd?: (node: TreeNode | null) => void
  onEdit?: (node: TreeNode) => void
  onDelete?: (node: TreeNode) => void
  selectedId?: string
  onSelect?: (node: TreeNode) => void
}

interface TreeNodeItemProps {
  node: TreeNode
  level: number
  onAdd?: (node: TreeNode | null) => void
  onEdit?: (node: TreeNode) => void
  onDelete?: (node: TreeNode) => void
  selectedId?: string
  onSelect?: (node: TreeNode) => void
}

function TreeNodeItem({
  node,
  level,
  onAdd,
  onEdit,
  onDelete,
  selectedId,
  onSelect
}: TreeNodeItemProps) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-100",
          selectedId === node.id && "bg-blue-50"
        )}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
        {/* Expand/Collapse Icon */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex h-5 w-5 items-center justify-center"
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )
          ) : (
            <span className="w-4" />
          )}
        </button>

        {/* Folder Icon */}
        {expanded ? (
          <FolderOpen className="h-4 w-4 text-blue-500" />
        ) : (
          <Folder className="h-4 w-4 text-gray-500" />
        )}

        {/* Node Name */}
        <span
          onClick={() => onSelect?.(node)}
          className="flex-1 cursor-pointer text-sm"
        >
          {node.name}
          {node.code && (
            <span className="ml-2 text-xs text-gray-400">({node.code})</span>
          )}
        </span>

        {/* Action Buttons */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100">
          {onAdd && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onAdd(node)
              }}
              className="h-6 w-6 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(node)
              }}
              className="h-6 w-6 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(node)
              }}
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              level={level + 1}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function TreeView({
  data,
  onAdd,
  onEdit,
  onDelete,
  selectedId,
  onSelect
}: TreeViewProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2">
      {data.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500">
          暂无数据
        </div>
      ) : (
        <div className="space-y-1">
          {data.map((node) => (
            <TreeNodeItem
              key={node.id}
              node={node}
              level={0}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

import { Pencil, Trash2 } from 'lucide-react'

interface Column<T> {
  key: string
  title: string
  render?: (value: any, record: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  onEdit?: (record: T) => void
  onDelete?: (record: T) => void
  actions?: (record: T) => React.ReactNode
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading,
  onEdit,
  onDelete,
  actions,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-muted/40">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  {column.title}
                </th>
              ))}
              {(onEdit || onDelete || actions) && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  操作
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-6 py-8 text-center text-muted-foreground"
                >
                  加载中...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-6 py-8 text-center text-muted-foreground"
                >
                  暂无数据
                </td>
              </tr>
            ) : (
              data.map((record) => (
                <tr key={record.id} className="hover:bg-muted/50 transition-colors">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 text-sm text-foreground">
                      {column.render
                        ? column.render((record as any)[column.key], record)
                        : (record as any)[column.key]}
                    </td>
                  ))}
                  {(onEdit || onDelete || actions) && (
                    <td className="px-6 py-4 text-sm">
                      {actions ? (
                        actions(record)
                      ) : (
                        <div className="flex items-center gap-2">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(record)}
                              className="rounded p-1 text-accent hover:bg-accent/10 transition-colors"
                              title="编辑"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(record)}
                              className="rounded p-1 text-destructive hover:bg-destructive/10 transition-colors"
                              title="删除"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

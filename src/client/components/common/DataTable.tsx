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
    <div className="overflow-hidden rounded-lg border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700"
                >
                  {column.title}
                </th>
              ))}
              {(onEdit || onDelete || actions) && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  操作
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  加载中...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  暂无数据
                </td>
              </tr>
            ) : (
              data.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 text-sm text-gray-900">
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
                              className="rounded p-1 text-blue-600 hover:bg-blue-50"
                              title="编辑"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(record)}
                              className="rounded p-1 text-red-600 hover:bg-red-50"
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

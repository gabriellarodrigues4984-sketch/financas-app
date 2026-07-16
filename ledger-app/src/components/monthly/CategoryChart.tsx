import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { Category } from '../../context/DataContext'
import { formatCurrency } from '../../lib/format'

interface Slice {
  categoryId: string
  value: number
}

export function CategoryChart({ data, categories, total }: { data: Slice[]; categories: Category[]; total: number }) {
  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]))
  const chartData = data
    .map((d) => ({
      name: categoryById[d.categoryId]?.name ?? 'Outros',
      value: d.value,
      color: categoryById[d.categoryId]?.color ?? '#727785',
    }))
    .sort((a, b) => b.value - a.value)

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[180px] text-sm text-on-surface-variant">
        Sem gastos por categoria ainda
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-[180px] h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={2}
              stroke="none"
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Total</span>
          <span className="font-data font-bold text-lg">{formatCurrency(total)}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full">
        {chartData.slice(0, 8).map((c) => (
          <div key={c.name} className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
            <span className="text-xs truncate">{c.name}</span>
            <span className="text-xs text-on-surface-variant ml-auto font-data shrink-0">{formatCurrency(c.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

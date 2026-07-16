import { useState } from 'react'
import { useData, type Goal } from '../context/DataContext'
import { formatCurrency } from '../lib/format'
import { AddGoalModal } from '../components/goals/AddGoalModal'
import { EditGoalModal } from '../components/goals/EditGoalModal'
import { GoalCard } from '../components/goals/GoalCard'
import { EmptyState } from '../components/EmptyState'

export function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal, contributeToGoal } = useData()
  const [open, setOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  const totalCurrent = goals.reduce((s, g) => s + Number(g.current_amount), 0)
  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0)
  const pct = totalTarget > 0 ? Math.min(100, (totalCurrent / totalTarget) * 100) : 0

  return (
    <div className="space-y-6 pb-6">
      <section>
        <h1 className="font-display font-bold text-2xl text-on-background mb-1">Metas Financeiras</h1>
        <p className="text-sm text-on-surface-variant">Gerencie seus objetivos e acompanhe sua jornada de economia.</p>
      </section>

      <button
        onClick={() => setOpen(true)}
        className="w-full bg-brand-red hover:bg-brand-red/90 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-red/20 transition-transform active:scale-[0.98]"
      >
        <span className="material-symbols-outlined">add_circle</span>
        Nova Meta
      </button>

      {goals.length > 0 && (
        <div className="bg-surface-container-low p-4 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
            Progresso Total
          </span>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-data text-2xl font-bold text-on-surface">{formatCurrency(totalCurrent)}</span>
            <span className="text-sm text-on-surface-variant">de {formatCurrency(totalTarget)} acumulados</span>
          </div>
          <div className="mt-3 w-full bg-surface-container-highest h-3 rounded-full overflow-hidden">
            <div className="bg-brand-blue h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs font-bold text-brand-blue">{pct.toFixed(1)}%</span>
            <span className="text-xs text-on-surface-variant">{Math.max(0, 100 - pct).toFixed(1)}% para a meta</span>
          </div>
        </div>
      )}

      {goals.length === 0 ? (
        <EmptyState
          icon="ads_click"
          title="Nenhuma meta criada"
          subtitle="Defina objetivos como viagens, reserva de emergência ou compras grandes e acompanhe o progresso."
        />
      ) : (
        <div className="space-y-3">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} onContribute={contributeToGoal} onEdit={setEditingGoal} />
          ))}
        </div>
      )}

      <AddGoalModal open={open} onClose={() => setOpen(false)} onSave={addGoal} />
      <EditGoalModal goal={editingGoal} onClose={() => setEditingGoal(null)} onSave={updateGoal} onDelete={deleteGoal} />
    </div>
  )
}

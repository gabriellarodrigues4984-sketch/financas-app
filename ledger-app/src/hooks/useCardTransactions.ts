import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { TransactionRow } from '../lib/database.types'

export interface InstallmentGroup {
  groupId: string
  description: string
  categoryId: string | null
  installmentAmount: number
  installmentsTotal: number
  totalValue: number
  paidCount: number
  remainingCount: number
  remainingValue: number
  nextDueDate: string | null
  firstDate: string
  transactions: TransactionRow[]
}

const todayStr = () => new Date().toISOString().slice(0, 10)

export function useCardTransactions(cardId: string | undefined) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user || !cardId) return
    setLoading(true)
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('card_id', cardId)
      .order('date', { ascending: false })
    setTransactions((data ?? []) as TransactionRow[])
    setLoading(false)
  }, [user, cardId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const today = todayStr()

  // Agrupa parcelas da mesma compra (mesmo installment_group)
  const groupsMap = new Map<string, TransactionRow[]>()
  const singleTransactions: TransactionRow[] = []
  for (const t of transactions) {
    if (t.installment_group) {
      const arr = groupsMap.get(t.installment_group) ?? []
      arr.push(t)
      groupsMap.set(t.installment_group, arr)
    } else {
      singleTransactions.push(t)
    }
  }

  const installmentGroups: InstallmentGroup[] = Array.from(groupsMap.entries())
    .map(([groupId, txs]) => {
      const sorted = [...txs].sort((a, b) => a.installment_number - b.installment_number)
      const first = sorted[0]
      const paidStored = sorted.filter((t) => t.date <= today)
      const remaining = sorted.filter((t) => t.date > today)
      const installmentAmount = Number(first.amount)
      // Se a compra foi cadastrada já em andamento (ex: começando na parcela 3 de 6),
      // as parcelas anteriores (1 e 2) são consideradas pagas mesmo sem lançamento salvo.
      const impliedAlreadyPaid = first.installment_number - 1
      const paidCount = impliedAlreadyPaid + paidStored.length
      return {
        groupId,
        description: first.description,
        categoryId: first.category_id,
        installmentAmount,
        installmentsTotal: first.installments_total,
        totalValue: installmentAmount * first.installments_total,
        paidCount,
        remainingCount: remaining.length,
        remainingValue: remaining.reduce((s, t) => s + Number(t.amount), 0),
        nextDueDate: remaining[0]?.date ?? null,
        firstDate: sorted[0].date,
        transactions: sorted,
      }
    })
    .sort((a, b) => (b.remainingCount > 0 ? 1 : 0) - (a.remainingCount > 0 ? 1 : 0) || b.firstDate.localeCompare(a.firstDate))

  const inProgress = installmentGroups.filter((g) => g.remainingCount > 0)
  const finished = installmentGroups.filter((g) => g.remainingCount === 0)

  const totalAllTime = transactions.reduce((s, t) => s + Number(t.amount), 0)
  const totalCharged = transactions.filter((t) => t.date <= today).reduce((s, t) => s + Number(t.amount), 0)
  const totalCommitted = transactions.filter((t) => t.date > today).reduce((s, t) => s + Number(t.amount), 0)

  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const monthEnd = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-01`
  const totalThisMonth = transactions
    .filter((t) => t.date >= monthStart && t.date < monthEnd)
    .reduce((s, t) => s + Number(t.amount), 0)

  async function deleteTransaction(id: string) {
    await supabase.from('transactions').delete().eq('id', id)
    await refresh()
  }

  return {
    loading,
    transactions,
    singleTransactions,
    installmentGroups,
    inProgress,
    finished,
    totals: {
      totalAllTime,
      totalCharged,
      totalCommitted,
      totalThisMonth,
    },
    refresh,
    deleteTransaction,
  }
}

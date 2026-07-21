import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { monthKey } from '../lib/format'
import type { TransactionRow, IncomeRow, FixedCostRow, FixedCostPaymentRow, PaymentType } from '../lib/database.types'

export type Transaction = TransactionRow
export type Income = IncomeRow
export type FixedCost = FixedCostRow
export type FixedCostPayment = FixedCostPaymentRow

export interface FixedCostWithPayment extends FixedCost {
  payment: FixedCostPayment | null
}

export function useMonthData(year: number, monthIndex0: number) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [incomes, setIncomes] = useState<Income[]>([])
  const [fixedCosts, setFixedCosts] = useState<FixedCostWithPayment[]>([])
  const [saldoAnterior, setSaldoAnterior] = useState(0)
  const [loading, setLoading] = useState(true)

  const monthStart = monthKey(year, monthIndex0)
  const monthEnd = monthKey(...Object.values(addMonthsLocal(year, monthIndex0, 1)) as [number, number])

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const [txRes, incRes, fcRes, fcpRes, prevIncRes, prevTxRes, prevFcpRes] = await Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .gte('date', monthStart)
        .lt('date', monthEnd)
        .order('date', { ascending: false }),
      supabase
        .from('incomes')
        .select('*')
        .gte('date', monthStart)
        .lt('date', monthEnd)
        .order('date', { ascending: false }),
      supabase.from('fixed_costs').select('*').eq('active', true).order('created_at', { ascending: true }),
      supabase.from('fixed_cost_payments').select('*').eq('month', monthStart),
      // Totais acumulados de todos os meses ANTERIORES ao mês selecionado, para
      // que o saldo que sobrou (ou faltou) carregue automaticamente para o mês seguinte.
      supabase.from('incomes').select('amount').lt('date', monthStart),
      supabase.from('transactions').select('amount').lt('date', monthStart),
      supabase.from('fixed_cost_payments').select('paid_amount').lt('month', monthStart),
    ])

    const payments: FixedCostPayment[] = fcpRes.data ?? []
    const merged: FixedCostWithPayment[] = ((fcRes.data ?? []) as FixedCost[]).map((fc) => ({
      ...fc,
      payment: payments.find((p) => p.fixed_cost_id === fc.id) ?? null,
    }))

    const prevIncomes = ((prevIncRes.data ?? []) as { amount: number }[]).reduce((s, r) => s + Number(r.amount), 0)
    const prevExpenses =
      ((prevTxRes.data ?? []) as { amount: number }[]).reduce((s, r) => s + Number(r.amount), 0) +
      ((prevFcpRes.data ?? []) as { paid_amount: number | null }[]).reduce((s, r) => s + Number(r.paid_amount ?? 0), 0)

    setTransactions(txRes.data ?? [])
    setIncomes(incRes.data ?? [])
    setFixedCosts(merged)
    setSaldoAnterior(prevIncomes - prevExpenses)
    setLoading(false)
  }, [user, monthStart, monthEnd])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function addTransaction(input: {
    description: string
    amount: number
    category_id: string | null
    payment_type: PaymentType
    card_id: string | null
    date: string
    installments_total?: number
    installment_start?: number
  }) {
    if (!user) return
    const installments = Math.max(1, input.installments_total ?? 1)
    // Parcela a partir da qual o lançamento começa a ser registrado (útil para compras
    // parceladas que já estavam em andamento quando o usuário começou a usar o app).
    const startInstallment = Math.min(Math.max(1, input.installment_start ?? 1), installments)

    if (installments === 1 || input.payment_type !== 'credito') {
      await supabase.from('transactions').insert({
        user_id: user.id,
        description: input.description,
        amount: input.amount,
        category_id: input.category_id,
        payment_type: input.payment_type,
        card_id: input.card_id,
        date: input.date,
        installments_total: 1,
        installment_number: 1,
      })
    } else {
      // Parcela o valor total em N lançamentos, ligados por installment_group.
      // `date` corresponde ao mês da parcela `startInstallment`; as demais parcelas
      // (até installments_total) são geradas para os meses seguintes.
      const groupId = crypto.randomUUID()
      const perInstallment = Math.round((input.amount / installments) * 100) / 100
      const baseDate = new Date(input.date + 'T00:00:00')
      const remaining = installments - startInstallment + 1
      const rows = Array.from({ length: remaining }, (_, i) => {
        const d = new Date(baseDate)
        d.setMonth(d.getMonth() + i)
        return {
          user_id: user.id,
          description: input.description,
          amount: perInstallment,
          category_id: input.category_id,
          payment_type: input.payment_type,
          card_id: input.card_id,
          date: d.toISOString().slice(0, 10),
          installment_group: groupId,
          installment_number: startInstallment + i,
          installments_total: installments,
        }
      })
      await supabase.from('transactions').insert(rows)
    }
    await refresh()
  }

  async function updateTransaction(
    id: string,
    input: {
      description: string
      amount: number
      category_id: string | null
      payment_type: PaymentType
      card_id: string | null
      date: string
    }
  ) {
    if (!user) return
    // Edita apenas o lançamento selecionado (se fizer parte de um parcelamento,
    // as demais parcelas do grupo não são alteradas).
    await supabase
      .from('transactions')
      .update({
        description: input.description,
        amount: input.amount,
        category_id: input.category_id,
        payment_type: input.payment_type,
        card_id: input.card_id,
        date: input.date,
      })
      .eq('id', id)
    await refresh()
  }

  async function deleteTransaction(id: string) {
    await supabase.from('transactions').delete().eq('id', id)
    await refresh()
  }

  async function addIncome(input: { description: string; amount: number; date: string }) {
    if (!user) return
    await supabase.from('incomes').insert({ ...input, user_id: user.id })
    await refresh()
  }

  async function addFixedCost(input: {
    name: string
    category_id: string | null
    due_day: number | null
    amount: number
    variable?: boolean
  }) {
    if (!user) return
    await supabase.from('fixed_costs').insert({ ...input, user_id: user.id })
    await refresh()
  }

  async function toggleFixedCostPaid(fixedCost: FixedCostWithPayment, paidAmount?: number) {
    if (!user) return
    const nextPaid = !(fixedCost.payment?.paid ?? false)
    await supabase.from('fixed_cost_payments').upsert(
      {
        fixed_cost_id: fixedCost.id,
        user_id: user.id,
        month: monthStart,
        paid: nextPaid,
        paid_amount: paidAmount ?? fixedCost.payment?.paid_amount ?? fixedCost.amount,
      },
      { onConflict: 'fixed_cost_id,month' }
    )
    await refresh()
  }

  async function setFixedCostAmount(fixedCost: FixedCostWithPayment, amount: number) {
    if (!user) return
    await supabase.from('fixed_cost_payments').upsert(
      {
        fixed_cost_id: fixedCost.id,
        user_id: user.id,
        month: monthStart,
        paid: fixedCost.payment?.paid ?? false,
        paid_amount: amount,
      },
      { onConflict: 'fixed_cost_id,month' }
    )
    await refresh()
  }

  async function updateFixedCost(
    id: string,
    input: Partial<{
      name: string
      category_id: string | null
      due_day: number | null
      amount: number
      variable: boolean
    }>
  ) {
    if (!user) return
    await supabase.from('fixed_costs').update(input).eq('id', id)
    await refresh()
  }

  async function deleteFixedCost(id: string) {
    if (!user) return
    // Apaga o custo fixo e, em cascata, o histórico de pagamentos dele (fixed_cost_payments).
    await supabase.from('fixed_costs').delete().eq('id', id)
    await refresh()
  }

  // ---- Totais derivados ----
  const fixedCostsTotal = fixedCosts.reduce(
    (sum, fc) => sum + Number(fc.payment?.paid_amount ?? fc.amount),
    0
  )
  const transactionsTotal = transactions.reduce((sum, t) => sum + Number(t.amount), 0)
  const gastosDoMes = fixedCostsTotal + transactionsTotal
  const entradasTotal = incomes.reduce((sum, i) => sum + Number(i.amount), 0)
  const saldo = entradasTotal - gastosDoMes
  const saldoAcumulado = saldoAnterior + saldo
  const debitoTotal =
    transactions.filter((t) => t.payment_type === 'debito').reduce((s, t) => s + Number(t.amount), 0)
  const creditoTotal =
    transactions.filter((t) => t.payment_type === 'credito').reduce((s, t) => s + Number(t.amount), 0)

  const byCategory = new Map<string, number>()
  for (const t of transactions) {
    if (!t.category_id) continue
    byCategory.set(t.category_id, (byCategory.get(t.category_id) ?? 0) + Number(t.amount))
  }
  for (const fc of fixedCosts) {
    if (!fc.category_id) continue
    const paidAmount = Number(fc.payment?.paid_amount ?? fc.amount)
    byCategory.set(fc.category_id, (byCategory.get(fc.category_id) ?? 0) + paidAmount)
  }

  const byCard = new Map<string, number>()
  for (const t of transactions) {
    if (!t.card_id) continue
    byCard.set(t.card_id, (byCard.get(t.card_id) ?? 0) + Number(t.amount))
  }

  return {
    loading,
    transactions,
    incomes,
    fixedCosts,
    refresh,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addIncome,
    addFixedCost,
    updateFixedCost,
    deleteFixedCost,
    toggleFixedCostPaid,
    setFixedCostAmount,
    totals: {
      fixedCostsTotal,
      transactionsTotal,
      gastosDoMes,
      entradasTotal,
      saldo,
      saldoAnterior,
      saldoAcumulado,
      debitoTotal,
      creditoTotal,
    },
    byCategory,
    byCard,
  }
}

function addMonthsLocal(year: number, monthIndex0: number, delta: number) {
  const total = year * 12 + monthIndex0 + delta
  return { year: Math.floor(total / 12), monthIndex0: ((total % 12) + 12) % 12 }
}

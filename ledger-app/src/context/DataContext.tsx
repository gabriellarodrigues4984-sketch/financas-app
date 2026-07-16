import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import type { CategoryRow, CardRow, GoalRow } from '../lib/database.types'

export type Category = CategoryRow
export type Card = CardRow
export type Goal = GoalRow

interface DataContextValue {
  categories: Category[]
  cards: Card[]
  goals: Goal[]
  loading: boolean
  refreshCategories: () => Promise<void>
  refreshCards: () => Promise<void>
  refreshGoals: () => Promise<void>
  addCard: (input: { name: string; color: string; closing_day?: number | null; due_day?: number | null }) => Promise<void>
  archiveCard: (id: string) => Promise<void>
  addGoal: (input: {
    name: string
    subtitle?: string
    target_amount: number
    target_date?: string | null
    icon?: string
    color?: string
  }) => Promise<void>
  updateGoal: (
    goalId: string,
    input: Partial<{
      name: string
      subtitle: string | null
      target_amount: number
      current_amount: number
      target_date: string | null
      icon: string
      color: string
    }>
  ) => Promise<void>
  deleteGoal: (goalId: string) => Promise<void>
  contributeToGoal: (goalId: string, amount: number, note?: string) => Promise<void>
}

const DataContext = createContext<DataContextValue | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  const refreshCategories = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
    setCategories(data ?? [])
  }, [user])

  const refreshCards = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('cards')
      .select('*')
      .eq('archived', false)
      .order('created_at', { ascending: true })
    setCards(data ?? [])
  }, [user])

  const refreshGoals = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: true })
    setGoals(data ?? [])
  }, [user])

  useEffect(() => {
    if (!user) {
      setCategories([])
      setCards([])
      setGoals([])
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all([refreshCategories(), refreshCards(), refreshGoals()]).finally(() => setLoading(false))
  }, [user, refreshCategories, refreshCards, refreshGoals])

  async function addCard(input: { name: string; color: string; closing_day?: number | null; due_day?: number | null }) {
    if (!user) return
    await supabase.from('cards').insert({ ...input, user_id: user.id })
    await refreshCards()
  }

  async function archiveCard(id: string) {
    await supabase.from('cards').update({ archived: true }).eq('id', id)
    await refreshCards()
  }

  async function addGoal(input: {
    name: string
    subtitle?: string
    target_amount: number
    target_date?: string | null
    icon?: string
    color?: string
  }) {
    if (!user) return
    await supabase.from('goals').insert({ ...input, user_id: user.id })
    await refreshGoals()
  }

  async function updateGoal(
    goalId: string,
    input: Partial<{
      name: string
      subtitle: string | null
      target_amount: number
      current_amount: number
      target_date: string | null
      icon: string
      color: string
    }>
  ) {
    if (!user) return
    await supabase.from('goals').update(input).eq('id', goalId)
    await refreshGoals()
  }

  async function deleteGoal(goalId: string) {
    if (!user) return
    await supabase.from('goals').delete().eq('id', goalId)
    await refreshGoals()
  }

  async function contributeToGoal(goalId: string, amount: number, note?: string) {
    if (!user) return
    await supabase.from('goal_contributions').insert({
      goal_id: goalId,
      user_id: user.id,
      amount,
      date: new Date().toISOString().slice(0, 10),
      note,
    })
    const goal = goals.find((g) => g.id === goalId)
    if (goal) {
      const nextAmount = Math.max(0, Number(goal.current_amount) + amount)
      await supabase.from('goals').update({ current_amount: nextAmount }).eq('id', goalId)
    }
    await refreshGoals()
  }

  return (
    <DataContext.Provider
      value={{
        categories,
        cards,
        goals,
        loading,
        refreshCategories,
        refreshCards,
        refreshGoals,
        addCard,
        archiveCard,
        addGoal,
        updateGoal,
        deleteGoal,
        contributeToGoal,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData deve ser usado dentro de <DataProvider>')
  return ctx
}

// Tipos de domínio usados no front-end, espelhando as tabelas de supabase/schema.sql.
// Não usamos o generic `Database` do supabase-js aqui de propósito: evita ter que manter
// a assinatura exata que o postgrest-js espera (Relationships, Views, Functions, etc.)
// sincronizada manualmente. Se preferir tipagem 100% gerada, rode:
//   npx supabase gen types typescript --project-id SEU_PROJECT_ID > src/lib/database.types.ts
// e ajuste os imports em lib/supabase.ts para usar createClient<Database>(...).

export type PaymentType = 'debito' | 'credito'

export interface CategoryRow {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  sort_order: number
  created_at: string
}

export interface CardRow {
  id: string
  user_id: string
  name: string
  color: string
  closing_day: number | null
  due_day: number | null
  archived: boolean
  created_at: string
}

export interface FixedCostRow {
  id: string
  user_id: string
  name: string
  category_id: string | null
  due_day: number | null
  amount: number
  variable: boolean
  active: boolean
  created_at: string
}

export interface FixedCostPaymentRow {
  id: string
  fixed_cost_id: string
  user_id: string
  month: string
  paid: boolean
  paid_amount: number | null
  created_at: string
}

export interface TransactionRow {
  id: string
  user_id: string
  description: string
  amount: number
  category_id: string | null
  payment_type: PaymentType
  card_id: string | null
  date: string
  installment_group: string | null
  installment_number: number
  installments_total: number
  created_at: string
}

export interface IncomeRow {
  id: string
  user_id: string
  description: string
  amount: number
  date: string
  created_at: string
}

export interface GoalRow {
  id: string
  user_id: string
  name: string
  subtitle: string | null
  target_amount: number
  current_amount: number
  target_date: string | null
  icon: string
  color: string
  status: string
  created_at: string
}

export interface GoalContributionRow {
  id: string
  goal_id: string
  user_id: string
  amount: number
  date: string
  note: string | null
  created_at: string
}

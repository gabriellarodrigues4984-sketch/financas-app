// Banco de dados falso, guardado no localStorage do navegador.
// Usado SOMENTE quando VITE_LOCAL_PREVIEW=true (veja .env.local), para
// você testar o app sem precisar logar com Google e sem tocar no Supabase real.

type Row = Record<string, any>
type Db = Record<string, Row[]>

const STORAGE_KEY = 'grao_preview_db_v1'
export const PREVIEW_USER_ID = 'preview-user'

function uuid() {
  return crypto.randomUUID()
}

function seedDb(): Db {
  const userId = PREVIEW_USER_ID
  const nowIso = new Date().toISOString()
  const today = new Date().toISOString().slice(0, 10)

  const categories: Row[] = [
    { id: uuid(), user_id: userId, name: 'Mercado', color: '#E31C23', icon: 'shopping_cart', sort_order: 1 },
    { id: uuid(), user_id: userId, name: 'Transporte', color: '#0057B8', icon: 'directions_car', sort_order: 2 },
    { id: uuid(), user_id: userId, name: 'Lazer', color: '#8B5CF6', icon: 'sports_esports', sort_order: 3 },
    { id: uuid(), user_id: userId, name: 'Saúde', color: '#10B981', icon: 'health_and_safety', sort_order: 4 },
    { id: uuid(), user_id: userId, name: 'Casa', color: '#F59E0B', icon: 'home', sort_order: 5 },
  ]

  const cards: Row[] = [
    { id: uuid(), user_id: userId, name: 'Nubank', color: '#820AD1', closing_day: 20, due_day: 27, archived: false, created_at: nowIso },
    { id: uuid(), user_id: userId, name: 'Inter', color: '#FF7A00', closing_day: 5, due_day: 12, archived: false, created_at: nowIso },
  ]

  const fixedCosts: Row[] = [
    { id: uuid(), user_id: userId, name: 'Aluguel', category_id: categories[4].id, due_day: 10, amount: 1200, variable: false, active: true, created_at: nowIso },
    { id: uuid(), user_id: userId, name: 'Internet', category_id: categories[4].id, due_day: 15, amount: 99.9, variable: false, active: true, created_at: nowIso },
  ]

  const transactions: Row[] = [
    {
      id: uuid(),
      user_id: userId,
      description: 'Compras do mês',
      amount: 320.5,
      category_id: categories[0].id,
      payment_type: 'debito',
      card_id: null,
      date: today,
      installment_group: null,
      installment_number: 1,
      installments_total: 1,
      created_at: nowIso,
    },
  ]

  return {
    transactions,
    incomes: [],
    fixed_costs: fixedCosts,
    fixed_cost_payments: [],
    categories,
    cards,
    goals: [],
    goal_contributions: [],
  }
}

function loadDb(): Db {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignora e recria
  }
  const fresh = seedDb()
  saveDb(fresh)
  return fresh
}

function saveDb(db: Db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

const db: Db = loadDb()

function persist() {
  saveDb(db)
}

type Filter = ['eq' | 'gte' | 'lt', string, any]

function matches(row: Row, filters: Filter[]) {
  return filters.every(([type, col, val]) => {
    const rowVal = row[col]
    if (type === 'eq') return rowVal === val
    if (type === 'gte') return rowVal >= val
    if (type === 'lt') return rowVal < val
    return true
  })
}

class QueryBuilder {
  private filters: Filter[] = []
  private orderCol: string | null = null
  private orderAsc = true
  private op: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select'
  private payload: any = null
  private upsertConflict: string | null = null
  private table: string

  constructor(table: string) {
    this.table = table
    db[this.table] ??= []
  }

  select(_cols?: string) {
    this.op = 'select'
    return this
  }
  insert(rows: Row | Row[]) {
    this.op = 'insert'
    this.payload = rows
    return this
  }
  update(patch: Row) {
    this.op = 'update'
    this.payload = patch
    return this
  }
  delete() {
    this.op = 'delete'
    return this
  }
  upsert(row: Row, opts?: { onConflict?: string }) {
    this.op = 'upsert'
    this.payload = row
    this.upsertConflict = opts?.onConflict ?? null
    return this
  }
  eq(col: string, val: any) {
    this.filters.push(['eq', col, val])
    return this
  }
  gte(col: string, val: any) {
    this.filters.push(['gte', col, val])
    return this
  }
  lt(col: string, val: any) {
    this.filters.push(['lt', col, val])
    return this
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this.orderCol = col
    this.orderAsc = opts?.ascending ?? true
    return this
  }

  private execute(): { data: any; error: null } {
    const table = db[this.table]

    if (this.op === 'select') {
      let rows = table.filter((r) => matches(r, this.filters))
      if (this.orderCol) {
        const col = this.orderCol
        rows = [...rows].sort((a, b) => {
          if (a[col] < b[col]) return this.orderAsc ? -1 : 1
          if (a[col] > b[col]) return this.orderAsc ? 1 : -1
          return 0
        })
      }
      return { data: rows, error: null }
    }

    if (this.op === 'insert') {
      const rows = Array.isArray(this.payload) ? this.payload : [this.payload]
      const inserted = rows.map((r) => ({ id: uuid(), created_at: new Date().toISOString(), ...r }))
      table.push(...inserted)
      persist()
      return { data: inserted, error: null }
    }

    if (this.op === 'update') {
      for (let i = 0; i < table.length; i++) {
        if (matches(table[i], this.filters)) table[i] = { ...table[i], ...this.payload }
      }
      persist()
      return { data: table.filter((r) => matches(r, this.filters)), error: null }
    }

    if (this.op === 'delete') {
      db[this.table] = table.filter((r) => !matches(r, this.filters))
      persist()
      return { data: null, error: null }
    }

    if (this.op === 'upsert') {
      const conflictCols = (this.upsertConflict ?? 'id').split(',')
      const idx = table.findIndex((r) => conflictCols.every((c) => r[c] === this.payload[c]))
      if (idx >= 0) {
        table[idx] = { ...table[idx], ...this.payload }
      } else {
        table.push({ id: uuid(), created_at: new Date().toISOString(), ...this.payload })
      }
      persist()
      return { data: null, error: null }
    }

    return { data: null, error: null }
  }

  // Torna o builder "aguardável" (await supabase.from(...).select()...)
  then(onFulfilled: any, onRejected?: any) {
    return Promise.resolve(this.execute()).then(onFulfilled, onRejected)
  }
}

export const mockSupabase = {
  from(table: string) {
    return new QueryBuilder(table)
  },
  auth: {
    async getSession() {
      return {
        data: {
          session: {
            user: { id: PREVIEW_USER_ID, email: 'preview@local.test' },
          },
        },
      }
    },
    onAuthStateChange() {
      return { data: { subscription: { unsubscribe() {} } } }
    },
    async signInWithOAuth() {
      // sem-op: no modo preview já entramos "logados"
    },
    async signOut() {
      localStorage.removeItem(STORAGE_KEY)
      window.location.reload()
    },
  },
}

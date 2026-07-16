-- ============================================================================
-- Modern Ledger — schema Supabase
-- Rode este arquivo inteiro em: Supabase Dashboard > SQL Editor > New query
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Tabelas
-- ----------------------------------------------------------------------------

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#377EC0',
  icon text not null default 'category',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#5460AC',
  closing_day int check (closing_day between 1 and 31),
  due_day int check (due_day between 1 and 31),
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.fixed_costs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category_id uuid references public.categories(id) on delete set null,
  due_day int check (due_day between 1 and 31),
  amount numeric(12,2) not null default 0,
  variable boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Controla, por mês, se um custo fixo foi pago e (para os variáveis) o valor daquele mês
create table if not exists public.fixed_cost_payments (
  id uuid primary key default gen_random_uuid(),
  fixed_cost_id uuid not null references public.fixed_costs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  month date not null, -- sempre dia 1, ex: 2026-01-01
  paid boolean not null default false,
  paid_amount numeric(12,2),
  created_at timestamptz not null default now(),
  unique (fixed_cost_id, month)
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount numeric(12,2) not null,
  category_id uuid references public.categories(id) on delete set null,
  payment_type text not null check (payment_type in ('debito', 'credito')),
  card_id uuid references public.cards(id) on delete set null,
  date date not null default current_date,
  installment_group uuid,
  installment_number int not null default 1,
  installments_total int not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount numeric(12,2) not null,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  subtitle text,
  target_amount numeric(12,2) not null default 0,
  current_amount numeric(12,2) not null default 0,
  target_date date,
  icon text not null default 'flag',
  color text not null default '#377EC0',
  status text not null default 'ativo',
  created_at timestamptz not null default now()
);

create table if not exists public.goal_contributions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12,2) not null,
  date date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

-- Índices úteis
create index if not exists idx_transactions_user_date on public.transactions (user_id, date desc);
create index if not exists idx_fixed_cost_payments_month on public.fixed_cost_payments (user_id, month);
create index if not exists idx_incomes_user_date on public.incomes (user_id, date desc);

-- ----------------------------------------------------------------------------
-- Row Level Security — cada usuário só acessa os próprios dados
-- ----------------------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.cards enable row level security;
alter table public.fixed_costs enable row level security;
alter table public.fixed_cost_payments enable row level security;
alter table public.transactions enable row level security;
alter table public.incomes enable row level security;
alter table public.goals enable row level security;
alter table public.goal_contributions enable row level security;

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'categories', 'cards', 'fixed_costs', 'fixed_cost_payments',
    'transactions', 'incomes', 'goals', 'goal_contributions'
  ])
  loop
    execute format('drop policy if exists "select_own" on public.%I', t);
    execute format('drop policy if exists "insert_own" on public.%I', t);
    execute format('drop policy if exists "update_own" on public.%I', t);
    execute format('drop policy if exists "delete_own" on public.%I', t);

    execute format('create policy "select_own" on public.%I for select using (auth.uid() = user_id)', t);
    execute format('create policy "insert_own" on public.%I for insert with check (auth.uid() = user_id)', t);
    execute format('create policy "update_own" on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    execute format('create policy "delete_own" on public.%I for delete using (auth.uid() = user_id)', t);
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- Seed automático: quando um usuário novo faz login pela primeira vez
-- (via Google), cria as categorias padrão dele.
-- ----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (user_id, name, color, icon, sort_order)
  values
    (new.id, 'Mercado', '#377EC0', 'shopping_basket', 1),
    (new.id, 'IFood/restaurante', '#F7891F', 'restaurant', 2),
    (new.id, 'Uber/transporte', '#12BAAA', 'local_taxi', 3),
    (new.id, 'Contas', '#5460AC', 'receipt_long', 4),
    (new.id, 'Assinaturas', '#9FD2D6', 'subscriptions', 5),
    (new.id, 'Saúde', '#F04F52', 'favorite', 6),
    (new.id, 'Beleza', '#FBDF54', 'face', 7),
    (new.id, 'Lazer', '#12BAAA', 'sports_esports', 8),
    (new.id, 'Desenvolvimento', '#377EC0', 'school', 9),
    (new.id, 'Roupa', '#5460AC', 'checkroom', 10),
    (new.id, 'Eletrônicos', '#414754', 'devices', 11),
    (new.id, 'Presentes', '#F04F52', 'card_giftcard', 12),
    (new.id, 'Necessidades', '#F7891F', 'home', 13),
    (new.id, 'Aluguel', '#377EC0', 'apartment', 14),
    (new.id, 'Despesas eventuais', '#727785', 'event_repeat', 15)
  on conflict (user_id, name) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Fim. Depois de rodar este script, configure o provedor Google em:
-- Authentication > Providers > Google (veja README.md do projeto).
-- ----------------------------------------------------------------------------

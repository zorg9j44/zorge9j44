-- Нейро-РОП: базовая схема MVP
-- Тарифы фиксированы в коде (см. lib/tariffs.ts), таблица нужна только
-- чтобы биллинг ссылался на цену/лимит, актуальные на момент оформления подписки.

create table if not exists public.tariffs (
  code text primary key,
  name text not null,
  price_rub integer not null,
  manager_limit integer not null,
  features jsonb not null default '[]'::jsonb
);

insert into public.tariffs (code, name, price_rub, manager_limit, features) values
  ('start', 'Старт', 14900, 3, '["analysis", "dashboard"]'),
  ('business', 'Бизнес', 34900, 10, '["analysis", "dashboard", "hints", "auto_dozhim"]'),
  ('enterprise', 'Энтерпрайз', 69900, 999, '["analysis", "dashboard", "hints", "auto_dozhim", "priority_support"]')
on conflict (code) do nothing;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  tariff_code text not null default 'start' references public.tariffs(code),
  trial_ends_at timestamptz not null default (now() + interval '7 days'),
  -- заполняется, когда собственник пишет /start уведомляющему боту - туда шлём ежедневную сводку
  telegram_bot_chat_id bigint,
  created_at timestamptz not null default now()
);

-- Профиль пользователя: владелец кабинета (роль owner) либо аккаунт менеджера,
-- у которого есть доступ только к своим диалогам (роль manager).
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  role text not null check (role in ('owner', 'manager')),
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.managers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  display_name text not null,
  telegram_user_id bigint,
  -- заполняется, когда менеджер пишет /start уведомляющему боту - туда шлём live-подсказки
  telegram_bot_chat_id bigint,
  auto_dozhim_enabled boolean not null default false,
  style_profile jsonb,
  created_at timestamptz not null default now()
);

-- session_string - это фактически пароль от личного Telegram-аккаунта менеджера
-- (MTProto). Шифруется на уровне приложения (воркер) перед записью, в БД
-- хранится только шифротекст - это единственное исключение из решения
-- "без app-level шифрования", т.к. компрометация session_string = захват аккаунта.
create table if not exists public.telegram_sessions (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references public.managers(id) on delete cascade,
  phone text not null,
  session_string_encrypted text not null,
  status text not null default 'active' check (status in ('active', 'expired', 'revoked')),
  created_at timestamptz not null default now()
);

create table if not exists public.dialogues (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  manager_id uuid not null references public.managers(id) on delete cascade,
  telegram_chat_id bigint not null,
  client_display_name text,
  funnel_stage text not null default 'new' check (
    funnel_stage in ('new', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')
  ),
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  unique (manager_id, telegram_chat_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  dialogue_id uuid not null references public.dialogues(id) on delete cascade,
  sender_type text not null check (sender_type in ('manager', 'client', 'ai')),
  text text not null,
  telegram_message_id bigint,
  sent_at timestamptz not null default now()
);

create table if not exists public.analysis (
  id uuid primary key default gen_random_uuid(),
  dialogue_id uuid not null references public.dialogues(id) on delete cascade,
  script_compliance jsonb,
  errors jsonb,
  close_probability numeric(4, 3),
  summary text,
  created_at timestamptz not null default now()
);

create table if not exists public.hints (
  id uuid primary key default gen_random_uuid(),
  dialogue_id uuid not null references public.dialogues(id) on delete cascade,
  manager_id uuid not null references public.managers(id) on delete cascade,
  text text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'dismissed')),
  created_at timestamptz not null default now()
);

create table if not exists public.auto_dozhim_log (
  id uuid primary key default gen_random_uuid(),
  dialogue_id uuid not null references public.dialogues(id) on delete cascade,
  message_text text not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'cancelled')),
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create table if not exists public.daily_summaries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  summary_date date not null,
  payload jsonb not null,
  sent_at timestamptz,
  unique (company_id, summary_date)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  tariff_code text not null references public.tariffs(code),
  status text not null default 'trialing' check (
    status in ('trialing', 'active', 'past_due', 'canceled')
  ),
  current_period_end timestamptz,
  yookassa_payment_id text,
  created_at timestamptz not null default now()
);

-- RLS: доступ только к данным своей компании.
alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.managers enable row level security;
alter table public.telegram_sessions enable row level security;
alter table public.dialogues enable row level security;
alter table public.messages enable row level security;
alter table public.analysis enable row level security;
alter table public.hints enable row level security;
alter table public.auto_dozhim_log enable row level security;
alter table public.daily_summaries enable row level security;
alter table public.subscriptions enable row level security;

create or replace function public.current_company_id()
returns uuid
language sql
security definer
stable
as $$
  select company_id from public.profiles where id = auth.uid();
$$;

create policy "company members read own company" on public.companies
  for select using (id = public.current_company_id());

create policy "profiles read own company" on public.profiles
  for select using (company_id = public.current_company_id());

create policy "managers scoped to company" on public.managers
  for all using (company_id = public.current_company_id());

create policy "telegram sessions scoped to company" on public.telegram_sessions
  for all using (
    manager_id in (select id from public.managers where company_id = public.current_company_id())
  );

create policy "dialogues scoped to company" on public.dialogues
  for all using (company_id = public.current_company_id());

create policy "messages scoped to company" on public.messages
  for all using (
    dialogue_id in (select id from public.dialogues where company_id = public.current_company_id())
  );

create policy "analysis scoped to company" on public.analysis
  for all using (
    dialogue_id in (select id from public.dialogues where company_id = public.current_company_id())
  );

create policy "hints scoped to company" on public.hints
  for all using (
    dialogue_id in (select id from public.dialogues where company_id = public.current_company_id())
  );

create policy "auto_dozhim scoped to company" on public.auto_dozhim_log
  for all using (
    dialogue_id in (select id from public.dialogues where company_id = public.current_company_id())
  );

create policy "daily summaries scoped to company" on public.daily_summaries
  for all using (company_id = public.current_company_id());

create policy "subscriptions scoped to company" on public.subscriptions
  for all using (company_id = public.current_company_id());

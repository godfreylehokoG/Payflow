create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  phone_number text not null,
  full_name text,
  role text not null default 'consumer' check (role in ('consumer', 'merchant', 'agent')),
  wallet_balance numeric(12, 2) not null default 0 check (wallet_balance >= 0),
  pin_hash text,
  is_verified boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.merchants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  name text not null,
  category text not null check (category in ('spaza', 'kota', 'street_vendor', 'taxi', 'agent')),
  address text,
  distance text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.users(id) on delete set null,
  receiver_id uuid references public.users(id) on delete set null,
  amount numeric(12, 2) not null check (amount > 0),
  fee numeric(12, 2) not null default 0 check (fee >= 0),
  type text not null check (type in ('send', 'receive', 'withdraw', 'borrow', 'repay', 'deposit')),
  status text not null default 'completed' check (status in ('pending', 'completed', 'failed')),
  reference text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.borrows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  fee numeric(12, 2) not null default 0 check (fee >= 0),
  purpose text check (purpose in ('food', 'airtime', 'transport', 'other')),
  status text not null default 'active' check (status in ('active', 'repaid', 'overdue')),
  due_date timestamptz,
  created_at timestamptz not null default now(),
  repaid_at timestamptz
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.merchants enable row level security;
alter table public.transactions enable row level security;
alter table public.borrows enable row level security;

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own"
on public.users
for select
to authenticated
using (id = auth.uid());

drop policy if exists "users_insert_own" on public.users;
create policy "users_insert_own"
on public.users
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own"
on public.users
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "merchants_select_all_authenticated" on public.merchants;
create policy "merchants_select_all_authenticated"
on public.merchants
for select
to authenticated
using (true);

drop policy if exists "transactions_select_participant" on public.transactions;
create policy "transactions_select_participant"
on public.transactions
for select
to authenticated
using (sender_id = auth.uid() or receiver_id = auth.uid());

drop policy if exists "borrows_select_own" on public.borrows;
create policy "borrows_select_own"
on public.borrows
for select
to authenticated
using (user_id = auth.uid());

create or replace function public.process_send(
  p_sender_id uuid,
  p_amount numeric,
  p_recipient_phone text default null,
  p_merchant_id uuid default null
)
returns public.transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sender public.users;
  v_receiver public.users;
  v_fee numeric(12, 2);
  v_total numeric(12, 2);
  v_tx public.transactions;
begin
  if p_sender_id <> auth.uid() then
    raise exception 'sender mismatch';
  end if;

  select * into v_sender from public.users where id = p_sender_id;
  if not found then
    raise exception 'sender not found';
  end if;

  if p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;

  v_fee := round(p_amount * 0.01, 2);
  v_total := p_amount + v_fee;

  if v_sender.wallet_balance < v_total then
    raise exception 'insufficient funds';
  end if;

  if p_merchant_id is not null then
    select * into v_receiver from public.users
    where id = (select user_id from public.merchants where id = p_merchant_id)
    limit 1;
  elsif p_recipient_phone is not null and p_recipient_phone <> '' then
    select * into v_receiver from public.users
    where phone_number = p_recipient_phone
    limit 1;
    if v_receiver.id is null then
      raise exception 'recipient not found';
    end if;
  end if;

  update public.users
  set wallet_balance = wallet_balance - v_total
  where id = p_sender_id;

  if found and v_receiver.id is not null then
    update public.users
    set wallet_balance = wallet_balance + p_amount
    where id = v_receiver.id;
  end if;

  insert into public.transactions (
    sender_id, receiver_id, amount, fee, type, status, reference, description
  )
  values (
    p_sender_id,
    v_receiver.id,
    p_amount,
    v_fee,
    'send',
    'completed',
    concat('TX-', to_char(now(), 'YYYYMMDDHH24MISSMS')),
    case when p_merchant_id is not null then 'Merchant payment' else 'P2P send' end
  )
  returning * into v_tx;

  return v_tx;
end;
$$;

create or replace function public.process_withdraw(
  p_user_id uuid,
  p_amount numeric,
  p_merchant_id uuid
)
returns public.transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user public.users;
  v_fee numeric(12, 2);
  v_total numeric(12, 2);
  v_tx public.transactions;
begin
  if p_user_id <> auth.uid() then
    raise exception 'user mismatch';
  end if;

  select * into v_user from public.users where id = p_user_id;
  if not found then
    raise exception 'user not found';
  end if;

  if p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;

  v_fee := round(greatest(p_amount * 0.01, 2), 2);
  v_total := p_amount + v_fee;

  if v_user.wallet_balance < v_total then
    raise exception 'insufficient funds';
  end if;

  update public.users
  set wallet_balance = wallet_balance - v_total
  where id = p_user_id;

  insert into public.transactions (
    sender_id, receiver_id, amount, fee, type, status, reference, description
  )
  values (
    p_user_id,
    null,
    p_amount,
    v_fee,
    'withdraw',
    'completed',
    concat('WD-', to_char(now(), 'YYYYMMDDHH24MISSMS')),
    'Cash withdrawal'
  )
  returning * into v_tx;

  return v_tx;
end;
$$;

create or replace function public.process_borrow(
  p_user_id uuid,
  p_amount numeric,
  p_purpose text
)
returns public.transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_active_count integer;
  v_fee numeric(12, 2);
  v_tx public.transactions;
begin
  if p_user_id <> auth.uid() then
    raise exception 'user mismatch';
  end if;

  if p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;

  select count(*) into v_active_count
  from public.borrows
  where user_id = p_user_id and status = 'active';

  if v_active_count > 0 then
    raise exception 'existing active borrow';
  end if;

  v_fee := round(p_amount * 0.1, 2);

  insert into public.borrows (user_id, amount, fee, purpose, status, due_date)
  values (
    p_user_id,
    p_amount,
    v_fee,
    case when p_purpose in ('food', 'airtime', 'transport', 'other') then p_purpose else 'other' end,
    'active',
    now() + interval '14 days'
  );

  update public.users
  set wallet_balance = wallet_balance + p_amount
  where id = p_user_id;

  insert into public.transactions (
    sender_id, receiver_id, amount, fee, type, status, reference, description
  )
  values (
    null,
    p_user_id,
    p_amount,
    0,
    'borrow',
    'completed',
    concat('BR-', to_char(now(), 'YYYYMMDDHH24MISSMS')),
    'Borrow disbursement'
  )
  returning * into v_tx;

  return v_tx;
end;
$$;

grant usage on schema public to authenticated;
grant select, insert, update on public.users to authenticated;
grant select on public.merchants to authenticated;
grant select on public.transactions to authenticated;
grant select on public.borrows to authenticated;
grant execute on function public.process_send(uuid, numeric, text, uuid) to authenticated;
grant execute on function public.process_withdraw(uuid, numeric, uuid) to authenticated;
grant execute on function public.process_borrow(uuid, numeric, text) to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'transactions'
  ) then
    alter publication supabase_realtime add table public.transactions;
  end if;
end;
$$;

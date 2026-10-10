-- ====================================================================
-- CANDI SUPER STORE PLATFORM: INITIAL DATABASE MIGRATION
-- ====================================================================

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text unique,
  avatar_url text,
  preferred_language text not null default 'en',
  contact_preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. DELIVERY ZONES
create table if not exists public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  description text,
  is_active boolean not null default true,
  serviceable boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. CUSTOMER ACCOUNTS
create table if not exists public.customer_accounts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  customer_type text not null check (customer_type in ('retailer', 'sub_wholesaler')),
  business_name text not null,
  business_category text,
  whatsapp_number text,
  status text not null default 'pending_review' check (
    status in ('pending_review', 'under_review', 'approved', 'rejected', 'changes_requested', 'suspended', 'archived')
  ),
  assigned_delivery_zone_id uuid references public.delivery_zones(id),
  internal_notes text,
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  rejected_reason text,
  change_request_message text,
  credit_limit numeric(12, 2) not null default 0.00,
  current_balance numeric(12, 2) not null default 0.00,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. CUSTOMER ADDRESSES
create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_account_id uuid not null references public.customer_accounts(id) on delete cascade,
  label text not null,
  recipient_name text not null,
  recipient_phone text not null,
  address_line text not null,
  area text not null,
  city text not null,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  location_accuracy numeric,
  location_source text check (location_source in ('gps', 'map_pin', 'manual') or location_source is null),
  location_captured_at timestamptz,
  delivery_instructions text,
  is_primary boolean not null default false,
  is_active boolean not null default true,
  validation_status text not null default 'unverified' check (validation_status in ('unverified', 'verified', 'needs_review')),
  validated_by uuid references public.profiles(id),
  validated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Invariant constraint: Only one active primary address per customer account
create unique index if not exists one_primary_active_address_per_customer
on public.customer_addresses (customer_account_id)
where is_primary = true and is_active = true;

-- 5. STAFF ROLES & RBAC
create table if not exists public.staff_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text not null
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.staff_roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists public.staff_role_assignments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.staff_roles(id),
  is_active boolean not null default true,
  assigned_by uuid references public.profiles(id),
  assigned_at timestamptz not null default now(),
  unique (profile_id, role_id)
);

-- 6. AUDIT LOGS (Immutable)
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles(id),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  old_values jsonb,
  new_values jsonb,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 7. PRODUCTS & PACKAGING
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  category text not null,
  brand text not null,
  description text,
  image_url text,
  base_unit text not null check (base_unit in ('carton', 'box', 'packet', 'piece')),
  base_price numeric(10, 2) not null,
  retailer_price numeric(10, 2) not null,
  sub_wholesaler_price numeric(10, 2) not null,
  units_available integer not null default 0,
  reserved_units integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8. ORDERS & INVOICES
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_account_id uuid not null references public.customer_accounts(id),
  delivery_address_id uuid not null references public.customer_addresses(id),
  delivery_zone_id uuid not null references public.delivery_zones(id),
  status text not null default 'draft' check (
    status in ('draft', 'pending_confirmation', 'confirmed', 'approved_for_picking', 'picked', 'dispatched', 'delivered', 'reconciled', 'cancelled', 'credit_hold')
  ),
  subtotal numeric(12, 2) not null default 0.00,
  discount numeric(12, 2) not null default 0.00,
  tax numeric(12, 2) not null default 0.00,
  total numeric(12, 2) not null default 0.00,
  payment_method text not null default 'cash_on_delivery',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  order_id uuid not null unique references public.orders(id),
  customer_account_id uuid not null references public.customer_accounts(id),
  gross_amount numeric(12, 2) not null,
  discount numeric(12, 2) not null default 0.00,
  tax numeric(12, 2) not null default 0.00,
  net_amount numeric(12, 2) not null,
  paid_amount numeric(12, 2) not null default 0.00,
  balance_due numeric(12, 2) not null,
  status text not null default 'issued' check (status in ('issued', 'paid', 'partial', 'cancelled')),
  challan_number text not null,
  issued_at timestamptz not null default now()
);

-- 9. PROCUREMENT
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_person text not null,
  phone text not null,
  email text,
  address text not null,
  city text not null,
  payment_terms text not null,
  category text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  po_number text not null unique,
  supplier_id uuid not null references public.suppliers(id),
  order_date date not null default current_date,
  expected_delivery_date date not null,
  payment_terms text not null,
  subtotal numeric(12, 2) not null default 0.00,
  discount numeric(12, 2) not null default 0.00,
  tax numeric(12, 2) not null default 0.00,
  total numeric(12, 2) not null default 0.00,
  status text not null default 'draft' check (
    status in ('draft', 'submitted', 'pending_approval', 'approved', 'sent_to_supplier', 'partially_received', 'fully_received', 'closed', 'cancelled')
  ),
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ====================================================================
-- SECURITY DEFINER FUNCTIONS & TRIGGERS
-- ====================================================================

-- Function to check RBAC permissions
create or replace function public.has_permission(p_user_id uuid, p_perm_code text)
returns boolean
language plpgsql
security definer
as $$
declare
  has_perm boolean;
begin
  select exists (
    select 1
    from public.staff_role_assignments sra
    join public.role_permissions rp on rp.role_id = sra.role_id
    join public.permissions p on p.id = rp.permission_id
    where sra.profile_id = p_user_id
      and sra.is_active = true
      and p.code = p_perm_code
  ) into has_perm;
  
  return coalesce(has_perm, false);
end;
$$;

-- Trigger: auto-create profile on auth.users insert
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.phone
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.customer_accounts enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.orders enable row level security;
alter table public.invoices enable row level security;
alter table public.audit_logs enable row level security;

-- Policies for Profiles
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id or public.has_permission(auth.uid(), 'customers.view_all'));

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Policies for Customer Accounts
drop policy if exists "Customers can view their own account" on public.customer_accounts;
create policy "Customers can view their own account"
  on public.customer_accounts for select
  using (profile_id = auth.uid() or public.has_permission(auth.uid(), 'customers.view_all'));

drop policy if exists "Customers can register pending review account" on public.customer_accounts;
create policy "Customers can register pending review account"
  on public.customer_accounts for insert
  with check (profile_id = auth.uid() and status = 'pending_review');

-- Policies for Addresses
drop policy if exists "Customers manage their own addresses" on public.customer_addresses;
create policy "Customers manage their own addresses"
  on public.customer_addresses for all
  using (
    customer_account_id in (
      select id from public.customer_accounts where profile_id = auth.uid()
    ) or public.has_permission(auth.uid(), 'customers.view_all')
  );

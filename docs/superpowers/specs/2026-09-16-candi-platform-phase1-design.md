# Candi Super Store Platform — Phase 1 Specification (1A, 1B, 1C, 1D)
**Date:** 2026-09-16  
**Status:** Validated Design Spec  
**Target:** Monorepo (`apps/customer-web`, `apps/customer-mobile`, `apps/admin-web`, `packages/*`, `supabase/*`)

---

## 1. Executive Summary & Architecture Overview

The **Candi Super Store Platform** is a specialized B2B wholesale distribution platform for FMCG and confectionery products serving retailers and sub-wholesalers across Pakistan.

Phase 1 establishes the complete foundation, authentication, customer registration, admin approval governance, and customer address/profile management across four integrated milestones:
- **Phase 1A — Project Foundation**: Monorepo structure (pnpm workspaces), shared theme design tokens, shared TypeScript contracts, Supabase database schema, RLS policies, and Screen 01 (Customer Welcome).
- **Phase 1B — Authentication & Registration**: Pakistan phone OTP login (+92 normalization), multi-step registration (Retailer / Sub-wholesaler), primary address capture with coordinates, and account status lifecycle (`pending_review`, `under_review`, `approved`, `rejected`, `changes_requested`, `suspended`, `archived`).
- **Phase 1C — Admin Control Tower**: Operations dashboard in `admin-web` with Customer Applications queue, Application Review & Decision panel (Approve, Reject, Request Changes, Suspend), Delivery Zones management, Staff RBAC with permission enforcement, and immutable Audit Logging.
- **Phase 1D — Customer Account & Address Management**: Customer profile viewing and editing, profile completion percentage, multi-address management (with single active primary address enforcement via database partial unique index), address deactivation rules, and location pin selector.

---

## 2. Monorepo Directory Layout

```text
candi-super-store/
├── apps/
│   ├── customer-web/           # Vite + React 19 + React Router v7 (Customer Web Portal)
│   ├── customer-mobile/        # Expo SDK 52 + React Native (Customer Mobile App)
│   └── admin-web/              # Vite + React 19 + React Router v7 (Admin Control Tower)
│
├── packages/
│   ├── theme/                  # Design tokens, CSS variables, typography, colors, shadows
│   ├── types/                  # Database, Auth, Customer, Address, Admin, RBAC, and Audit interfaces
│   ├── validation/             # Zod schemas (Pakistan phone normalization, 6-digit OTP, registration, review)
│   ├── auth/                   # Supabase client factory, Auth provider, RBAC helper, mock/offline emulator
│   ├── ui/                     # Accessible web primitives styled with theme tokens (Button, Modal, Stepper, etc.)
│   └── config/                 # Base tsconfigs, ESLint configs, environment validator
│
├── supabase/
│   ├── migrations/             # Full PostgreSQL schema, RLS policies, RBAC functions, and triggers
│   ├── seed/                   # Seed data: default roles, permissions, delivery zones, sample admin/staff
│   └── tests/                  # SQL & integration verification scripts
│
├── docs/
│   ├── architecture/
│   ├── database/
│   ├── permissions/
│   └── superpowers/specs/
│
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

## 3. Global Theme & Design Tokens (`@candi/theme`)

### 3.1 Color Palette
* **Smoky Black (`#11120D`)**: Primary text, dominant buttons, headers, high-emphasis icons.
* **Floral White (`#FFFBF4`)**: Primary background for customer web, customer mobile, and admin content canvas.
* **Olive Drab (`#565449`)**: Secondary text, navigation links, dark sidebar background in admin dashboard.
* **Bone (`#D8CFBC`)**: Borders, soft surface cards, dividers, input borders, disabled states.
* **Semantic Feedback**:
  * Success: `#687B62` (Approved badge, verified status)
  * Warning: `#A58A54` (Changes requested, pending review)
  * Danger: `#A65D56` (Rejected badge, deactivation, destructive actions)
  * Info: `#647A86` (Under review badge, helper alerts)

### 3.2 Token Exports
* `tokens.css`: Exposes CSS Custom Properties (`--color-smoky-black`, `--color-floral-white`, `--color-olive-drab`, `--color-bone`, `--color-success`, etc.).
* `tokens.ts`: Strongly-typed TypeScript object for React Native stylesheets and JavaScript consumers.

---

## 4. Supabase Database Schema, Functions & RLS Policies

### 4.1 Tables Schema
```sql
-- 1. PROFILES (1-to-1 with auth.users)
create table public.profiles (
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
create table public.delivery_zones (
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
create table public.customer_accounts (
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. CUSTOMER ADDRESSES
create table public.customer_addresses (
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

-- Unique index: Only one active primary address per customer account
create unique index one_primary_active_address_per_customer
on public.customer_addresses (customer_account_id)
where is_primary = true and is_active = true;

-- 5. STAFF ROLES & RBAC PERMISSIONS
create table public.staff_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text not null
);

create table public.role_permissions (
  role_id uuid not null references public.staff_roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table public.staff_role_assignments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.staff_roles(id),
  is_active boolean not null default true,
  assigned_by uuid references public.profiles(id),
  assigned_at timestamptz not null default now(),
  unique (profile_id, role_id)
);

-- 6. CUSTOMER APPLICATION REVIEWS
create table public.customer_application_reviews (
  id uuid primary key default gen_random_uuid(),
  customer_account_id uuid not null references public.customer_accounts(id) on delete cascade,
  reviewer_profile_id uuid not null references public.profiles(id),
  decision text not null check (decision in ('approved', 'rejected', 'changes_requested', 'suspended', 'reactivated')),
  reason text,
  notes text,
  created_at timestamptz not null default now()
);

-- 7. AUDIT LOGS (Immutable)
create table public.audit_logs (
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
```

### 4.2 Security Functions & Triggers
* `handle_new_user()`: Trigger on `auth.users` insert $\rightarrow$ creates `profiles` record automatically.
* `has_permission(user_id uuid, required_perm text)`: `SECURITY DEFINER` function returning boolean based on active staff role assignments and permissions.
* `set_primary_customer_address(p_address_id uuid, p_account_id uuid)`: Server-side function that atomicity unsets other primary flags and marks `p_address_id` as primary.

### 4.3 Row Level Security (RLS) Summary
* `profiles`: Users can select/update their own profile (`id = auth.uid()`). Staff with `customers.view_all` can select profiles.
* `customer_accounts`: Users can select their own account (`profile_id = auth.uid()`). Users can insert only with `status = 'pending_review'`. Users cannot update `status`, `assigned_delivery_zone_id`, or `internal_notes`. Staff with `customers.approve` can update status and zones.
* `customer_addresses`: Users can select/insert/update their own active addresses. Foreign addresses are inaccessible.
* `audit_logs`: Selectable only by staff with `audit.view`. Update/Delete is forbidden for everyone.

---

## 5. Phone Normalization & Validation (`@candi/validation`)

### 5.1 Pakistan Phone Number Rules
* Format regex: `^(\+92|0)?(3[0-9]{9})$`
* Accepts: `0300 1234567`, `03001234567`, `+923001234567`, `0321-7654321`
* Normalized output: `+923001234567` (stored in database)
* Display format: `+92 300 1234567` (or masked `+92 300 ••••567`)

### 5.2 OTP Validation
* Exactly 6 numeric digits: `^\d{6}$`

### 5.3 Customer Registration & Address Validation (Zod)
* Step 1: Customer Type (`retailer` or `sub_wholesaler`).
* Step 2: Business Info (Full name required, Shop name required, WhatsApp valid phone if given, City & Area required).
* Step 3: Address Info (Label required, recipient name & phone required, address line required, city & area required).
* Step 4: Map Location (Latitude between -90 and 90, Longitude between -180 and 180; optional only if GPS unavailable).

---

## 6. Authentication Context & Dual Mode (`@candi/auth`)

* **Live Mode**: Uses `@supabase/supabase-js` with `signInWithOtp({ phone })` and `verifyOtp({ phone, token, type: 'sms' })`.
* **Mock / Offline Emulator Mode**: Active when Supabase environment keys are not configured or set to mock.
  * In-memory local storage engine.
  * Generates instant mock OTP code (`123456`).
  * Seeds demo accounts:
    1. Approved Retailer (`03001111111`)
    2. Pending Review Sub-wholesaler (`03002222222`)
    3. Changes Requested Customer (`03003333333`)
    4. Rejected Customer (`03004444444`)
    5. Suspended Customer (`03005555555`)
    6. Super Admin Staff (`03009999999`)
* **Routing Resolver**: Maps account status to route:
  * `pending_review` $\rightarrow$ `/account/pending`
  * `under_review` $\rightarrow$ `/account/pending`
  * `approved` $\rightarrow$ `/home`
  * `rejected` $\rightarrow$ `/account/rejected`
  * `changes_requested` $\rightarrow$ `/account/changes-requested`
  * `suspended` $\rightarrow$ `/account/suspended`
  * `no_profile` $\rightarrow$ `/register`

---

## 7. Customer Application Flows (Mobile & Web)

1. **Screen 01 — Customer Welcome**:
   * Brand header with Candi Super Store logo.
   * Headline: *"Wholesale Stock for Your Business"*.
   * Two primary buttons: `Create Business Account` (opens phone registration) and `Login` (opens phone login).
   * Three benefit cards: Wholesale Pricing, Business Delivery, Team Confirmation.
   * Language selector placeholder (English / اردو).
   * Session listener: auto-redirects active sessions based on account status.
2. **Screen 01B — Phone Login**:
   * Country code selector (default Pakistan `+92`).
   * Phone number input with auto-formatting.
   * Actions: `Send OTP` (with 60s cooldown) and `Back`.
3. **Screen 01C — OTP Verification**:
   * Six individual numeric inputs with auto-focus forward/backward and paste handling.
   * Countdown timer, `Resend OTP`, `Change phone number`.
4. **Screen 01D — Customer Registration (5 Steps)**:
   * Step 1: Customer Type selection (`Retailer` vs `Sub-wholesaler`).
   * Step 2: Business information.
   * Step 3: Primary delivery address.
   * Step 4: Map location selector with pin placement / GPS detect / manual fallback.
   * Step 5: Review & Submit $\rightarrow$ sets status to `pending_review`.
5. **Account Status Screens**:
   * `Pending Review`, `Changes Requested` (with update form), `Rejected`, `Suspended`, `Customer Home Placeholder`.
6. **Screen 1D — Customer Profile & Saved Addresses**:
   * Profile card with completion score (0-100%).
   * Edit profile (name, WhatsApp, language). Read-only for status & customer type.
   * Saved Addresses list with primary badge, edit action, set as primary action, deactivate action (last active address cannot be deactivated).
   * Add/Edit Address with map pin picker.

---

## 8. Admin Control Tower (`apps/admin-web`)

1. **Dashboard Shell**:
   * Olive Drab sidebar, Floral White canvas, Smoky Black text, Bone borders.
   * Active routes: Dashboard, Customer Applications, Customers, Delivery Zones, Staff and Roles, Audit Logs, Settings.
   * Future routes disabled / marked "Phase 2+".
2. **Customer Applications Queue**:
   * Real-time count metrics: Pending Review, Under Review, Approved, Changes Requested, Rejected, Suspended.
   * Search by business name, customer name, phone, application number.
   * Multi-filter: Status, Customer Type, City, Delivery Zone.
   * Data table with actions: View Detail, Quick Assign, Mark Under Review.
3. **Application Detail & Decision Panel**:
   * Customer Identity & Business Information card.
   * Delivery Address & Location card (renders address line, area, city, and visual map pin coordinates).
   * Review History & Staff internal notes.
   * Duplicate detection indicator (flags matching phone, WhatsApp, or shop name).
   * **Decision Action Panel**:
     * `Approve Account`: requires delivery zone assignment, sets status to `approved`, creates audit log.
     * `Reject Account`: requires rejection reason, sets status to `rejected`, creates audit log.
     * `Request Changes`: requires explanation note, sets status to `changes_requested`, creates audit log.
     * `Suspend / Reactivate`: requires reason, toggles status, creates audit log.
4. **Delivery Zones Management**:
   * Interactive list of delivery zones grouped by city.
   * Add new delivery zone, edit zone name/description, toggle active & serviceable flags.
5. **Staff and Roles (RBAC)**:
   * Staff list with assigned roles and activation status.
   * Role assignment modal with permission overview.
6. **Audit Logs View**:
   * Searchable, filterable chronological audit feed.

---

## 9. Verification & Acceptance Criteria

* **Architecture**: Monorepo builds with `pnpm build`, TypeScript check passes with zero errors.
* **Palette & Design**: Global palette (`#11120D`, `#565449`, `#D8CFBC`, `#FFFBF4`) is consistently applied via shared tokens.
* **Phone & Validation**: Phone normalizer correctly transforms `0300 1234567` to `+923001234567`. Zod schemas validate registration and addresses.
* **Database & RLS**: SQL migration scripts create all 7 core tables, partial unique index for primary address, security functions, triggers, and comprehensive RLS policies.
* **Screen 01 & Auth Flow**: Customer Welcome renders on both web and mobile; OTP flow works seamlessly in both live Supabase mode and mock fallback mode.
* **Customer Registration & Profile**: Multi-step registration successfully submits pending review accounts; saved addresses support add, edit, set primary, and deactivate.
* **Admin Dashboard**: Applications queue filters and sorts; Application detail allows reviewing customer info, map coordinates, and executing Approve / Reject / Changes Requested / Suspend decisions with audit logging.

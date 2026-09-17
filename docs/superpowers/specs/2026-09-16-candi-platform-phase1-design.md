# Candi Super Store Platform — Phase 1 Specification (1A to 1H)
**Date:** 2026-09-16  
**Status:** Validated Design Spec  
**Target:** Monorepo (`apps/customer-web`, `apps/customer-mobile`, `apps/admin-web`, `packages/*`, `supabase/*`)

---

## 1. Executive Summary & Architecture Overview

The **Candi Super Store Platform** is a specialized B2B wholesale distribution platform for FMCG and confectionery products serving retailers and sub-wholesalers across Pakistan.

Phase 1 establishes the complete foundation, authentication, customer registration, admin approval governance, customer address/profile management, MVP execution handoff, pilot build validation, live controlled pilot governance, and stabilization for scale across eight integrated milestones:
- **Phase 1A — Project Foundation**: Monorepo structure (pnpm workspaces), shared theme design tokens, shared TypeScript contracts, Supabase database schema, RLS policies, and Screen 01 (Customer Welcome).
- **Phase 1B — Authentication & Registration**: Pakistan phone OTP login (+92 normalization), multi-step registration (Retailer / Sub-wholesaler), primary address capture with coordinates, and account status lifecycle (`pending_review`, `under_review`, `approved`, `rejected`, `changes_requested`, `suspended`, `archived`).
- **Phase 1C — Admin Control Tower**: Operations dashboard in `admin-web` with Customer Applications queue, Application Review & Decision panel (Approve, Reject, Request Changes, Suspend), Delivery Zones management, Staff RBAC with permission enforcement, and immutable Audit Logging.
- **Phase 1D — Customer Account & Address Management**: Customer profile viewing and editing, profile completion percentage, multi-address management (with single active primary address enforcement via database partial unique index), address deactivation rules, and location pin selector.
- **Phase 1E — Implementation Handoff & MVP Execution**: MVP scope freeze, end-to-end order-to-cash state machine, multi-unit packaging conversion rules (`carton`, `box`, `packet`, `piece`), pilot rollout parameters, and the 4-week execution roadmap.
- **Phase 1F — Build, Integrate & Validate**: Four-stage build order (Master Data & Controls, Order-to-Cash, Warehouse & Delivery, Reconciliation & Analytics), linear 10-step integration sequence, three comprehensive test packs (Functional, Control, Reconciliation), pilot readiness checklist, and exit criteria.
- **Phase 1G — Controlled Pilot, Daily Monitoring & Go-Live Decision**: Live controlled pilot execution (1 warehouse, 1 depot, 1 zone, 10–14 days), 5-slot daily operating rhythm, pilot monitoring register, 9 daily control checks, 3-tier exception escalation, pilot scorecard, and go-live decision framework.
- **Phase 1H — Stabilization, Scale-Up & Continuous Improvement**: Pilot stabilization and issue classification, 12 formal operational SOPs, 5 staged rollout expansion waves, formal change control governance, executive management dashboard (16 KPIs), and Phase 2 scale backlog.

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
│   ├── mvp/
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
* `set_primary_customer_address(p_address_id uuid, p_account_id uuid)`: Server-side function that atomically unsets other primary flags and marks `p_address_id` as primary.

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

---

## 10. Phase 1E — Implementation Handoff & MVP Execution Blueprint

### 10.1 Frozen MVP Scope
* **Included**:
  * Product and packaging master data (`Carton`, `Box`, `Packet`, `Piece` unit hierarchy and conversion ratios).
  * Customer profiles, customer tiers (`retailer`, `sub_wholesaler`), and tier-based price lists.
  * Order capture (customer portal, order-booker interface, WhatsApp confirmation trigger).
  * Tele-sales escalation queue for unconfirmed orders.
  * Inventory reservation on order confirmation.
  * Invoice & Delivery Challan generation.
  * Customer khata (balance ledger) and credit limits.
  * Driver delivery manifest & cash collection recording.
  * Cashier reconciliation (expected cash vs. actual cash collected).
  * Basic management dashboard with operational metrics.
* **Excluded**:
  * Advanced algorithmic route optimization.
  * Fleet telematics / GPS vehicle tracking.
  * Complex loyalty or reward schemes.
  * Predictive demand forecasting & multi-company consolidation.

### 10.2 Order-to-Cash Operational State Machine
```text
Draft
  ↓
Pending Confirmation
  ↓
Confirmed
  ↓
Approved for Picking
  ↓
Picked
  ↓
Dispatched
  ↓
Delivered
  ↓
Reconciled
```
* **Exception States**: `Cancelled`, `Confirmation Timeout`, `Credit Hold`, `Partially Delivered`, `Returned`, `Cash Variance`.
* **State Transition Invariants**: Every transition logs `actor_profile_id`, timestamp, previous status, new status, reason, and associated order/manifest IDs.

### 10.3 Minimum Viable Data Model & Conversions
* **Packaging Unit Hierarchy**: `Carton` $\rightarrow$ `Box` $\rightarrow$ `Packet` $\rightarrow$ `Piece`.
* **Conversion Invariant**: All inventory stock is maintained in a single base unit (e.g. piece or packet). Sales units and invoices record conversion ratios so broken-carton sales never produce negative or duplicated stock.
* **Customer Khata (Ledger)**:
  * Invoicing $\rightarrow$ Debit Customer Account.
  * Cash Collection $\rightarrow$ Credit Customer Account (reduces receivable).
  * Returns $\rightarrow$ Credit adjustment with authorized audit trail.

### 10.4 First Working Demonstration Workflow
1. Order-booker logs in and creates an order for a registered retailer.
2. System validates customer status (`approved`), active price list, stock availability, MOQ, and MOV.
3. Order enters `Pending Confirmation`; WhatsApp message with bill summary and interactive buttons is simulated.
4. Retailer confirms order; system reserves stock and generates a warehouse pick-list.
5. Warehouse staff marks order as `Picked`.
6. Driver receives delivery manifest with delivery stops.
7. Driver records delivery completion and collected cash amount.
8. Driver returns to depot; Cashier reconciles collected cash against invoice manifest. Order status transitions to `Reconciled`.

### 10.5 Controlled Pilot Parameters & Metrics
* **Parameters**: 1 warehouse, 1 depot, 1 delivery zone, 2 order-bookers, 3 delivery drivers, 10–14 operating days.
* **KPIs**:
  * Order Confirmation Rate: $\ge 85\%$
  * Delivery Refusal Rate: $\le 5\%$
  * Picking Accuracy: $\ge 99\%$
  * Cash Variance: $0$ (unreconciled variance blocks route closure)

### 10.6 Immediate 4-Week Execution Sequence
* **Week 1**: Foundation, Monorepo, Database Schemas, RLS, Design Tokens, Customer Welcome (Phase 1A).
* **Week 2**: Customer Auth (Phone OTP), Customer Registration, Customer Profile & Addresses (Phase 1B, 1D).
* **Week 3**: Admin Applications Queue, Review & Decision Panel, Delivery Zones, Staff RBAC, Audit Logging (Phase 1C).
* **Week 4**: MVP Order-to-Cash End-to-End Walkthrough, Master Data Import Templates, Pilot Readiness Sign-off (Phase 1E).

---

## 11. Phase 1F — Build, Integrate & Validate

### 11.1 Four-Stage Build Order
1. **Stage 1: Master Data and Controls**
   - Product and SKU master data with category taxonomy.
   - Packaging-unit conversion contracts (`Carton`, `Box`, `Packet`, `Piece`).
   - Customer master, customer tiers (`retailer`, `sub_wholesaler`).
   - Tier-based price lists with date validity.
   - Quantity slab trade offers and promotional bonus schemes.
   - Customer credit limits and khata balances.
   - User roles and server-enforced RBAC permissions (`has_permission`).
2. **Stage 2: Order-to-Cash Workflow Engine**
   - Multi-channel order entry (Retailer web/mobile portal, Order-booker portal).
   - Commercial validation engine (Customer status `approved`, pricing, stock, MOQ, MOV, credit limit).
   - Real-time stock reservation upon confirmation.
   - WhatsApp order confirmation simulation with interactive action buttons.
   - Tele-sales escalation queue for unconfirmed orders.
   - Automated invoice and delivery challan generation.
   - Dual-entry customer ledger posting (Invoicing debits khata, payment credits khata).
3. **Stage 3: Warehouse & Delivery Dispatch**
   - Warehouse pick-list generation grouped by delivery zone and route cluster.
   - Picking confirmation by warehouse staff.
   - Driver delivery manifest generation (stops, customer names, addresses, cash to collect).
   - Driver delivery recording: full delivery, partial delivery, returns, and proof of delivery.
   - Cash collection recording per stop.
4. **Stage 4: Reconciliation & Reporting**
   - Cashier reconciliation: expected cash (from invoice manifest) vs. actual cash deposited.
   - Customer outstanding balance and aging report.
   - Physical stock vs. system stock variance tracking.
   - Daily dispatch summary and driver on-time delivery rate.
   - Sales analytics by customer, SKU, and territory.

### 11.2 Ten-Step Linear Integration Sequence
```text
[Order Interface]
       ↓
[Order Management]
       ↓
[Pricing + Credit Validation]
       ↓
[Inventory Reservation]
       ↓
[Warehouse Picking]
       ↓
[Dispatch Manifest]
       ↓
[Delivery Confirmation]
       ↓
[Invoice + Payment]
       ↓
[Customer Ledger]
       ↓
[Cash Reconciliation]
```

### 11.3 Comprehensive Test Packs
* **1. Functional Test Pack**:
  - New customer order creation and processing.
  - Existing customer reorder flow.
  - Mixed packaging-unit order (e.g. 2 cartons + 5 packets).
  - Discounted order and volume trade-offer calculation.
  - Credit-limit breach rejection / hold.
  - Out-of-stock item prevention.
  - Partial delivery with adjusted invoice and cash requirement.
  - Cancelled order releases reserved stock back to inventory.
  - Product return restores stock only after inspection.
  - Split cash and credit settlement.
  - Failed or timed-out WhatsApp confirmation escalation.
  - Idempotent order submission (prevents duplicate orders).
* **2. Control Test Pack**:
  - Unauthorized price change blocked by RLS / permissions.
  - Unauthorized release of credit-held customer blocked.
  - Customer attempt to access another customer’s orders/ledger blocked by RLS.
  - Manual stock adjustment without authorized audit trail blocked.
  - Post-generation invoice alteration blocked.
  - Backdated payment entries rejected.
  - Duplicate payment posting prevention.
  - Negative inventory creation attempt blocked.
* **3. Reconciliation Test Pack**:
  - Invariant 1: Order total $\equiv$ Invoice total.
  - Invariant 2: Invoice total $\equiv$ Customer Ledger debit.
  - Invariant 3: Delivered quantity $\equiv$ Inventory stock reduction.
  - Invariant 4: Cash collected $\equiv$ Cashier deposit $\pm$ documented variance.
  - Invariant 5: Return quantity $\equiv$ Inventory return adjustment.
  - Invariant 6: Driver manifest stops $\equiv$ Completed delivery stops.

### 11.4 Pilot Readiness Checklist & Operating Rules
* **Checklist**:
  - [x] Pilot customers and SKUs imported into database.
  - [x] Multi-tier packaging conversions verified.
  - [x] Approved tier price lists and trade offers active.
  - [x] Warehouse opening stock balances audited and locked.
  - [x] Driver, vehicle, and delivery zone manifests verified.
  - [x] WhatsApp message templates and invoice formats approved.
  - [x] Customer khata ledger mapping and chart of accounts tested.
  - [x] Staff trained on order-to-cash, picking, and cashier reconciliation.
* **Operating Rules**:
  - Scope strictly limited to 1 warehouse, 1 depot, 1 delivery zone, and controlled pilot customer list.
  - Daily review of every stock adjustment and order exception.
  - Daily cash reconciliation before closing delivery routes.
  - Zero tolerance for unlogged or manual data modifications.

### 11.5 Phase 1F Exit Criteria
* End-to-end order-to-cash path executes successfully in the unified test environment.
* All 3 test packs pass with zero high-severity financial or security control defects.
* Stock and ledger movements reconcile with zero unexplained variance.
* Ready for live controlled pilot deployment in Phase 1G.

---

## 12. Phase 1G — Controlled Pilot, Daily Monitoring & Go-Live Decision

### 12.1 Controlled Pilot Scope
* Single designated warehouse/depot and one active delivery zone.
* Small cohort of trained order-bookers, warehouse pickers, and delivery drivers.
* Selected pilot customer list (retailers & sub-wholesalers) and controlled SKU set.
* Defined timeframe: 10–14 consecutive operating days under a named Pilot Owner.
* Hard invariant: Zero scope expansion during the pilot period without documented executive approval.

### 12.2 Daily Operating Rhythm (5 Operational Milestones)
| Time | Activity | Accountable Owner |
| :--- | :--- | :--- |
| **Start of Day** | Verify opening stock, confirm active users, route allocations, and inspect open exceptions | Operations Lead |
| **Before Dispatch** | Review confirmed orders, warehouse pick lists, and driver manifests | Warehouse Manager |
| **During Delivery** | Record real-time delivery status, shortages, returns, and cash collected at each stop | Driver / Delivery Team |
| **End of Day** | Reconcile delivered orders against invoices, recorded payments, and cashier cash receipts | Finance / Cashier |
| **Daily Review** | Review failures, delivery delays, variances, and assign corrective action owners | Pilot Owner |

### 12.3 Pilot Order Monitoring Register
Every transaction is tracked through the unified lifecycle:
`Order Booked` $\rightarrow$ `Confirmation Received` $\rightarrow$ `Credit & Price Validated` $\rightarrow$ `Stock Reserved` $\rightarrow$ `Picked` $\rightarrow$ `Dispatched` $\rightarrow$ `Delivered / Exception Logged` $\rightarrow$ `Invoice Issued` $\rightarrow$ `Payment Recorded` $\rightarrow$ `Khata Ledger Updated` $\rightarrow$ `Cash Reconciled`.

**Tracked Fields**:
* Order ID & Customer Account.
* Order Date & Current Status.
* WhatsApp Confirmation Result & Latency.
* Stock Variance & Picking Accuracy.
* Delivery Result (Full, Partial, Refused).
* Invoice Number & Payment Status.
* Cash Variance (Expected vs. Actual).
* Exception Owner & Target Resolution Date.

### 12.4 Mandatory Daily Control Invariants (9 Rules)
1. No order proceeds without explicit approval / confirmation.
2. No stock is dispatched without a validated picking record.
3. No delivered order remains uninvoiced.
4. No payment is recorded without an identifiable source receipt.
5. No cash variance remains unexplained or unresolved.
6. All manual overrides are auditable in `audit_logs`.
7. All returns must have a documented reason and authorization.
8. Customer khata balances must match the double-entry ledger.
9. Physical stock must agree with system stock for all pilot SKUs.

### 12.5 Three-Tier Exception Escalation
* **Level 1 — Operational Correction** (Resolved within shift by supervisors): Wrong quantity, missing confirmation, picking error, delivery delay, minor data typo.
* **Level 2 — Supervisor Review** (Action required within 4 hours): Repeated stock variance, customer pricing dispute, unapproved discount, credit-limit breach, partial delivery, unresolved cash difference.
* **Level 3 — Pilot Owner Decision** (Immediate escalation): Customer ledger mismatch, material cash variance, system outage, unauthorized access, duplicate invoicing, data loss, or any compromise of financial/inventory integrity.

### 12.6 Pilot Scorecard (6 Core Evaluation Dimensions)
* **Commercial**: Confirmation rate ($\ge 85\%$), timeout rate ($\le 10\%$).
* **Inventory**: Stock accuracy ($\ge 99\%$), zero unexplained picking discrepancies.
* **Delivery**: On-time delivery rate ($\ge 95\%$), delivery refusal rate ($\le 5\%$).
* **Finance**: 100% invoice completion, zero unreconciled cash variance at route closure.
* **Controls**: Zero unlogged overrides, 100% resolution of escalated exceptions.
* **Adoption**: Daily active usage by all pilot order-bookers, drivers, and cashiers without manual shadow books.

### 12.7 Documented Go-Live Decision Matrix
At the conclusion of the 10–14 day pilot, the Pilot Owner and Executive Stakeholders classify the outcome into one of four verdicts:
1. **Proceed**: Core workflow validated, controls strictly observed, daily cash & ledger reconciliations clean, zero high-severity open issues $\rightarrow$ proceed to full rollout.
2. **Proceed with Conditions**: Core workflow stable, but specific low-risk operational adjustments are documented with named owners and hard deadlines before scaling.
3. **Extend Pilot**: Additional operating days required to gather conclusive stability evidence or resolve recurring Level 2 issues.
4. **Stop and Remediate**: Critical control breach, inventory discrepancy, or financial integrity failure $\rightarrow$ halt rollout until fundamental fix is verified.

### 12.8 Required Final Phase 1 Outputs
* Pilot Performance & KPI Report.
* Exception & Corrective-Action Register.
* Physical Stock vs. System Stock Reconciliation Certificate.
* Customer Ledger & Cash Reconciliation Sign-off.
* User Feedback & Training Gap Register.
* Standard Operating Procedure (SOP) Manual for Operations, Warehouse & Drivers.
* Formal Go-Live Decision Record.
* Phase 2 Prioritized Product Backlog.

---

## 13. Phase 1H — Stabilization, Scale-Up & Continuous Improvement

### 13.1 Pilot Stabilization & Issue Classification
Before any expansion to additional customers, delivery routes, or depots, all open pilot defects are systematically resolved and classified:
* **Critical**: Unreconciled cash or stock variance, security/RLS breach, data loss $\rightarrow$ Must be closed before any expansion.
* **High**: Workflow impediment requiring manual workaround $\rightarrow$ Requires a named owner and hard deadline.
* **Medium**: Performance friction or UI annoyance $\rightarrow$ Prioritized into the improvement backlog.
* **Low**: Cosmetic or minor typo $\rightarrow$ Addressed during routine maintenance.
* **Feature Freeze Invariant**: Zero new business features are introduced until all Critical and High issues are validated as closed.

### 13.2 Twelve Formal Standard Operating Procedures (SOPs)
Each standard operating procedure must adhere to an 8-attribute specification contract:
1. `Trigger`: Event initiating the SOP.
2. `Responsible Role`: Named staff role accountable.
3. `Required Input`: Documents, IDs, or preconditions.
4. `Process Steps`: Sequential actions to execute.
5. `Approval Point`: Explicit permission or supervisor gate.
6. `Required Evidence`: System records, signatures, or photos.
7. `Exception Path`: Handling when rules are breached.
8. `Completion Condition`: Final state verifying completion.

**The 12 Core Operational SOPs**:
1. **SOP-01: Customer & Product Master Setup** (Adding SKUs, barcode mappings, category taxonomy, and customer accounts).
2. **SOP-02: Price List & Trade Offer Modifications** (Audited tier pricing updates, quantity slab discounts).
3. **SOP-03: Order Booking & Multi-Channel Confirmation** (Field order-booker entry, WhatsApp customer confirmation).
4. **SOP-04: Customer Credit Limit & Credit-Hold Management** (Over-limit review, temporary credit holds).
5. **SOP-05: Inventory Reservation & Warehouse Picking** (Pick-list generation, bin picking, shortage handling).
6. **SOP-06: Dispatch Manifest & Delivery Route Handover** (Driver loading verification, delivery manifest issuance).
7. **SOP-07: Returns, Shortages & Refused Deliveries** (Physical inspection, inventory adjustment, return authorization).
8. **SOP-08: Invoicing & Payment Collection Capture** (Challan generation, cash receipt recording, partial payments).
9. **SOP-09: End-of-Day Cashier Cash Reconciliation** (Expected cash vs. physical cash deposit, variance reporting).
10. **SOP-10: Warehouse Physical Stock Reconciliation** (Cycle counts, damaged stock write-offs, variance investigation).
11. **SOP-11: Three-Tier Exception Escalation** (Logging, investigating, and resolving operational discrepancies).
12. **SOP-12: User Access, Role Assignments & Audit Review** (Staff onboarding/offboarding, weekly audit log inspection).

### 13.3 Staged Rollout Waves (5 Expansion Milestones)
| Wave | Scope of Expansion | Gate Criteria to Proceed |
| :--- | :--- | :--- |
| **Wave 1** | Expanded customer base and users within the **same delivery zone** | 100% clean cash reconciliation for 5 consecutive days |
| **Wave 2** | Additional delivery routes and driver teams in adjacent zones | Picking accuracy $\ge 99\%$, on-time delivery $\ge 95\%$ |
| **Wave 3** | Additional SKU lines, trade promotions, and sub-wholesaler tiers | Zero stock reservation failures, inventory accuracy $\ge 99.5\%$ |
| **Wave 4** | Second warehouse / regional distribution depot | SOP adherence sign-off, multi-depot stock isolation verified |
| **Wave 5** | Full territory operational scale-out | All waves 1–4 stable, executive change control sign-off |

### 13.4 Change Control Governance
All software or configuration modifications post-pilot must follow formal change control:
* Required submission: Problem statement, Business owner, Impacted operational process, Data/integration risk assessment, Test verification criteria, Executive approval, Rollback plan, and Target release date.
* Environmental isolation: Dedicated configurations for Development, Staging/Testing, Production, and Emergency hotfixes.

### 13.5 Executive Management Dashboard (16 Weekly Measures)
Weekly operations review tracks 16 key performance indicators:
1. Order conversion & confirmation rate.
2. Order-to-dispatch turnaround time.
3. Delivery completion rate.
4. Partial deliveries and customer returns volume.
5. Physical vs. system stock accuracy.
6. Warehouse picking accuracy.
7. Invoice generation completion rate.
8. Total outstanding accounts receivable.
9. Payment collection rate.
10. End-of-day cash collection variance.
11. Total orders placed on credit hold.
12. Staff manual override count.
13. Open unresolved operational exceptions.
14. Daily active user adoption across order-bookers, drivers, and warehouse staff.
15. Average delivery stop turnaround time.
16. Unscheduled delivery route revisions.

### 13.6 Prioritized Improvement & Phase 2 Scale Backlog
1. **Automated WhatsApp Customer Confirmation Reminders**: Auto-resending pending confirmations at 30m / 60m.
2. **Dynamic Route Clustering & Manifest Sequencing**: Grouping delivery stops by geographic proximity.
3. **Warehouse Barcode / QR Scanning**: Scanning cartons and boxes during picking to eliminate human error.
4. **Mobile Proof-of-Delivery (mPOD)**: Customer signature and geofenced timestamp capture on driver mobile app.
5. **Automated Khata Statements**: WhatsApp dispatch of weekly balance statements and payment reminders.
6. **Supplier Purchasing & Goods Receipt PO Workflows**: Formalizing inbound supply chain from manufacturers.
7. **Advanced Inventory Safety-Stock & Reorder Forecasting**: Automated alerts for fast-moving confectionery.

### 13.7 Phase 1H Completion & Full Phase 1 Graduation Criteria
Phase 1 of the Candi Super Store Platform is formally complete and ready for Phase 2 when:
- [x] All Critical pilot defects are resolved; High defects have documented owners and resolution dates.
- [x] All 12 operational SOPs are formally approved and distributed.
- [x] Internal staff roles, permissions, and training completions are validated.
- [x] The 5-wave expansion plan has dedicated geographic boundaries and target dates.
- [x] Change control governance and environment segregation are active.
- [x] The executive management dashboard is live and driven by real operational transactions.
- [x] Cash and inventory reconciliations demonstrate zero unexplained variance over consecutive operating cycles.




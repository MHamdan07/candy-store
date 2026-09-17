# Implementation Plan: Part 1 — Design & Theme Setup with Working Screen Previews

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the Candi Super Store monorepo foundation, global theme system using `"SUSE Mono", sans-serif` and the official 4-color palette (`#11120D`, `#565449`, `#D8CFBC`, `#FFFBF4`), and build high-fidelity, interactive, responsive previews for all required Part 1 screens (Login, Main Dashboard, Sidebar & Nav, Customer List, Product List, Order Screen, Invoice Screen, and Mobile Layout) plus shared packages and Supabase schemas.

**Architecture:** Monorepo with `pnpm` workspaces: `@candi/theme` (CSS vars and TS tokens with "SUSE Mono"), `@candi/types` (data models), `@candi/validation` (phone + order validation), `@candi/auth` (Supabase + offline/mock engine), and `@candi/ui` (accessible design system primitives). Applications in `apps/customer-web`, `apps/admin-web`, and `apps/customer-mobile`.

**Tech Stack:** React 19, Vite, React Router v7, Vanilla CSS design tokens with `"SUSE Mono"` typography, Supabase JS client, Expo SDK 52 / React Native, Zod.

**Spec:** [`docs/superpowers/specs/2026-09-16-candi-platform-phase1-design.md`](file:///d:/Candi%20Super%20Store%20Platform/docs/superpowers/specs/2026-09-16-candi-platform-phase1-design.md)

## Global Constraints
- Typography: Primary font MUST be `"SUSE Mono", sans-serif`.
- Color Palette:
  - Smoky Black: `#11120D`
  - Olive Drab: `#565449`
  - Bone: `#D8CFBC`
  - Floral White: `#FFFBF4`
- Semantic Status Colors: Success `#687B62`, Warning `#A58A54`, Danger `#A65D56`, Info `#647A86`.
- Confectionery Accents: Warm confectionery cards, chocolate/FMCG imagery, and promotional accents (inspired by Dakingo reference) for the customer store. Admin dashboard uses clean Olive Drab sidebar, Floral White canvas, and Bone borders (never bright pink/red admin theme).
- Required Screen Previews to show:
  1. Login Screen
  2. Main Dashboard
  3. Sidebar & Top Navigation
  4. Customer List
  5. Product List
  6. Order Screen
  7. Invoice Screen
  8. Mobile Layout

---

### Task 1: Workspace & Monorepo Initialization (`pnpm-workspace.yaml`, `package.json`, TSConfig)

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `package.json`
- Create: `packages/config/tsconfig.base.json`
- Create: `packages/config/package.json`

**Interfaces:**
- Produces: Root monorepo orchestration with workspace linking for `@candi/*` packages.

- [ ] **Step 1: Create `pnpm-workspace.yaml` and root `package.json`**
- [ ] **Step 2: Create `packages/config/tsconfig.base.json`**
- [ ] **Step 3: Run `pnpm install` and verify workspaces resolution**
- [ ] **Step 4: Commit**

---

### Task 2: Design Token & Typography System (`packages/theme`) with "SUSE Mono"

**Files:**
- Create: `packages/theme/package.json`
- Create: `packages/theme/src/tokens.css` (CSS variables, Google Fonts `@import url('https://fonts.googleapis.com/css2?family=SUSE:wght@100..800&family=JetBrains+Mono:wght@400;500;700&display=swap')` or local fallback, `--font-primary: 'SUSE Mono', 'SUSE', monospace, sans-serif;`, palette values, radii, elevation, spacing tokens)
- Create: `packages/theme/src/tokens.ts` (Typed JS token exports for React Native and component consumers)
- Create: `packages/theme/src/index.ts`
- Create: `packages/theme/tests/tokens.test.ts`

**Interfaces:**
- Produces:
  - `import '@candi/theme/tokens.css'`
  - `export { colors, typography, spacing, radii, shadows } from '@candi/theme'`

- [ ] **Step 1: Write token test verifying color hex codes and font definitions**
- [ ] **Step 2: Implement `tokens.css` and `tokens.ts`**
- [ ] **Step 3: Build/test `@candi/theme`**
- [ ] **Step 4: Commit**

---

### Task 3: Shared Contracts & Validation (`packages/types`, `packages/validation`)

**Files:**
- Create: `packages/types/package.json`
- Create: `packages/types/src/index.ts` (CustomerAccount, Profile, CustomerAddress, Product, PackagingUnit, Order, Invoice, StaffRole, DeliveryZone, AuditLog)
- Create: `packages/validation/package.json`
- Create: `packages/validation/src/phone.ts` (Pakistan phone normalizer `^(\+92|0)?(3[0-9]{9})$` -> `+923001234567`)
- Create: `packages/validation/src/registration.ts` (Zod schemas for registration steps)
- Create: `packages/validation/src/order.ts` (Zod schemas for order creation)
- Create: `packages/validation/src/index.ts`
- Create: `packages/validation/tests/phone.test.ts`

**Interfaces:**
- Produces:
  - `normalizePakistanPhone(raw: string): { valid: boolean; normalized: string; display: string }`
  - `customerRegistrationSchema`, `createOrderSchema`

- [ ] **Step 1: Write phone normalization unit test**
- [ ] **Step 2: Implement types and validation functions**
- [ ] **Step 3: Run tests and verify 100% pass**
- [ ] **Step 4: Commit**

---

### Task 4: Supabase Client, Auth Context & Offline Simulator (`packages/auth`)

**Files:**
- Create: `packages/auth/package.json`
- Create: `packages/auth/src/client.ts` (dual-mode Supabase client with in-memory offline fallback)
- Create: `packages/auth/src/context.tsx` (React Auth Context, useAuth hook, signInWithOtp, verifyOtp, mock OTP `123456`)
- Create: `packages/auth/src/statusRouter.ts` (account status routing resolver)
- Create: `packages/auth/src/index.ts`

**Interfaces:**
- Produces:
  - `<AuthProvider>`, `useAuth()`
  - `resolveCustomerRoute(status: AccountStatus): string`

- [ ] **Step 1: Implement dual-mode Supabase client and AuthContext**
- [ ] **Step 2: Verify offline mock authentication flow**
- [ ] **Step 3: Commit**

---

### Task 5: Design System UI Primitives (`packages/ui`)

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/src/Button.tsx` (Primary Smoky Black, Secondary Olive, Bone Outline, Accent promotional)
- Create: `packages/ui/src/Input.tsx` (Text, Phone, Search with Bone border and Olive Drab focus)
- Create: `packages/ui/src/Card.tsx` (Rounded wholesale card, Dakingo-inspired confectionery card)
- Create: `packages/ui/src/Badge.tsx` (Status badges: Approved, Pending, Under Review, Changes Requested, Suspended)
- Create: `packages/ui/src/Table.tsx` (Responsive clean wholesale table with Bone borders)
- Create: `packages/ui/src/Modal.tsx`
- Create: `packages/ui/src/Alert.tsx`
- Create: `packages/ui/src/Dropdown.tsx`
- Create: `packages/ui/src/index.ts`

**Interfaces:**
- Produces: Complete library of theme-compliant, accessible UI primitives for Web and Mobile-web.

- [ ] **Step 1: Build UI primitives with `"SUSE Mono", sans-serif` and Candi theme classes**
- [ ] **Step 2: Verify exports and styles**
- [ ] **Step 3: Commit**

---

### Task 6: Supabase Migrations, RLS Policies & Initial Seeds (`supabase/*`)

**Files:**
- Create: `supabase/migrations/20260917000001_initial_schema.sql` (profiles, customer_accounts, customer_addresses, delivery_zones, staff_roles, permissions, audit_logs, products, packaging_units, conversions, orders, invoices, ledger_entries, partial unique index for primary address, RLS policies, `has_permission` function, `handle_new_user` trigger)
- Create: `supabase/seed/seed.sql` (seed roles, permissions, delivery zones, confectionery products, sample customers)
- Create: `supabase/config.toml`

- [ ] **Step 1: Write SQL migration with all required tables, triggers, and RLS policies**
- [ ] **Step 2: Write seed script with demo confectionery & FMCG wholesale catalog**
- [ ] **Step 3: Commit**

---

### Task 7: Admin Control Tower (`apps/admin-web`) with All Required Part 1 Screens

**Files:**
- Create: `apps/admin-web/package.json`
- Create: `apps/admin-web/vite.config.ts`
- Create: `apps/admin-web/index.html`
- Create: `apps/admin-web/src/main.tsx`
- Create: `apps/admin-web/src/App.tsx`
- Create: `apps/admin-web/src/components/Sidebar.tsx` (Olive Drab dark sidebar with Candi logo, navigation, active indicators)
- Create: `apps/admin-web/src/components/TopNav.tsx` (Search bar, quick actions, role badge, user profile)
- Create: `apps/admin-web/src/pages/DashboardPage.tsx` (Main Dashboard with operational metrics, pending review queue, quick actions)
- Create: `apps/admin-web/src/pages/CustomerListPage.tsx` (Searchable customer queue, status badges, filters, zone mapping)
- Create: `apps/admin-web/src/pages/ProductListPage.tsx` (Wholesale confectionery SKUs, packaging units Carton/Box/Packet/Piece, conversions)
- Create: `apps/admin-web/src/pages/OrderScreenPage.tsx` (Order capture, validation states, pick-list status, credit check)
- Create: `apps/admin-web/src/pages/InvoiceScreenPage.tsx` (Wholesale invoice generation, delivery challan, ledger posting, cash collection)
- Create: `apps/admin-web/src/pages/LoginPage.tsx` (Admin login with phone/credentials)

- [ ] **Step 1: Set up Vite React application with `@candi/*` dependencies**
- [ ] **Step 2: Implement Sidebar, TopNav, and responsive Shell**
- [ ] **Step 3: Implement Main Dashboard, Customer List, Product List, Order Screen, and Invoice Screen**
- [ ] **Step 4: Implement Login screen**
- [ ] **Step 5: Verify build with `pnpm build` in `apps/admin-web`**
- [ ] **Step 6: Commit**

---

### Task 8: Customer Website (`apps/customer-web`) & Mobile Responsive Layout

**Files:**
- Create: `apps/customer-web/package.json`
- Create: `apps/customer-web/vite.config.ts`
- Create: `apps/customer-web/index.html`
- Create: `apps/customer-web/src/main.tsx`
- Create: `apps/customer-web/src/App.tsx`
- Create: `apps/customer-web/src/pages/WelcomePage.tsx` (Screen 01 Customer Welcome, 2-column hero with wholesale confectionery visual, benefit cards)
- Create: `apps/customer-web/src/pages/PhoneLoginPage.tsx` (Screen 01B Phone Login with +92 formatting)
- Create: `apps/customer-web/src/pages/OtpVerifyPage.tsx` (Screen 01C 6-digit OTP verification)
- Create: `apps/customer-web/src/pages/RegistrationPage.tsx` (Screen 01D 5-step registration)
- Create: `apps/customer-web/src/pages/CustomerPortalPage.tsx` (Customer dashboard, order status, saved addresses, profile completion)
- Create: `apps/customer-web/src/components/MobileDeviceSimulator.tsx` (Interactive toggleable mobile layout view allowing instant preview of mobile view on desktop)

- [ ] **Step 1: Build Customer Web portal with Screen 01, Login, OTP, Registration, and Customer Portal**
- [ ] **Step 2: Implement interactive Mobile layout preview mode**
- [ ] **Step 3: Verify build with `pnpm build`**
- [ ] **Step 4: Commit**

---

### Task 9: Customer Mobile Application (`apps/customer-mobile`)

**Files:**
- Create: `apps/customer-mobile/package.json`
- Create: `apps/customer-mobile/app.json`
- Create: `apps/customer-mobile/App.tsx` (Expo React Native mobile app utilizing shared tokens and auth context)
- Create: `apps/customer-mobile/src/screens/WelcomeScreen.tsx`
- Create: `apps/customer-mobile/src/screens/LoginScreen.tsx`
- Create: `apps/customer-mobile/src/screens/CustomerHomeScreen.tsx`

- [ ] **Step 1: Configure Expo React Native app structure**
- [ ] **Step 2: Implement native screens matching the Candi theme and `"SUSE Mono"` typography**
- [ ] **Step 3: Commit**

---

### Task 10: Verification & Interactive Demonstration

- [ ] **Step 1: Run comprehensive tests across packages (`pnpm test`)**
- [ ] **Step 2: Build all applications (`pnpm build`)**
- [ ] **Step 3: Launch dev server and use browser subagent to capture live screenshots of all 8 Part 1 screens:**
  1. Login Screen
  2. Main Dashboard
  3. Sidebar & Navigation
  4. Customer List
  5. Product List
  6. Order Screen
  7. Invoice Screen
  8. Mobile Layout
- [ ] **Step 4: Generate `walkthrough.md` with visual evidence and complete acceptance checklist**

# Candi Super Store Platform: `apps/admin-web` Control Tower Report

> **Document Type:** System Architecture, Operational Manual & Navigation Guide  
> **Target Audience:** System Administrators, Operations Directors, Warehouse Controllers, Dispatchers, Accountants, HR Managers, and Developers  
> **Platform Version:** Enterprise FMCG Distribution Release 2026.10  
> **Repository Path:** [`apps/admin-web`](file:///d:/Candi%20Super%20Store%20Platform/apps/admin-web)  

---

## Executive Summary

`apps/admin-web` is the enterprise wholesale and FMCG distribution **Control Tower** for the **Candi Super Store Platform**. Designed to handle high-velocity wholesale operations, bulk confectionery procurement, tiered B2B credit cycles, multi-stop fleet delivery, dual-entry accounting, and workforce compliance across the Karachi metropolitan commercial territory.

The application serves as the single source of truth for all operational, financial, and organizational workflows. It is built with an enterprise design philosophy emphasizing high information density, strict maker-checker controls, zero-discrepancy reconciliation, and role-based access security.

```
+---------------------------------------------------------------------------------------------------+
|                                     CANDI CONTROL TOWER TOPNAV                                    |
| [=] Title & Subtitle                    [ Search Orders, SKUs, Retailers... ]   (Role) [Logout]   |
+-------------------+-------------------------------------------------------------------------------+
|   SIDE NAVBAR     |                                                                               |
|                   |                          MAIN WORKSPACE AREA                                  |
| [Candi Super Store|                                                                               |
|  Distribution Hub]|  - Real-Time KPI Cards (GMV, Cash In Transit, Fill Rate, Overdue AR)          |
|                   |  - Dynamic Data Grids & Filter Toolbars                                       |
| - Dashboard       |  - Multi-Stage Action Panels & Slide-Out Execution Drawers                    |
| - Customers [5]   |  - Maker-Checker Verification Modals                                          |
| - Products Master |  - Printable Thermal Delivery Challans & Manifests                            |
| - Orders Queue[12]|                                                                               |
| - Verification    |                                                                               |
| - Invoices & Khata|                                                                               |
| [PRICING & OFFERS]|                                                                               |
| [PROCUREMENT]     |                                                                               |
| [RECEIVABLES]     |                                                                               |
| [FLEET LOGISTICS] |                                                                               |
| [FINANCE & GL]    |                                                                               |
| [WORKFORCE & HR]  |                                                                               |
|                   |                                                                               |
| User: Farhan Z.   |                                                                               |
| Role: Super Admin |                                                                               |
| [Sign Out ->]     |                                                                               |
+-------------------+-------------------------------------------------------------------------------+
```

---

## System Architecture & Technical Stack

`apps/admin-web` is part of the Candi monorepo, collaborating with shared packages and consumer applications:

```
                  +-----------------------------------+
                  |  Candi Super Store Monorepo       |
                  +-----------------------------------+
                                    |
         +--------------------------+--------------------------+
         |                          |                          |
+-------------------+      +-------------------+      +-------------------+
|  apps/admin-web   |      | apps/customer-web |      |customer-mobile(RN)|
| (B2B Admin Tower) |      | (Web Retail Store)|      | (Mobile App Store)|
+-------------------+      +-------------------+      +-------------------+
         |                          |                          |
         +--------------------------+--------------------------+
                                    |
     +-------------------------------------------------------------+
     |                       Shared Packages                       |
     |  - @candi/types      : Domain models, enums & interfaces     |
     |  - @candi/auth       : Supabase RBAC, tokens & permissions  |
     |  - @candi/ui         : Reusable enterprise UI component lib  |
     |  - @candi/theme      : CSS design tokens, fonts, variables   |
     |  - @candi/validation : Zod schemas, credit gates, controls   |
     +-------------------------------------------------------------+
```

### Core Technologies
- **Runtime & Language:** React 19, TypeScript 5.7+
- **Bundler & Tooling:** Vite 6.4+, pnpm workspaces
- **Styling Architecture:** Custom CSS tokens (`@candi/theme/tokens.css`), curated enterprise palette (Deep Slate `#0F172A`, Candi Crimson `#E11D48`, Emerald `#10B981`, Amber `#F59E0B`), responsive grid & flexbox layouts. No generic frameworks.
- **State & Access Control:** Context-driven RBAC via `@candi/auth` with Supabase authentication and 10 granular system modules.
- **Routing:** React Router v6 with URL query state persistence and role-guarded layout.

---

## The Side Navbar (Sidebar): Complete Guide

The **Side Navbar** ([`apps/admin-web/src/components/Sidebar.tsx`](file:///d:/Candi%20Super%20Store%20Platform/apps/admin-web/src/components/Sidebar.tsx)) is the navigational backbone and operational spine of the entire application. It structures over 45 distinct pages and consoles into logical, hierarchical, and permission-governed paths.

### 1. Purpose of the Side Navbar

| Strategic Purpose | Description |
| :--- | :--- |
| **Instant Situational Awareness** | Displays real-time numerical badges indicating pending orders, unverified retailers, awaiting GRNs, overdue collections, and active fleet vehicles at a glance. |
| **Strict Role-Based Segregation** | Automatically purges unauthorized modules and sections based on the logged-in user's role (e.g., warehouse pickers see inventory and dispatch, cashiers see collections, accountants see GL and trial balance). |
| **Ergonomic Workflow Navigation** | Keeps primary and deep sub-modules reachable in 1 click, without deeply nested dropdowns or pagination menus. |
| **Mobile & Field Operability** | Transforms seamlessly from a fixed 260px desktop rail into an off-canvas slide-out drawer on tablets and rugged warehouse handheld terminals. |
| **Identity & Shift Persistence** | Displays active user initials, full name, assigned role, and one-click session termination directly on the bottom rail. |

---

### 2. Side Navbar Anatomy & Visual Layout

The sidebar is built with a 260px fixed width, sticky full-height rail (`height: 100vh; position: sticky; top: 0`), finished in a deep midnight slate palette:

```
+--------------------------------------------------+
| [Candi Super Store Logo]                         | <-- Brand Header (Light SVG)
+--------------------------------------------------+
| TOP-LEVEL OPERATIONAL ROOTS                      |
|  📊 Dashboard                                    |
|  🏪 Customers                     [5] Badge      |
|  📦 Products Master                              |
|  📝 Orders Queue                 [12] Badge      |
|  💬 5-Stage Verification     [5-Stage] Badge      |
|  🧾 Invoices & Khata                             |
+--------------------------------------------------+
| PRICING & OFFERS                                 | <-- Collapsible Section Group
|  🏷️ Customer Tiers                               |
|  💲 Wholesale Price Lists                        |
|  🎁 Trade Offers & Schemes        [4] Badge      |
|  ⚡ Order Pricing Preview                        |
+--------------------------------------------------+
| PROCUREMENT                                      | <-- Section Group
|  🏭 Suppliers Database            [6] Badge      |
|  📋 Purchase Requests                            |
|  🛒 Purchase Orders               [3] Badge      |
|  📥 Goods Received (GRN)          [3] Badge      |
|  ⚖️ Supplier Invoices             [3] Badge      |
|  📈 Stock Planning & Reorder      [3] Badge      |
+--------------------------------------------------+
| RECEIVABLES & KHATA                              | <-- Section Group
|  💳 Receivables Dashboard                        |
|  📜 Customer Statement                           |
|  ⏳ Invoice Aging                 [5] Badge      |
|  📞 Collection Follow-ups         [4] Badge      |
+--------------------------------------------------+
| FLEET & LAST-MILE DELIVERY                       | <-- Section Group
|  🚚 Trip Manifest Console      [Live] Badge      |
|  📥 Cash Collections              [5] Badge      |
|  🤝 Cash Handover                 [2] Badge      |
|  🔐 Vault Reconciliation          [$0] Badge      |
+--------------------------------------------------+
| FINANCE & LEDGERS                                | <-- Section Group
|  🏛️ Chart of Accounts                           |
|  👤 Customer Ledger                              |
|  🏭 Supplier Ledger                              |
|  💵 Payment Register              [7] Badge      |
|  📖 Journal Entries               [4] Badge      |
|  ⚖️ GL Reconciliation             [$0] Badge      |
|  📊 Financial Reports            [14] Badge      |
|  🔒 Period Closing             [GAAP] Badge      |
|  🚨 Exception Tower               [8] Badge      |
|  🛡️ Approvals & Controls          [4] Badge      |
|  🔍 Financial Audit Trail                        |
+--------------------------------------------------+
| WORKFORCE & OPERATIONS                           | <-- Section Group
|  👥 Workforce Dashboard                          |
|  📇 Employees Master                             |
|  ⏰ Shifts & Rosters                             |
|  📅 Attendance Register                          |
|  🏖️ Leave Requests                               |
|  💰 Payroll Register                             |
|  🎯 Performance Appraisals                       |
|  📚 Training Matrix                              |
|  📑 Workforce Reports                            |
|  🔑 Roles & Permissions                          |
|  🛡️ Audit Trail                                 |
+--------------------------------------------------+
| USER SESSION FOOTER                              |
|  (FZ)  Farhan Zaidi                              | <-- User Initials Badge
|        Role: super_admin                         | <-- Dynamic RBAC Role
|  [Sign Out of Control Tower ->]                  | <-- Secure Logout Trigger
+--------------------------------------------------+
```

---

### 3. Detailed Breakdown of Every Sidebar Entry

#### Root Operational Direct Links
1. **📊 Dashboard (`/`)**
   - **Module:** `dashboard`
   - **Purpose:** Executive command center displaying real-time wholesale fulfillment KPIs, day's gross merchandise value (GMV), active fleet trips, credit hold count, and cash collected.
2. **🏪 Customers (`/customers`) — `[Badge: 5]`**
   - **Module:** `customers`
   - **Purpose:** Retailer and sub-wholesaler directory. The `5` badge indicates accounts pending KYC documentation, CNIC verification, or credit limit assignment.
3. **📦 Products Master (`/products`)**
   - **Module:** `inventory`
   - **Purpose:** Wholesale SKU master covering confectionery, beverages, and bakery goods. Manages carton unit conversions, reorder buffers, supplier lead times, and tax brackets.
4. **📝 Orders Queue (`/orders`) — `[Badge: 12]`**
   - **Module:** `sales`
   - **Purpose:** Central order intake ledger. The `12` badge alerts fulfillment officers to newly placed orders pending wave allocation or picking release.
5. **💬 5-Stage Verification & Picking (`/orders/verification`) — `[Badge: 5-Stage]`**
   - **Module:** `sales`
   - **Purpose:** Multi-channel WhatsApp order confirmation queue, tele-sales exception desk, address disambiguation, and automated release engine for warehouse picking waves.
6. **🧾 Invoices & Khata (`/invoices`)**
   - **Module:** `sales`
   - **Purpose:** Tax-compliant sales invoices, electronic delivery challans (DC), payment mode tagging (COD, Credit, Khata), and cashier receipt matching.

---

#### Group 1: PRICING & OFFERS
- **Parent Module:** `sales`
- **Heading Purpose:** Manages B2B tiered wholesale pricing matrices, bulk trade incentives, promotional schemes, and automated waterfall simulation.
  - **🏷️ Customer Tiers (`/pricing/tiers`):** Defines Tier-1 Platinum Wholesalers, Tier-2 Gold Distributors, and Tier-3 Silver Retailers with minimum order quantities (MOQ) and default credit terms.
  - **💲 Wholesale Price Lists (`/pricing/lists`):** Base price lists, promotional rate cards, effective date windows, and manufacturer price adjustment trails.
  - **🎁 Trade Offers & Schemes (`/pricing/trade-offers`) — `[Badge: 4]`:** Configures volume incentives (e.g., "Buy 10 cartons, Get 1 free", "5% instant rebate on 50+ cartons"). The `4` badge indicates active promotions currently in market.
  - **⚡ Order Pricing Preview (`/pricing/preview`):** Real-time 4-step waterfall simulation testing how customer tier, volume slabs, and trade offers combine before finalizing quotes.

---

#### Group 2: PROCUREMENT
- **Parent Module:** `procurement`
- **Heading Purpose:** End-to-end inbound supply chain management from replenishment forecasting to supplier 3-way invoice reconciliation.
  - **🏭 Suppliers Database (`/suppliers`) — `[Badge: 6]`:** Manufacturer and distributor directory (e.g., Candyland, Hilal Confectionery, English Biscuit Manufacturers, Mitchells) with credit limits, NTN/STRN, and payment terms.
  - **📋 Purchase Requests (`/procurement/requests`):** Internal requisitions initiated by warehouse supervisors when bin levels hit reorder thresholds.
  - **🛒 Purchase Orders (`/procurement/orders`) — `[Badge: 3]`:** Authorized commercial purchase orders transmitted to manufacturers. Badge `3` flags POs awaiting supplier confirmation or delivery.
  - **📥 Goods Received (GRN) (`/procurement/grn`) — `[Badge: 3]`:** Dockside intake inspection console for logging arrived cartons, batch numbers, expiry dates, and segregating transit damages.
  - **⚖️ Supplier Invoices (`/procurement/supplier-invoices`) — `[Badge: 3]`:** 3-Way matching engine (PO vs. GRN vs. Vendor Invoice) validating unit prices and quantities before Accounts Payable release.
  - **📈 Stock Planning & Reorder (`/procurement/planning`) — `[Badge: 3]`:** Predictive inventory planner computing safety stock, average daily consumption (ADC), lead-time variance, and automated replenishment orders.

---

#### Group 3: RECEIVABLES & KHATA
- **Parent Module:** `sales`
- **Heading Purpose:** Credit exposure control, B2B running khata ledgers, aging analysis, and debt recovery pipelines.
  - **💳 Receivables Dashboard (`/receivables/dashboard`):** Real-time DSO (Days Sales Outstanding), total overdue receivables, credit-hold count, and collection recovery run-rate.
  - **📜 Customer Statement (`/receivables/statement`):** Immutable double-entry running balance matching the customer ledger for printing or WhatsApp delivery to retailers.
  - **⏳ Invoice Aging (`/receivables/aging`) — `[Badge: 5]`:** Categorizes unpaid invoices into standard 5 time-buckets (Current, 1–30 days, 31–60 days, 61–90 days, >90 days overdue).
  - **📞 Collection Follow-ups (`/receivables/follow-ups`) — `[Badge: 4]`:** Recovery CRM logging debtor phone calls, Promise-to-Pay (PTP) commitments, and dispute resolution tickets.

---

#### Group 4: FLEET & LAST-MILE DELIVERY
- **Parent Module:** `delivery`
- **Heading Purpose:** Delivery logistics, commercial beat route clustering, trip manifest execution, and daily cash-on-delivery (COD) reconciliation.
  - **🚚 Trip Manifest Console (`/delivery/fleet-console`) — `[Badge: Live]`:** The dispatch control tower. Clusters picked orders into Karachi wholesale beats (Nazimabad, Saddar, Gulshan, Korangi, DHA), validates vehicle payload (kg & m³), dispatches drivers, simulates stop deliveries, captures mPOD, and generates thermal delivery challans.
  - **📥 Cash Collections (`/cash/collections`) — `[Badge: 5]`:** Real-time register of every rupee collected on delivery beats, logging official receipt numbers, collection timestamps, and invoice associations.
  - **🤝 Cash Handover (`/cash/handovers`) — `[Badge: 2]`:** Shift-settlement custody exchange gate where drivers physically surrender cash bags to the depot cashier with dual digital signatures.
  - **🔐 Vault Reconciliation (`/cash/reconciliation`) — `[Badge: $0]`:** Physical vault balance counter with automated denomination breakdown (Rs. 5000 down to Rs. 10 notes) validating zero variance before day-end bank deposit generation.

---

#### Group 5: FINANCE & LEDGERS
- **Parent Module:** `finance`
- **Heading Purpose:** Full double-entry general ledger, sub-ledger reconciliation, period-end governance, 4-eyes financial controls, and statutory reporting.
  - **🏛️ Chart of Accounts (`/finance/coa`):** 5-digit account hierarchy spanning Assets (1000s), Liabilities (2000s), Equity (3000s), Revenue (4000s), and Expenses (5000s).
  - **👤 Customer Ledger (`/finance/customer-ledger`):** Detailed Accounts Receivable sub-ledger tied to Control Account 1100.
  - **🏭 Supplier Ledger (`/finance/supplier-ledger`):** Detailed Accounts Payable sub-ledger tied to Control Account 2010.
  - **💵 Payment Register (`/finance/payments`) — `[Badge: 7]`:** Master audit register of all incoming retail receipts and outgoing vendor disbursements.
  - **📖 Journal Entries (`/finance/journal-entries`) — `[Badge: 4]`:** Immutable double-entry manual and system journal vouchers requiring balanced debit/credit sums.
  - **⚖️ GL Reconciliation (`/finance/reconciliation`) — `[Badge: $0]`:** Automated audit proof proving that AR and AP sub-ledgers match general ledger control accounts with exact $0 variance.
  - **📊 Financial Reports (`/finance/reports`) — `[Badge: 14]`:** 14 statutory and management reports: Balance Sheet, Profit & Loss, Trial Balance, Cash Flow, Tax Schedule, and Cost of Goods Sold.
  - **🔒 Period Closing (`/finance/period-closing`) — `[Badge: GAAP]`:** 8-stage month-end and year-end closing wizard locking financial periods to prevent retroactive tampering.
  - **🚨 Exception Tower (`/finance/exceptions`) — `[Badge: 8]`:** Live monitor highlighting unapproved journals, cash discrepancies, and debit-balance anomalies.
  - **🛡️ Approvals & Controls (`/finance/approvals`) — `[Badge: 4]`:** Segregation-of-duties maker-checker desk enforcing authorization thresholds and contra-reversals.
  - **🔍 Financial Audit Trail (`/finance/audit-trail`):** Cryptographically timestamped change log documenting every financial edit, account alteration, and approval action.

---

#### Group 6: WORKFORCE & OPERATIONS
- **Parent Module:** `administration`
- **Heading Purpose:** Human capital management, employee directory, maker-checker onboarding, shift rosters, biometric attendance, payroll processing, and security permissions.
  - **👥 Workforce Dashboard (`/workforce/dashboard`):** Real-time headcount, departmental presence, late arrivals, active shifts, and pending HR sign-offs.
  - **📇 Employees Master (`/workforce/employees`):** Complete staff directory with 2-tier maker-checker onboarding for warehouse, sales, finance, and logistics personnel.
  - **⏰ Shifts & Rosters (`/workforce/shifts`):** Dock intake, picking wave, and dispatch shift schedules assigned by warehouse zone.
  - **📅 Attendance Register (`/workforce/attendance`):** Daily punch register tracking on-time arrival, biometric machine integration, and supervisor-authorized overrides.
  - **🏖️ Leave Requests (`/workforce/leaves`):** Annual, medical, and casual leave workflows with automatic attendance and payroll deductions.
  - **💰 Payroll Register (`/workforce/payroll`):** Attendance-synchronized gross-to-net salary calculator with tax deductions, provident fund, and automated general ledger posting.
  - **🎯 Performance Appraisals (`/workforce/performance`):** Quarterly KPI evaluations for warehouse pickers (picks/hour), delivery drivers (on-time rate), and tele-sales agents (verification accuracy).
  - **📚 Training Matrix (`/workforce/training`):** Forklift safety, cold-chain handling, and hazardous materials compliance tracking.
  - **📑 Workforce Reports (`/workforce/reports`):** Overtime analysis, absenteeism rates, and payroll cost distribution across departments.
  - **🔑 Roles & Permissions (`/admin/roles`):** Matrix assigning `view`, `create`, `edit`, `approve`, and `delete` rights across all 10 modules.
  - **🛡️ Audit Trail (`/workforce/audit`):** Immutable log of staff profile modifications, salary adjustments, and permission elevations.

---

### 4. Interactive Sidebar Features & How to Use Them

#### Feature A: Active Route Highlighting & Feedback
- **Behavior:** The sidebar uses React Router’s `<NavLink>` with active route detection.
- **Visual Cue:** The active page is highlighted with a slate container background (`#1E293B`), pure white typography (`#FFFFFF`), bold font-weight (`700`), and a prominent **3px solid Candi Crimson left border** (`#E11D48`).
- **Hover State:** Non-active items transition smoothly to light slate text on hover, giving tactile responsiveness.

#### Feature B: Dynamic Badge Counters
- **Behavior:** Badges indicate immediate action required.
- **Styling:** Pill-shaped badge (`border-radius: 999px`) in Candi Crimson (`#E11D48`) with high-contrast bold white text (`#FFFFFF`, `font-size: 10px`, `font-weight: 800`).
- **Use Case:** An operations director scanning the sidebar can immediately see that there are **12** orders to release, **5** unverified customers, and **4** trade offers active without opening submenus.

#### Feature C: Role-Based Filtering Engine
- **Behavior:** In `Sidebar.tsx`, the navigation array is filtered against the logged-in user’s granted permissions:
  ```tsx
  const visibleEntries = navEntries.filter((entry) => {
    return hasPermission(entry.module, 'view');
  });
  ```
- **Operator Impact:**
  - A **Warehouse Manager** will not see `FINANCE & LEDGERS` or `WORKFORCE & HR`.
  - A **Rider / Driver** will only see `Dashboard`, `Customers`, and `FLEET & LAST-MILE DELIVERY`.
  - A **Super Admin** sees all 45 operational consoles.

#### Feature D: Responsive Off-Canvas Mobile Drawer
- **Behavior:** On viewports under 1024px width, the sidebar hides off-screen to preserve operational screen real estate.
- **Opening:** Tapping the hamburger icon (`☰`) on the top navigation bar opens the drawer.
- **Dismissing:** Tapping anywhere on the blurred dark backdrop (`rgba(15, 23, 42, 0.65)` with `backdrop-filter: blur(3px)`), clicking the close button (`✕`), or selecting any link will automatically close the drawer.

#### Feature E: Identity & Quick Logout Footer
- **Behavior:** At the base of the rail, the user profile section displays:
  - User initials inside a circular badge with border accent (e.g., `FZ`).
  - Full Name (e.g., `Farhan Zaidi`).
  - Active RBAC Role badge (e.g., `Role: super_admin`).
  - **Sign Out of Control Tower →**: Destroys auth session tokens, cleans storage, and redirects to `/login`.

---

## Complete Route & Module Mapping Reference

The following table provides the comprehensive reference for all navigation routes implemented in `apps/admin-web`:

| Route Path | Sidebar Label | Section / Group | Primary Module | Default Roles Permitted |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Dashboard | Root | `dashboard` | All Staff Roles |
| `/customers` | Customers | Root | `customers` | Super Admin, Admin Mgr, Sales, Rider, Accounts |
| `/products` | Products Master | Root | `inventory` | Super Admin, Admin Mgr, Warehouse, Sales |
| `/orders` | Orders Queue | Root | `sales` | Super Admin, Admin Mgr, Sales, Accounts |
| `/orders/verification` | 5-Stage Verification & Picking | Root | `sales` | Super Admin, Admin Mgr, Sales Agents |
| `/invoices` | Invoices & Khata | Root | `sales` | Super Admin, Admin Mgr, Sales, Accounts |
| `/pricing/tiers` | Customer Tiers | PRICING & OFFERS | `sales` | Super Admin, Admin Mgr |
| `/pricing/lists` | Wholesale Price Lists | PRICING & OFFERS | `sales` | Super Admin, Admin Mgr |
| `/pricing/trade-offers` | Trade Offers & Schemes | PRICING & OFFERS | `sales` | Super Admin, Admin Mgr, Sales Agents |
| `/pricing/preview` | Order Pricing Preview | PRICING & OFFERS | `sales` | Super Admin, Admin Mgr, Sales Agents |
| `/suppliers` | Suppliers Database | PROCUREMENT | `procurement` | Super Admin, Admin Mgr, Warehouse, Accounts |
| `/procurement/requests` | Purchase Requests | PROCUREMENT | `procurement` | Super Admin, Admin Mgr, Warehouse Mgr |
| `/procurement/orders` | Purchase Orders | PROCUREMENT | `procurement` | Super Admin, Admin Mgr, Accounts |
| `/procurement/grn` | Goods Received (GRN) | PROCUREMENT | `procurement` | Super Admin, Admin Mgr, Warehouse Staff |
| `/procurement/supplier-invoices` | Supplier Invoices | PROCUREMENT | `procurement` | Super Admin, Admin Mgr, Accounts Staff |
| `/procurement/planning` | Stock Planning & Reorder | PROCUREMENT | `procurement` | Super Admin, Admin Mgr, Warehouse Mgr |
| `/receivables/dashboard` | Receivables Dashboard | RECEIVABLES & KHATA | `sales` | Super Admin, Admin Mgr, Accounts Staff |
| `/receivables/statement` | Customer Statement | RECEIVABLES & KHATA | `sales` | Super Admin, Admin Mgr, Sales, Accounts |
| `/receivables/aging` | Invoice Aging | RECEIVABLES & KHATA | `sales` | Super Admin, Admin Mgr, Accounts Staff |
| `/receivables/follow-ups` | Collection Follow-ups | RECEIVABLES & KHATA | `sales` | Super Admin, Admin Mgr, Sales, Accounts |
| `/delivery/fleet-console` | Trip Manifest Console | FLEET & LAST-MILE DELIVERY | `delivery` | Super Admin, Admin Mgr, Delivery Mgr, Riders |
| `/cash/collections` | Cash Collections | FLEET & LAST-MILE DELIVERY | `delivery` | Super Admin, Delivery Mgr, Riders, Cashiers |
| `/cash/handovers` | Cash Handover | FLEET & LAST-MILE DELIVERY | `delivery` | Super Admin, Delivery Mgr, Cashiers |
| `/cash/reconciliation` | Vault Reconciliation | FLEET & LAST-MILE DELIVERY | `delivery` | Super Admin, Finance Mgr, Head Cashier |
| `/finance/coa` | Chart of Accounts | FINANCE & LEDGERS | `finance` | Super Admin, Finance Mgr, Senior Accountant |
| `/finance/customer-ledger` | Customer Ledger | FINANCE & LEDGERS | `finance` | Super Admin, Finance Mgr, Accounts Staff |
| `/finance/supplier-ledger` | Supplier Ledger | FINANCE & LEDGERS | `finance` | Super Admin, Finance Mgr, Accounts Staff |
| `/finance/payments` | Payment Register | FINANCE & LEDGERS | `finance` | Super Admin, Finance Mgr, Cashier |
| `/finance/journal-entries` | Journal Entries | FINANCE & LEDGERS | `finance` | Super Admin, Finance Mgr, Accountants |
| `/finance/reconciliation` | GL Reconciliation | FINANCE & LEDGERS | `finance` | Super Admin, Finance Mgr, Internal Auditor |
| `/finance/reports` | Financial Reports | FINANCE & LEDGERS | `finance` | Super Admin, Finance Mgr, External Auditor |
| `/finance/period-closing` | Period Closing | FINANCE & LEDGERS | `finance` | Super Admin, Chief Financial Officer |
| `/finance/exceptions` | Exception Tower | FINANCE & LEDGERS | `finance` | Super Admin, Finance Controller |
| `/finance/approvals` | Approvals & Controls | FINANCE & LEDGERS | `finance` | Super Admin, Finance Controller (4-Eyes) |
| `/finance/audit-trail` | Financial Audit Trail | FINANCE & LEDGERS | `finance` | Super Admin, Statutory Compliance Auditor |
| `/workforce/dashboard` | Workforce Dashboard | WORKFORCE & OPERATIONS | `administration` | Super Admin, Admin Mgr, HR Director |
| `/workforce/employees` | Employees Master | WORKFORCE & OPERATIONS | `administration` | Super Admin, Admin Mgr, HR Officer |
| `/workforce/shifts` | Shifts & Rosters | WORKFORCE & OPERATIONS | `administration` | Super Admin, Admin Mgr, Warehouse Mgr |
| `/workforce/attendance` | Attendance Register | WORKFORCE & OPERATIONS | `administration` | Super Admin, Admin Mgr, Operations Supervisor|
| `/workforce/leaves` | Leave Requests | WORKFORCE & OPERATIONS | `administration` | Super Admin, Admin Mgr, Department Leads |
| `/workforce/payroll` | Payroll Register | WORKFORCE & OPERATIONS | `administration` | Super Admin, Finance Mgr, HR Lead |
| `/workforce/performance` | Performance Appraisals | WORKFORCE & OPERATIONS | `administration` | Super Admin, Admin Mgr, Team Leads |
| `/workforce/training` | Training Matrix | WORKFORCE & OPERATIONS | `administration` | Super Admin, Safety Officer, HR Lead |
| `/workforce/reports` | Workforce Reports | WORKFORCE & OPERATIONS | `administration` | Super Admin, HR Director, CFO |
| `/admin/roles` | Roles & Permissions | WORKFORCE & OPERATIONS | `administration` | Super Admin Only |
| `/workforce/audit` | Audit Trail | WORKFORCE & OPERATIONS | `administration` | Super Admin, Internal Compliance Lead |

---

## Operational Scenarios & Daily Navigation Walkthroughs

### Scenario 1: Morning Order Wave Release & Picking Dispatch
1. **Login:** Operations Supervisor logs into the Control Tower.
2. **Review Intake:** Clicks `Orders Queue` (`/orders`) on the sidebar to check incoming overnight orders.
3. **Conversational Verification:** Clicks `5-Stage Verification & Picking` (`/orders/verification`). Uses the tele-sales desk to verify retail phone confirmations and releases eligible batches into warehouse picking waves.
4. **Dock Intake & Physical Packing:** Warehouse staff view the generated pick tickets and move cartons to staging bays.

### Scenario 2: Afternoon Delivery Manifest Clustering & Driver Departure
1. **Open Fleet Console:** Dispatch Controller navigates to `FLEET & LAST-MILE DELIVERY -> Trip Manifest Console` (`/delivery/fleet-console`).
2. **Beat Clustering:** Clicks **Cluster New Beat Trip**. Selects the target route (e.g., `BEAT-KHI-01: Nazimabad Commercial`), assigns a vehicle (`KHI-7890 Shehzore`) and licensed driver (`Muhammad Tariq`).
3. **Payload Verification:** Selects staged orders. The system checks payload weight (1,240 kg / 2,500 kg) and cubic volume (8.4 m³ / 12.0 m³) capacity meters.
4. **Print Manifest:** Clicks **Print Manifest / Challan** to generate the thermal barcode delivery sheet for the driver.
5. **Dispatch:** Hits **Dispatch Vehicle to Route**. Manifest status transitions to `in_transit`.

### Scenario 3: Evening Driver Settlement & Vault Closing
1. **Arrival & Cash Handover:** Driver returns from beat. Cashier navigates to `Cash Handover` (`/cash/handovers`). Validates physical cash collected against the trip manifest. Driver and cashier provide dual confirmation sign-offs.
2. **Vault Reconciliation:** Head Cashier opens `Vault Reconciliation` (`/cash/reconciliation`). Counts physical bills across Rs. 5000, 1000, 500, 100, 50, 20, and 10 notes.
3. **System Balanced:** Confirms `$0` variance between physical count and expected collections. Posts closing journal entry to GL Account `1010: Cash on Hand`.

### Scenario 4: Month-End Financial Closing & Audit Verification
1. **GL Sub-ledger Check:** Senior Accountant navigates to `FINANCE & LEDGERS -> GL Reconciliation` (`/finance/reconciliation`) to verify that the Customer Subledger (AR 1100) and Supplier Subledger (AP 2010) match control accounts with zero variance.
2. **Review Exceptions:** Opens `Exception Tower` (`/finance/exceptions`) to ensure all unposted journals or suspense balances are cleared.
3. **Period Lockdown:** Opens `Period Closing` (`/finance/period-closing`). Executes the 8-stage closing wizard to lock the accounting period under GAAP / IFRS standards.

---

## Technical Maintenance & Extension Guidelines

### How to Add a New Page to the Side Navbar
To add a new operational screen to `apps/admin-web`, follow these three steps:

1. **Create the Page Component:**
   Place the new React component in the appropriate directory under [`apps/admin-web/src/pages/`](file:///d:/Candi%20Super%20Store%20Platform/apps/admin-web/src/pages/).

2. **Register the Route in `App.tsx`:**
   Import the page in [`App.tsx`](file:///d:/Candi%20Super%20Store%20Platform/apps/admin-web/src/App.tsx), add its page title and subtitle in `getPageMeta()`, and declare its `<Route>` entry:
   ```tsx
   <Route path="/your-module/new-feature" element={<YourNewFeaturePage />} />
   ```

3. **Add Navigation Item in `Sidebar.tsx`:**
   In [`apps/admin-web/src/components/Sidebar.tsx`](file:///d:/Candi%20Super%20Store%20Platform/apps/admin-web/src/components/Sidebar.tsx), add the item to the corresponding section within `navEntries`:
   ```tsx
   {
     heading: 'YOUR SECTION HEADING',
     module: 'your_module_name', // Must match SystemModule type
     items: [
       { label: 'Feature Name', path: '/your-module/new-feature', icon: '✨', badge: 'New' },
     ],
   }
   ```
4. **Compile & Verify:**
   Execute compilation from the project root:
   ```powershell
   pnpm --filter @candi/admin-web build
   ```

---

*Candi Super Store Platform Control Tower — Empowering Wholesale Distribution with Reliability, Speed, and Financial Integrity.*

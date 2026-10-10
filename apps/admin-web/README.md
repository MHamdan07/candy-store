# 🏢 Candi Super Store Control Tower (`admin-web`)

The **Control Tower** is the enterprise wholesale operations, distribution, and ERP management system for Candi Super Store Platform. It enables business teams to manage FMCG confectionery inventory, sub-wholesaler pipelines, delivery manifests, purchasing, supplier invoices, tele-sales, and cash settlements across Pakistan.

---

## 🚀 Quick Start

### 1. Start Development Server

From the **workspace root**:
```bash
pnpm dev:admin
```

Or from within this directory (`apps/admin-web`):
```bash
pnpm dev
```

The application will launch at:
👉 **`http://localhost:3001`**

---

## 🔑 Login & Authentication

The platform supports OTP authentication for Pakistani mobile numbers (`+92 3XX XXXXXXX`).

### Offline Demo Credentials
If no Supabase environment keys are specified, the app runs in **Offline Demo Mode** with mock accounts:

- **Admin Phone:** `0300 9999999` (or `+923009999999`)
- **Verification OTP:** `123456`
- **User Role:** Super Admin (`Farhan Zaidi - Operations Director`)

> **Note:** The login screen pre-fills the demo phone number and verification OTP for instant 1-click access.

---

## 📋 Control Tower Modules & Features

The Control Tower includes 15+ operational modules accessible via the navigation sidebar:

1. **Dashboard & Executive Metrics:** High-level revenue, inventory value, pending approvals, and active dispatch stats.
2. **Customer Onboarding & Approvals:** Review new retailer registrations, inspect business photos/NTN, and approve or reject accounts.
3. **Product Catalog & Tier Pricing:** Multi-tier pricing (single piece, box, carton, bulk pallets) and minimum order thresholds.
4. **Order Management & Invoicing:** Review inbound retailer orders, generate wholesale sales invoices, apply discounts, and manage approvals.
5. **Procurement & Purchase Orders (PO):** Create purchase orders to FMCG manufacturers, track PO lifecycle from Draft to Fully Received.
6. **Goods Receipt (GRN):** Warehouse receiving dock inspection, batch/lot tracking, expiry tracking, and damaged goods reconciliation.
7. **Supplier Invoices & AP (Accounts Payable):** 3-way matching (PO vs. GRN vs. Supplier Invoice) and disbursement recording.
8. **Stock Planning & Reorder Alerts:** Reorder points, safety stock calculations, and warehouse zone allocation.
9. **Dispatch & Route Logistics:** Delivery manifests, rider dispatch, proof of delivery (POD), and route clustering.
10. **Tele-Sales & Order Desk:** Outbound call logging, customer re-order reminders, and telesales conversion metrics.
11. **Finance & Receivables (AR):** Retailer ledger, aging analysis (0-30, 31-60, 60+ days), and credit limits.
12. **Cash & Float Management:** Cash-on-Delivery (COD) reconciliation from delivery riders and bank deposits.

For an extensive deep-dive into each module and system workflows, see:
👉 **[`admin-web.md`](../../admin-web.md)** (located in the root workspace).

---

## ⚙️ Environment Variables

Optional configuration can be placed in `.env` in this directory or in the monorepo root:

```env
# Optional: Live Supabase Backend
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

*If left empty, all actions run safely in offline demo mode.*

---

## 📦 Production Build

```bash
# Type check and build bundle
pnpm build

# Preview production build locally
pnpm preview
```
Output will be generated in `dist/`.

---

## 🛠️ Tech Stack
- **Framework:** React 19 + TypeScript
- **Bundler:** Vite 6
- **Routing:** React Router v7
- **Design Tokens:** `@candi/theme`
- **UI Components:** `@candi/ui`
- **Auth & State:** `@candi/auth`
- **Port:** `3001`

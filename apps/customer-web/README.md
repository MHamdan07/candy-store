# 🛒 Candi Super Store B2B Customer Portal (`customer-web`)

The **Customer Web Portal** is the wholesale e-commerce storefront for retail store owners, grocery shopkeepers, and sub-wholesalers across Pakistan to order confectionery and FMCG stock directly from Candi Super Store.

---

## 🚀 Quick Start

### 1. Start Development Server

From the **workspace root**:
```bash
pnpm dev:customer
```

Or from within this directory (`apps/customer-web`):
```bash
pnpm dev
```

The application will launch at:
👉 **`http://localhost:3000`**

---

## 🔑 Login & Demo Accounts

Authentication is powered by mobile phone number verification (+92 format).

### Offline Demo Credentials
If no Supabase backend is configured, the application runs seamlessly in **Offline Demo Mode**. Use any of the following accounts with OTP **`123456`**:

| Account Type | Phone Number | Business Name | Status & Access Level |
| :--- | :--- | :--- | :--- |
| **Approved Retailer** (Recommended) | `0300 1111111` | Bilal General Store | Full catalog ordering & checkout access |
| **Pending Review Sub-Wholesaler** | `0300 2222222` | Mehmood Traders Wholesale | Onboarding submitted, pending admin approval |
| **Changes Requested** | `0300 3333333` | Al-Madina Mini Mart | Prompts KYC document / shop update |
| **Rejected Account** | `0300 4444444` | Corner Kiosk | Outside serviceable delivery zone preview |
| **Suspended Account** | `0300 5555555` | Ali & Sons Candy Mart | Settlement/reconciliation hold notice |

> **Tip:** You can also register a **new business account** by navigating to `/register` or selecting "Register New Business" on the welcome screen.

---

## 🛍️ Portal Features

- **Wholesale Tiered Pricing:** Automatic price break discounts based on order volume (Individual Pack, Outer Box, Master Carton, Pallet Tiers).
- **Fast Search & FMCG Categories:** Confectionery (Candies, Toffees, Chocolates, Lollipops, Biscuits, Chewing Gums).
- **Live Wholesale Cart:** Dynamic calculation of total cartons, weight estimates, discounts, and delivery charges.
- **Doorstep Business Delivery:** Cash on Delivery (COD) and approved B2B credit terms.
- **Account Status Router:** Smart routing based on customer verification state (`pending_review`, `changes_requested`, `approved`, `suspended`).
- **Order Tracking:** Real-time visibility into order status (Pending, Confirmed, Dispatched, Delivered).

---

## ⚙️ Environment Variables

Optional backend keys can be set in `.env` or inherited from root `.env`:

```env
# Optional: Live Supabase Backend
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

*When left empty, the app runs completely standalone with mock data.*

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
- **Validation:** `@candi/validation`
- **Port:** `3000`

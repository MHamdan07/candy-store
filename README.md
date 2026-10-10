# 🍭 Candi Super Store Platform

> **Enterprise B2B Wholesale Distribution Platform for FMCG and Confectionery in Pakistan**

The Candi Super Store Platform is a full-featured monorepo solution engineered for modern wholesale commerce, end-to-end supply chain execution, route deliveries, and retailer self-service.

---

## 📁 Repository Structure

```text
├── apps/
│   ├── admin-web/          # Operations Control Tower & ERP (React 19 + Vite @ Port 3001)
│   ├── customer-web/       # Retailer & Sub-Wholesaler Web Portal (React 19 + Vite @ Port 3000)
│   └── customer-mobile/    # Mobile Retailer Ordering App (React Native + Expo 52)
│
├── packages/
│   ├── auth/               # Unified Auth Context, Supabase Client & Mock Accounts
│   ├── config/             # Shared build and environment configuration
│   ├── theme/              # Design tokens (warm amber/emerald palette, typography)
│   ├── types/              # TypeScript data contracts, interfaces & enums
│   ├── ui/                 # Reusable React components (Button, Modal, StatCard, Badge, etc.)
│   └── validation/         # Pakistan phone (+92) & business rule validators
│
├── docs/                   # Platform documentation & diagrams
└── supabase/               # Database schemas, migrations & seed files
```

---

## ⚡ Prerequisites

Make sure the following tools are installed on your machine:

- **Node.js**: `v20.x` or later (LTS recommended)
- **pnpm**: `v9.x` or `v10.x` (monorepo package manager)
  ```bash
  # Enable via Corepack
  corepack enable
  corepack prepare pnpm@latest --activate
  ```

---

## 🚀 Quick Start (Running All Apps)

### 1. Install Dependencies
Run the command below in the root directory:
```bash
pnpm install
```

### 2. Environment Setup (Optional)
The platform is designed to **run out-of-the-box in zero-config offline/mock mode** without requiring a live Supabase instance.

If connecting to a live Supabase backend, duplicate `.env.example` to `.env`:
```bash
# Windows PowerShell
copy .env.example .env
```
Populate `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as needed. If left empty, all apps automatically use rich mock data and demo sessions.

---

## 💻 Running the Applications

You can run each app directly from the root using convenience scripts:

| Application | Command | Local URL / Access | Description |
| :--- | :--- | :--- | :--- |
| **Control Tower (`admin-web`)** | `pnpm dev:admin` | [http://localhost:3001](http://localhost:3001) | B2B Operations, Inventory, Purchasing, Dispatch & Finance |
| **Storefront (`customer-web`)** | `pnpm dev:customer` | [http://localhost:3000](http://localhost:3000) | Retailer ordering, Tiered pricing & Account KYC |
| **Mobile App (`customer-mobile`)** | `pnpm dev:mobile` | Expo Dev Server (Terminal / Web / QR) | React Native ordering app for retail shopkeepers |

---

### Detailed App Run Guides

#### 1. Operations Control Tower (`admin-web`)
Dedicated ERP and operational management portal for warehouse directors, purchasing agents, inventory leads, and sales reps.
```bash
# From workspace root:
pnpm dev:admin

# Or navigate directly into the folder:
cd apps/admin-web
pnpm dev
```
- **Port:** `3001` ([http://localhost:3001](http://localhost:3001))
- **Demo Login:**
  - Phone: `0300 9999999`
  - OTP: `123456`
- **Documentation:** See [apps/admin-web/README.md](file:///d:/Candi%20Super%20Store%20Platform/apps/admin-web/README.md) and [`admin-web.md`](file:///d:/Candi%20Super%20Store%20Platform/admin-web.md).

---

#### 2. Customer Web Portal (`customer-web`)
Wholesale self-service ordering storefront for retail shop owners, kiosks, and sub-wholesalers across Pakistan.
```bash
# From workspace root:
pnpm dev:customer

# Or navigate directly into the folder:
cd apps/customer-web
pnpm dev
```
- **Port:** `3000` ([http://localhost:3000](http://localhost:3000))
- **Demo Login:**
  - Approved Retailer: `0300 1111111` (OTP: `123456`)
  - Sub-Wholesaler (Pending Review): `0300 2222222` (OTP: `123456`)
- **Documentation:** See [apps/customer-web/README.md](file:///d:/Candi%20Super%20Store%20Platform/apps/customer-web/README.md).

---

#### 3. Customer Mobile App (`customer-mobile`)
Cross-platform React Native mobile app built with Expo SDK 52 for shopkeepers ordering stock from their phones.
```bash
# From workspace root:
pnpm dev:mobile

# Or navigate directly into the folder:
cd apps/customer-mobile
pnpm dev        # Starts Expo interactive terminal
pnpm web        # Launches web browser preview (http://localhost:8081)
pnpm android    # Launches on connected Android device/emulator
pnpm ios        # Launches on iOS simulator (macOS only)
```
- **Expo Go:** Scan the QR code displayed in your terminal using the **Expo Go** app on your physical mobile phone.
- **Documentation:** See [apps/customer-mobile/README.md](file:///d:/Candi%20Super%20Store%20Platform/apps/customer-mobile/README.md).

---

## 🛠️ Monorepo Utility Commands

```bash
# Build all apps and packages
pnpm build

# Run TypeScript checking & tests across all workspaces
pnpm test

# Run linter across packages
pnpm lint
```

---

## 🔐 Mock Accounts Reference

When running in offline demo mode (default), the following accounts are pre-configured:

| Role / Status | Phone Number | Demo OTP | Name | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `0300 9999999` | `123456` | Farhan Zaidi | Operations Director with full Control Tower access |
| **Approved Retailer** | `0300 1111111` | `123456` | Muhammad Bilal Khan | Bilal General Store, full checkout access |
| **Pending Review** | `0300 2222222` | `123456` | Tariq Mehmood | Mehmood Traders, awaiting admin verification |
| **Changes Requested**| `0300 3333333` | `123456` | Kamran Siddiqui | Al-Madina Mini Mart, prompts KYC update |
| **Suspended Account**| `0300 5555555` | `123456` | Rashid Ali | Ali & Sons Candy Mart, restricted ordering status |

---

## 📄 License
Internal Proprietary Platform for Candi Super Store.

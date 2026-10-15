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

## 🎨 Interactive Category System & UI Enhancements (Latest Update)

### 1. Scrollbar-Free Smooth Carousel Navigation
- **Zero Ugly Scrollbars**: Browser native scrollbars have been completely removed across Chrome, Safari, Firefox, and Edge (`scrollbar-width: none`, `-ms-overflow-style: none`, `::-webkit-scrollbar { display: none }`).
- **Multi-Modal Smooth Scrolling**:
  - Horizontal mouse-wheel redirection for desktop mice.
  - Touch-swipe acceleration for mobile and tablet devices.
  - Subtle floating directional chevron assistant buttons (`‹` / `›`) that appear dynamically when content overflows.
  - Clicked category pills automatically scroll into center view smoothly.

### 2. Cursor Hover Micro-Animations & Dynamic States
- **Hover Micro-Animations**:
  - Hover Lift: `transform: translateY(-2px) scale(1.03)` with soft drop-shadow `0 6px 16px -2px rgba(15, 23, 42, 0.14)`.
  - Icon Animation: Emojis and category icons smoothly scale and tilt (`transform: scale(1.22) rotate(-6deg)`).
  - Micro-tap response: Tactile active compression `transform: scale(0.97)` on click.
- **Active State Indicators**:
  - Selected category highlights in high-contrast Obsidian `#0F172A` with pure white `#FFFFFF` text, elevated depth, and luminous active badge counters.
  - Default selected: `📌 All Products` reset pill.

### 3. Dynamic Product Count Badges & Synchronization
- **Dynamic Calculation**: Category counts are dynamically computed from active product lists using `getCategoryCounts(products)` in `wholesaleCatalogData.ts` rather than static hardcoding.
- **Normalized Category Matching**: `matchProductCategory()` handles case-insensitive, slug-normalized, and cross-referenced category matching, ensuring 100% accuracy regardless of casing or punctuation.

### 4. Active Category Header Banner & 1-Click Clear
- **Visual Context**: When any category is selected, an active banner is displayed above the product grid:
  - Displays category icon + title + product count (e.g. `🍫 Showing 3 products in Chocolates & Truffles`).
  - Includes a prominent 1-click **"✕ Clear filter"** button that instantly resets back to "All Products".
- **Focus Auto-Scroll**: Selecting a category smoothly aligns the product grid into view if the user has scrolled down the catalog page.

### 5. Admin-Web Category Management Integration
- Complementary category administration in `apps/admin-web/src/pages/ProductListPage.tsx` and `CategoryManagementModal.tsx`:
  - Quick-switch inline category dropdowns on product rows.
  - Add, edit, reorder, and toggle visibility of wholesale categories.
  - Safety validation prompting admins to reassign active SKUs before deactivating or deleting any category.

### 6. Slim Navbar & Zero-Scrollbar Tactile Experience
- **Zero-Scrollbar Guarantee Across All Browsers**:
  - `wholesale-desktop-tabs` has explicit multi-browser scrollbar suppression (`scrollbar-width: none !important`, `-ms-overflow-style: none !important`, and `::-webkit-scrollbar, ::-webkit-scrollbar-track, ::-webkit-scrollbar-thumb { display: none !important; width: 0 !important; height: 0 !important; background: transparent !important; }`).
- **Slim & Compact Dimensions**:
  - Main navbar bar padding reduced to `6px 16px` with `gap: 10px`.
  - Verified retailer pill slimmed to `padding: 4px 10px`, shop title `12px`, and subtitle `9.5px`.
  - Navigation tab buttons streamlined to `padding: 6px 11px` and `font-size: 12px`.
  - Desktop cart button compact padding `5px 12px` and `font-size: 12px`.
- **Smooth Hover & Tactile Micro-Animations**:
  - Tab buttons (`.candi-nav-tab`): Hover lift (`transform: translateY(-1px) scale(1.025)`) with soft depth shadow (`0 4px 12px rgba(15, 23, 42, 0.08)`); active press `transform: scale(0.96)`.
  - Retailer pill (`.candi-nav-retailer-pill`): Hover scale (`scale(1.015)`) with emerald glow and `#10B981` border highlight.
  - Cart button (`.candi-nav-cart`): Hover lift (`translateY(-1.5px) scale(1.025)`) with crimson aura (`rgba(225, 29, 72, 0.32)`).

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

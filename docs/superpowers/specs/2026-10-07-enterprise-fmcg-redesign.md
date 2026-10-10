# Enterprise FMCG Design System & Multi-Portal Redesign Spec

**Target:** Monorepo (`packages/theme`, `packages/ui`, `apps/customer-web`, `apps/admin-web`, `apps/customer-mobile`)  
**Design Direction:** Modern Enterprise FMCG  
**Palette:** Crisp Clean White & Slate 50 (`#F8FAFC`), Deep Slate Typography (`#0F172A`, `#334155`), Refined Slate Borders (`#E2E8F0`), Vibrant Confectionery Red (`#E11D48`), Warm Amber (`#D97706`), Emerald Green (`#059669`).  
**Typography:** Google Fonts `'Plus Jakarta Sans'`, `'Inter'` (replacing monospaced fonts with professional, highly readable sans-serif).

---

## 1. Problem Statement & Motivation
The previous design relied on an earthy, khaki/olive drab (`#565449`), bone beige (`#D8CFBC`), and floral white (`#FFFBF4`) palette, coupled with a monospaced font (`SUSE Mono` / `JetBrains Mono`) applied globally across all body text, cards, tables, and inputs. This produced a grainy, low-contrast, non-commercial look that felt dated and difficult to read. Furthermore, a floating desktop device preview button (`📱 Mobile Preview`) was cluttering the user interface.

## 2. Goals & Design Principles
1. **Professional Typography:** Switch to `Plus Jakarta Sans` for headings and brand elements, and `Inter` for data tables, forms, and dense B2B operational lists.
2. **Crisp High-Contrast Color System:**
   - App Canvas: `#F8FAFC` (Slate 50)
   - Cards & Surfaces: `#FFFFFF` with crisp `#E2E8F0` borders
   - Primary Text: `#0F172A` (Slate 900)
   - Secondary Text: `#475569` (Slate 600)
   - Muted / Placeholders: `#94A3B8` (Slate 400)
   - Brand Accent: `#E11D48` (Rose 600 - Candi Confectionery Red)
   - Status Badges: `#059669` (Emerald 600), `#D97706` (Amber 600), `#DC2626` (Red 600), `#0284C7` (Sky 600)
3. **True Mobile & Web Responsiveness:**
   - Fluid grid layouts (`grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))`)
   - Collapsible admin sidebar with mobile slide-out drawer on viewports $\le 1024\text{px}$
   - Horizontal scroll wrappers with indicator cues for wide data tables
   - Removal of artificial toggle pills in favor of native CSS media queries and flex/grid responsive primitives

---

## 3. Architecture & Package Changes

### 3.1 `packages/theme`
- **`tokens.css`**: Update Google Font imports to `'Plus Jakarta Sans'` and `'Inter'`. Update all CSS variables: `--color-canvas`, `--color-surface`, `--color-text`, `--color-border`, `--color-admin-sidebar-bg`, `--color-promo-crimson`, etc.
- **`tokens.ts`**: Update TypeScript exports `colors`, `typography`, `theme` to align with the new hex codes and font families.

### 3.2 `packages/ui`
- **`Button.tsx`**: Update styles for `primary` (`#E11D48`), `secondary` (`#1E293B`), `outline` (`#E2E8F0`), `ghost`, with minimum 40px touch targets and smooth focus rings.
- **`Card.tsx`**: Clean white background `#FFFFFF`, border `#E2E8F0`, subtle shadow `0 1px 3px rgba(15, 23, 42, 0.06)`.
- **`Badge.tsx`**: Subtle pastel backgrounds with crisp text (`#ECFDF5` + `#059669`, `#FFFBEB` + `#D97706`, `#FEF2F2` + `#DC2626`).
- **`Input.tsx`**: Crisp border `#CBD5E1`, text `#0F172A`, focus ring `#E11D48`.
- **`Table.tsx`**: Responsive container wrapping `<table>` with clean header row `#F8FAFC` and zebra border `#F1F5F9`.
- **`Logo.tsx`**: Update emblem with vibrant confectionery ruby styling and sharp Plus Jakarta Sans lettering.

### 3.3 `apps/customer-web`
- Update [`WholesaleNavbar.tsx`](file:///d:/Candi%20Super%20Store%20Platform/apps/customer-web/src/components/WholesaleNavbar.tsx) with sleek white background, crisp bottom border, and responsive mobile nav.
- Update [`WholesaleCatalogHero.tsx`](file:///d:/Candi%20Super%20Store%20Platform/apps/customer-web/src/components/WholesaleCatalogHero.tsx) with modern gradient banner and pill filters.
- Update [`ProductCard.tsx`](file:///d:/Candi%20Super%20Store%20Platform/apps/customer-web/src/components/ProductCard.tsx) with crisp white cards, bold prices, and high-contrast text.
- Update [`CartDrawer.tsx`](file:///d:/Candi%20Super%20Store%20Platform/apps/customer-web/src/components/CartDrawer.tsx) and [`CheckoutModal.tsx`](file:///d:/Candi%20Super%20Store%20Platform/apps/customer-web/src/components/CheckoutModal.tsx).
- Ensure [`App.tsx`](file:///d:/Candi%20Super%20Store%20Platform/apps/customer-web/src/App.tsx) has no floating preview buttons.

### 3.4 `apps/admin-web`
- Update [`Sidebar.tsx`](file:///d:/Candi%20Super%20Store%20Platform/apps/admin-web/src/components/Sidebar.tsx) to support mobile collapsible hamburger menu and modern dark-navy slate `#0F172A`.
- Update canvas and metric cards across dashboard, tables, and reporting pages to use `#F8FAFC` and `#0F172A`.

### 3.5 `apps/customer-mobile`
- Update `App.tsx` styling and theme imports to use modern clean white `#FFFFFF`, deep slate `#0F172A`, and brand ruby `#E11D48`.

---

## 4. Verification & Testing
- Monorepo package builds:
  - `pnpm --filter @candi/theme build`
  - `pnpm --filter @candi/ui build`
  - `pnpm --filter @candi/customer-web build`
  - `pnpm --filter @candi/admin-web build`
- Validate responsive layouts on both 390px mobile viewport and 1440px desktop viewport.

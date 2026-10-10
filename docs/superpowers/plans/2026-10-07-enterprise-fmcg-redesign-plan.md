# Modern Enterprise FMCG Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the visual texture, typography, color palette, and responsiveness across the entire Candi Super Store monorepo (`packages/theme`, `packages/ui`, `apps/customer-web`, `apps/admin-web`, `apps/customer-mobile`) to a crisp Modern Enterprise FMCG aesthetic.

**Architecture:** Update foundational CSS tokens and TypeScript definitions in `@candi/theme` with Google Fonts `Plus Jakarta Sans` / `Inter` and Slate/Ruby color tokens. Update `@candi/ui` primitives (`Button`, `Card`, `Badge`, `Input`, `Table`, `Logo`). Update `apps/customer-web` to adopt the new theme, remove artificial floating buttons, and ensure full mobile-desktop responsiveness. Update `apps/admin-web` with modern slate navy sidebar, mobile drawer menu, and responsive layout. Update `apps/customer-mobile` styling.

**Tech Stack:** React 19, TypeScript 5.7, Vite 6.2, React Native (Expo), Vanilla CSS Design Tokens with Google Fonts.

**Spec:** [`docs/superpowers/specs/2026-10-07-enterprise-fmcg-redesign.md`](file:///d:/Candi%20Super%20Store%20Platform/docs/superpowers/specs/2026-10-07-enterprise-fmcg-redesign.md)

## Global Constraints
- Typography: Primary sans-serif `'Plus Jakarta Sans'`, `'Inter'`, `-apple-system`, `sans-serif`. Monospaced fonts reserved only for technical codes/IDs.
- Background: Clean `#F8FAFC` (Slate 50) and Pure White `#FFFFFF`. No muddy olive drab or beige bone.
- Text: Deep high-contrast `#0F172A` (Slate 900) for headlines, `#334155` (Slate 700) for body, `#64748B` (Slate 500) for muted metadata.
- Brand Accent: `#E11D48` (Rose/Confectionery Red) with `#10B981` (Emerald) and `#F59E0B` (Amber).
- Mobile Preview Floating Button: Permanently removed. Native responsive CSS used throughout.

---

### Task 1: Update `@candi/theme` Design Tokens and Typography

**Files:**
- Modify: `packages/theme/src/tokens.css`
- Modify: `packages/theme/src/tokens.ts`

- [ ] **Step 1: Update `packages/theme/src/tokens.css`**
Replace `SUSE Mono` and `JetBrains Mono` imports with `Plus Jakarta Sans` and `Inter`. Replace earthy/olive drab tokens with crisp Slate 50, Slate 900, Slate 200 borders, and Confectionery Red `#E11D48`.

- [ ] **Step 2: Update `packages/theme/src/tokens.ts`**
Update TypeScript export `colors` and `typography` with the corresponding values.

- [ ] **Step 3: Verify `@candi/theme` build**
Run: `pnpm --filter @candi/theme build`
Expected: PASS with exit code 0.

---

### Task 2: Redesign `@candi/ui` Primitives

**Files:**
- Modify: `packages/ui/src/Button.tsx`
- Modify: `packages/ui/src/Card.tsx`
- Modify: `packages/ui/src/Badge.tsx`
- Modify: `packages/ui/src/Input.tsx`
- Modify: `packages/ui/src/Table.tsx`
- Modify: `packages/ui/src/Logo.tsx`

- [ ] **Step 1: Update `Button.tsx`**
Refine variant colors (`primary`: `#E11D48`, `secondary`: `#1E293B`, `outline`: `#E2E8F0` border with `#0F172A` text). Ensure font-weight is 600/700, border-radius is 8px/10px, and touch targets are comfortable.

- [ ] **Step 2: Update `Card.tsx`**
Set background to `#FFFFFF`, border to `1px solid var(--color-border)` (`#E2E8F0`), and shadow to soft modern elevation `0 1px 3px rgba(15, 23, 42, 0.05)`.

- [ ] **Step 3: Update `Badge.tsx`**
Modernize status pills with soft pastel backgrounds (`#ECFDF5`, `#FFFBEB`, `#FEF2F2`) and deep readable text (`#059669`, `#D97706`, `#DC2626`).

- [ ] **Step 4: Update `Input.tsx` and `Table.tsx`**
Add clean border styling `#CBD5E1`, focus ring `#E11D48`, and responsive horizontal scroll wrapper for tables with subtle scroll hints.

- [ ] **Step 5: Update `Logo.tsx`**
Render modern vibrant confectionery badge with Plus Jakarta Sans bold lettering.

- [ ] **Step 6: Verify `@candi/ui` build**
Run: `pnpm --filter @candi/ui build`
Expected: PASS with exit code 0.

---

### Task 3: Redesign Customer Web Portal (`apps/customer-web`)

**Files:**
- Modify: `apps/customer-web/src/components/WholesaleNavbar.tsx`
- Modify: `apps/customer-web/src/components/WholesaleCatalogHero.tsx`
- Modify: `apps/customer-web/src/components/ProductCard.tsx`
- Modify: `apps/customer-web/src/components/CartDrawer.tsx`
- Modify: `apps/customer-web/src/components/CheckoutModal.tsx`
- Modify: `apps/customer-web/src/pages/WelcomePage.tsx`
- Modify: `apps/customer-web/src/pages/CustomerPortalPage.tsx`

- [ ] **Step 1: Update `WholesaleNavbar.tsx`**
Apply crisp white background `#FFFFFF`, subtle border `#E2E8F0`, deep slate typography `#0F172A`, responsive mobile menu / scrollable tab strip, and floating cart pill.

- [ ] **Step 2: Update `WholesaleCatalogHero.tsx`**
Apply modern gradient banner with deep slate and ruby accent, responsive category pill carousel, and crisp search bar.

- [ ] **Step 3: Update `ProductCard.tsx`**
Clean card with pure white background, crisp `#E2E8F0` border, deep slate titles, bold wholesale prices, and emerald profit margin indicators.

- [ ] **Step 4: Update `CartDrawer.tsx` and `CheckoutModal.tsx`**
Clean slide-over design, high contrast text, and responsive mobile bottom sheet styling.

- [ ] **Step 5: Verify `apps/customer-web` build**
Run: `pnpm --filter @candi/customer-web build`
Expected: PASS with exit code 0.

---

### Task 4: Redesign Admin Web Portal (`apps/admin-web`) & Mobile Responsiveness

**Files:**
- Modify: `apps/admin-web/src/components/Sidebar.tsx`
- Modify: `apps/admin-web/src/App.tsx`
- Modify: `apps/admin-web/src/pages/DashboardPage.tsx`

- [ ] **Step 1: Update `Sidebar.tsx`**
Apply modern dark-navy slate `#0F172A`, silver text `#94A3B8`, and active ruby accent `#E11D48`. Implement responsive mobile hamburger toggle and slide-out drawer on screens $\le 1024\text{px}$.

- [ ] **Step 2: Update `DashboardPage.tsx` & layout canvas**
Apply `#F8FAFC` canvas, crisp white metric cards, and responsive grid (`repeat(auto-fit, minmax(240px, 1fr))`).

- [ ] **Step 3: Verify `apps/admin-web` build**
Run: `pnpm --filter @candi/admin-web build`
Expected: PASS with exit code 0.

---

### Task 5: Align Customer Mobile App Theme (`apps/customer-mobile`)

**Files:**
- Modify: `apps/customer-mobile/App.tsx`

- [ ] **Step 1: Update React Native styles in `apps/customer-mobile/App.tsx`**
Replace floralWhite and oliveDrab with crisp white `#FFFFFF`, canvas `#F8FAFC`, deep slate `#0F172A`, and brand ruby `#E11D48`.

---

### Task 6: Final Full-Monorepo Build & Verification

- [ ] **Step 1: Run comprehensive build verification**
Run: `pnpm --filter @candi/theme build && pnpm --filter @candi/ui build && pnpm --filter @candi/customer-web build && pnpm --filter @candi/admin-web build`
Expected: All exit with code 0.

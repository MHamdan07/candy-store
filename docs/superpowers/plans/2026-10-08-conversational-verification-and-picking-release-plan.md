# 5-Stage WhatsApp & Tele-Sales Conversational Verification Queue and Picking Release Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete 5-Stage WhatsApp & Tele-Sales Conversational Verification Queue and Picking Release Engine in `apps/admin-web`, enabling seamless multi-channel order confirmation, live tele-sales in-call quantity adjustments, khata credit governance, and automated warehouse wave picking release with printable pick slips.

**Architecture:** Extend `@candi/types` with 5-stage workflow state machines and warehouse picking release structures (`PickingReleaseDetails`, `VerificationStage`). Enrich `apps/admin-web/src/data/conversationalVerification.ts` with comprehensive mock orders across all 5 stages, wave allocations, bin locations, and warehouse pickers. Build `PickingReleaseModal.tsx`, `PrintablePickSlipModal.tsx`, and a visual 5-Stage Stepper in `ConversationalVerificationPage.tsx`. Connect picking release status back into `OrderScreenPage.tsx`.

**Tech Stack:** React 19, TypeScript 5.7, Vite 6.2, `@candi/ui`, `@candi/types`, `@candi/theme`.

---

### Task 1: Extend Types in `@candi/types` for 5-Stage Verification and Picking Release Engine

**Files:**
- Modify: `packages/types/src/index.ts`

- [ ] **Step 1: Add `VerificationStage`, `PickingReleaseDetails`, and extended `VerificationStatus`**
Extend `VerificationStatus` with `'released_for_picking'` and `'picked'`. Define `PickingReleaseDetails` with wave ID, picker name, bin locations, priority, and manifest code. Add `stage: 1 | 2 | 3 | 4 | 5` and `pickingRelease` to `ConversationalVerificationRecord`.

- [ ] **Step 2: Verify `@candi/types` compiles cleanly**
Run: `pnpm --filter @candi/types build`
Expected: PASS with exit code 0.

---

### Task 2: Enrich Verification & Picking Release Data Engine in `admin-web`

**Files:**
- Modify: `apps/admin-web/src/data/conversationalVerification.ts`

- [ ] **Step 1: Add Warehouse Wave definitions, Warehouse Pickers, and FMCG Bin Locations**
Define `WAREHOUSE_WAVES`, `WAREHOUSE_PICKERS`, and default bin mappings for SKUs.
Update `INITIAL_VERIFICATION_RECORDS` to cover all 5 stages:
- Stage 1: Outbound WhatsApp Sent / Delivered / Awaiting reply with active SLA timer
- Stage 2: Retailer reply / Triage (Change requested / Urgency)
- Stage 3: Tele-sales escalation (Breached SLA, live call pending, in-call quantity adjustment)
- Stage 4: Khata credit verified & pending warehouse release
- Stage 5: Released for warehouse picking with wave ID, picker, and FMCG bin allocations.
Update `calculateVerificationKpis` to calculate stage-by-stage counts, ready-for-release count, and warehouse release metrics.

---

### Task 3: Build Picking Release Engine & Printable Pick Slip Components

**Files:**
- Create: `apps/admin-web/src/pages/tele-sales/PickingReleaseModal.tsx`
- Create: `apps/admin-web/src/pages/tele-sales/PrintablePickSlipModal.tsx`

- [ ] **Step 1: Build `PickingReleaseModal.tsx`**
Provide wave selection (Zone 1 Morning, Zone 2 Afternoon, etc.), warehouse picker assignment, picking priority (Standard / Express / Urgent), bin rack allocation preview, and "Confirm Wave & Release to Floor" action.

- [ ] **Step 2: Build `PrintablePickSlipModal.tsx`**
Provide a clean FMCG warehouse pick slip format with SKU barcodes, bin/bay locations, carton/box quantities, verified lines, picker checkboxes, signature blocks, and window.print() support.

---

### Task 4: Re-architect `ConversationalVerificationPage.tsx` with Interactive 5-Stage Pipeline

**Files:**
- Modify: `apps/admin-web/src/pages/tele-sales/ConversationalVerificationPage.tsx`

- [ ] **Step 1: Implement visual 5-Stage Pipeline Status Stepper**
Add interactive 5-stage progress bar showing Stage 1 (WhatsApp Dispatch), Stage 2 (Retailer Reply), Stage 3 (Tele-Sales Escalation), Stage 4 (Credit & Verification), and Stage 5 (Picking Release). Allow filtering orders by stage.

- [ ] **Step 2: Implement Khata Credit Validation Gate in Stage 4**
In the detail modal, add a dedicated "Credit & Khata Sign-Off" tab with real-time balance vs limit visualization, credit risk badge, payment term confirmation, and "Sign Off & Move to Picking Release".

- [ ] **Step 3: Integrate Picking Release Engine tab and Batch Release**
Add a dedicated "Warehouse Picking Release" tab in the page. Allow selecting single or multiple verified orders to assign wave and picker, release to warehouse floor, and generate printable pick slips.

---

### Task 5: Synchronize with `OrderScreenPage.tsx` and Navigation

**Files:**
- Modify: `apps/admin-web/src/pages/OrderScreenPage.tsx`
- Modify: `apps/admin-web/src/components/Sidebar.tsx`

- [ ] **Step 1: Update `OrderScreenPage.tsx`**
Display `released_for_picking` badge, assigned wave & picker, and "View Pick Slip" / "Verification Dossier" action linking directly to the verification engine.

- [ ] **Step 2: Update `Sidebar.tsx` badge and naming**
Ensure "Conversational Queue & Picking Release" is clearly indicated with live queue count badge.

---

### Task 6: Verify Build & End-to-End Monorepo Check

- [ ] **Step 1: Run TypeScript and Vite build on `apps/admin-web`**
Run: `pnpm --filter @candi/admin-web build`
Expected: PASS with exit code 0.

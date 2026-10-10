# Last-Mile Fleet Logistics, Beat Route Clustering, and Vehicle Trip Manifest Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the comprehensive Last-Mile Fleet Logistics, Beat Route Clustering, and Vehicle Trip Manifest Console in `apps/admin-web`, providing delivery fleet vehicle/driver management, intelligent beat route clustering, trip dispatch execution, live driver delivery tracking with COD cash collection recording, and printable vehicle loading manifests.

**Architecture:** Extend `@candi/types` with fleet and last-mile delivery domain contracts (`DeliveryVehicle`, `DeliveryDriver`, `BeatRouteCluster`, `TripManifest`, `TripDeliveryStop`). Implement a comprehensive fleet logistics data engine in `apps/admin-web/src/data/fleetLogisticsData.ts`. Build the interactive `FleetConsolePage.tsx`, `BeatClusteringModal.tsx`, `TripExecutionDrawer.tsx`, and `PrintableTripManifestModal.tsx`. Register routes in `App.tsx` and integrate into `Sidebar.tsx`.

**Tech Stack:** React 19, TypeScript 5.7, Vite 6.2, `@candi/ui`, `@candi/types`, `@candi/theme`.

---

### Task 1: Define Fleet Logistics & Route Clustering Types in `@candi/types`

**Files:**
- Modify: `packages/types/src/index.ts`

- [ ] **Step 1: Add Fleet Logistics, Vehicle, Driver, Beat Route, and Trip Manifest types**
Add `VehicleType`, `VehicleStatus`, `DeliveryVehicle`, `DeliveryDriver`, `BeatRoute`, `TripManifestStatus`, `StopDeliveryStatus`, `TripDeliveryStop`, `TripManifest`, and `FleetKpis`.

- [ ] **Step 2: Build `@candi/types` and verify compilation**
Run: `pnpm --filter @candi/types build`
Expected: PASS with exit code 0.

---

### Task 2: Build Fleet Logistics Data Engine & Route Clustering Mock Service

**Files:**
- Create: `apps/admin-web/src/data/fleetLogisticsData.ts`

- [ ] **Step 1: Create mock vehicles, drivers, beat routes, and trip manifests**
Add 5 distribution vehicles (Suzuki Bolan, Shehzore 1-ton, Mazda Titan, etc.), driver roster with CNIC/license details, 5 FMCG commercial beat routes across Karachi, initial active/completed trip manifests with realistic delivery stops, and KPI calculator function.

---

### Task 3: Build Modal & Drawer Components for Trip Manifest Console

**Files:**
- Create: `apps/admin-web/src/pages/delivery/BeatClusteringModal.tsx`
- Create: `apps/admin-web/src/pages/delivery/TripExecutionDrawer.tsx`
- Create: `apps/admin-web/src/pages/delivery/PrintableTripManifestModal.tsx`

- [ ] **Step 1: Create `BeatClusteringModal.tsx`**
Allows selecting an FMCG Beat Route, assigning an available vehicle and driver, clustering picked orders into sequenced stops, verifying vehicle payload utilization (weight & carton volume limit), and dispatching a new Trip Manifest.

- [ ] **Step 2: Create `TripExecutionDrawer.tsx`**
Live operational control center for an active trip: view sequenced stops, simulate stop arrival, mark delivery completed with COD cash collected, record customer signature/proof of delivery, and simulate return to depot.

- [ ] **Step 3: Create `PrintableTripManifestModal.tsx`**
Official vehicle loading manifest and delivery sheet with barcode, loading gate summary, stop sequence table, COD expected collection column, and signature sign-off blocks with `window.print()` support.

---

### Task 4: Build Main Fleet & Trip Manifest Console Page

**Files:**
- Create: `apps/admin-web/src/pages/delivery/FleetConsolePage.tsx`

- [ ] **Step 1: Implement KPI metric cards, tabs, and filters**
Fleet status KPIs (Active Trips In Transit, Staged for Loading, Delivery Completion Rate, Total COD Cash Collected Today, Fleet Capacity Utilization %). Tabs for "All Trips", "In Transit", "Staged Loading", "Completed / Reconciled", "Fleet Vehicles", and "Beat Routes".

- [ ] **Step 2: Implement Trip Manifests table, Fleet Vehicle roster, and Beat Route directory**
Rich interactive tables with live status badges, vehicle capacity meters, driver assignments, and one-click actions ("Open Live Console", "Print Manifest", "Create Clustered Trip", "Dispatch to Road").

---

### Task 5: Register Routes, TopNav Meta, and Update Sidebar Navigation

**Files:**
- Modify: `apps/admin-web/src/App.tsx`
- Modify: `apps/admin-web/src/components/Sidebar.tsx`

- [ ] **Step 1: Add `/delivery/fleet-console` route in `App.tsx`**
Add page metadata and protected route element for `FleetConsolePage`.

- [ ] **Step 2: Update `Sidebar.tsx` navigation entries**
Add dedicated `FLEET & LAST-MILE DELIVERY` section in `Sidebar.tsx` with `Trip Manifest Console`, linking directly to the new page.

---

### Task 6: Full Verification & Monorepo Build Check

- [ ] **Step 1: Run comprehensive build verification**
Run: `pnpm -r --filter "@candi/types" --filter "@candi/ui" --filter "@candi/admin-web" build`
Expected: PASS with exit code 0.

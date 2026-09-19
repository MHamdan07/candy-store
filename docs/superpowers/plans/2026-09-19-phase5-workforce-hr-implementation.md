# Phase 5: Users, HR & Workforce Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the comprehensive enterprise Users, HR, Attendance, Shifts, Payroll, and Workforce Management suite (Phases 5A, 5B, 5C, 5D) for the Candi Super Store Platform.

**Architecture:** Extend `@candi/types` with full workforce domain models, enhance `@candi/auth` with a dynamic 10-module RBAC permissions engine and live role-switcher, provide governance validation rules in `@candi/validation`, and implement a unified Workforce & HR management hub in `apps/admin-web` with 13 rich operational screens, strict segregation of duties, confidential compensation protection, and immutable audit trails.

**Tech Stack:** React 18, TypeScript, React Router 6, Vite, Vanilla CSS design system tokens (`@candi/theme`), Vitest / Node test runner.

**Spec:** [`docs/superpowers/specs/2026-09-19-phase5-workforce-hr-design.md`](file:///d:/Candi%20Super%20Store%20Platform/docs/superpowers/specs/2026-09-19-phase5-workforce-hr-design.md)

## Global Constraints

- **Strict Role-Based Confidentiality:** Salary metrics must never be displayed to roles lacking explicit payroll permissions (masked as `•••••••• PKR`).
- **No Shared Accounts:** Enforce unique employee ID and phone/CNIC binding.
- **Two-Tier Maker-Checker:** New employee onboarding requires separate review and activation sign-off.
- **Segregation of Duties:** Employees cannot approve their own leaves or overtime.
- **Audit Logging:** Every status change, manual attendance override, leave review, payroll approval, and permission update must produce an immutable audit log entry with actor and timestamp.
- **Soft-Delete Only:** Employee master profiles and financial records cannot be hard-deleted from normal user interfaces.

---

### Task 1: Core Type Definitions & Domain Contracts (`packages/types`)

**Files:**
- Modify: `packages/types/src/index.ts`

**Interfaces:**
- Produces: `DepartmentType`, `EmploymentType`, `EmployeeWorkflowStatus`, `EmergencyContact`, `Employee`, `SystemModule`, `ModulePermissions`, `RoleDefinition`, `DayOfWeek`, `WorkShift`, `AttendanceStatus`, `AttendanceRecord`, `LeaveType`, `LeaveApprovalStatus`, `LeaveRequest`, `EmployeeLeaveBalance`, `SalaryStructureType`, `AllowanceItem`, `DeductionItem`, `EmployeeCompensation`, `PayrollPeriodStatus`, `PayrollPeriod`, `PayrollEntry`, `EmployeeDocument`, `PerformanceReviewStatus`, `PerformanceGoal`, `PerformanceReview`, `TrainingRecord`, `WorkforceAuditRecord`.

- [ ] **Step 1: Append Phase 5 domain interfaces to `packages/types/src/index.ts`**
- [ ] **Step 2: Verify type exports by running build or type-check on `packages/types`**
- [ ] **Step 3: Commit changes**
```bash
git add packages/types/src/index.ts
git commit -m "feat(types): add Phase 5 Users, HR, Attendance and Payroll domain contracts"
```

---

### Task 2: RBAC Engine, Permission Gate & Live Role Switcher (`packages/auth`)

**Files:**
- Modify: `packages/auth/src/client.ts`
- Modify: `packages/auth/src/context.tsx`
- Modify: `packages/auth/src/index.ts`

**Interfaces:**
- Consumes: `StaffRoleName`, `SystemModule`, `ModulePermissions`, `RoleDefinition` from `@candi/types`
- Produces: `usePermissions()` hook with helper checks (`hasPermission`, `canViewCompensation`, `canApproveLeave`, `canApprovePayroll`, `canOverrideAttendance`, `switchRole`), and `PermissionGate` component.

- [ ] **Step 1: Implement default role permission matrix and dynamic role switching in `packages/auth`**
- [ ] **Step 2: Export `usePermissions` and `PermissionGate`**
- [ ] **Step 3: Verify auth package compilation**
- [ ] **Step 4: Commit changes**
```bash
git add packages/auth/src/
git commit -m "feat(auth): implement 10-module RBAC engine and PermissionGate"
```

---

### Task 3: Workforce Validation & Governance Rules (`packages/validation`)

**Files:**
- Create: `packages/validation/src/workforceControls.ts`
- Modify: `packages/validation/src/index.ts`

**Interfaces:**
- Consumes: Workforce types from `@candi/types`
- Produces: `validateEmployeeOnboarding`, `validateLeaveRequest`, `validateAttendanceOverride`, `validateOvertimeApproval`, `validatePayrollCalculation`.

- [ ] **Step 1: Write validation functions for employee creation, leave rules, attendance overrides, and payroll calculations**
- [ ] **Step 2: Export from `packages/validation/src/index.ts`**
- [ ] **Step 3: Commit changes**
```bash
git add packages/validation/src/
git commit -m "feat(validation): add workforce governance and approval validation rules"
```

---

### Task 4: Comprehensive Mock Data & State Store (`apps/admin-web`)

**Files:**
- Create: `apps/admin-web/src/data/workforceData.ts`

**Interfaces:**
- Consumes: All Phase 5 types from `@candi/types`
- Produces: Seed datasets for employees, shifts, attendance records, leave requests, compensations, payroll periods, performance reviews, training programs, and workforce audit records.

- [ ] **Step 1: Create `workforceData.ts` with realistic Pakistani confectionery enterprise personas across all statuses**
- [ ] **Step 2: Include mock helper functions for state updates (approve employee, punch override, leave review, payroll batch calculation)**
- [ ] **Step 3: Commit changes**
```bash
git add apps/admin-web/src/data/workforceData.ts
git commit -m "feat(admin-web): add seed data and state store for Phase 5 workforce domain"
```

---

### Task 5: Workforce Command Dashboard (`apps/admin-web`)

**Files:**
- Create: `apps/admin-web/src/pages/workforce/WorkforceDashboardPage.tsx`

**Interfaces:**
- Consumes: `workforceData.ts`, `usePermissions()`

- [ ] **Step 1: Build `WorkforceDashboardPage.tsx` featuring real-time headcount, today's attendance summary, shift coverage gauges, pending action banners, and attendance donut/bar widgets**
- [ ] **Step 2: Add quick navigation links to pending approvals**
- [ ] **Step 3: Commit changes**
```bash
git add apps/admin-web/src/pages/workforce/WorkforceDashboardPage.tsx
git commit -m "feat(admin-web): build Workforce Command Dashboard"
```

---

### Task 6: Employee Directory & Maker-Checker Onboarding Wizard (`apps/admin-web`)

**Files:**
- Create: `apps/admin-web/src/pages/workforce/EmployeeListPage.tsx`

**Interfaces:**
- Consumes: `workforceData.ts`, `validateEmployeeOnboarding`

- [ ] **Step 1: Implement searchable, filterable employee table with department, location, and workflow status tabs**
- [ ] **Step 2: Implement 4-step "New Employee" onboarding wizard modal with 2-Tier Maker-Checker submission**
- [ ] **Step 3: Commit changes**
```bash
git add apps/admin-web/src/pages/workforce/EmployeeListPage.tsx
git commit -m "feat(admin-web): build Employee Directory and Maker-Checker onboarding wizard"
```

---

### Task 7: Employee 360° HR Profile Dossier (`apps/admin-web`)

**Files:**
- Create: `apps/admin-web/src/pages/workforce/EmployeeProfilePage.tsx`

**Interfaces:**
- Consumes: `workforceData.ts`, `usePermissions()`

- [ ] **Step 1: Build employee header with lifecycle actions (`Approve`, `Suspend`, `Deactivate`, `Reactivate`, `Change Role`)**
- [ ] **Step 2: Build 8-tab dossier layout (Overview, Attendance, Leaves, Confidential Payroll, Performance, Training, Documents, Audit Trail)**
- [ ] **Step 3: Apply salary masking for unauthorized roles**
- [ ] **Step 4: Commit changes**
```bash
git add apps/admin-web/src/pages/workforce/EmployeeProfilePage.tsx
git commit -m "feat(admin-web): build Employee 360 HR Profile Dossier with RBAC masking"
```

---

### Task 8: Shift Rostering & Scheduling Hub (`apps/admin-web`)

**Files:**
- Create: `apps/admin-web/src/pages/workforce/ShiftManagementPage.tsx`

**Interfaces:**
- Consumes: `workforceData.ts`

- [ ] **Step 1: Create shift definition cards with working days, hours, and break durations**
- [ ] **Step 2: Build employee rostering assignment drawer with shift coverage indicators**
- [ ] **Step 3: Commit changes**
```bash
git add apps/admin-web/src/pages/workforce/ShiftManagementPage.tsx
git commit -m "feat(admin-web): build Shift Rostering and Scheduling hub"
```

---

### Task 9: Daily Attendance Register & Override Modal (`apps/admin-web`)

**Files:**
- Create: `apps/admin-web/src/pages/workforce/AttendanceRegisterPage.tsx`

**Interfaces:**
- Consumes: `workforceData.ts`, `validateAttendanceOverride`, `validateOvertimeApproval`

- [ ] **Step 1: Build daily attendance table with punch times, working hours, late minutes, and overtime**
- [ ] **Step 2: Implement 1-click overtime approval with supervisor verification**
- [ ] **Step 3: Implement manual punch override modal requiring written justification and logging to audit trail**
- [ ] **Step 4: Commit changes**
```bash
git add apps/admin-web/src/pages/workforce/AttendanceRegisterPage.tsx
git commit -m "feat(admin-web): build Daily Attendance Register with reason-backed overrides"
```

---

### Task 10: Leave Management & Approval Queue (`apps/admin-web`)

**Files:**
- Create: `apps/admin-web/src/pages/workforce/LeaveManagementPage.tsx`

**Interfaces:**
- Consumes: `workforceData.ts`, `validateLeaveRequest`

- [ ] **Step 1: Create leave request modal with self-approval prevention checks**
- [ ] **Step 2: Build manager approval queue with conflict detection alerts**
- [ ] **Step 3: Connect 1-click approval/rejection to automatically update the attendance register**
- [ ] **Step 4: Commit changes**
```bash
git add apps/admin-web/src/pages/workforce/LeaveManagementPage.tsx
git commit -m "feat(admin-web): build Leave Management and approval queue"
```

---

### Task 11: Payroll Register, Processing Pipeline & Payslip Viewer (`apps/admin-web`)

**Files:**
- Create: `apps/admin-web/src/pages/workforce/PayrollRegisterPage.tsx`
- Create: `apps/admin-web/src/pages/workforce/PayslipViewPage.tsx`

**Interfaces:**
- Consumes: `workforceData.ts`, `usePermissions()`

- [ ] **Step 1: Implement 5-stage payroll workflow bar and automated calculation engine**
- [ ] **Step 2: Build dual sign-off approval modal and bank disbursement recording**
- [ ] **Step 3: Implement branded, printable Candi Super Store payslip template (`PayslipViewPage.tsx`)**
- [ ] **Step 4: Implement non-destructive payroll adjustment/reversal modal**
- [ ] **Step 5: Commit changes**
```bash
git add apps/admin-web/src/pages/workforce/PayrollRegisterPage.tsx apps/admin-web/src/pages/workforce/PayslipViewPage.tsx
git commit -m "feat(admin-web): build Payroll Register, 5-stage pipeline and printable Payslips"
```

---

### Task 12: Performance Reviews & Training Matrix (`apps/admin-web`)

**Files:**
- Create: `apps/admin-web/src/pages/workforce/PerformanceReviewPage.tsx`
- Create: `apps/admin-web/src/pages/workforce/TrainingSkillsPage.tsx`

**Interfaces:**
- Consumes: `workforceData.ts`

- [ ] **Step 1: Build 6-stage performance review cycle management and appraisal scorecard**
- [ ] **Step 2: Build training programs tracker with certification renewals and skills inventory**
- [ ] **Step 3: Commit changes**
```bash
git add apps/admin-web/src/pages/workforce/PerformanceReviewPage.tsx apps/admin-web/src/pages/workforce/TrainingSkillsPage.tsx
git commit -m "feat(admin-web): build Performance Management and Training matrix"
```

---

### Task 13: 10 Enterprise Workforce & HR Reports (`apps/admin-web`)

**Files:**
- Create: `apps/admin-web/src/pages/workforce/WorkforceReportsPage.tsx`

**Interfaces:**
- Consumes: `workforceData.ts`

- [ ] **Step 1: Build interactive report switcher for all 10 statutory/management workforce reports**
- [ ] **Step 2: Provide summary metrics, tabular drill-downs, and print/export utilities**
- [ ] **Step 3: Commit changes**
```bash
git add apps/admin-web/src/pages/workforce/WorkforceReportsPage.tsx
git commit -m "feat(admin-web): build 10 Enterprise Workforce and HR Reports"
```

---

### Task 14: 10-Module RBAC Matrix Manager & Workforce Audit Trail (`apps/admin-web`)

**Files:**
- Create: `apps/admin-web/src/pages/workforce/RolePermissionsPage.tsx`
- Create: `apps/admin-web/src/pages/workforce/WorkforceAuditTrailPage.tsx`
- Modify: `apps/admin-web/src/components/TopNav.tsx`

**Interfaces:**
- Consumes: `workforceData.ts`, `usePermissions()`

- [ ] **Step 1: Implement interactive 10-module permission matrix editor with live permission toggles**
- [ ] **Step 2: Add quick role impersonator switcher to `TopNav.tsx`**
- [ ] **Step 3: Build centralized Workforce Audit Trail with search, actor stamps, and state diffs**
- [ ] **Step 4: Commit changes**
```bash
git add apps/admin-web/src/pages/workforce/RolePermissionsPage.tsx apps/admin-web/src/pages/workforce/WorkforceAuditTrailPage.tsx apps/admin-web/src/components/TopNav.tsx
git commit -m "feat(admin-web): build 10-Module RBAC Matrix, TopNav role switcher, and Audit Trail"
```

---

### Task 15: Sidebar Navigation Integration & Route Guards (`apps/admin-web`)

**Files:**
- Modify: `apps/admin-web/src/components/Sidebar.tsx`
- Modify: `apps/admin-web/src/App.tsx`

**Interfaces:**
- Consumes: All workforce pages, `usePermissions()`, `PermissionGate`

- [ ] **Step 1: Integrate "WORKFORCE & HR" section in `Sidebar.tsx` with dynamic permission visibility**
- [ ] **Step 2: Register all 13 workforce routes in `App.tsx`**
- [ ] **Step 3: Apply dynamic module protection across Dashboard, Sales, Customers, Inventory, Procurement, Suppliers, Delivery, Finance, Reports, Administration**
- [ ] **Step 4: Run full project type-check and Vite build to confirm 0 compilation errors**
- [ ] **Step 5: Commit changes**
```bash
git add apps/admin-web/src/components/Sidebar.tsx apps/admin-web/src/App.tsx
git commit -m "feat(admin-web): integrate Workforce & HR routing and 10-module RBAC guards"
```

---

## Plan Self-Review Checklist
- [x] **Spec Coverage:** Implements all requirements from Phases 5A, 5B, 5C, and 5D.
- [x] **No Placeholders:** Every task lists exact files, interfaces, and concrete action steps.
- [x] **Type Consistency:** Domain model types align between packages/types, validation, auth, and admin-web.

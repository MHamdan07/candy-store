# Phase 5: Users, HR & Workforce Management System Design

**Document ID:** SPEC-2026-PHASE-5  
**Version:** 1.0.0  
**Date:** 2026-09-19  
**Status:** Approved for Implementation Planning  
**Target Applications:** `apps/admin-web`, `packages/types`, `packages/auth`, `packages/validation`  

---

## 1. Executive Summary & Objective

Phase 5 establishes the comprehensive human resources, access control, attendance, payroll, and workforce governance layer for the **Candi Super Store Platform**. As a high-volume confectionery and FMCG wholesale enterprise with warehouses, distribution depots, field delivery fleets, and accounting centers, the business requires stringent operational security, reliable workforce scheduling, controlled salary confidentiality, and a full audit trail.

This specification unifies all four sub-phases into an integrated architectural system:
* **Phase 5A — User & Employee Management:** Unique employee/user IDs, departments, job titles, reporting hierarchy, employment lifecycle workflows (New → Pending Approval → Active → Suspended → Inactive), and 10-module RBAC permissions enforcement across Dashboard, Sales, Customers, Inventory, Procurement, Suppliers, Delivery, Finance, Reports, and Administration.
* **Phase 5B — Attendance, Shifts & Workforce Operations:** Daily biometric/clock-in tracking, working hours, punctuality tracking (late arrival, early departure), overtime authorization, shift definitions, employee rostering, multi-day leave workflows with automatic attendance syncing, and the real-time Workforce Command Dashboard.
* **Phase 5C — Payroll & Employee Financial Records:** Confidential compensation structures (basic salary, allowances, statutory/internal deductions, overtime multipliers), 5-stage payroll processing pipeline (Attendance Sync → Calculation → Maker-Checker Review → Approval → GL Posting → Bank Disbursement), payslip generation, and non-destructive adjustment/reversal controls.
* **Phase 5D — HR Records, Performance & Workforce Reporting:** Complete 360° Employee HR profiles (personal, contracts, training history, attendance, leaves, payroll history, notes), structured 6-stage performance review cycle, technical training & skill tracking, soft-delete data protection, and 10 enterprise workforce analytics reports.

---

## 2. Core Architecture & System Boundaries

```
+----------------------------------------------------------------------------------------------------+
|                                    CANDI ADMIN WEB PLATFORM                                        |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  [ TOP NAVIGATION ]  Live Role Switcher | Active User Profile | Notification Alerts                |
|                                                                                                    |
|  [ SIDEBAR (10 MODULES) ]                                                                          |
|  1. Dashboard       6. Suppliers                                                                   |
|  2. Sales           7. Delivery                                                                    |
|  3. Customers       8. Finance & Ledgers                                                           |
|  4. Inventory       9. Intelligence & Reports                                                      |
|  5. Procurement    10. Workforce & Administration                                                  |
|                                                                                                    |
|  +-----------------------------------------------------------------------------------------------+ |
|  | WORKFORCE & HR MODULE SUITE                                                                   | |
|  |                                                                                               | |
|  |  [Workforce Dashboard]   --> Real-time Headcount, Today's Attendance, Overtime, Exceptions    | |
|  |  [Employee Directory]    --> Search, Filters, 2-Tier Maker-Checker Onboarding Wizard          | |
|  |  [Employee 360° Profile] --> Overview, Employment, Attendance, Leaves, Payroll, Docs, Audit   | |
|  |  [Shift Management]      --> Shift Definitions, Timing, Days, Roster Assignment Drawer        | |
|  |  [Attendance Register]   --> Daily Log, Check-in/out, Reason-backed Manual Overrides          | |
|  |  [Leave Center]          --> Request Portal, Balances, Manager Approval Queue                 | |
|  |  [Payroll Register]      --> Period Batch, Auto Calculation, Dual Sign-off, Bank Pay Out      | |
|  |  [Payslip Generator]     --> Official Confectionery Wholesale Format, Export/Print            | |
|  |  [Performance Reviews]   --> KPI Metrics, Goal Setting, Manager Appraisal, Feedback           | |
|  |  [Training & Skills]     --> Certification Log, Skills Inventory, Expiry Tracking            | |
|  |  [10 Workforce Reports]  --> Headcount, Attendance, Leaves, Overtime, Turnover, Staffing     | |
|  |  [RBAC Matrix Manager]   --> 10-Module Permission Matrix, Action Switches, Custom Roles       | |
|  |  [Workforce Audit Log]   --> Tamper-evident Audit Trail for Accounts, Access, Attendance      | |
|  +-----------------------------------------------------------------------------------------------+ |
|                                                                                                    |
|  +-----------------------------------+   +-------------------------------------------------------+ |
|  | @candi/auth (RBAC & Guards)       |   | @candi/types (Domain Interfaces & Enums)              | |
|  | - usePermissions() Hook           |   | - Employee, Shift, AttendanceRecord, LeaveRequest     | |
|  | - PermissionGate Component        |   | - EmployeeCompensation, PayrollPeriod, PayrollEntry   | |
|  | - Sensitive Action Guards         |   | - PerformanceReview, TrainingRecord, WorkforceReport  | |
|  +-----------------------------------+   +-------------------------------------------------------+ |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Data Models & Type Specifications (`packages/types`)

### 3.1 Employee & Organization Models (Phase 5A)

```typescript
export type DepartmentType =
  | 'sales'
  | 'warehouse'
  | 'procurement'
  | 'finance'
  | 'delivery'
  | 'operations'
  | 'administration';

export type EmploymentType =
  | 'full_time'
  | 'part_time'
  | 'contract'
  | 'probation';

export type EmployeeWorkflowStatus =
  | 'new'
  | 'pending_approval'
  | 'active'
  | 'suspended'
  | 'inactive'
  | 'archived';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Employee {
  id: string; // e.g. "EMP-1001"
  employeeCode: string; // e.g. "CS-01001"
  fullName: string;
  phone: string;
  email: string;
  cnic: string; // Pakistani National Identity Card: 42101-XXXXXXX-X
  department: DepartmentType;
  jobTitle: string;
  employmentStatus: EmploymentType;
  workflowStatus: EmployeeWorkflowStatus;
  joiningDate: string; // YYYY-MM-DD
  assignedLocationId: string; // Warehouse or depot identifier
  assignedLocationName: string;
  managerId?: string;
  managerName?: string;
  emergencyContact: EmergencyContact;
  address: string;
  userAccountId?: string; // Linked system login
  role: StaffRoleName;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  suspendedReason?: string;
  inactiveReason?: string;
  updatedAt: string;
}
```

### 3.2 10-Module RBAC Permissions Matrix

```typescript
export type SystemModule =
  | 'dashboard'
  | 'sales'
  | 'customers'
  | 'inventory'
  | 'procurement'
  | 'suppliers'
  | 'delivery'
  | 'finance'
  | 'reports'
  | 'administration';

export interface ModulePermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  approve: boolean;
  delete: boolean;
}

export interface RoleDefinition {
  id: string;
  roleName: StaffRoleName;
  displayName: string;
  description: string;
  isSystemRole: boolean; // Immutable template vs custom role
  isSensitive: boolean; // Requires dual-authorization to assign
  permissions: Record<SystemModule, ModulePermissions>;
  assignedEmployeeCount: number;
}
```

### 3.3 Shift & Scheduling Models (Phase 5B)

```typescript
export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface WorkShift {
  id: string; // e.g. "SHIFT-01"
  shiftName: string; // e.g. "Morning Logistics & Dispatch"
  startTime: string; // "07:30"
  endTime: string; // "16:30"
  breakDurationMinutes: number; // 60
  workingDays: DayOfWeek[];
  location: string;
  assignedEmployeeIds: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}
```

### 3.4 Attendance & Time-Tracking Models (Phase 5B)

```typescript
export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'late'
  | 'half_day'
  | 'leave'
  | 'off_day';

export interface AttendanceRecord {
  id: string; // "ATT-20260919-EMP1001"
  employeeId: string;
  employeeName: string;
  department: DepartmentType;
  date: string; // "YYYY-MM-DD"
  shiftId: string;
  shiftName: string;
  checkInTime?: string; // "07:45"
  checkOutTime?: string; // "16:35"
  workingHours: number; // 8.8
  lateArrivalMinutes: number; // 15
  earlyDepartureMinutes: number; // 0
  overtimeHours: number; // 0.8
  overtimeApproved: boolean;
  overtimeApprovedBy?: string;
  status: AttendanceStatus;
  isManualEdit: boolean;
  editReason?: string;
  editedBy?: string;
  editedAt?: string;
  notes?: string;
}
```

### 3.5 Leave Management Models (Phase 5B)

```typescript
export type LeaveType =
  | 'annual'
  | 'casual'
  | 'sick'
  | 'maternity'
  | 'unpaid'
  | 'emergency';

export type LeaveApprovalStatus =
  | 'submitted'
  | 'manager_review'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export interface LeaveRequest {
  id: string; // "LV-2026-001"
  employeeId: string;
  employeeName: string;
  department: DepartmentType;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  supportingDocumentUrl?: string;
  status: LeaveApprovalStatus;
  approverId?: string;
  approverName?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  attendanceUpdated: boolean;
  createdAt: string;
}

export interface EmployeeLeaveBalance {
  employeeId: string;
  year: number;
  annualTotal: number;
  annualUsed: number;
  casualTotal: number;
  casualUsed: number;
  sickTotal: number;
  sickUsed: number;
}
```

### 3.6 Compensation & Payroll Models (Phase 5C)

```typescript
export type SalaryStructureType = 'monthly_salaried' | 'daily_wage' | 'hourly';

export interface AllowanceItem {
  id: string;
  type: 'house_rent' | 'conveyance' | 'medical' | 'food' | 'special_duty' | 'performance_bonus';
  title: string;
  amountPKR: number;
  isTaxable: boolean;
}

export interface DeductionItem {
  id: string;
  type: 'income_tax' | 'eobi' | 'provident_fund' | 'advance_loan' | 'late_fine' | 'unpaid_leave';
  title: string;
  amountPKR: number;
}

export interface EmployeeCompensation {
  id: string;
  employeeId: string;
  salaryStructure: SalaryStructureType;
  basicSalaryPKR: number;
  allowances: AllowanceItem[];
  standardDeductions: DeductionItem[];
  overtimeHourlyRatePKR: number;
  paymentMethod: 'bank_transfer' | 'cheque' | 'cash';
  bankName?: string;
  accountTitle?: string;
  accountNumber?: string;
  effectiveDate: string;
  payrollStatus: 'active' | 'on_hold' | 'suspended';
  updatedAt: string;
}

export type PayrollPeriodStatus =
  | 'draft'
  | 'calculating'
  | 'under_review'
  | 'approved'
  | 'posted'
  | 'disbursed'
  | 'closed';

export interface PayrollPeriod {
  id: string; // "PAY-2026-09"
  periodCode: string; // "SEP-2026"
  startDate: string;
  endDate: string;
  status: PayrollPeriodStatus;
  totalGrossPKR: number;
  totalDeductionsPKR: number;
  totalNetPayPKR: number;
  employeeCount: number;
  calculatedBy?: string;
  calculatedAt?: string;
  reviewedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  postedBy?: string;
  postedAt?: string;
}

export interface PayrollEntry {
  id: string; // "PAY-ENTRY-001"
  payrollPeriodId: string;
  employeeId: string;
  employeeName: string;
  department: DepartmentType;
  jobTitle: string;
  daysInPeriod: number;
  daysPresent: number;
  daysApprovedLeave: number;
  daysUnpaidLeave: number;
  lateDeductionsPKR: number;
  approvedOvertimeHours: number;
  overtimePayPKR: number;
  basicSalaryPKR: number;
  totalAllowancesPKR: number;
  grossPayPKR: number;
  taxDeductionPKR: number;
  eobiDeductionPKR: number;
  otherDeductionsPKR: number;
  totalDeductionsPKR: number;
  netPayPKR: number;
  approvalStatus: 'pending' | 'approved' | 'adjusted' | 'rejected';
  paymentStatus: 'unpaid' | 'processing' | 'paid';
  paymentReference?: string;
  paidAt?: string;
  isAdjusted: boolean;
  adjustmentNotes?: string;
}
```

### 3.7 HR Profile, Performance & Training Models (Phase 5D)

```typescript
export interface EmployeeDocument {
  id: string;
  title: string;
  docType: 'cnic_copy' | 'employment_contract' | 'academic_degree' | 'driving_license' | 'medical_fitness' | 'other';
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
  fileSizeBytes: number;
}

export type PerformanceReviewStatus =
  | 'created'
  | 'goals_submitted'
  | 'manager_review'
  | 'employee_feedback'
  | 'finalized'
  | 'follow_up';

export interface PerformanceGoal {
  id: string;
  description: string;
  metric: string;
  target: string;
  achieved?: string;
  rating?: 1 | 2 | 3 | 4 | 5; // 1: Unsatisfactory, 5: Outstanding
}

export interface PerformanceReview {
  id: string;
  reviewPeriod: string; // e.g. "Q3-2026"
  employeeId: string;
  employeeName: string;
  department: DepartmentType;
  managerId: string;
  managerName: string;
  goals: PerformanceGoal[];
  overallRating: number; // 1.0 to 5.0
  managerComments: string;
  employeeComments?: string;
  reviewStatus: PerformanceReviewStatus;
  followUpActions?: string[];
  finalizedAt?: string;
  createdAt: string;
}

export interface TrainingRecord {
  id: string;
  programTitle: string;
  employeeId: string;
  employeeName: string;
  trainingDate: string;
  provider: string; // e.g. "Sindh Food Authority", "Lahore Safety Council", "In-house ERP Team"
  completionStatus: 'scheduled' | 'in_progress' | 'completed' | 'expired';
  certificateNumber?: string;
  skillsAcquired: string[];
  expiryDate?: string;
  notes?: string;
}

export interface WorkforceAuditRecord {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  action:
    | 'employee_created'
    | 'employee_approved'
    | 'status_changed'
    | 'role_reassigned'
    | 'permissions_modified'
    | 'attendance_edited'
    | 'overtime_approved'
    | 'leave_approved'
    | 'leave_rejected'
    | 'payroll_calculated'
    | 'payroll_approved'
    | 'payroll_adjusted'
    | 'performance_finalized';
  targetEntity: string;
  targetId: string;
  details: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  reason?: string;
  ipAddress?: string;
}
```

---

## 4. Governance & Security Controls

### 4.1 Segregation of Duties & Two-Tier Approvals
1. **Maker-Checker Account Activation:** A Department Head or HR Officer can draft a new employee (`new`), but the profile remains in `pending_approval` until verified and activated by an Authorized Executive (`admin_manager` or `super_admin`).
2. **Self-Leave Approval Prevention:** The system strictly prohibits an employee from approving their own leave application (`approverId !== employeeId`).
3. **Overtime Authorization Gate:** Overtime hours calculated by the biometric clock cannot feed into payroll until explicitly authorized with an approver stamp.
4. **Attendance Override Reason Mandate:** Any manual correction to clock-in, clock-out, or status demands a non-empty `editReason` and logs an immutable audit entry.
5. **Approved Payroll Immutability:** Once a payroll batch is `approved` or `posted`, field modifications are locked. Adjustments must follow an explicit `adjustmentNotes` diff workflow with contra-journal reconciliation.
6. **Soft-Delete Only:** Employee master records, performance reviews, and financial records cannot be permanently deleted through regular UI; soft-delete transitions them to `archived` with mandatory justification.

### 4.2 Strict Role-Based Visibility (10 Modules)

| Module | Super Admin | Operations / Admin Mgr | Warehouse Mgr / Staff | Sales Agent | Cashier / Accounts | Delivery Mgr / Rider |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Dashboard** | Full | Full | Operations View | Sales View | Financial View | Delivery View |
| **Sales** | Full | Full | Read Only (Pick) | Create / Edit | Read Only | Read Only |
| **Customers** | Full | Full | Read Only | Create / View | Khata Balance | Read Only (Address) |
| **Inventory** | Full | Full | Full (GRN, Counts) | Read Only | Read Only (Valuation)| None |
| **Procurement** | Full | Full | GRN Intake | None | Invoices & Payables | None |
| **Suppliers** | Full | Full | Read Only | None | Ledger & Aging | None |
| **Delivery** | Full | Full | Dispatch Ready | Order Status | COD Reconciliation | Full / Route Orders |
| **Finance** | Full | Review / Approve | None | None | Full (COA, JVs, Khata)| Cash Handover |
| **Reports** | Full | Operational | Stock & Logistics | Route & Customer | Financial & Tax | Route Efficiency |
| **Administration** | Full | HR Operations | None | None | None | None |

### 4.3 Compensation Confidentiality
Salary metrics are classified as `Restricted`. The frontend UI wraps compensation values inside a secure gate:
* When viewed by users without `finance.view` or `administration.edit` permissions, salary amounts display as `•••••••• PKR` with interaction disabled.

---

## 5. Screen & Workflow Architecture (`apps/admin-web`)

### 5.1 Workforce Command Dashboard (`/workforce/dashboard`)
* **Live Operational KPIs:**
  * Total Headcount & Active Staff
  * Today's Attendance (Present, Late, Absent, Approved Leave)
  * Shift Coverage Gauges (Morning Warehouse, Dispatch, Field Delivery, Finance/Billing)
  * Pending Action Banners: Unapproved Overtime, Pending Leave Applications, Pending Employee Activations
* **Visual Charts:**
  * Punctuality & Attendance Donut Chart
  * Weekly Overtime Trend Line
  * Department Staffing Distribution Bar Chart

### 5.2 Employee Directory & 2-Tier Onboarding (`/workforce/employees`)
* **Filtering & Search:** Instant search by name, CNIC, employee code; filters by Department, Location, Employment Status, and Workflow Status.
* **Status Badges:** Distinct badges for `New`, `Pending Approval`, `Active`, `Suspended`, `Inactive`.
* **New Employee Wizard Modal (Maker-Checker):**
  * Step 1: Personal & Contact Information (CNIC, Phone, Emergency Contact)
  * Step 2: Organizational Assignment (Department, Job Title, Warehouse Location, Supervisor)
  * Step 3: Role & System Account Linking (Select Role, System Username/Phone)
  * Step 4: Compensation Setup (Basic Salary, Standard Allowances, Payment Method)
  * Submit as `Pending Approval` with review notes.

### 5.3 Employee 360° HR Profile (`/workforce/employees/:id`)
* **Header:** Employee Code, Avatar, Job Title, Department, Workflow Status, and Quick Action Buttons (`Approve`, `Suspend`, `Deactivate`, `Reactivate`, `Edit Role`).
* **Tabbed Dossier Architecture:**
  1. **Overview & Organization:** Employment history, manager hierarchy, assigned warehouse/depot, emergency contacts.
  2. **Attendance & Shifts:** 30-day attendance calendar heatmap, monthly hours, late arrivals count, overtime summary.
  3. **Leave Management:** Leave entitlement breakdown (Annual, Casual, Sick), active requests, historical leaves.
  4. **Confidential Payroll:** Salary structure, allowance breakdown, bank disbursement account, historical payslips (guarded by RBAC).
  5. **Performance & Goals:** Review ratings, quarterly KPI appraisals, development objectives.
  6. **Training & Certifications:** Completed safety programs, certificates, skill badges.
  7. **Digital Documents:** Uploaded documents (CNIC copy, offer letter, certificates) with preview and upload modal.
  8. **Audit Trail:** Complete chronological record of every status transition, role change, and profile edit.

### 5.4 Shift Rostering & Scheduling (`/workforce/shifts`)
* **Shift Definition Cards:** Name, Timings, Working Days, Break Duration, Location.
* **Roster Assignment Drawer:** Drag/assign staff to shifts with shift coverage validation (ensuring minimum staffing for warehouse and delivery operations).

### 5.5 Daily Attendance Register & Override Modal (`/workforce/attendance`)
* **Date Navigator & Department Filter.**
* **Interactive Table:** Employee, Shift, Clock-in, Clock-out, Worked Hours, Late (Mins), Overtime (Hours), Status Badge.
* **Overtime 1-Click Approval:** Approve pending overtime hours with supervisor stamp.
* **Manual Override Modal:** Allows authorized managers to adjust punch times or statuses; requires a mandatory reason dropdown + text explanation.

### 5.6 Leave Management Center (`/workforce/leaves`)
* **Leave Request Modal:** Employee selector, Leave type, Date range picker, Auto day calculator, Reason, File attachment.
* **Manager Approval Queue:** Pending requests with conflict warning (e.g. alerts if multiple warehouse workers request the same date).
* **1-Click Approve / Reject Action:** Updates leave status and automatically populates the Attendance Register with `leave` status for approved dates.

### 5.7 Payroll Register & Processing Center (`/workforce/payroll`)
* **Period Controller:** Selects monthly billing cycle (e.g. "SEP-2026").
* **5-Stage Pipeline Status Bar:** Draft → Calculating → Under Review → Approved → Posted → Disbursed.
* **Master Register Table:** Employee, Basic, Allowances, Approved Overtime Pay, Deductions (Late, Tax, EOBI), Net Pay, Status.
* **Dual-Signoff Approval Modal:** Reviewer notes, total financial liability verification, contra-journal integration reference.
* **Disbursement Modal:** Mark as Paid with Bank Transfer / Cheque Reference.

### 5.8 Confectionery Wholesale Payslip Viewer (`/workforce/payroll/payslips/:id`)
* Professional, print-ready branded payslip for Candi Super Store.
* Displays earnings, overtime hours, deductions, employer contributions, bank account details, and unique payslip serial number.

### 5.9 Performance Management Center (`/workforce/performance`)
* Cycle manager (e.g. Q3-2026 Wholesale Review).
* Review cards with rating indicators (1-5 stars).
* Detailed review modal with goal scorecard, manager assessment, and employee feedback.

### 5.10 Training & Skills Center (`/workforce/training`)
* Program roster (Food Safety & Hygiene, Warehouse Safety & Forklift, Customer Delivery Protocols, Accounts Compliance).
* Track active vs expired certifications with renewal reminders.

### 5.11 10 Enterprise Workforce Reports (`/workforce/reports`)
1. **Headcount & Departmental Distribution Report**
2. **Monthly Attendance & Punctuality Summary**
3. **Absence & Chronic Latecomers Report**
4. **Leave Utilization & Accrual Balance Schedule**
5. **Overtime Hours & Cost Analysis**
6. **Payroll Register & Financial Liability Report**
7. **Department Shift Coverage & Roster Report**
8. **Employee Training Compliance & Skills Matrix**
9. **Performance Appraisal & Rating Distribution Report**
10. **Employee Turnover, Retention & Tenure Audit**

### 5.12 10-Module RBAC Matrix Manager (`/admin/roles`)
* Dynamic interactive matrix table with row per role and column per module.
* Toggle buttons for View, Create, Edit, Approve, Delete.
* "Add Custom Role" modal.
* **Live Role Switcher Bar:** Top-level dropdown allowing immediate role impersonation for demonstration and test verification.

### 5.13 Central Workforce Audit Trail (`/workforce/audit`)
* Real-time search across all workforce events with before/after state diff inspector and IP/actor tracking.

---

## 6. Verification & Demonstration Plan

### 6.1 Automated Verification
* Run TypeScript compiler across all workspace packages (`pnpm type-check` or `tsc --noEmit`).
* Validate validation rule engines (`packages/validation`).
* Execute frontend build (`pnpm --filter admin-web build`) to guarantee zero compilation or bundling errors.

### 6.2 Interactive Demonstration Scenarios
1. **Scenario 1: Employee Onboarding & 2-Tier Approval:**
   * Create a new employee "Hamza Tariq" (Warehouse Associate) in `pending_approval`.
   * Switch to Executive view and approve the account to transition to `active`.
2. **Scenario 2: Shift Assignment & Attendance Overrides:**
   * Assign Hamza to the "Morning Warehouse Shift".
   * Record a manual punch-in override with mandatory justification note; verify it appears in the Attendance Audit Log.
3. **Scenario 3: Leave Request & Automatic Attendance Update:**
   * Submit a 2-day Sick Leave request; approve as manager.
   * Verify the Attendance Register reflects `leave` for those dates with zero unexcused penalty.
4. **Scenario 4: Attendance-to-Payroll Calculation & Payslip:**
   * Trigger the monthly payroll calculation; observe automated computation of basic, allowances, overtime pay, and late arrival deductions.
   * Authorize batch and view Hamza's generated payslip with printable styling.
5. **Scenario 5: 10-Module Dynamic RBAC Guard Demonstration:**
   * Switch active role to `sales_agent` → verify Finance, Payroll, Administration, and Supplier Invoices are hidden and blocked.
   * Switch active role to `warehouse_manager` → verify Inventory, Goods Receipt, and Shifts are accessible, while Finance remains protected.
   * Switch active role to `super_admin` → full control tower restored.
6. **Scenario 6: Immutable Audit Trail Inspection:**
   * Open `/workforce/audit` and verify all previous operations (creation, approval, manual attendance edit, leave review, payroll approval) are logged with exact actor stamps.

---

## 7. Spec Self-Review Checklist

- [x] **Placeholder Scan:** No "TBD", "TODO", or incomplete definitions.
- [x] **Internal Consistency:** Data models match the UI screens and state transitions across all 4 sub-phases (5A, 5B, 5C, 5D).
- [x] **Scope Check:** Covers all aspects requested in user prompts 5A, 5B, 5C, and 5D in a modular, unified architecture.
- [x] **Ambiguity Check:** Explicit definitions for 10-module RBAC, segregation of duties, salary confidentiality, and soft-delete safeguards.

# Audit & Requirements Alignment Report: Candi Super Store Wholesale Platform

**Document Version:** 1.0.0 (Phase 1 Audit)  
**Date:** 2026-10-15  
**Git Branch:** `cleanup/report-alignment`  
**Sole Source of Truth:** `docs/report.md` (*"Architectural Blueprint and Technology Evaluation for Wholesale Confectionery and FMCG Distribution in Pakistan"*)  
**Auditor Status:** Phase 1 Complete — Awaiting User Approval on all `UNSURE` items before proceeding to Phase 2.

---

## 1. Requirements Audit Table

The table below catalogs every feature, page, route, data module, database table, and component across the project. Each item is strictly evaluated against `docs/report.md`.

| Feature / Page | Where in code (file / route) | Report section that requires it (quote the heading) | Verdict | Reason / Justification |
| :--- | :--- | :--- | :--- | :--- |
| **Operational Command Dashboard** | `apps/admin-web/src/pages/DashboardPage.tsx` (`/`) | `## 1. Executive Synthesis & Architectural Blueprint` & `### Functional Application Modules` | **KEEP** | Administrative control tower for operational governance. Needs complete rebuild in Phase 3 to show only real report KPIs (verification stage, dispatches, COD cash, khata overdue, low stock). |
| **Customer Accounts & Approvals** | `apps/admin-web/src/pages/CustomerListPage.tsx` (`/customers`) | `## 1. Executive Synthesis & Architectural Blueprint` ("integrated credit ledger (*khata*) tracking counterparty exposures") & `### Cash-on-Delivery (COD) and Credit Ledger (Udhaar) Architecture` | **KEEP** | Core customer directory for neighborhood kiryana stores and sub-wholesalers, approval queue, credit limits, and credit hold status. |
| **Customer 360° Profile** | `apps/admin-web/src/pages/CustomerProfilePage.tsx` (`/customers/:id`) | `### Tiered B2B Pricing, Trade Offers, and Packaging Hierarchies` & `### Cash-on-Delivery (COD) and Credit Ledger (Udhaar) Architecture` | **KEEP** | Customer profile dossier: delivery addresses, price tier assignment, credit limit, and running khata balance. |
| **Wholesale Products & SKUs** | `apps/admin-web/src/pages/ProductListPage.tsx` (`/products`) | `### Tiered B2B Pricing, Trade Offers, and Packaging Hierarchies` & `### Functional Application Modules` ("govern SKU definitions, multi-tier packaging ratios") | **KEEP** | SKU master catalog, packaging ratios (Carton ↔ Box ↔ Packet), stock levels, soft-reserved stock, and base/tier prices. |
| **Order Operations Queue** | `apps/admin-web/src/pages/OrderScreenPage.tsx` (`/orders`) | `### Functional Application Modules` ("A dynamic order management console organizes transactions across structured operational states") | **KEEP** | Order intake console tracking operational states (new, pending confirmation, approved for picking, dispatched, reconciled) with line pricing breakdown. |
| **5-Stage Order Verification & Picking** | `apps/admin-web/src/pages/tele-sales/ConversationalVerificationPage.tsx` (`/orders/verification`) | `### Omnichannel Order Capture and Automated Confirmation Architecture` (Table: "5-stage verification pipeline") | **KEEP** | Core 5-stage verification desk: Stage 1 Ingestion, Stage 2 WhatsApp interactive verification, Stage 3 Telephony click-to-dial escalation, Stage 4 Warehouse release, Stage 5 Exception/Cancel. |
| **Invoices & Customer Billing** | `apps/admin-web/src/pages/InvoiceScreenPage.tsx` (`/invoices`) | `### Cash-on-Delivery (COD) and Credit Ledger (Udhaar) Architecture` & `### Functional Application Modules` ("fiscal compliance engine... FBR Digital Invoicing... IRN and QR codes") | **KEEP** | B2B invoice generation, challan matching, khata balance posting, and FBR digital compliance. Must add missing FBR IRN and QR code displays. |
| **Customer Tiers Definition** | `apps/admin-web/src/pages/pricing/CustomerTierListPage.tsx` (`/pricing/tiers`) | `### Tiered B2B Pricing, Trade Offers, and Packaging Hierarchies` ("assigned price lists: Sub-Wholesaler, Semi-Wholesale, Modern Retail, or Kiryana General Store") | **KEEP** | Configuration of the four mandatory B2B customer tiers, qualification criteria, and payment terms. |
| **Wholesale Price Lists** | `apps/admin-web/src/pages/pricing/PriceListPage.tsx` (`/pricing/lists`) | `### Tiered B2B Pricing, Trade Offers, and Packaging Hierarchies` ("pricing engine must dynamically evaluate the authenticated customer identity, instantly mapping the catalog display to assigned price lists") | **KEEP** | Manages catalog rates and customer-tier specific wholesale price schedules. |
| **Trade Offers & Schemes** | `apps/admin-web/src/pages/pricing/TradeOffersPage.tsx` (`/pricing/trade-offers`) | `### Tiered B2B Pricing, Trade Offers, and Packaging Hierarchies` ("deep trade offer (T.O.) scheme automation... quantity slabs... unit allowances, percentage rebates, and bonus inventory mechanics (such as a 12-plus-1 carton bonus)") | **KEEP** | Manufacturer promotional schemes, volume slab rules, bonus cartons, and rebate calculations. |
| **Order Pricing Preview** | `apps/admin-web/src/pages/pricing/OrderPricingPreviewPage.tsx` (`/pricing/preview`) | `### Tiered B2B Pricing, Trade Offers, and Packaging Hierarchies` | **UNSURE** | Interactive 4-step pricing simulator (Base -> Tier -> Trade Offer -> Tax). The underlying calculation logic is required, but a separate admin simulation page is not explicitly requested in the report. |
| **Receivables Dashboard** | `apps/admin-web/src/pages/receivables/ReceivablesDashboardPage.tsx` (`/receivables/dashboard`) | `### Cash-on-Delivery (COD) and Credit Ledger (Udhaar) Architecture` ("platform enforces system-managed credit ceilings and aging restrictions... administrative credit hold") | **KEEP** | Central credit control cockpit monitoring outstanding khata exposure, credit hold enforcement, and overdue amounts. |
| **Customer Khata Statement** | `apps/admin-web/src/pages/receivables/CustomerStatementPage.tsx` (`/receivables/statement`) | `### Functional Application Modules` ("downloadable ledger statements") & `### Cash-on-Delivery (COD) and Credit Ledger (Udhaar) Architecture` | **KEEP** | Detailed running ledger statement showing invoices, cash collections, and outstanding balance for a customer. |
| **Invoice Aging Report** | `apps/admin-web/src/pages/receivables/InvoiceAgingReportPage.tsx` (`/receivables/aging`) | `### Cash-on-Delivery (COD) and Credit Ledger (Udhaar) Architecture` ("unpaid invoices past an allowable aging window (such as 7 or 14 days)") | **KEEP** | 5-bucket aging classification (Current, 1–30, 31–60, 61–90, >90) used to trigger automated administrative credit hold. |
| **Collection Follow-ups** | `apps/admin-web/src/pages/receivables/CollectionFollowUpPage.tsx` (`/receivables/follow-ups`) | `### Cash-on-Delivery (COD) and Credit Ledger (Udhaar) Architecture` ("barring warehouse release until outstanding dues are collected") | **KEEP** | Field recovery tracking, timestamped customer communications, and Promise-to-Pay (PTP) scheduling. |
| **Fleet & Trip Manifest Console** | `apps/admin-web/src/pages/delivery/FleetConsolePage.tsx` (`/delivery/fleet-console`, `/fleet`) | `## 5. Last-Mile Logistics, Fleet Operations, and Cash Reconciliation` & `### Route Optimization and Delivery Beat Structuring` | **KEEP** | Manages Permanent Journey Plans (PJPs), vehicle loading, beat route clustering, trip manifests, driver dispatch, and POD delivery closure. |
| **Field Cash Collections** | `apps/admin-web/src/pages/cash/CashCollectionPage.tsx` (`/cash/collections`) | `### Operational Delivery Lifecycle` ("signed delivery challans and returned cartons... physical cash count performed") & `### Driver Cash Settlement Protocol` | **KEEP** | Logs route-level cash collections, money receipts, and partial payments per delivery challan. |
| **Driver Cash Handover** | `apps/admin-web/src/pages/cash/CashHandoverPage.tsx` (`/cash/handovers`) | `### Operational Delivery Lifecycle` ("Depot Return & Audit Closure... Driver returns to central facility with collected currency") | **KEEP** | Physical handover checkpoint between returning drivers and depot vault cashiers. |
| **Zero-Variance Vault Reconciliation** | `apps/admin-web/src/pages/cash/CashReconciliationPage.tsx` (`/cash/reconciliation`) | `### Driver Cash Settlement Protocol` ("mathematical zero-variance validation formula: Net Variance = Physical Currency Deposited - Net Cash Obligation = 0") | **KEEP** | Physical currency denomination counting (PKR 5000 to 10), zero-variance verification formula, and depot shift closing. |
| **Customer Sub-Ledger** | `apps/admin-web/src/pages/finance/CustomerLedgerPage.tsx` (`/finance/customer-ledger`) | `### Cash-on-Delivery (COD) and Credit Ledger (Udhaar) Architecture` ("maintains ledger integrity through automated double-entry accounting") | **KEEP** | Double-entry customer credit ledger tracking debits (invoiced sales) and credits (cash collections / returns). |
| **Payment Register** | `apps/admin-web/src/pages/finance/PaymentRegisterPage.tsx` (`/finance/payments`) | `### Cash-on-Delivery (COD) and Credit Ledger (Udhaar) Architecture` ("Double-entry ledger for customer khata, invoices and payments") | **UNSURE** | Keep-list includes customer payments. However, this page currently includes supplier outflows and GL reconciliation flags that are outside the report. If kept, it should be simplified to customer payments only. |
| **Goods Received Notes (GRN)** | `apps/admin-web/src/pages/GoodsReceiptPage.tsx` (`/procurement/grn`) | `### Functional Application Modules` ("warehouse management module handles pick-pack wave generation, batch tracking, expiry date auditing, and Goods Received Note (GRN) logging") | **KEEP** | Warehouse receiving dock intake, batch numbers, and expiry date auditing. Needs decoupling from removed PO pages. |
| **Suppliers Database & Profile** | `apps/admin-web/src/pages/SupplierListPage.tsx`, `SupplierProfilePage.tsx` (`/suppliers`, `/suppliers/:id`) | None (Only generic procurement mentioned) | **UNSURE** | Report mentions receiving confectionery goods from manufacturers, but does not specify a full supplier CRM / database / profile dossier. Can be kept minimal for GRN reference or removed. |
| **Purchase Requests** | `apps/admin-web/src/pages/PurchaseRequestPage.tsx` (`/procurement/requests`) | None | **REMOVE** | Enterprise ERP internal purchasing requisition workflow not in report. |
| **Purchase Orders** | `apps/admin-web/src/pages/PurchaseOrderListPage.tsx`, `PurchaseOrderPage.tsx` (`/procurement/orders`, `/procurement/orders/:id`) | None | **REMOVE** | Supplier PO generation and approval workflow not in report. |
| **Supplier Invoices & 3-Way Match** | `apps/admin-web/src/pages/SupplierInvoicePage.tsx` (`/procurement/supplier-invoices`) | None | **REMOVE** | 3-way matching of supplier invoices against PO and GRN is an enterprise ERP feature not in report. |
| **Replenishment & Stock Planning** | `apps/admin-web/src/pages/StockPlanningPage.tsx` (`/procurement/planning`) | None | **REMOVE** | Predictive stock forecasting, buffer levels, and reorder triggers are not in report. |
| **Chart of Accounts (COA)** | `apps/admin-web/src/pages/finance/ChartOfAccountsPage.tsx` (`/finance/coa`) | None | **REMOVE** | 5-level statutory GL Chart of Accounts is generic ERP accounting, not in report (only customer khata is required). |
| **Supplier Payables Ledger** | `apps/admin-web/src/pages/finance/SupplierLedgerPage.tsx` (`/finance/supplier-ledger`) | None | **REMOVE** | Accounts payable ledger for manufacturers is not in report or keep list. |
| **General Journal Entries** | `apps/admin-web/src/pages/finance/JournalEntryPage.tsx` (`/finance/journal-entries`) | None | **REMOVE** | Manual double-entry journal vouchers across general ledger accounts are outside report requirements. |
| **GL Reconciliation** | `apps/admin-web/src/pages/finance/LedgerReconciliationPage.tsx` (`/finance/reconciliation`) | None | **REMOVE** | General ledger control account reconciliation explicitly listed for removal by user. |
| **Statutory Financial Reports** | `apps/admin-web/src/pages/finance/FinancialReportsPage.tsx` (`/finance/reports`) | None | **REMOVE** | 14 financial reports (Trial Balance, P&L, Balance Sheet, GAAP statements) explicitly listed for removal by user. |
| **Period Closing & GAAP** | `apps/admin-web/src/pages/finance/PeriodClosingPage.tsx` (`/finance/period-closing`) | None | **REMOVE** | 8-stage month-end accounting closing workflow explicitly listed for removal by user. |
| **Financial Exception Tower** | `apps/admin-web/src/pages/finance/FinancialExceptionDashboardPage.tsx` (`/finance/exceptions`) | None | **REMOVE** | Extra financial approval/exception monitoring system explicitly listed for removal by user. |
| **Financial Approvals & 4-Eyes** | `apps/admin-web/src/pages/finance/FinancialApprovalsPage.tsx` (`/finance/approvals`) | None | **REMOVE** | Role-based authorization limits and dual sign-off controls explicitly listed for removal by user. |
| **Financial Audit Trail** | `apps/admin-web/src/pages/finance/FinancialAuditTrailPage.tsx` (`/finance/audit-trail`) | None | **REMOVE** | Audit trail for general ledger edits is outside report scope. |
| **Executive Management Dashboard** | `apps/admin-web/src/pages/reporting/ExecutiveDashboardPage.tsx` (`/reporting/management-dashboard`) | None | **REMOVE** | Secondary disconnected BI dashboard not listed in report or sidebar; filled with mock metrics. |
| **Advanced BI Reports** | `apps/admin-web/src/pages/reporting/AdvancedReportsPage.tsx` (`/reporting/reports`) | None | **REMOVE** | Generic multi-tab BI reports (Margin, Purchasing, Payables) outside report requirements; not in sidebar. |
| **Workforce Command Dashboard** | `apps/admin-web/src/pages/workforce/WorkforceDashboardPage.tsx` (`/workforce/dashboard`) | None | **REMOVE** | HR/workforce module explicitly listed for removal by user. |
| **Employees Master Directory** | `apps/admin-web/src/pages/workforce/EmployeeListPage.tsx` (`/workforce/employees`, `/staff`) | None | **REMOVE** | HR employee records explicitly listed for removal by user. |
| **Employee 360° HR Dossier** | `apps/admin-web/src/pages/workforce/EmployeeProfilePage.tsx` (`/workforce/employees/:id`) | None | **REMOVE** | HR employee dossier explicitly listed for removal by user. |
| **Shift Rostering & Schedules** | `apps/admin-web/src/pages/workforce/ShiftManagementPage.tsx` (`/workforce/shifts`) | None | **REMOVE** | HR shift management explicitly listed for removal by user. |
| **Attendance Register & Punch Logs** | `apps/admin-web/src/pages/workforce/AttendanceRegisterPage.tsx` (`/workforce/attendance`) | None | **REMOVE** | Attendance tracking explicitly listed for removal by user. |
| **Leave Management & Approvals** | `apps/admin-web/src/pages/workforce/LeaveManagementPage.tsx` (`/workforce/leaves`) | None | **REMOVE** | Leave management explicitly listed for removal by user. |
| **Payroll Register** | `apps/admin-web/src/pages/workforce/PayrollRegisterPage.tsx` (`/workforce/payroll`) | None | **REMOVE** | Payroll processing explicitly listed for removal by user. |
| **Salary Payslip View** | `apps/admin-web/src/pages/workforce/PayslipViewPage.tsx` (`/workforce/payroll/payslips/:id`) | None | **REMOVE** | Employee salary slips explicitly listed for removal by user. |
| **Performance Appraisals** | `apps/admin-web/src/pages/workforce/PerformanceReviewPage.tsx` (`/workforce/performance`) | None | **REMOVE** | Performance appraisals explicitly listed for removal by user. |
| **Training Matrix & Compliance** | `apps/admin-web/src/pages/workforce/TrainingSkillsPage.tsx` (`/workforce/training`) | None | **REMOVE** | HR training matrix explicitly listed for removal by user. |
| **Workforce HR Reports** | `apps/admin-web/src/pages/workforce/WorkforceReportsPage.tsx` (`/workforce/reports`) | None | **REMOVE** | HR reports explicitly listed for removal by user. |
| **Roles & Permissions UI Editor** | `apps/admin-web/src/pages/workforce/RolePermissionsPage.tsx` (`/admin/roles`) | None | **UNSURE** | System enforces RBAC permissions, but a runtime UI matrix editor page is not mentioned in the report. Can be removed and permissions kept as clean static code configuration. |
| **Workforce Audit Trail** | `apps/admin-web/src/pages/workforce/WorkforceAuditTrailPage.tsx` (`/workforce/audit`, `/audit`) | None | **REMOVE** | HR audit trail explicitly listed for removal by user. |
| **Admin Login Screen** | `apps/admin-web/src/pages/LoginPage.tsx` (`/login`) | `### Functional Application Modules` ("role-based access security") | **KEEP** | Admin authentication gateway. |
| **Category Management Modal** | `apps/admin-web/src/components/CategoryManagementModal.tsx` | `### Functional Application Modules` ("govern SKU definitions") | **KEEP** | Category classification for confectionery SKU master catalog. |
| **Product Form Modal** | `apps/admin-web/src/components/ProductFormModal.tsx` | `### Tiered B2B Pricing, Trade Offers, and Packaging Hierarchies` | **KEEP** | Packaging hierarchy configuration and tier pricing on SKUs. |
| **Stock Adjust Modal** | `apps/admin-web/src/components/StockAdjustModal.tsx` | `### Functional Application Modules` ("warehouse management module") | **KEEP** | Physical stock adjustment modal. |
| **Beat Clustering Modal** | `apps/admin-web/src/pages/delivery/BeatClusteringModal.tsx` | `### Route Optimization and Delivery Beat Structuring` | **KEEP** | Clustered delivery stops assignment to vehicle manifests. |
| **Trip Execution Drawer** | `apps/admin-web/src/pages/delivery/TripExecutionDrawer.tsx` | `## 5. Last-Mile Logistics, Fleet Operations, and Cash Reconciliation` | **KEEP** | Driver delivery stop execution, returns logging, and cash collection drawer. |
| **Printable Trip Manifest** | `apps/admin-web/src/pages/delivery/PrintableTripManifestModal.tsx` | `### Operational Delivery Lifecycle` ("vehicle manifests... delivery documents") | **KEEP** | Thermal/printable trip manifest for driver routes. |
| **Picking Release Modal** | `apps/admin-web/src/pages/tele-sales/PickingReleaseModal.tsx` | `### Omnichannel Order Capture and Automated Confirmation Architecture` | **KEEP** | Wave picking release into warehouse queue. |
| **Printable Pick Slip** | `apps/admin-web/src/pages/tele-sales/PrintablePickSlipModal.tsx` | `### Omnichannel Order Capture and Automated Confirmation Architecture` ("warehouse picking slips") | **KEEP** | Printable warehouse item pick slip. |

---

## 2. Shared Packages, Validation Schemas & Data Stores Audit

| Module / File | Where in code | Report Requirement | Verdict | Reason |
| :--- | :--- | :--- | :--- | :--- |
| **Workforce Data Store** | `apps/admin-web/src/data/workforceData.ts` | None | **REMOVE** | Mock data for employees, shifts, attendance, leaves, payroll, appraisals, training. |
| **Chart of Accounts Data** | `apps/admin-web/src/data/chartOfAccounts.ts` | None | **REMOVE** | Statutory GL accounts mock store. |
| **Journal Entries Data** | `apps/admin-web/src/data/journalEntries.ts` | None | **REMOVE** | GL journal vouchers mock store. |
| **Financial Reports Data** | `apps/admin-web/src/data/financialReportsData.ts` | None | **REMOVE** | 14 financial reports mock store. |
| **Period Closing Data** | `apps/admin-web/src/data/periodClosingData.ts` | None | **REMOVE** | Month-end closing mock store. |
| **Financial Controls Data** | `apps/admin-web/src/data/financialControlsData.ts` | None | **REMOVE** | Financial exceptions & approval limits mock store. |
| **Finance Reconciliation Engine** | `apps/admin-web/src/data/financeReconciliationEngine.ts` | None | **REMOVE** | GL reconciliation calculation engine. |
| **Supplier Ledgers Data** | `apps/admin-web/src/data/supplierLedgers.ts` | None | **REMOVE** | Accounts payable mock store. |
| **Supplier Invoices Data** | `apps/admin-web/src/data/supplierInvoices.ts` | None | **REMOVE** | Supplier billing mock store. |
| **Stock Planning Data** | `apps/admin-web/src/data/stockPlanning.ts` | None | **REMOVE** | Replenishment forecasting mock store. |
| **Reporting Analytics Data** | `apps/admin-web/src/data/reportingAnalytics.ts` | None | **REMOVE** | BI reports and management dashboard mock store. |
| **Suppliers Data Store** | `apps/admin-web/src/data/suppliers.ts` | None | **UNSURE** | Supplier master records. Can be pruned to basic vendor names for GRN logging or removed. |
| **Workforce Validation** | `packages/validation/src/workforceControls.ts` | None | **REMOVE** | HR validation rules (attendance, leave, payroll). |
| **Period Closing Validation** | `packages/validation/src/periodClosing.ts` | None | **REMOVE** | GAAP closing validation schemas. |
| **Financial Controls Validation** | `packages/validation/src/financialControls.ts` | None | **REMOVE** | Financial approval limit validation schemas. |
| **Finance Validation** | `packages/validation/src/finance.ts` | None | **REMOVE** | Journal vouchers and COA validation schemas. |
| **Validation Tests (Removed Modules)** | `packages/validation/tests/periodClosing.test.ts`, `finance.test.ts`, `financialControls.test.ts`, `reporting.test.ts` | None | **REMOVE** | Tests corresponding to removed ERP modules. |
| **RBAC Matrix Definition** | `packages/auth/src/permissions.tsx` | `### Functional Application Modules` ("role-based access security") | **KEEP (PRUNED)** | Reduce from 10 modules (including removed procurement, finance, administration, reports) to only the active report modules: `dashboard`, `orders`, `customers`, `inventory`, `fleet`, `khata`, `settings`. |
| **Database Schema** | `supabase/migrations/20260917000001_initial_schema.sql` | `## 1. Executive Synthesis & Architectural Blueprint` | **KEEP (CLEANED)** | Remove unused tables: `public.purchase_orders` and `public.suppliers` (if approved). |

---

## 3. Disconnected Features & Fake / Hardcoded Data

These elements are currently disconnected from real data, show hardcoded or fake metrics, or link to placeholder pages:

1. **Dashboard Fake KPI Banners (`DashboardPage.tsx`)**:
   - Hardcoded string: *"Karachi Depot Pilot Active: 1 Warehouse, 1 Depot, Zone 1 & 2 operational. SOP Compliance 100%"*.
   - Static numbers: *"Today's Wholesale Orders: 28 (+14%)"*, *"Pending Customer Reviews: 5"*, *"Dispatched for Delivery: 18"*, *"Expected Cash to Reconcile: PKR 482,500"*. None calculate from actual orders/customers/trips.
   - Hardcoded Application Review table using static dummy records (`APP-1029`, `APP-1028`, `APP-1027`) instead of customer accounts.
   - Quick Action button: *"Purchase Orders (3)"* linking to an unneeded module with a fake counter.
2. **TopNav Simulated Role & Status Pill (`TopNav.tsx`)**:
   - Meaningless green pulsating dot with static text *"Live"*.
   - Non-functional *"🎭 Simulated Role"* dropdown switch in header that overrides the user session without persisting real authentication.
3. **Sidebar Random Badges & Labels (`Sidebar.tsx`)**:
   - Random numeric badges: Customers `'5'`, Orders `'12'`, Trade Offers `'4'`, Cash Collections `'5'`, Cash Handover `'2'`, Suppliers `'6'`, Purchase Orders `'3'`, GRN `'3'`, Supplier Invoices `'3'`, Stock Planning `'3'`, Invoice Aging `'5'`, Follow-ups `'4'`, Payment Register `'7'`, Journals `'4'`, Reports `'14'`, Exceptions `'8'`, Approvals `'4'`.
   - Meaningless chips and foreign currency labels:
     - `Vault Reconciliation`: shows `"$0"` (dollar sign instead of PKR).
     - `GL Reconciliation`: shows `"$0"`.
     - `5-Stage Verification`: shows `"5-Stage"`.
     - `Trip Manifest Console`: shows `"Live"`.
     - `Period Closing`: shows `"GAAP"` (statutory GAAP chip).
4. **Disconnected / Orphan BI Pages**:
   - `ExecutiveDashboardPage.tsx` (`/reporting/management-dashboard`): Not linked in the sidebar. Displays disconnected mock statistics and alerts for dummy Excel/PDF exports.
   - `AdvancedReportsPage.tsx` (`/reporting/reports`): Not linked in the sidebar. Shows disconnected aggregations across purchasing and payables.
5. **Missing FBR Digital Invoicing Connection (`InvoiceScreenPage.tsx`)**:
   - The report explicitly mandates FBR Digital Invoicing integration (PRAL API, IRN, and QR code). Currently, `InvoiceScreenPage.tsx` contains no IRN or QR code rendering on invoices or challans.
6. **Missing Intercity Courier CPR Tracking (`delivery/fleet-console`)**:
   - The report specifies third-party courier COD tracking (PostEx, Trax, Leopard CPR receipts) for intercity shipments. Currently, this is only documented in text and not surfaced in the fleet logistics console.

---

## 4. Items Requiring User Approval (`UNSURE` List)

Please review the following **4 borderline items** before Phase 2 removal begins:

1. **Suppliers Database & Profiles (`/suppliers`, `/suppliers/:id`, `data/suppliers.ts`)**:
   - *Report Status:* The report notes that confectionery lines (like Candi biscuits) are procured from manufacturers in bulk master cartons and mentions Goods Received Note (GRN) logging. However, it does not specify a dedicated Supplier CRM / Profile directory.
   - *Recommendation:* Keep a simple vendor reference (name, phone) strictly for GRN intake, but remove the dedicated `/suppliers` CRUD and 360° profile pages.
2. **Payment Register (`/finance/payments`, `data/paymentRegister.ts`)**:
   - *Report Status:* The report keep-list includes *"Double-entry ledger for customer khata, invoices and payments"*. `PaymentRegisterPage` logs payment transactions, but currently mixes in supplier outflows and GL reconciliation flags.
   - *Recommendation:* Strip all supplier payouts and GL flags, retaining only customer cash/bank receipts under the Khata workflow.
3. **Order Pricing Preview (`/pricing/preview`)**:
   - *Report Status:* An interactive sandbox that simulates the 4-step pricing priority waterfall for a selected SKU and Customer. The logic is core to the backend pricing engine, but a dedicated admin simulation screen is not explicitly requested.
   - *Recommendation:* Remove the standalone preview page, as real-time pricing is already displayed directly inside the Order Screen and Customer Portal.
4. **Roles & Permissions UI Editor (`/admin/roles`, `RolePermissionsPage.tsx`)**:
   - *Report Status:* The report specifies *"role-based access security"* across staff roles (Admin, Warehouse, Sales Booker, Rider, Cashier). However, a live runtime permission checkbox matrix UI was introduced in the workforce module.
   - *Recommendation:* Remove the UI editor page, and maintain the pruned RBAC matrix as a clean, immutable configuration in `@candi/auth`.

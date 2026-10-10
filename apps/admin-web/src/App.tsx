import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth, PermissionsProvider, usePermissions } from '@candi/auth';
import '@candi/theme/tokens.css';

import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomerListPage } from './pages/CustomerListPage';
import { CustomerProfilePage } from './pages/CustomerProfilePage';
import { ProductListPage } from './pages/ProductListPage';
import { OrderScreenPage } from './pages/OrderScreenPage';
import { ConversationalVerificationPage } from './pages/tele-sales/ConversationalVerificationPage';
import { InvoiceScreenPage } from './pages/InvoiceScreenPage';
import { PurchaseRequestPage } from './pages/PurchaseRequestPage';
import { PurchaseOrderListPage } from './pages/PurchaseOrderListPage';
import { PurchaseOrderPage } from './pages/PurchaseOrderPage';
import { SupplierListPage } from './pages/SupplierListPage';
import { SupplierProfilePage } from './pages/SupplierProfilePage';
import { GoodsReceiptPage } from './pages/GoodsReceiptPage';
import { SupplierInvoicePage } from './pages/SupplierInvoicePage';
import { StockPlanningPage } from './pages/StockPlanningPage';
import { CustomerTierListPage } from './pages/pricing/CustomerTierListPage';
import { PriceListPage } from './pages/pricing/PriceListPage';
import { TradeOffersPage } from './pages/pricing/TradeOffersPage';
import { OrderPricingPreviewPage } from './pages/pricing/OrderPricingPreviewPage';
import { CustomerStatementPage } from './pages/receivables/CustomerStatementPage';
import { ReceivablesDashboardPage } from './pages/receivables/ReceivablesDashboardPage';
import { InvoiceAgingReportPage } from './pages/receivables/InvoiceAgingReportPage';
import { CollectionFollowUpPage } from './pages/receivables/CollectionFollowUpPage';
import { ExecutiveDashboardPage } from './pages/reporting/ExecutiveDashboardPage';
import { AdvancedReportsPage } from './pages/reporting/AdvancedReportsPage';
import { ChartOfAccountsPage } from './pages/finance/ChartOfAccountsPage';
import { CustomerLedgerPage } from './pages/finance/CustomerLedgerPage';
import { SupplierLedgerPage } from './pages/finance/SupplierLedgerPage';
import { PaymentRegisterPage } from './pages/finance/PaymentRegisterPage';
import { JournalEntryPage } from './pages/finance/JournalEntryPage';
import { LedgerReconciliationPage } from './pages/finance/LedgerReconciliationPage';
import { CashCollectionPage } from './pages/cash/CashCollectionPage';
import { CashHandoverPage } from './pages/cash/CashHandoverPage';
import { CashReconciliationPage } from './pages/cash/CashReconciliationPage';
import { FinancialReportsPage } from './pages/finance/FinancialReportsPage';
import { PeriodClosingPage } from './pages/finance/PeriodClosingPage';
import { FinancialExceptionDashboardPage } from './pages/finance/FinancialExceptionDashboardPage';
import { FinancialApprovalsPage } from './pages/finance/FinancialApprovalsPage';
import { FinancialAuditTrailPage } from './pages/finance/FinancialAuditTrailPage';
import { FleetConsolePage } from './pages/delivery/FleetConsolePage';

// Phase 5 Workforce & HR Pages
import { WorkforceDashboardPage } from './pages/workforce/WorkforceDashboardPage';
import { EmployeeListPage } from './pages/workforce/EmployeeListPage';
import { EmployeeProfilePage } from './pages/workforce/EmployeeProfilePage';
import { ShiftManagementPage } from './pages/workforce/ShiftManagementPage';
import { AttendanceRegisterPage } from './pages/workforce/AttendanceRegisterPage';
import { LeaveManagementPage } from './pages/workforce/LeaveManagementPage';
import { PayrollRegisterPage } from './pages/workforce/PayrollRegisterPage';
import { PayslipViewPage } from './pages/workforce/PayslipViewPage';
import { PerformanceReviewPage } from './pages/workforce/PerformanceReviewPage';
import { TrainingSkillsPage } from './pages/workforce/TrainingSkillsPage';
import { WorkforceReportsPage } from './pages/workforce/WorkforceReportsPage';
import { RolePermissionsPage } from './pages/workforce/RolePermissionsPage';
import { WorkforceAuditTrailPage } from './pages/workforce/WorkforceAuditTrailPage';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-family-base)',
        }}
      >
        Loading Candi Super Store Control Tower...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const getPageMeta = () => {
    switch (location.pathname) {
      case '/':
        return { title: 'Operational Command Dashboard', subtitle: 'Real-time wholesale fulfillment and customer governance' };
      case '/customers':
        return { title: 'Customer Accounts & Verification Queue', subtitle: 'Review retailer and sub-wholesaler registrations' };
      case '/products':
        return { title: 'Wholesale SKU Master & Packaging Units', subtitle: 'Unit conversions, inventory buffers and tier pricing' };
      case '/orders':
        return { title: 'Order Operations & Picking Queue', subtitle: 'WhatsApp confirmation tracking and warehouse pick lists' };
      case '/orders/verification':
        return {
          title: '5-Stage Verification & Picking Release Engine',
          subtitle: 'Multi-channel WhatsApp confirmation queue, live tele-sales escalation desk, and warehouse wave picking release engine',
        };
      case '/invoices':
        return { title: 'Invoices & Customer Khata Ledger', subtitle: 'Cashier reconciliation and delivery challan matching' };
      case '/procurement/requests':
        return { title: 'Procurement: Purchase Requests', subtitle: 'Internal stock replenishment requests' };
      case '/procurement/orders':
        return { title: 'Procurement: Supplier Purchase Orders', subtitle: 'Authorized purchase orders for confectionery manufacturers' };
      case '/suppliers':
        return { title: 'Supplier Management & Database', subtitle: 'Vendor profiles, pricing agreements, terms, and khata balances' };
      case '/procurement/grn':
        return { title: 'Goods Received Notes (GRN)', subtitle: 'Inspection, damage segregation, and verified stock intake' };
      case '/procurement/supplier-invoices':
        return { title: 'Supplier Invoices & 3-Way Matching', subtitle: 'Three-way match comparison against PO and GRN before payment release' };
      case '/procurement/planning':
        return { title: 'Replenishment & Stock Planning', subtitle: 'Predictive reorder points, buffer levels, and suggested purchase orders' };
      case '/pricing/tiers':
        return { title: 'Customer Tiers & Eligibility Rules', subtitle: 'Price matrix levels, volume qualification thresholds, and credit terms' };
      case '/pricing/lists':
        return { title: 'Wholesale Price List Management', subtitle: 'Standard catalog rates, customer-tier price covenants, validity dates, and audit trail' };
      case '/pricing/trade-offers':
        return { title: 'Trade Offers & Promotional Schemes', subtitle: 'Volume incentives, bonus carton programs, and promotion validity windows' };
      case '/pricing/preview':
        return { title: 'Order Pricing Preview & Waterfall Engine', subtitle: 'Real-time 4-step pricing priority resolver, discount gate, and order simulation' };
      case '/receivables/dashboard':
        return { title: 'Receivables Management & Collections', subtitle: 'Credit-hold controls, recovery tracking, and overdue invoices' };
      case '/receivables/statement':
        return { title: 'Customer Statement & Khata Ledger', subtitle: 'Double-entry running balance matching the customer ledger' };
      case '/receivables/aging':
        return { title: 'Invoice Aging & Exposure Schedule', subtitle: 'Automated 5-bucket aging classification (Current, 1–30, 31–60, 61–90, >90)' };
      case '/receivables/follow-ups':
        return { title: 'Collection Follow-Up & PTP Pipeline', subtitle: 'Timestamped customer communications, PTP scheduling, and payment allocation' };
      case '/reporting/management-dashboard':
        return { title: 'Executive Management Dashboard', subtitle: 'Reconciled operational control tower across sales, stock, procurement, and cash' };
      case '/reporting/reports':
        return { title: 'Operational Business Intelligence Reports', subtitle: 'Multi-dimensional drill-down analytics for sales, inventory, purchasing, payables, and cash' };
      case '/delivery/fleet-console':
      case '/fleet':
        return {
          title: 'Fleet Logistics & Trip Manifest Console',
          subtitle: 'Beat route clustering, delivery vehicle tracking, sequenced stops, and COD cash reconciliation',
        };
      case '/cash/collections':
        return { title: 'Field Cash Collections & Money Receipts', subtitle: 'Log and track every rupee collected on delivery routes with unique receipt numbers' };
      case '/cash/handovers':
        return { title: 'Cash Handover & Shift Settlement', subtitle: 'Dual-party confirmation gate between drivers and depot vault cashiers' };
      case '/cash/reconciliation':
        return { title: 'Cash Reconciliation & Vault Closing', subtitle: 'Physical currency note counter, variance explanation, and automated GL posting' };
      case '/finance/coa':
        return { title: 'Chart of Accounts (COA)', subtitle: 'Standard double-entry classification for assets, liabilities, equity, revenue, and expenses' };
      case '/finance/customer-ledger':
        return { title: 'Customer Sub-Ledger', subtitle: 'Detailed customer accounts receivable khata tied to GL Control Account 1100' };
      case '/finance/supplier-ledger':
        return { title: 'Supplier Sub-Ledger', subtitle: 'Detailed manufacturer and vendor payables khata tied to GL Control Account 2010' };
      case '/finance/payments':
        return { title: 'Payment Register', subtitle: 'Master collection inflows and disbursement register with transaction audit references' };
      case '/finance/journal-entries':
        return { title: 'Journal Entries & Posting Engine', subtitle: 'Immutable double-entry journal vouchers with real-time balancing and reversal trail' };
      case '/finance/reconciliation':
        return { title: 'General Ledger Reconciliation', subtitle: 'Proof of reconciliation comparing Sub-ledgers against GL Control Accounts ($0 variance)' };
      case '/finance/reports':
        return { title: '14 Statutory & Management Financial Reports', subtitle: 'General Ledger, Trial Balance, P&L, Balance Sheet, Aging, Reconciliations & Tax' };
      case '/finance/period-closing':
        return { title: 'Accounting Period Closing & Financial Governance', subtitle: '8-stage workflow, subledger verification, adjusting entries, and locked period guard' };
      case '/finance/exceptions':
        return { title: 'Financial Exception Control Tower', subtitle: 'Live monitoring and resolution of unapproved journals, cash variances, and closed-period adjustments' };
      case '/finance/approvals':
        return { title: 'Financial Approvals & 4-Eyes Governance', subtitle: 'Role-based authorization limits, segregation of duties, and contra-reversals' };
      case '/finance/audit-trail':
        return { title: 'Statutory Financial Audit Trail', subtitle: 'Immutable tamper-proof record of every financial alteration with before/after diffs' };

      // Phase 5 Workforce Routes
      case '/workforce/dashboard':
        return { title: 'Workforce Command & Operational Control', subtitle: 'Real-time staffing, attendance, shift coverage, and pending approvals' };
      case '/workforce/employees':
        return { title: 'Employee Directory & Maker-Checker Governance', subtitle: 'Staff profiles, departmental placement, and 2-tier onboarding approval' };
      case '/workforce/shifts':
        return { title: 'Shift Rostering & Operational Schedules', subtitle: 'Dock intake, dispatch hours, working days, and personnel assignment' };
      case '/workforce/attendance':
        return { title: 'Daily Attendance Register & Punch Logs', subtitle: 'Punctuality tracking, overtime authorization, and audit-backed overrides' };
      case '/workforce/leaves':
        return { title: 'Leave Management & Approval Workflows', subtitle: 'Paid, casual, and medical leaves with automated attendance integration' };
      case '/workforce/payroll':
        return { title: 'Payroll Register & Financial Compensation', subtitle: 'Attendance-synchronized calculation, dual sign-off, and GL posting' };
      case '/workforce/performance':
        return { title: 'Performance Management & Appraisals', subtitle: '6-stage evaluation cycle, KPI scorecards, and developmental feedback' };
      case '/workforce/training':
        return { title: 'Training Records & Food Safety Compliance', subtitle: 'Accredited certifications, forklift licensing, and expiry renewal tracking' };
      case '/workforce/reports':
        return { title: 'Workforce Business Intelligence & HR Reports', subtitle: '10 comprehensive statutory and management reports' };
      case '/admin/roles':
        return { title: '10-Module RBAC Permissions Matrix', subtitle: 'Enterprise role-based access control and granular action privileges' };
      case '/workforce/audit':
        return { title: 'Workforce & User Governance Audit Trail', subtitle: 'Immutable chronological ledger of all workforce operations and edits' };

      default:
        if (location.pathname.startsWith('/workforce/payroll/payslips/')) {
          return { title: 'Employee Official Salary Payslip', subtitle: 'Confectionery wholesale branded earnings and statutory deductions' };
        }
        if (location.pathname.startsWith('/workforce/employees/')) {
          return { title: 'Employee 360° HR Profile Dossier', subtitle: 'Comprehensive personal, organizational, attendance, and payroll records' };
        }
        if (location.pathname.startsWith('/procurement/orders/')) {
          return { title: 'Purchase Order Management', subtitle: 'Supplier terms, automatic totals and receiving' };
        }
        if (location.pathname.startsWith('/suppliers/')) {
          return { title: 'Supplier 360° Profile', subtitle: 'Purchasing history, invoices, payments, and audit history' };
        }
        if (location.pathname.startsWith('/customers/')) {
          return { title: 'Customer 360° Profile', subtitle: 'Delivery addresses, tier pricing, credit control, and khata ledger' };
        }
        return { title: 'Control Tower', subtitle: 'Candi Super Store Platform' };
    }
  };

  const meta = getPageMeta();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: 'var(--font-family-base)' }}>
      <Sidebar mobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopNav title={meta.title} subtitle={meta.subtitle} onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)} />
        <main style={{ flex: 1, padding: 'clamp(16px, 3vw, 32px)', maxWidth: '1440px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/customers" element={<CustomerListPage />} />
            <Route path="/customers/:id" element={<CustomerProfilePage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/orders" element={<OrderScreenPage />} />
            <Route path="/orders/verification" element={<ConversationalVerificationPage />} />
            <Route path="/invoices" element={<InvoiceScreenPage />} />
            <Route path="/pricing/tiers" element={<CustomerTierListPage />} />
            <Route path="/pricing/lists" element={<PriceListPage />} />
            <Route path="/pricing/trade-offers" element={<TradeOffersPage />} />
            <Route path="/pricing/preview" element={<OrderPricingPreviewPage />} />
            <Route path="/receivables/dashboard" element={<ReceivablesDashboardPage />} />
            <Route path="/receivables/statement" element={<CustomerStatementPage />} />
            <Route path="/receivables/aging" element={<InvoiceAgingReportPage />} />
            <Route path="/receivables/follow-ups" element={<CollectionFollowUpPage />} />
            <Route path="/reporting/management-dashboard" element={<ExecutiveDashboardPage />} />
            <Route path="/reporting/reports" element={<AdvancedReportsPage />} />
            <Route path="/delivery/fleet-console" element={<FleetConsolePage />} />
            <Route path="/fleet" element={<Navigate to="/delivery/fleet-console" replace />} />
            <Route path="/cash/collections" element={<CashCollectionPage />} />
            <Route path="/cash/handovers" element={<CashHandoverPage />} />
            <Route path="/cash/reconciliation" element={<CashReconciliationPage />} />
            <Route path="/finance/coa" element={<ChartOfAccountsPage />} />
            <Route path="/finance/customer-ledger" element={<CustomerLedgerPage />} />
            <Route path="/finance/supplier-ledger" element={<SupplierLedgerPage />} />
            <Route path="/finance/payments" element={<PaymentRegisterPage />} />
            <Route path="/finance/journal-entries" element={<JournalEntryPage />} />
            <Route path="/finance/reconciliation" element={<LedgerReconciliationPage />} />
            <Route path="/finance/reports" element={<FinancialReportsPage />} />
            <Route path="/finance/period-closing" element={<PeriodClosingPage />} />
            <Route path="/finance/exceptions" element={<FinancialExceptionDashboardPage />} />
            <Route path="/finance/approvals" element={<FinancialApprovalsPage />} />
            <Route path="/finance/audit-trail" element={<FinancialAuditTrailPage />} />
            <Route path="/suppliers" element={<SupplierListPage />} />
            <Route path="/suppliers/:id" element={<SupplierProfilePage />} />
            <Route path="/procurement/requests" element={<PurchaseRequestPage />} />
            <Route path="/procurement/orders" element={<PurchaseOrderListPage />} />
            <Route path="/procurement/orders/:id" element={<PurchaseOrderPage />} />
            <Route path="/procurement/grn" element={<GoodsReceiptPage />} />
            <Route path="/procurement/supplier-invoices" element={<SupplierInvoicePage />} />
            <Route path="/procurement/planning" element={<StockPlanningPage />} />

            {/* Phase 5 Workforce & HR Management Routes */}
            <Route path="/workforce/dashboard" element={<WorkforceDashboardPage />} />
            <Route path="/workforce/employees" element={<EmployeeListPage />} />
            <Route path="/workforce/employees/:id" element={<EmployeeProfilePage />} />
            <Route path="/workforce/shifts" element={<ShiftManagementPage />} />
            <Route path="/workforce/attendance" element={<AttendanceRegisterPage />} />
            <Route path="/workforce/leaves" element={<LeaveManagementPage />} />
            <Route path="/workforce/payroll" element={<PayrollRegisterPage />} />
            <Route path="/workforce/payroll/payslips/:id" element={<PayslipViewPage />} />
            <Route path="/workforce/performance" element={<PerformanceReviewPage />} />
            <Route path="/workforce/training" element={<TrainingSkillsPage />} />
            <Route path="/workforce/reports" element={<WorkforceReportsPage />} />
            <Route path="/admin/roles" element={<RolePermissionsPage />} />
            <Route path="/workforce/audit" element={<WorkforceAuditTrailPage />} />

            {/* Legacy alias redirects */}
            <Route path="/staff" element={<Navigate to="/workforce/employees" replace />} />
            <Route path="/audit" element={<Navigate to="/workforce/audit" replace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <PermissionsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </BrowserRouter>
      </PermissionsProvider>
    </AuthProvider>
  );
};

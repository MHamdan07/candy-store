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
import { SupplierListPage } from './pages/SupplierListPage';
import { SupplierProfilePage } from './pages/SupplierProfilePage';
import { GoodsReceiptPage } from './pages/GoodsReceiptPage';
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
import { CustomerLedgerPage } from './pages/finance/CustomerLedgerPage';
import { PaymentRegisterPage } from './pages/finance/PaymentRegisterPage';
import { CashCollectionPage } from './pages/cash/CashCollectionPage';
import { CashHandoverPage } from './pages/cash/CashHandoverPage';
import { CashReconciliationPage } from './pages/cash/CashReconciliationPage';
import { FleetConsolePage } from './pages/delivery/FleetConsolePage';

import { RolePermissionsPage } from './pages/RolePermissionsPage';
import type { SystemModule } from '@candi/types';

// Route guard checking view permission for active authenticated role
const RouteGuard: React.FC<{ module: SystemModule; element: React.ReactElement }> = ({ module, element }) => {
  const { hasPermission } = usePermissions();
  if (!hasPermission(module, 'view')) {
    return <Navigate to="/" replace />;
  }
  return element;
};

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
      case '/suppliers':
        return { title: 'Supplier Management & Database', subtitle: 'Vendor profiles, pricing agreements, terms, and khata balances' };
      case '/procurement/grn':
        return { title: 'Goods Received Notes (GRN)', subtitle: 'Inspection, damage segregation, and verified stock intake' };
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
      case '/finance/customer-ledger':
        return { title: 'Customer Sub-Ledger', subtitle: 'Detailed customer accounts receivable khata tied to GL Control Account 1100' };
      case '/finance/payments':
        return { title: 'Payment Register', subtitle: 'Master collection inflows and disbursement register with transaction audit references' };

      case '/admin/roles':
        return { title: '10-Module RBAC Permissions Matrix', subtitle: 'Enterprise role-based access control and granular action privileges' };

      default:
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
            <Route path="/customers" element={<RouteGuard module="customers" element={<CustomerListPage />} />} />
            <Route path="/customers/:id" element={<RouteGuard module="customers" element={<CustomerProfilePage />} />} />
            <Route path="/products" element={<RouteGuard module="inventory" element={<ProductListPage />} />} />
            <Route path="/orders" element={<RouteGuard module="sales" element={<OrderScreenPage />} />} />
            <Route path="/orders/verification" element={<RouteGuard module="sales" element={<ConversationalVerificationPage />} />} />
            <Route path="/invoices" element={<RouteGuard module="sales" element={<InvoiceScreenPage />} />} />
            <Route path="/pricing/tiers" element={<RouteGuard module="sales" element={<CustomerTierListPage />} />} />
            <Route path="/pricing/lists" element={<RouteGuard module="sales" element={<PriceListPage />} />} />
            <Route path="/pricing/trade-offers" element={<RouteGuard module="sales" element={<TradeOffersPage />} />} />
            <Route path="/pricing/preview" element={<RouteGuard module="sales" element={<OrderPricingPreviewPage />} />} />
            <Route path="/receivables/dashboard" element={<RouteGuard module="sales" element={<ReceivablesDashboardPage />} />} />
            <Route path="/receivables/statement" element={<RouteGuard module="sales" element={<CustomerStatementPage />} />} />
            <Route path="/receivables/aging" element={<RouteGuard module="sales" element={<InvoiceAgingReportPage />} />} />
            <Route path="/receivables/follow-ups" element={<RouteGuard module="sales" element={<CollectionFollowUpPage />} />} />
            <Route path="/reporting/management-dashboard" element={<RouteGuard module="reports" element={<ExecutiveDashboardPage />} />} />
            <Route path="/reporting/reports" element={<RouteGuard module="reports" element={<AdvancedReportsPage />} />} />
            <Route path="/delivery/fleet-console" element={<RouteGuard module="delivery" element={<FleetConsolePage />} />} />
            <Route path="/fleet" element={<Navigate to="/delivery/fleet-console" replace />} />
            <Route path="/cash/collections" element={<RouteGuard module="delivery" element={<CashCollectionPage />} />} />
            <Route path="/cash/handovers" element={<RouteGuard module="delivery" element={<CashHandoverPage />} />} />
            <Route path="/cash/reconciliation" element={<RouteGuard module="delivery" element={<CashReconciliationPage />} />} />
            <Route path="/finance/customer-ledger" element={<RouteGuard module="finance" element={<CustomerLedgerPage />} />} />
            <Route path="/finance/payments" element={<RouteGuard module="finance" element={<PaymentRegisterPage />} />} />
            <Route path="/suppliers" element={<RouteGuard module="suppliers" element={<SupplierListPage />} />} />
            <Route path="/suppliers/:id" element={<RouteGuard module="suppliers" element={<SupplierProfilePage />} />} />
            <Route path="/procurement/grn" element={<RouteGuard module="procurement" element={<GoodsReceiptPage />} />} />

            <Route path="/admin/roles" element={<RouteGuard module="administration" element={<RolePermissionsPage />} />} />

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

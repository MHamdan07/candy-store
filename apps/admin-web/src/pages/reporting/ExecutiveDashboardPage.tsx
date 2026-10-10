import React, { useState } from 'react';
import { Card, Badge, Button, Input, Modal } from '@candi/ui';
import { useNavigate } from 'react-router-dom';
import { INITIAL_DASHBOARD_METRICS } from '../../data/reportingAnalytics';
import { CUSTOMERS_DATABASE } from '../../data/customers';
import { INITIAL_PRICE_LIST } from '../../data/priceLists';
import { INITIAL_SUPPLIERS } from '../../data/suppliers';

export const ExecutiveDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Filter Bar State
  const [dateRange, setDateRange] = useState<'today' | 'this_week' | 'this_month' | 'ytd'>('today');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('ALL');
  const [selectedProductId, setSelectedProductId] = useState<string>('ALL');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('ALL');
  const [selectedRoute, setSelectedRoute] = useState<string>('ALL');
  const [selectedSalesperson, setSelectedSalesperson] = useState<string>('ALL');
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const metrics = INITIAL_DASHBOARD_METRICS;

  const handleExport = (format: 'excel' | 'pdf') => {
    setExportModalOpen(false);
    alert(`Management Dashboard snapshot successfully exported to ${format.toUpperCase()} with active filters: [Date Range: ${dateRange.toUpperCase()}, Route: ${selectedRoute}, Customer: ${selectedCustomerId}]. Timestamp: 2026-09-17 21:00`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--color-smoky-black)' }}>
            Executive Management Dashboard & Business Intelligence
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-olive-drab)' }}>
            Consolidated operational control tower across sales fulfillment, inventory valuation, procurement, credit receivables, and cash recovery.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="outline" onClick={() => setExportModalOpen(true)}>
            📥 Export to Excel / PDF
          </Button>
          <Button variant="primary" onClick={() => navigate('/reporting/reports')}>
            📊 Full Operational Reports (7 Views)
          </Button>
        </div>
      </div>

      {/* Multi-Dimensional Filter Bar */}
      <Card>
        <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-smoky-black)', marginBottom: '10px' }}>
          MULTI-DIMENSIONAL RECONCILED REPORTING FILTERS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', alignItems: 'flex-end' }}>
          {/* Date Presets */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '3px' }}>Date Window</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              style={{ width: '100%', padding: '7px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-bone)', fontSize: '12px' }}
            >
              <option value="today">Today (17 Sep)</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month (Sep)</option>
              <option value="ytd">Year to Date (2026)</option>
            </select>
          </div>

          {/* Customer */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '3px' }}>Customer</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              style={{ width: '100%', padding: '7px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-bone)', fontSize: '12px' }}
            >
              <option value="ALL">All Customers (42)</option>
              {CUSTOMERS_DATABASE.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Product */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '3px' }}>Product SKU</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              style={{ width: '100%', padding: '7px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-bone)', fontSize: '12px' }}
            >
              <option value="ALL">All SKUs (7 Active)</option>
              {INITIAL_PRICE_LIST.map((p) => (
                <option key={p.productId} value={p.productId}>{p.productName}</option>
              ))}
            </select>
          </div>

          {/* Supplier */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '3px' }}>Supplier</label>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              style={{ width: '100%', padding: '7px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-bone)', fontSize: '12px' }}
            >
              <option value="ALL">All Suppliers (6)</option>
              {INITIAL_SUPPLIERS.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Route */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '3px' }}>Route / Region</label>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              style={{ width: '100%', padding: '7px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-bone)', fontSize: '12px' }}
            >
              <option value="ALL">All Routes (4)</option>
              <option value="Route 01">Route 01: Gulshan</option>
              <option value="Route 02">Route 02: Saddar</option>
              <option value="Route 04">Route 04: Clifton/DHA</option>
              <option value="Route 05">Route 05: Liaquatabad</option>
            </select>
          </div>

          {/* Salesperson */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '3px' }}>Sales Lead</label>
            <select
              value={selectedSalesperson}
              onChange={(e) => setSelectedSalesperson(e.target.value)}
              style={{ width: '100%', padding: '7px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-bone)', fontSize: '12px' }}
            >
              <option value="ALL">All Sales Reps</option>
              <option value="Adnan Tariq">Adnan Tariq</option>
              <option value="Kamran Siddiqui">Kamran Siddiqui</option>
              <option value="Zubair Shah">Zubair Shah</option>
              <option value="Tariq Mehmood">Tariq Mehmood</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Row 1: Today's Revenue & Order Execution Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        <Card style={{ borderLeft: '4px solid #2D6A4F' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-olive-drab)' }}>TODAY'S GROSS SALES</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-smoky-black)', marginTop: '4px' }}>
            PKR {metrics.todaySalesPKR.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#2D6A4F', marginTop: '2px', fontWeight: 700 }}>
            +{metrics.todaySalesChangePct}% vs Yesterday
          </div>
        </Card>

        <Card style={{ borderLeft: '4px solid #11120D' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-olive-drab)' }}>TODAY'S ORDERS</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-smoky-black)', marginTop: '4px' }}>
            {metrics.todayOrdersCount} Booked
          </div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
            Avg Basket: PKR {(metrics.todaySalesPKR / metrics.todayOrdersCount).toFixed(0)}
          </div>
        </Card>

        <Card style={{ borderLeft: '4px solid #C27803' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-olive-drab)' }}>PENDING CONFIRMATIONS</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#C27803', marginTop: '4px' }}>
            {metrics.pendingConfirmationsCount} Orders
          </div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
            Awaiting WhatsApp verification
          </div>
        </Card>

        <Card style={{ borderLeft: '4px solid #005F73' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-olive-drab)' }}>AWAITING DISPATCH / PICKING</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#005F73', marginTop: '4px' }}>
            {metrics.ordersAwaitingDispatchCount} Orders
          </div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
            {metrics.completedDeliveriesCount} Completed Deliveries
          </div>
        </Card>
      </div>

      {/* Row 2: Inventory, Procurement, Receivables, Cash */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        <Card style={{ borderLeft: '4px solid #D00000' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-olive-drab)' }}>LOW STOCK ALERTS</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#D00000', marginTop: '4px' }}>
            {metrics.lowStockAlertsCount} SKUs
          </div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
            1 Out of Stock • 2 Below Reorder Point
          </div>
        </Card>

        <Card style={{ borderLeft: '4px solid #565449' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-olive-drab)' }}>OPEN PURCHASE ORDERS</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-smoky-black)', marginTop: '4px' }}>
            {metrics.openPurchaseOrdersCount} POs
          </div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
            PKR 670,000 inbound replenishment
          </div>
        </Card>

        <Card style={{ borderLeft: '4px solid #8C2A2A' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-olive-drab)' }}>OVERDUE RECEIVABLES</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#8C2A2A', marginTop: '4px' }}>
            PKR {metrics.overdueInvoicesPKR.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
            Total Khata: PKR {metrics.outstandingReceivablesPKR.toLocaleString()}
          </div>
        </Card>

        <Card style={{ borderLeft: '4px solid #1B4332', backgroundColor: 'var(--color-bone)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-smoky-black)' }}>CASH RECOVERED TODAY</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#1B4332', marginTop: '4px' }}>
            PKR {metrics.cashCollectedTodayPKR.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#565449', marginTop: '2px' }}>
            Reconciled Cashier Drawer
          </div>
        </Card>
      </div>

      {/* Row 3: Operational Quick Navigation & Open Exceptions */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        <Card title="Quick Operational Drill-Downs">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <Button variant="outline" onClick={() => navigate('/orders')}>
              📦 Orders & Pick Lists (6)
            </Button>
            <Button variant="outline" onClick={() => navigate('/receivables/statement')}>
              🧾 Customer Khatas (42)
            </Button>
            <Button variant="outline" onClick={() => navigate('/procurement/planning')}>
              📈 Reorder Planning (3)
            </Button>
            <Button variant="outline" onClick={() => navigate('/receivables/aging')}>
              ⏳ Invoice Aging (5 Overdue)
            </Button>
            <Button variant="outline" onClick={() => navigate('/pricing/lists')}>
              💲 Wholesale Prices (7)
            </Button>
            <Button variant="outline" onClick={() => navigate('/procurement/grn')}>
              📥 Goods Receipt (GRN)
            </Button>
          </div>
        </Card>

        <Card title={`Open Operational Exceptions (${metrics.openExceptionsCount})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ padding: '8px', backgroundColor: '#FFF0F0', border: '1px solid #D00000', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontWeight: 800, color: '#D00000' }}>Credit Hold Lock</div>
              <div style={{ color: '#555', marginTop: '2px' }}>SubhanAllah Cash & Carry has 2 invoices overdue &gt; 60 days.</div>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#FFF8EA', border: '1px solid #E6C875', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontWeight: 800, color: '#C27803' }}>Stock Out of Stock</div>
              <div style={{ color: '#555', marginTop: '2px' }}>Sour Berry Gummy Bears reached 0 inventory level.</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Export Modal */}
      {exportModalOpen && (
        <Modal
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          title="Export Management Dashboard Report"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--color-bone)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontWeight: 800 }}>CANDI SUPER STORE MANAGEMENT CONTROL REPORT</div>
              <div style={{ fontSize: '12px', color: '#565449', marginTop: '3px' }}>
                Snapshot Timestamp: 2026-09-17 21:00:00 • Generated by: Kashif Razzaq
              </div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '3px' }}>
                Applied Scope: [Date: {dateRange.toUpperCase()}, Customer: {selectedCustomerId}, Route: {selectedRoute}]
              </div>
            </div>

            <p style={{ margin: 0 }}>
              Select target format for reconciled business intelligence report:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Button variant="primary" onClick={() => handleExport('excel')}>
                📊 Download Excel (.xlsx / CSV)
              </Button>
              <Button variant="secondary" onClick={() => handleExport('pdf')}>
                📄 Download Executive PDF
              </Button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <Button variant="outline" onClick={() => setExportModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

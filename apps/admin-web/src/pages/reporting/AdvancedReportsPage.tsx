import React, { useState } from 'react';
import { Card, Table, Badge, Button, Input, Modal } from '@candi/ui';
import {
  MOCK_SALES_REPORT_DATA,
  MOCK_INVENTORY_REPORT_DATA,
  MOCK_PURCHASING_REPORT_DATA,
  MOCK_PAYABLES_REPORT_DATA,
  MOCK_CASH_REPORT_DATA,
  MOCK_GROSS_MARGIN_DATA,
} from '../../data/reportingAnalytics';

export const AdvancedReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'sales' | 'inventory' | 'purchasing' | 'receivables' | 'payables' | 'cash' | 'margin'
  >('sales');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrillDown, setSelectedDrillDown] = useState<any | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Columns for Sales Report
  const salesColumns = [
    { header: 'Dimension (Customer / Segment)', accessor: 'dimensionLabel' as const, width: '320px' },
    { header: 'Orders', accessor: 'ordersCount' as const, width: '100px' },
    { header: 'Volume (Units)', accessor: 'quantityUnits' as const, width: '130px' },
    {
      header: 'Gross Sales (PKR)',
      render: (r: any) => `PKR ${r.grossSalesPKR.toLocaleString()}`,
      width: '160px',
    },
    {
      header: 'Discounts',
      render: (r: any) => <span style={{ color: '#C27803' }}>- PKR {r.discountsPKR.toLocaleString()}</span>,
      width: '140px',
    },
    {
      header: 'Returns',
      render: (r: any) => (r.returnsPKR > 0 ? <span style={{ color: '#8C2A2A' }}>- PKR {r.returnsPKR.toLocaleString()}</span> : '-'),
      width: '130px',
    },
    {
      header: 'Net Billed Sales (PKR)',
      render: (r: any) => <strong>PKR {r.netSalesPKR.toLocaleString()}</strong>,
      width: '180px',
    },
    {
      header: 'Drill-Down',
      render: (r: any) => (
        <Button size="sm" variant="outline" onClick={() => setSelectedDrillDown({ type: 'sales', data: r })}>
          Source Orders ({r.sourceOrderIds.length})
        </Button>
      ),
      width: '160px',
    },
  ];

  // Columns for Inventory Report
  const inventoryColumns = [
    {
      header: 'Product / SKU',
      render: (r: any) => (
        <div>
          <div style={{ fontWeight: 800 }}>{r.productName}</div>
          <div style={{ fontSize: '11px', color: '#666' }}>SKU: {r.sku} • {r.category} ({r.packagingUnit})</div>
        </div>
      ),
      width: '260px',
    },
    { header: 'Current Stock', accessor: 'currentStock' as const, width: '120px' },
    { header: 'Available', accessor: 'availableStock' as const, width: '110px' },
    {
      header: 'Unit Cost',
      render: (r: any) => `PKR ${r.unitCostPKR.toLocaleString()}`,
      width: '130px',
    },
    {
      header: 'Total Valuation',
      render: (r: any) => <strong>PKR {r.stockValuationPKR.toLocaleString()}</strong>,
      width: '160px',
    },
    {
      header: 'Health Status',
      render: (r: any) => {
        let variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' = 'neutral';
        if (r.status === 'healthy') variant = 'success';
        if (r.status === 'low_stock' || r.status === 'reorder_required') variant = 'warning';
        if (r.status === 'out_of_stock') variant = 'danger';
        if (r.status === 'overstock') variant = 'info';
        return <Badge variant={variant}>{r.status.replace(/_/g, ' ').toUpperCase()}</Badge>;
      },
      width: '160px',
    },
    {
      header: 'Turnover & Days',
      render: (r: any) => `${r.daysOfInventory} Days (Run-rate: ${r.monthlyMovementQty}/mo)`,
      width: '180px',
    },
  ];

  // Columns for Purchasing Report
  const purchasingColumns = [
    { header: 'Supplier Name', accessor: 'supplierName' as const, width: '280px' },
    { header: 'Category', accessor: 'category' as const, width: '180px' },
    { header: 'POs Issued', accessor: 'totalPOsIssued' as const, width: '110px' },
    {
      header: 'Total Purchase Cost',
      render: (r: any) => `PKR ${r.totalPurchaseCostPKR.toLocaleString()}`,
      width: '170px',
    },
    {
      header: 'Received (GRN)',
      render: (r: any) => <strong style={{ color: '#1B4332' }}>PKR {r.receivedCostPKR.toLocaleString()}</strong>,
      width: '160px',
    },
    {
      header: 'Inbound Pending',
      render: (r: any) => `PKR ${r.pendingDeliveryCostPKR.toLocaleString()}`,
      width: '150px',
    },
    {
      header: 'Open POs',
      render: (r: any) => (
        <Button size="sm" variant="outline" onClick={() => setSelectedDrillDown({ type: 'purchasing', data: r })}>
          View {r.openPOCount} Open POs
        </Button>
      ),
      width: '160px',
    },
  ];

  // Columns for Payables Report
  const payablesColumns = [
    { header: 'Supplier Name & Code', render: (r: any) => `${r.supplierName} (${r.supplierCode})`, width: '280px' },
    { header: 'Terms', accessor: 'paymentTerms' as const, width: '130px' },
    {
      header: 'Total Invoiced',
      render: (r: any) => `PKR ${r.totalInvoicedPKR.toLocaleString()}`,
      width: '150px',
    },
    {
      header: 'Paid to Date',
      render: (r: any) => `PKR ${r.paidPKR.toLocaleString()}`,
      width: '150px',
    },
    {
      header: 'Outstanding Balance',
      render: (r: any) => <strong>PKR {r.outstandingBalancePKR.toLocaleString()}</strong>,
      width: '170px',
    },
    {
      header: 'Due in 7 Days',
      render: (r: any) => `PKR ${r.dueWithin7DaysPKR.toLocaleString()}`,
      width: '150px',
    },
    {
      header: '3-Way Match Status',
      render: (r: any) => (
        <Badge variant={r.threeWayMatchCleared ? 'success' : 'warning'}>
          {r.threeWayMatchCleared ? 'CLEARED' : 'PENDING MATCH'}
        </Badge>
      ),
      width: '170px',
    },
  ];

  // Columns for Cash Report
  const cashColumns = [
    { header: 'Time & ID', render: (r: any) => `${r.timestamp} (${r.transactionId})`, width: '180px' },
    {
      header: 'Ref & Transaction Type',
      render: (r: any) => (
        <div>
          <div style={{ fontWeight: 700 }}>{r.referenceNumber}</div>
          <Badge variant={r.inflowPKR > 0 ? 'success' : 'warning'}>
            {r.referenceType.replace(/_/g, ' ').toUpperCase()}
          </Badge>
        </div>
      ),
      width: '180px',
    },
    { header: 'Party (Customer / Payee)', accessor: 'customerOrPayee' as const, width: '240px' },
    { header: 'Handler / Officer', accessor: 'cashierOrDriver' as const, width: '180px' },
    {
      header: 'Inflow (+Cash)',
      render: (r: any) => (r.inflowPKR > 0 ? <strong style={{ color: '#1B4332' }}>+ PKR {r.inflowPKR.toLocaleString()}</strong> : '-'),
      width: '150px',
    },
    {
      header: 'Outflow (-Expense)',
      render: (r: any) => (r.outflowPKR > 0 ? <span style={{ color: '#8C2A2A' }}>- PKR {r.outflowPKR.toLocaleString()}</span> : '-'),
      width: '150px',
    },
    {
      header: 'Reconciliation',
      render: (r: any) => <Badge variant={r.isReconciled ? 'success' : 'danger'}>{r.isReconciled ? 'RECONCILED' : 'VARIANCE'}</Badge>,
      width: '140px',
    },
  ];

  // Columns for Margin Report
  const marginColumns = [
    { header: 'Accounting Period', accessor: 'periodLabel' as const, width: '260px' },
    {
      header: 'Gross Revenue',
      render: (r: any) => `PKR ${r.grossRevenuePKR.toLocaleString()}`,
      width: '160px',
    },
    {
      header: 'Deductions (Discounts & Returns)',
      render: (r: any) => `- PKR ${(r.discountsPKR + r.returnsPKR).toLocaleString()}`,
      width: '200px',
    },
    {
      header: 'Net Billed Revenue',
      render: (r: any) => <strong>PKR {r.netRevenuePKR.toLocaleString()}</strong>,
      width: '180px',
    },
    {
      header: 'COGS (Wholesale Cost)',
      render: (r: any) => `PKR ${r.costOfGoodsSoldPKR.toLocaleString()}`,
      width: '180px',
    },
    {
      header: 'Gross Profit Margin',
      render: (r: any) => (
        <div>
          <strong style={{ color: '#1B4332', fontSize: '14px' }}>PKR {r.grossMarginPKR.toLocaleString()}</strong>
          <div style={{ fontSize: '11px', color: '#2D6A4F', fontWeight: 800 }}>{r.grossMarginPct.toFixed(1)}% Margin</div>
        </div>
      ),
      width: '180px',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--color-smoky-black)' }}>
            Operational Business Reports & Audit Reconciliations
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-olive-drab)' }}>
            Multi-dimensional drill-down analytics for sales, stock movement, purchasing, receivables, payables, and cash drawers.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" onClick={() => setExportModalOpen(true)}>
            📥 Export Current Report (Excel / PDF)
          </Button>
        </div>
      </div>

      {/* Report Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid var(--color-bone)', paddingBottom: '10px', overflowX: 'auto' }}>
        {[
          { key: 'sales', label: '1. Sales Reports' },
          { key: 'inventory', label: '2. Inventory Valuation' },
          { key: 'purchasing', label: '3. Purchasing & Suppliers' },
          { key: 'receivables', label: '4. Receivables & Aging' },
          { key: 'payables', label: '5. Payables & 3-Way Match' },
          { key: 'cash', label: '6. Cash Inflows & Drawers' },
          { key: 'margin', label: '7. Gross Margins & Profit' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: activeTab === key ? 'var(--color-smoky-black)' : 'var(--color-bone)',
              color: activeTab === key ? 'var(--color-floral-white)' : 'var(--color-smoky-black)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Active Tab View */}
      <Card>
        {activeTab === 'sales' && (
          <Table
            columns={salesColumns}
            data={MOCK_SALES_REPORT_DATA}
            keyExtractor={(r) => r.dimensionId}
            emptyMessage="No sales data found."
          />
        )}

        {activeTab === 'inventory' && (
          <Table
            columns={inventoryColumns}
            data={MOCK_INVENTORY_REPORT_DATA}
            keyExtractor={(r) => r.productId}
            emptyMessage="No inventory data found."
          />
        )}

        {activeTab === 'purchasing' && (
          <Table
            columns={purchasingColumns}
            data={MOCK_PURCHASING_REPORT_DATA}
            keyExtractor={(r) => r.supplierId}
            emptyMessage="No purchasing data found."
          />
        )}

        {activeTab === 'receivables' && (
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <p>Comprehensive 5-bucket receivables and overdue schedule:</p>
            <Button variant="primary" onClick={() => window.location.href = '/receivables/aging'}>
              Open Full Invoice Aging Report
            </Button>
          </div>
        )}

        {activeTab === 'payables' && (
          <Table
            columns={payablesColumns}
            data={MOCK_PAYABLES_REPORT_DATA}
            keyExtractor={(r) => r.supplierId}
            emptyMessage="No payables data found."
          />
        )}

        {activeTab === 'cash' && (
          <Table
            columns={cashColumns}
            data={MOCK_CASH_REPORT_DATA}
            keyExtractor={(r) => r.transactionId}
            emptyMessage="No cash transactions recorded."
          />
        )}

        {activeTab === 'margin' && (
          <Table
            columns={marginColumns}
            data={MOCK_GROSS_MARGIN_DATA}
            keyExtractor={(r) => r.periodLabel}
            emptyMessage="No gross margin data available."
          />
        )}
      </Card>

      {/* Transaction Drill-Down Modal */}
      {selectedDrillDown && (
        <Modal
          isOpen={Boolean(selectedDrillDown)}
          onClose={() => setSelectedDrillDown(null)}
          title={`Drill-Down to Source Transactions: ${selectedDrillDown.data.dimensionLabel || selectedDrillDown.data.supplierName}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ padding: '10px', backgroundColor: 'var(--color-bone)', borderRadius: 'var(--radius-sm)' }}>
              <strong>Reconciled Source Records:</strong> All aggregated figures correspond directly to individual transaction IDs in the master operational database.
            </div>

            {selectedDrillDown.type === 'sales' && (
              <div>
                <div style={{ fontWeight: 800, marginBottom: '6px' }}>Source Wholesale Orders:</div>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {selectedDrillDown.data.sourceOrderIds.map((id: string) => (
                    <li key={id} style={{ marginBottom: '4px' }}>
                      <strong>{id}</strong> — Delivered and posted to Customer Statement Ledger.
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedDrillDown.type === 'purchasing' && (
              <div>
                <div style={{ fontWeight: 800, marginBottom: '6px' }}>Open Purchase Orders:</div>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {selectedDrillDown.data.sourcePOIds.map((id: string) => (
                    <li key={id} style={{ marginBottom: '4px' }}>
                      <strong>{id}</strong> — Inbound manufacturer replenishment order.
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Button variant="outline" onClick={() => setSelectedDrillDown(null)}>
                Close Drill-Down
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Export Modal */}
      {exportModalOpen && (
        <Modal
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          title="Export Operational Report"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--color-bone)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontWeight: 800 }}>ACTIVE REPORT: {activeTab.toUpperCase()} SCHEDULE</div>
              <div style={{ fontSize: '12px', color: '#565449', marginTop: '3px' }}>
                Export Timestamp: 2026-09-17 21:00:00 • Status: Verified Reconciled
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Button variant="primary" onClick={() => { alert('Report exported to Excel (.xlsx).'); setExportModalOpen(false); }}>
                📊 Download Excel (.xlsx)
              </Button>
              <Button variant="secondary" onClick={() => { alert('Report rendered to PDF with audit stamp.'); setExportModalOpen(false); }}>
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

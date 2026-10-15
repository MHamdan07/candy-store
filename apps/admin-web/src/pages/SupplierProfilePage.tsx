import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, Badge, Button, Input, Dropdown, Modal, Alert } from '@candi/ui';
import type { Supplier, SupplierStatus } from '@candi/types';
import { INITIAL_SUPPLIERS } from '../data/suppliers';

export const SupplierProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const foundSupplier = INITIAL_SUPPLIERS.find((s) => s.id === id) || INITIAL_SUPPLIERS[0];
  const [supplier, setSupplier] = useState<Supplier>(foundSupplier);
  const [activeTab, setActiveTab] = useState<
    'info' | 'products' | 'priceHistory' | 'orders' | 'grn' | 'invoices' | 'notes' | 'audit'
  >('info');

  const [notice, setNotice] = useState<string | null>(null);
  const [isEditTermsModalOpen, setIsEditTermsModalOpen] = useState(false);
  const [tempTerms, setTempTerms] = useState(supplier.paymentTerms);
  const [tempCreditLimit, setTempCreditLimit] = useState(supplier.creditLimit.toString());
  const [termsChangeReason, setTermsChangeReason] = useState('');

  // Workflow transitions
  const handleStatusChange = (newStatus: SupplierStatus, actionNote: string) => {
    setSupplier((prev) => ({
      ...prev,
      status: newStatus,
      auditHistory: [
        {
          timestamp: new Date().toISOString().slice(0, 16),
          actor: 'Farhan Zaidi (Authorized Lead)',
          action: `Status Changed to ${newStatus.toUpperCase()}`,
          details: actionNote,
        },
        ...(prev.auditHistory || []),
      ],
      updatedAt: new Date().toISOString().slice(0, 10),
    }));
    setNotice(`Supplier status transitioned to: ${newStatus.toUpperCase()}`);
  };

  // Controlled change of payment terms & bank details
  const handleSavePaymentTerms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsChangeReason.trim()) {
      alert('A formal justification reason is required to modify payment terms or credit limits.');
      return;
    }

    setSupplier((prev) => ({
      ...prev,
      paymentTerms: tempTerms,
      creditLimit: Number(tempCreditLimit) || prev.creditLimit,
      auditHistory: [
        {
          timestamp: new Date().toISOString().slice(0, 16),
          actor: 'Farhan Zaidi (Procurement Manager)',
          action: 'Terms & Credit Revision (Approved)',
          details: `Terms updated to "${tempTerms}", Credit Limit set to PKR ${Number(tempCreditLimit).toLocaleString()}. Reason: ${termsChangeReason}`,
        },
        ...(prev.auditHistory || []),
      ],
      updatedAt: new Date().toISOString().slice(0, 10),
    }));

    setIsEditTermsModalOpen(false);
    setNotice(`Payment terms & credit limit updated and recorded in audit log.`);
    setTermsChangeReason('');
  };

  const getStatusBadge = (status: SupplierStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'pending_approval':
        return <Badge variant="warning">Pending Approval</Badge>;
      case 'approved':
        return <Badge variant="info">Approved</Badge>;
      case 'on_hold':
        return <Badge variant="neutral">On Hold</Badge>;
      case 'inactive':
        return <Badge variant="danger">Inactive</Badge>;
      case 'new_supplier':
        return <Badge variant="info">New Supplier</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  // Historical linked POs
  const linkedPOs: any[] = [];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Breadcrumb & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button size="sm" variant="secondary" onClick={() => navigate('/suppliers')}>
            ← Back to Suppliers
          </Button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1
                style={{
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '22px',
                  fontWeight: 800,
                  color: 'var(--color-smoky-black)',
                  margin: 0,
                }}
              >
                {supplier.name}
              </h1>
              <span
                style={{
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-olive-drab)',
                  backgroundColor: 'var(--color-bone)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                {supplier.code}
              </span>
              {getStatusBadge(supplier.status)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
              {supplier.category} • {supplier.city} • Registered on {supplier.createdAt}
            </div>
          </div>
        </div>

        {/* Workflow Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {supplier.status === 'pending_approval' && (
            <Button
              variant="primary"
              onClick={() =>
                handleStatusChange('approved', 'Approved by procurement management after document review')
              }
            >
              ✓ Approve Supplier
            </Button>
          )}

          {supplier.status === 'approved' && (
            <Button
              variant="primary"
              onClick={() => handleStatusChange('active', 'Promoted to Active vendor ready for purchase ordering')}
            >
              Activate for Orders
            </Button>
          )}

          {supplier.status === 'active' && (
            <Button
              variant="secondary"
              onClick={() =>
                handleStatusChange('on_hold', 'Placed on hold pending operational or quality compliance audit')
              }
            >
              Put On Hold
            </Button>
          )}

          {supplier.status === 'on_hold' && (
            <Button
              variant="primary"
              onClick={() =>
                handleStatusChange('active', 'Reinstated to active status following resolution of inspection hold')
              }
            >
              Reactivate Supplier
            </Button>
          )}

          {supplier.status !== 'inactive' && (
            <Button
              variant="danger"
              onClick={() =>
                handleStatusChange('inactive', 'Supplier permanently marked inactive and restricted from purchase orders')
              }
            >
              Deactivate
            </Button>
          )}

          {/* Quick Create PO Button - Disabled if Inactive or On Hold */}
          <Button
            variant="primary"
            disabled={supplier.status === 'inactive' || supplier.status === 'on_hold'}
            onClick={() => navigate('/procurement/orders/new')}
            title={
              supplier.status === 'inactive' || supplier.status === 'on_hold'
                ? 'Cannot create purchase orders for inactive or on-hold suppliers'
                : 'Create Purchase Order'
            }
          >
            + Create PO
          </Button>
        </div>
      </div>

      {notice && (
        <div style={{ marginBottom: '16px' }}>
          <Alert type="success">{notice}</Alert>
        </div>
      )}

      {/* Control Warning if On Hold or Inactive */}
      {supplier.status === 'on_hold' && (
        <div style={{ marginBottom: '16px' }}>
          <Alert type="warning">
            <strong>SUPPLIER ON HOLD:</strong> This supplier is temporarily suspended from receiving new purchase orders. Existing invoices and outstanding balances can still be settled.
          </Alert>
        </div>
      )}

      {supplier.status === 'inactive' && (
        <div style={{ marginBottom: '16px' }}>
          <Alert type="danger">
            <strong>INACTIVE SUPPLIER:</strong> This supplier is permanently deactivated. System controls forbid issuing new Purchase Orders.
          </Alert>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <Card padding="md">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            Outstanding Balance
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: supplier.outstandingBalance > 0 ? '#b91c1c' : 'var(--color-olive-drab)', marginTop: '4px' }}>
            PKR {supplier.outstandingBalance.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            Pending payments across verified invoices
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            Authorized Credit Limit
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-smoky-black)', marginTop: '4px' }}>
            PKR {supplier.creditLimit.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            Utilization: {supplier.creditLimit > 0 ? Math.round((supplier.outstandingBalance / supplier.creditLimit) * 100) : 0}%
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            Delivery Lead Time
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-smoky-black)', marginTop: '4px' }}>
            {supplier.deliveryLeadTime}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            Standard fulfillment SLA
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            Payment Terms
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-smoky-black)', marginTop: '6px' }}>
            {supplier.paymentTerms}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '4px' }}>
            <button
              onClick={() => setIsEditTermsModalOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: 'var(--color-olive-drab)',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontFamily: 'var(--font-family-mono)',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              Modify Terms (Requires Auth)
            </button>
          </div>
        </Card>
      </div>

      {/* Tabs Bar */}
      <div
        style={{
          display: 'flex',
          borderBottom: '2px solid var(--color-bone)',
          marginBottom: '20px',
          gap: '4px',
        }}
      >
        {[
          { key: 'info', label: 'Overview & Bank' },
          { key: 'products', label: `Products Supplied (${supplier.productsSupplied?.length || 0})` },
          { key: 'priceHistory', label: 'Price History' },
          { key: 'orders', label: `Purchase Orders (${linkedPOs.length})` },
          { key: 'grn', label: `Goods Received (${supplier.goodsReceived?.length || 0})` },
          { key: 'invoices', label: `Invoices & Payments (${supplier.invoices?.length || 0})` },
          { key: 'notes', label: 'Notes & Attachments' },
          { key: 'audit', label: `Audit Log (${supplier.auditHistory?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '10px 16px',
              fontFamily: 'var(--font-family-mono)',
              fontSize: '13px',
              fontWeight: activeTab === tab.key ? 700 : 500,
              color: activeTab === tab.key ? 'var(--color-smoky-black)' : 'var(--color-olive-drab)',
              backgroundColor: activeTab === tab.key ? 'var(--color-bone)' : 'transparent',
              border: 'none',
              borderTopLeftRadius: '6px',
              borderTopRightRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & BANK */}
      {activeTab === 'info' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <Card padding="lg">
            <h3 style={{ fontFamily: 'var(--font-family-mono)', fontSize: '15px', fontWeight: 800, marginTop: 0, marginBottom: '16px' }}>
              Company & Contact Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--color-olive-drab)', width: '140px', display: 'inline-block' }}>Company Name:</span>
                <strong>{supplier.name}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)', width: '140px', display: 'inline-block' }}>Supplier Code:</span>
                <code>{supplier.code}</code>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)', width: '140px', display: 'inline-block' }}>Contact Person:</span>
                <strong>{supplier.contactPerson}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)', width: '140px', display: 'inline-block' }}>Phone Number:</span>
                <span>{supplier.phone}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)', width: '140px', display: 'inline-block' }}>Email:</span>
                <span>{supplier.email || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)', width: '140px', display: 'inline-block' }}>Address:</span>
                <span>{supplier.address}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)', width: '140px', display: 'inline-block' }}>City:</span>
                <span>{supplier.city}, Pakistan</span>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-family-mono)', fontSize: '15px', fontWeight: 800, margin: 0 }}>
                Bank & Settlement Accounts
              </h3>
              <Badge variant="neutral">Verified</Badge>
            </div>
            {supplier.bankDetails ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: 'var(--color-olive-drab)', width: '130px', display: 'inline-block' }}>Bank Name:</span>
                  <strong>{supplier.bankDetails.bankName}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-olive-drab)', width: '130px', display: 'inline-block' }}>Account Title:</span>
                  <strong>{supplier.bankDetails.accountTitle}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-olive-drab)', width: '130px', display: 'inline-block' }}>Account Number:</span>
                  <code>{supplier.bankDetails.accountNumber}</code>
                </div>
                <div>
                  <span style={{ color: 'var(--color-olive-drab)', width: '130px', display: 'inline-block' }}>IBAN:</span>
                  <code>{supplier.bankDetails.iban}</code>
                </div>
                <div style={{ marginTop: '12px', padding: '10px', backgroundColor: 'var(--color-bone)', borderRadius: '4px', fontSize: '11px', color: 'var(--color-olive-drab)' }}>
                  🔒 <strong>Governance Rule:</strong> Changes to bank account credentials or payment terms require dual authorization from Finance & Procurement leads.
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--color-olive-drab)', fontStyle: 'italic' }}>
                No bank account details provided yet.
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: PRODUCTS SUPPLIED */}
      {activeTab === 'products' && (
        <Card padding="none">
          <Table
            columns={[
              { header: 'SKU', accessor: 'sku' as const, width: '140px' },
              { header: 'Product Name', accessor: 'productName' as const },
              { header: 'Packaging Unit', accessor: 'unit' as const, width: '130px' },
              {
                header: 'Current Supply Price',
                render: (row: any) => (
                  <strong>PKR {row.currentSupplyPrice.toLocaleString()}</strong>
                ),
                width: '180px',
              },
              { header: 'Last Price Revision', accessor: 'lastPriceChangeDate' as const, width: '160px' },
            ]}
            data={supplier.productsSupplied || []}
            emptyMessage="No products currently cataloged for this supplier."
          />
        </Card>
      )}

      {/* TAB 3: PRICE HISTORY */}
      {activeTab === 'priceHistory' && (
        <Card padding="none">
          <Table
            columns={[
              { header: 'SKU', accessor: 'sku' as const, width: '130px' },
              { header: 'Product Name', accessor: 'productName' as const },
              {
                header: 'Price Revision',
                render: (row: any) => (
                  <span>
                    <span style={{ textDecoration: 'line-through', color: 'var(--color-olive-drab)' }}>
                      PKR {row.oldPrice.toLocaleString()}
                    </span>{' '}
                    → <strong>PKR {row.newPrice.toLocaleString()}</strong>
                  </span>
                ),
                width: '180px',
              },
              { header: 'Effective Date', accessor: 'effectiveDate' as const, width: '140px' },
              { header: 'Approved By', accessor: 'approvedBy' as const, width: '220px' },
            ]}
            data={supplier.priceHistory || []}
            emptyMessage="No historical price revisions recorded."
          />
        </Card>
      )}

      {/* TAB 4: PURCHASE ORDERS */}
      {activeTab === 'orders' && (
        <Card padding="none">
          <Table
            columns={[
              {
                header: 'PO Number',
                render: (row: any) => (
                  <button
                    onClick={() => navigate(`/procurement/orders/${row.id}`)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontWeight: 700,
                      color: 'var(--color-smoky-black)',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontFamily: 'var(--font-family-mono)',
                    }}
                  >
                    {row.poNumber}
                  </button>
                ),
                width: '140px',
              },
              { header: 'Order Date', accessor: 'orderDate' as const, width: '120px' },
              { header: 'Expected Delivery', accessor: 'expectedDeliveryDate' as const, width: '140px' },
              {
                header: 'Total Amount',
                render: (row: any) => <strong>PKR {row.total.toLocaleString()}</strong>,
                width: '150px',
              },
              {
                header: 'Status',
                render: (row: any) => <Badge variant="info">{row.status}</Badge>,
                width: '140px',
              },
            ]}
            data={linkedPOs}
            emptyMessage="No purchase orders linked to this supplier."
          />
        </Card>
      )}

      {/* TAB 5: GOODS RECEIVED (GRN) */}
      {activeTab === 'grn' && (
        <Card padding="none">
          <Table
            columns={[
              { header: 'GRN Number', accessor: 'grnNumber' as const, width: '140px' },
              { header: 'Linked PO', accessor: 'poNumber' as const, width: '130px' },
              { header: 'Delivery Date', accessor: 'deliveryDate' as const, width: '130px' },
              { header: 'Received By', accessor: 'receivedBy' as const, width: '180px' },
              { header: 'Items Accepted', accessor: 'itemCount' as const, width: '130px' },
              { header: 'Quality / Inspection Notes', accessor: 'notes' as const },
            ]}
            data={supplier.goodsReceived || []}
            emptyMessage="No Goods Received Notes (GRN) recorded."
          />
        </Card>
      )}

      {/* TAB 6: INVOICES & PAYMENTS */}
      {activeTab === 'invoices' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-family-mono)', fontSize: '15px', fontWeight: 800, marginBottom: '12px' }}>
              Supplier Invoices
            </h3>
            <Card padding="none">
              <Table
                columns={[
                  { header: 'Invoice Number', accessor: 'invoiceNumber' as const, width: '150px' },
                  { header: 'PO Reference', accessor: 'poNumber' as const, width: '140px' },
                  { header: 'Invoice Date', accessor: 'invoiceDate' as const, width: '120px' },
                  { header: 'Due Date', accessor: 'dueDate' as const, width: '120px' },
                  {
                    header: 'Total Amount',
                    render: (row: any) => <strong>PKR {row.amount.toLocaleString()}</strong>,
                    width: '140px',
                  },
                  {
                    header: 'Paid Amount',
                    render: (row: any) => <span>PKR {row.paidAmount.toLocaleString()}</span>,
                    width: '140px',
                  },
                  {
                    header: 'Status',
                    render: (row: any) => (
                      <Badge variant={row.status === 'paid' ? 'success' : row.status === 'partially_paid' ? 'warning' : 'danger'}>
                        {row.status}
                      </Badge>
                    ),
                    width: '120px',
                  },
                ]}
                data={supplier.invoices || []}
                emptyMessage="No supplier invoices logged."
              />
            </Card>
          </div>

          <div>
            <h3 style={{ fontFamily: 'var(--font-family-mono)', fontSize: '15px', fontWeight: 800, marginBottom: '12px' }}>
              Recorded Payments
            </h3>
            <Card padding="none">
              <Table
                columns={[
                  { header: 'Payment Voucher', accessor: 'paymentNumber' as const, width: '150px' },
                  { header: 'Applied Invoice', accessor: 'invoiceNumber' as const, width: '150px' },
                  { header: 'Date', accessor: 'paymentDate' as const, width: '120px' },
                  {
                    header: 'Amount Paid',
                    render: (row: any) => <strong style={{ color: '#15803d' }}>PKR {row.amount.toLocaleString()}</strong>,
                    width: '150px',
                  },
                  { header: 'Method', accessor: 'method' as const, width: '140px' },
                  { header: 'Bank Reference #', accessor: 'referenceNo' as const },
                ]}
                data={supplier.payments || []}
                emptyMessage="No payment vouchers logged."
              />
            </Card>
          </div>
        </div>
      )}

      {/* TAB 7: NOTES & ATTACHMENTS */}
      {activeTab === 'notes' && (
        <Card padding="lg">
          <h3 style={{ fontFamily: 'var(--font-family-mono)', fontSize: '15px', fontWeight: 800, marginTop: 0, marginBottom: '16px' }}>
            Supplier Notes & Compliance Records
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(supplier.notes || []).map((n, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--color-floral-white)',
                  border: '1px solid var(--color-bone)',
                  borderRadius: '6px',
                  fontSize: '13px',
                }}
              >
                📝 {n}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 8: AUDIT LOG */}
      {activeTab === 'audit' && (
        <Card padding="none">
          <Table
            columns={[
              { header: 'Timestamp', accessor: 'timestamp' as const, width: '160px' },
              { header: 'Actor', accessor: 'actor' as const, width: '220px' },
              { header: 'Action', accessor: 'action' as const, width: '200px' },
              { header: 'Audit Details & Parameters', accessor: 'details' as const },
            ]}
            data={supplier.auditHistory || []}
            emptyMessage="No audit trail logged."
          />
        </Card>
      )}

      {/* MODAL: Modify Payment Terms & Credit Limit */}
      <Modal
        isOpen={isEditTermsModalOpen}
        onClose={() => setIsEditTermsModalOpen(false)}
        title="Modify Payment Terms & Credit Limit"
      >
        <form onSubmit={handleSavePaymentTerms} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Alert type="warning">
            Security Control: Modifying terms affects cash-flow covenants and must be approved by the Procurement Director.
          </Alert>

          <Dropdown
            label="Approved Payment Terms *"
            value={tempTerms}
            onChange={(e) => setTempTerms(e.target.value)}
            options={[
              { label: 'Net 15 Days', value: 'Net 15' },
              { label: 'Net 30 Days', value: 'Net 30' },
              { label: 'Net 45 Days', value: 'Net 45' },
              { label: 'Cash on Delivery (COD)', value: 'Cash on Delivery' },
              { label: 'Advance Payment', value: 'Advance Payment' },
            ]}
          />

          <Input
            label="Credit Limit (PKR) *"
            type="number"
            value={tempCreditLimit}
            onChange={(e) => setTempCreditLimit(e.target.value)}
            required
          />

          <Input
            label="Mandatory Justification Reason *"
            placeholder="e.g. Annual contract renegotiation approved by CFO"
            value={termsChangeReason}
            onChange={(e) => setTermsChangeReason(e.target.value)}
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="secondary" onClick={() => setIsEditTermsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Authorize Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

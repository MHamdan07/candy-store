import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, Badge, Button, Input, Dropdown, Modal, Alert } from '@candi/ui';
import type { CustomerRecord, CustomerWorkflowStatus, CustomerTier } from '@candi/types';
import { INITIAL_CUSTOMERS } from '../data/customers';

export const CustomerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const foundCustomer = INITIAL_CUSTOMERS.find((c) => c.id === id) || INITIAL_CUSTOMERS[0];
  const [customer, setCustomer] = useState<CustomerRecord>(foundCustomer);
  const [activeTab, setActiveTab] = useState<
    'details' | 'addresses' | 'pricing' | 'orders' | 'invoices' | 'payments' | 'returns' | 'notes' | 'audit'
  >('details');

  const [notice, setNotice] = useState<string | null>(null);

  // Credit Limit Edit Modal State
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [tempCreditLimit, setTempCreditLimit] = useState(customer.creditLimit.toString());
  const [tempTerms, setTempTerms] = useState(customer.paymentTerms);
  const [creditChangeReason, setCreditChangeReason] = useState('');
  const [creditError, setCreditError] = useState<string | null>(null);

  // Workflow status transition handler
  const handleStatusTransition = (newStatus: CustomerWorkflowStatus, actionDescription: string) => {
    setCustomer((prev) => ({
      ...prev,
      status: newStatus,
      auditHistory: [
        {
          timestamp: new Date().toISOString().slice(0, 16),
          actor: 'Farhan Zaidi (Authorized Lead)',
          action: `Status Changed to ${newStatus.toUpperCase()}`,
          details: actionDescription,
        },
        ...(prev.auditHistory || []),
      ],
      updatedAt: new Date().toISOString().slice(0, 10),
    }));

    setNotice(`Customer account status transitioned to: ${newStatus.toUpperCase()}`);
  };

  // CONTROL: Credit limit changes require approval
  const handleSaveCreditLimit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreditError(null);

    if (!creditChangeReason.trim()) {
      setCreditError('A mandatory justification reason is required to alter customer credit covenants.');
      return;
    }

    const newLimit = Number(tempCreditLimit);
    if (isNaN(newLimit) || newLimit < 0) {
      setCreditError('Please enter a valid credit limit amount.');
      return;
    }

    const oldLimit = customer.creditLimit;
    const oldTerms = customer.paymentTerms;

    setCustomer((prev) => ({
      ...prev,
      creditLimit: newLimit,
      paymentTerms: tempTerms,
      auditHistory: [
        {
          timestamp: new Date().toISOString().slice(0, 16),
          actor: 'Farhan Zaidi (Credit Committee Lead)',
          action: 'Approved Credit & Terms Revision',
          details: `Credit limit updated from PKR ${oldLimit.toLocaleString()} to PKR ${newLimit.toLocaleString()} (Terms: ${oldTerms} → ${tempTerms}). Reason: ${creditChangeReason}`,
        },
        ...(prev.auditHistory || []),
      ],
      updatedAt: new Date().toISOString().slice(0, 10),
    }));

    setIsCreditModalOpen(false);
    setNotice(`Credit limit and payment terms updated successfully and recorded in audit log.`);
  };

  const getStatusBadge = (status: CustomerWorkflowStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'pending_approval':
        return <Badge variant="warning">Pending Approval</Badge>;
      case 'approved':
        return <Badge variant="info">Approved</Badge>;
      case 'on_credit_hold':
        return <Badge variant="danger">On Credit Hold</Badge>;
      case 'inactive':
        return <Badge variant="neutral">Inactive</Badge>;
      case 'new_customer':
        return <Badge variant="info">New Customer</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const creditUtilization =
    customer.creditLimit > 0
      ? Math.min(100, Math.round((customer.currentBalance / customer.creditLimit) * 100))
      : 0;

  const isOverCreditLimit = customer.currentBalance > customer.creditLimit;

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Breadcrumb & Workflow Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button size="sm" variant="secondary" onClick={() => navigate('/customers')}>
            ← Back to Customers
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
                {customer.name}
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
                {customer.code}
              </span>
              {getStatusBadge(customer.status)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
              {customer.category} • {customer.tierLabel} • Route: {customer.assignedDeliveryRoute}
            </div>
          </div>
        </div>

        {/* Workflow Transition Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {customer.status === 'pending_approval' && (
            <Button
              variant="primary"
              onClick={() =>
                handleStatusTransition('approved', 'Approved by operations lead following trade verification')
              }
            >
              ✓ Approve Customer
            </Button>
          )}

          {customer.status === 'approved' && (
            <Button
              variant="primary"
              onClick={() =>
                handleStatusTransition('active', 'Promoted to Active; wholesale catalog booking enabled')
              }
            >
              Activate Account
            </Button>
          )}

          {customer.status === 'active' && (
            <Button
              variant="secondary"
              onClick={() =>
                handleStatusTransition('on_credit_hold', 'Placed on credit hold pending overdue payment clearance')
              }
            >
              Place On Credit Hold
            </Button>
          )}

          {customer.status === 'on_credit_hold' && (
            <Button
              variant="primary"
              onClick={() =>
                handleStatusTransition('active', 'Released from credit hold after payment confirmation')
              }
            >
              Release Credit Hold
            </Button>
          )}

          {customer.status !== 'inactive' && (
            <Button
              variant="danger"
              onClick={() =>
                handleStatusTransition('inactive', 'Account deactivated; restricted from further order booking')
              }
            >
              Deactivate
            </Button>
          )}

          {/* Book Order Button - Blocked if Credit Hold or Inactive */}
          <Button
            variant="primary"
            disabled={customer.status === 'on_credit_hold' || customer.status === 'inactive'}
            onClick={() => navigate('/orders')}
            title={
              customer.status === 'on_credit_hold'
                ? 'Orders blocked: Customer on credit hold'
                : customer.status === 'inactive'
                ? 'Orders blocked: Inactive account'
                : 'Book New Wholesale Order'
            }
          >
            + Book Order
          </Button>
        </div>
      </div>

      {notice && (
        <div style={{ marginBottom: '16px' }}>
          <Alert type="success">{notice}</Alert>
        </div>
      )}

      {/* Control Warning Banner */}
      {customer.status === 'on_credit_hold' && (
        <div style={{ marginBottom: '16px' }}>
          <Alert type="danger">
            <strong>CREDIT HOLD RESTRICTION:</strong> This account has breached its authorized credit limit (Balance PKR {customer.currentBalance.toLocaleString()} vs Limit PKR {customer.creditLimit.toLocaleString()}). Unrestricted order booking is locked until outstanding dues are settled.
          </Alert>
        </div>
      )}

      {customer.status === 'inactive' && (
        <div style={{ marginBottom: '16px' }}>
          <Alert type="danger">
            <strong>INACTIVE ACCOUNT:</strong> This customer is permanently deactivated. System controls forbid issuing new sales orders or delivery challans.
          </Alert>
        </div>
      )}

      {/* Metric KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <Card padding="md">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            Outstanding Khata Balance
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: customer.currentBalance > customer.creditLimit ? '#b91c1c' : 'var(--color-smoky-black)', marginTop: '4px' }}>
            PKR {customer.currentBalance.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            Connected to digital invoice ledger
          </div>
        </Card>

        <Card padding="md">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
              Authorized Credit Limit
            </div>
            <button
              onClick={() => setIsCreditModalOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '11px',
                color: 'var(--color-olive-drab)',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontFamily: 'var(--font-family-mono)',
                fontWeight: 700,
              }}
            >
              Modify (Auth)
            </button>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-smoky-black)', marginTop: '4px' }}>
            PKR {customer.creditLimit.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            Utilization: {creditUtilization}% {isOverCreditLimit && <span style={{ color: '#b91c1c', fontWeight: 700 }}>— BREACHED</span>}
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            Customer Tier & Pricing
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-smoky-black)', marginTop: '6px' }}>
            {customer.tierLabel}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '4px' }}>
            Terms: <strong>{customer.paymentTerms}</strong>
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            Assigned Logistics
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-smoky-black)', marginTop: '6px' }}>
            {customer.assignedDeliveryRoute}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '4px' }}>
            Sales Rep: {customer.assignedSalesperson}
          </div>
        </Card>
      </div>

      {/* Profile Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '2px solid var(--color-bone)',
          marginBottom: '20px',
          gap: '4px',
        }}
      >
        {[
          { key: 'details', label: 'Customer Details' },
          { key: 'addresses', label: `Delivery Addresses (${customer.deliveryAddresses.length})` },
          { key: 'pricing', label: 'Tier Pricing & Terms' },
          { key: 'orders', label: `Order History (${customer.orderHistory?.length || 0})` },
          { key: 'invoices', label: `Invoice Ledger (${customer.invoiceHistory?.length || 0})` },
          { key: 'payments', label: `Payment History (${customer.paymentHistory?.length || 0})` },
          { key: 'returns', label: `Returns & Claims (${customer.returnsHistory?.length || 0})` },
          { key: 'notes', label: 'Notes & Attachments' },
          { key: 'audit', label: `Audit Log (${customer.auditHistory?.length || 0})` },
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

      {/* TAB 1: DETAILS */}
      {activeTab === 'details' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <Card padding="lg">
            <h3 style={{ fontFamily: 'var(--font-family-mono)', fontSize: '15px', fontWeight: 800, marginTop: 0, marginBottom: '16px' }}>
              Business & Trade Registration
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--color-olive-drab)', width: '150px', display: 'inline-block' }}>Business Name:</span>
                <strong>{customer.name}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)', width: '150px', display: 'inline-block' }}>Customer Code:</span>
                <code>{customer.code}</code>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)', width: '150px', display: 'inline-block' }}>CNIC / NTN:</span>
                <span>{customer.cnicOrNtn || 'Not Provided'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)', width: '150px', display: 'inline-block' }}>Category:</span>
                <span>{customer.category}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)', width: '150px', display: 'inline-block' }}>Billing Address:</span>
                <span>{customer.billingAddress}</span>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h3 style={{ fontFamily: 'var(--font-family-mono)', fontSize: '15px', fontWeight: 800, marginTop: 0, marginBottom: '16px' }}>
              Contact & Sales Allocation
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--color-olive-drab)', width: '160px', display: 'inline-block' }}>Primary Contact:</span>
                <strong>{customer.contactPerson}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)', width: '160px', display: 'inline-block' }}>Phone Number:</span>
                <span>{customer.phone}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)', width: '160px', display: 'inline-block' }}>Email Address:</span>
                <span>{customer.email || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)', width: '160px', display: 'inline-block' }}>Assigned Salesperson:</span>
                <span>{customer.assignedSalesperson}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)', width: '160px', display: 'inline-block' }}>Assigned Delivery Route:</span>
                <span>{customer.assignedDeliveryRoute}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: DELIVERY ADDRESSES */}
      {activeTab === 'addresses' && (
        <Card padding="none">
          <Table
            columns={[
              { header: 'Location Label', accessor: 'label' as const, width: '220px' },
              { header: 'Recipient & Phone', render: (row: any) => <div><div>{row.recipientName}</div><div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>{row.recipientPhone}</div></div>, width: '180px' },
              { header: 'Address Line', accessor: 'addressLine' as const },
              { header: 'Area & City', render: (row: any) => <div>{row.area}, {row.city}</div>, width: '160px' },
              { header: 'GPS Coordinates', render: (row: any) => row.gpsCoordinates ? <code>{row.gpsCoordinates}</code> : <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Not Tagged</span>, width: '180px' },
              { header: 'Primary', render: (row: any) => row.isPrimary ? <Badge variant="success">Primary</Badge> : <Badge variant="neutral">Secondary</Badge>, width: '110px' },
            ]}
            data={customer.deliveryAddresses}
            emptyMessage="No delivery locations on record."
          />
        </Card>
      )}

      {/* TAB 3: TIER PRICING & TERMS */}
      {activeTab === 'pricing' && (
        <Card padding="lg">
          <h3 style={{ fontFamily: 'var(--font-family-mono)', fontSize: '15px', fontWeight: 800, marginTop: 0, marginBottom: '16px' }}>
            Tier Pricing, Discounts & Payment Terms
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
            <div style={{ padding: '16px', border: '1px solid var(--color-bone)', borderRadius: '6px', backgroundColor: 'var(--color-floral-white)' }}>
              <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '8px' }}>Active Wholesale Price List</div>
              <div>Name: <strong>{customer.priceListName}</strong></div>
              <div>Customer Tier: <Badge variant="info">{customer.tierLabel}</Badge></div>
              <div style={{ marginTop: '8px', color: 'var(--color-olive-drab)', fontSize: '12px' }}>
                All catalog order prices and margin calculations are dynamically loaded from this tier specification.
              </div>
            </div>

            <div style={{ padding: '16px', border: '1px solid var(--color-bone)', borderRadius: '6px', backgroundColor: 'var(--color-floral-white)' }}>
              <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '8px' }}>Credit Governance Covenants</div>
              <div>Authorized Limit: <strong>PKR {customer.creditLimit.toLocaleString()}</strong></div>
              <div>Payment Terms: <strong>{customer.paymentTerms}</strong></div>
              <div style={{ marginTop: '8px' }}>
                <Button size="sm" variant="secondary" onClick={() => setIsCreditModalOpen(true)}>
                  Revise Terms or Limit (Requires Approval)
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 4: ORDER HISTORY */}
      {activeTab === 'orders' && (
        <Card padding="none">
          <Table
            columns={[
              { header: 'Order #', accessor: 'orderNumber' as const, width: '150px' },
              { header: 'Order Date', accessor: 'orderDate' as const, width: '130px' },
              { header: 'Line Items', render: (row: any) => `${row.itemsCount} SKUs`, width: '120px' },
              { header: 'Total Value', render: (row: any) => <strong>PKR {row.totalAmount.toLocaleString()}</strong>, width: '160px' },
              { header: 'Status', render: (row: any) => <Badge variant="info">{row.status}</Badge>, width: '140px' },
            ]}
            data={customer.orderHistory || []}
            emptyMessage="No orders placed yet."
          />
        </Card>
      )}

      {/* TAB 5: INVOICE HISTORY */}
      {activeTab === 'invoices' && (
        <Card padding="none">
          <Table
            columns={[
              { header: 'Invoice #', accessor: 'invoiceNumber' as const, width: '150px' },
              { header: 'Invoice Date', accessor: 'invoiceDate' as const, width: '130px' },
              { header: 'Due Date', accessor: 'dueDate' as const, width: '130px' },
              { header: 'Billed Amount', render: (row: any) => <strong>PKR {row.amount.toLocaleString()}</strong>, width: '150px' },
              { header: 'Paid Amount', render: (row: any) => `PKR ${row.paidAmount.toLocaleString()}`, width: '150px' },
              { header: 'Status', render: (row: any) => <Badge variant={row.status === 'paid' ? 'success' : 'danger'}>{row.status}</Badge>, width: '130px' },
            ]}
            data={customer.invoiceHistory || []}
            emptyMessage="No invoices on record."
          />
        </Card>
      )}

      {/* TAB 6: PAYMENT HISTORY */}
      {activeTab === 'payments' && (
        <Card padding="none">
          <Table
            columns={[
              { header: 'Receipt #', accessor: 'receiptNumber' as const, width: '150px' },
              { header: 'Payment Date', accessor: 'paymentDate' as const, width: '130px' },
              { header: 'Amount Collected', render: (row: any) => <strong style={{ color: '#15803d' }}>PKR {row.amount.toLocaleString()}</strong>, width: '160px' },
              { header: 'Collection Mode', accessor: 'mode' as const, width: '150px' },
              { header: 'Bank / Slip Ref #', accessor: 'refNumber' as const },
            ]}
            data={customer.paymentHistory || []}
            emptyMessage="No payment vouchers logged."
          />
        </Card>
      )}

      {/* TAB 7: RETURNS HISTORY */}
      {activeTab === 'returns' && (
        <Card padding="none">
          <Table
            columns={[
              { header: 'Return Note #', accessor: 'returnNumber' as const, width: '150px' },
              { header: 'Date', accessor: 'returnDate' as const, width: '130px' },
              { header: 'Claim / Shortage Reason', accessor: 'reason' as const },
              { header: 'Credit Amount', render: (row: any) => <strong>PKR {row.amount.toLocaleString()}</strong>, width: '150px' },
              { header: 'Status', render: (row: any) => <Badge variant="success">{row.status}</Badge>, width: '120px' },
            ]}
            data={customer.returnsHistory || []}
            emptyMessage="No returns or damaged claims recorded."
          />
        </Card>
      )}

      {/* TAB 8: NOTES & ATTACHMENTS */}
      {activeTab === 'notes' && (
        <Card padding="lg">
          <h3 style={{ fontFamily: 'var(--font-family-mono)', fontSize: '15px', fontWeight: 800, marginTop: 0, marginBottom: '16px' }}>
            Notes & Verification Documents
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {(customer.notes || []).map((n, idx) => (
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

          <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>Uploaded Verification Attachments:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(customer.attachments || []).map((att, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: 'var(--color-bone)',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                <span>📎 <strong>{att.name}</strong> ({att.type})</span>
                <span style={{ color: 'var(--color-olive-drab)' }}>Uploaded: {att.uploadDate}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 9: AUDIT LOG */}
      {activeTab === 'audit' && (
        <Card padding="none">
          <Table
            columns={[
              { header: 'Timestamp', accessor: 'timestamp' as const, width: '160px' },
              { header: 'Actor', accessor: 'actor' as const, width: '220px' },
              { header: 'Action', accessor: 'action' as const, width: '200px' },
              { header: 'Audit Details', accessor: 'details' as const },
            ]}
            data={customer.auditHistory || []}
            emptyMessage="No audit trail logged."
          />
        </Card>
      )}

      {/* MODAL: Modify Credit Limit & Terms (Requires Approval) */}
      <Modal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        title="Revise Customer Credit Limit & Payment Terms"
      >
        <form onSubmit={handleSaveCreditLimit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {creditError && <Alert type="danger">{creditError}</Alert>}

          <Alert type="warning">
            GOVERNANCE CONTROL: Credit limit changes require management approval and are permanently recorded in the audit log.
          </Alert>

          <Input
            label="Authorized Credit Limit (PKR) *"
            type="number"
            value={tempCreditLimit}
            onChange={(e) => setTempCreditLimit(e.target.value)}
            required
          />

          <Dropdown
            label="Approved Payment Terms *"
            value={tempTerms}
            onChange={(e) => setTempTerms(e.target.value)}
            options={[
              { label: 'Net 7 Days', value: 'Net 7 Days' },
              { label: 'Net 15 Days', value: 'Net 15 Days' },
              { label: 'Net 30 Days', value: 'Net 30 Days' },
              { label: 'Cash on Delivery (COD)', value: 'Cash on Delivery' },
              { label: 'Advance Payment', value: 'Advance Payment' },
            ]}
          />

          <Input
            label="Mandatory Approval Justification Reason *"
            placeholder="e.g. Approved by Finance Director after 6-month perfect payment record"
            value={creditChangeReason}
            onChange={(e) => setCreditChangeReason(e.target.value)}
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="secondary" onClick={() => setIsCreditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Authorize & Log Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

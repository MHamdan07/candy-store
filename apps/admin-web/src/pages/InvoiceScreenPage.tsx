import React, { useState } from 'react';
import { Card, Table, Badge, Button, Modal, Input, Alert } from '@candi/ui';

interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  challanNumber: string;
  businessName: string;
  customerName: string;
  customerTier?: string;
  appliedPriceList?: string;
  gross: number;
  discount: number;
  tradeOfferRebate?: number;
  tax: number;
  net: number;
  paid: number;
  balanceDue: number;
  status: 'issued' | 'paid' | 'partial' | 'cancelled';
  issuedAt: string;
}

const INVOICES_DATA: InvoiceRecord[] = [
  {
    id: 'inv-01',
    invoiceNumber: 'INV-2026-0045',
    orderNumber: 'ORD-2026-089',
    challanNumber: 'CHL-0045',
    businessName: 'Bilal General Store',
    customerName: 'Muhammad Bilal Khan',
    customerTier: 'Tier 2 — Gold Key Accounts',
    appliedPriceList: 'Wholesale Tier 2 Price List (Approved)',
    gross: 18400,
    discount: 400,
    tradeOfferRebate: 0,
    tax: 0,
    net: 18000,
    paid: 18000,
    balanceDue: 0,
    status: 'paid',
    issuedAt: '2026-09-17 11:30',
  },
  {
    id: 'inv-02',
    invoiceNumber: 'INV-2026-0044',
    orderNumber: 'ORD-2026-086',
    challanNumber: 'CHL-0044',
    businessName: 'Ali & Sons Candy Mart',
    customerName: 'Rashid Ali',
    customerTier: 'Tier 1 — Platinum Sub-Wholesale',
    appliedPriceList: 'Contract CTR-ALI-2026-V1 & Tier 1 Rate',
    gross: 48500,
    discount: 2900,
    tradeOfferRebate: 1000,
    tax: 0,
    net: 44600,
    paid: 20000,
    balanceDue: 24600,
    status: 'partial',
    issuedAt: '2026-09-16 16:45',
  },
  {
    id: 'inv-03',
    invoiceNumber: 'INV-2026-0043',
    orderNumber: 'ORD-2026-087',
    challanNumber: 'CHL-0043',
    businessName: 'Al-Madina Mini Mart',
    customerName: 'Kamran Siddiqui',
    gross: 7200,
    discount: 0,
    tax: 0,
    net: 7200,
    paid: 0,
    balanceDue: 7200,
    status: 'issued',
    issuedAt: '2026-09-17 09:10',
  },
];

export const InvoiceScreenPage: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(INVOICES_DATA);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [pricingDetailInvoice, setPricingDetailInvoice] = useState<InvoiceRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const handleRecordPayment = () => {
    if (!selectedInvoice) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === selectedInvoice.id) {
          const newPaid = inv.paid + amount;
          const newBalance = Math.max(0, inv.net - newPaid);
          const newStatus = newBalance === 0 ? 'paid' : 'partial';
          return { ...inv, paid: newPaid, balanceDue: newBalance, status: newStatus };
        }
        return inv;
      })
    );

    setNotice(`Payment of PKR ${amount.toLocaleString()} posted to customer khata ledger.`);
    setSelectedInvoice(null);
    setPaymentAmount('');
  };

  const columns = [
    { header: 'Invoice No', accessor: 'invoiceNumber' as const, width: '130px' },
    {
      header: 'Customer & Challan',
      render: (row: InvoiceRecord) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-smoky-black)' }}>{row.businessName}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>
            Challan: {row.challanNumber} • Order: {row.orderNumber}
          </div>
          {row.customerTier && (
            <div style={{ fontSize: '10px', color: '#1B4332', fontWeight: 700, marginTop: '2px' }}>
              {row.customerTier}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Net Billed Amount',
      render: (row: InvoiceRecord) => (
        <div>
          <div style={{ fontWeight: 800, color: 'var(--color-smoky-black)' }}>
            PKR {row.net.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>
            Gross: PKR {row.gross.toLocaleString()}
            {row.discount > 0 && ` (Disc: -${row.discount})`}
          </div>
        </div>
      ),
    },
    {
      header: 'Khata Status',
      render: (row: InvoiceRecord) => (
        <div>
          <div style={{ fontSize: '12px' }}>
            Paid: <strong>PKR {row.paid.toLocaleString()}</strong>
          </div>
          <div
            style={{
              fontSize: '11px',
              color: row.balanceDue > 0 ? 'var(--color-danger)' : 'var(--color-olive-drab)',
            }}
          >
            Due: PKR {row.balanceDue.toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (row: InvoiceRecord) => <Badge status={row.status} label={row.status.toUpperCase()} />,
    },
    {
      header: 'Actions',
      render: (row: InvoiceRecord) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <Button size="sm" variant="outline" onClick={() => setSelectedInvoice(row)}>
            Payment
          </Button>
          <Button size="sm" variant="ghost" style={{ fontSize: '11px' }} onClick={() => setPricingDetailInvoice(row)}>
            Pricing Audit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {notice && <Alert type="success">{notice}</Alert>}

      <Card padding="lg">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-smoky-black)' }}>
              Invoices & Delivery Challans
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--color-olive-drab)' }}>
              Every invoice is matched with delivery proof and posted to double-entry customer khata ledger.
            </p>
          </div>
        </div>

        <Table columns={columns} data={invoices} keyExtractor={(row) => row.id} />
      </Card>

      {/* Payment / Khata Reconciliation Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={Boolean(selectedInvoice)}
          onClose={() => setSelectedInvoice(null)}
          title={`Khata Payment Entry: ${selectedInvoice.invoiceNumber}`}
          footer={
            <>
              <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleRecordPayment}>
                Post Cash Collection
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                backgroundColor: 'var(--color-surface-muted)',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-smoky-black)' }}>
                {selectedInvoice.businessName}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-olive-drab)' }}>
                Challan Ref: {selectedInvoice.challanNumber} • Order Ref: {selectedInvoice.orderNumber}
              </div>
              <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: 700 }}>
                Total Due: <span style={{ color: 'var(--color-danger)' }}>PKR {selectedInvoice.balanceDue.toLocaleString()}</span>
              </div>
            </div>

            <Input
              label="Cash Collected by Driver (PKR)"
              placeholder="e.g. 15000"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              helperText="Enters double-entry credit reducing customer account balance."
              autoFocus
            />
          </div>
        </Modal>
      )}

      {/* Pricing Audit Details Modal */}
      {pricingDetailInvoice && (
        <Modal
          isOpen={Boolean(pricingDetailInvoice)}
          onClose={() => setPricingDetailInvoice(null)}
          title={`Invoice Pricing Audit: ${pricingDetailInvoice.invoiceNumber}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
            <div
              style={{
                backgroundColor: 'var(--color-surface-muted)',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-smoky-black)' }}>
                {pricingDetailInvoice.businessName}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>
                Customer Tier: <strong>{pricingDetailInvoice.customerTier || 'Standard Retail'}</strong>
              </div>
              <div style={{ fontSize: '11px', color: '#565449', marginTop: '2px' }}>
                Applied Price List: <strong>{pricingDetailInvoice.appliedPriceList || 'Standard Catalog Price'}</strong>
              </div>
            </div>

            <div style={{ border: '1px solid var(--color-bone)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
              <div style={{ fontWeight: 800, marginBottom: '8px' }}>Pricing & Commercial Breakdown:</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: '#666' }}>Gross Catalog Total:</span>
                <span>PKR {pricingDetailInvoice.gross.toLocaleString()}</span>
              </div>
              {pricingDetailInvoice.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#2D6A4F' }}>
                  <span>Customer Tier Rebate:</span>
                  <span>- PKR {pricingDetailInvoice.discount.toLocaleString()}</span>
                </div>
              )}
              {pricingDetailInvoice.tradeOfferRebate ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#006D77' }}>
                  <span>Trade Offer Rebate:</span>
                  <span>- PKR {pricingDetailInvoice.tradeOfferRebate.toLocaleString()}</span>
                </div>
              ) : null}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0 0 0',
                  borderTop: '1px solid var(--color-bone)',
                  fontWeight: 800,
                  fontSize: '14px',
                  color: 'var(--color-smoky-black)',
                }}
              >
                <span>Net Billed Amount:</span>
                <span>PKR {pricingDetailInvoice.net.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ fontSize: '11px', color: '#2D6A4F', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>✓</span>
              <span>Validated against approved price lists and date-effective governance rules.</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Button variant="outline" onClick={() => setPricingDetailInvoice(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

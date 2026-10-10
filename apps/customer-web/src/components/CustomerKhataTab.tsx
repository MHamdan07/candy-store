import React, { useState } from 'react';
import { Card, Badge, Button, Alert } from '@candi/ui';
import { useAuth } from '@candi/auth';
import { useWholesaleOrder } from '../context/WholesaleOrderContext';

export const CustomerKhataTab: React.FC = () => {
  const { customerAccount } = useAuth();
  const { creditLimit, currentBalance, availableCredit, orders, setInvoiceModalOrder } = useWholesaleOrder();
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  const usagePercentage = Math.min(100, Math.round((currentBalance / creditLimit) * 100));

  const creditOrders = orders.filter((o) => o.paymentMethod === 'credit_khata');

  const handleSimulatePayment = () => {
    setPaymentNotice('Raast IBFT payment of PKR 10,000 submitted for verification. Ledger will update upon reconciliation.');
    setTimeout(() => setPaymentNotice(null), 5000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font-family-base)' }}>
      {paymentNotice && <Alert type="success">{paymentNotice}</Alert>}

      {/* Credit Overview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Card 1: Credit Line */}
        <Card padding="md">
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #64748B)', textTransform: 'uppercase', fontWeight: 700 }}>
            Approved Wholesale Credit Line
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--color-text-main, #0F172A)', marginTop: '4px' }}>
            PKR {creditLimit.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)', marginTop: '4px' }}>
            Terms: 14-Day Rolling Khata • 0% Markup
          </div>
          <div style={{ marginTop: '8px' }}>
            <Badge status="approved" label="CREDIT ACTIVE" />
          </div>
        </Card>

        {/* Card 2: Current Outstanding Balance */}
        <Card padding="md">
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #64748B)', textTransform: 'uppercase', fontWeight: 700 }}>
            Current Utilized Balance
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--color-primary, #E11D48)', marginTop: '4px' }}>
            PKR {currentBalance.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)', marginTop: '4px' }}>
            Next settlement due in 9 days
          </div>
          <div style={{ marginTop: '8px' }}>
            <Badge status={usagePercentage > 75 ? 'warning' : 'info'} label={`${usagePercentage}% UTILIZED`} />
          </div>
        </Card>

        {/* Card 3: Remaining Available Credit */}
        <Card padding="md">
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #64748B)', textTransform: 'uppercase', fontWeight: 700 }}>
            Remaining Purchasing Power
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#059669', marginTop: '4px' }}>
            PKR {availableCredit.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)', marginTop: '4px' }}>
            Ready for instant self-service checkout
          </div>
          <div style={{ marginTop: '8px' }}>
            <Button size="sm" variant="primary" onClick={handleSimulatePayment}>
              Make Payment / Settle
            </Button>
          </div>
        </Card>
      </div>

      {/* Credit Health Meter Card */}
      <Card padding="lg">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)' }}>
              Khata Utilization & Credit Health
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #64748B)' }}>
              {customerAccount?.businessName || 'Bilal General Store'} • Commercial Credit Agreement Ref: CCR-2026-081
            </div>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)' }}>{usagePercentage}% Limit Used</span>
        </div>

        <div
          style={{
            height: '10px',
            backgroundColor: 'var(--color-border, #E2E8F0)',
            borderRadius: '5px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${usagePercentage}%`,
              backgroundColor: usagePercentage > 80 ? '#EF4444' : '#F59E0B',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </Card>

      {/* Invoices on Khata Table */}
      <Card padding="lg">
        <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)', marginBottom: '12px' }}>
          Wholesale Khata Invoices ({creditOrders.length})
        </div>

        {creditOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted, #64748B)', fontSize: '13px' }}>
            No orders currently debited to your wholesale credit line.
          </div>
        ) : (
          <div style={{ border: '1px solid var(--color-border, #E2E8F0)', borderRadius: '8px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--color-border, #E2E8F0)' }}>Invoice / Order</th>
                  <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--color-border, #E2E8F0)' }}>Date</th>
                  <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--color-border, #E2E8F0)' }}>Units</th>
                  <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--color-border, #E2E8F0)' }}>Total Amount</th>
                  <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--color-border, #E2E8F0)' }}>Khata Status</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', borderBottom: '1px solid var(--color-border, #E2E8F0)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {creditOrders.map((ord) => (
                  <tr key={ord.id} style={{ borderBottom: '1px solid var(--color-border, #E2E8F0)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-text-main, #0F172A)' }}>
                      INV-{ord.orderNumber.replace('ORD-', '')}
                      <div style={{ fontSize: '10px', color: 'var(--color-text-muted, #64748B)' }}>{ord.orderNumber}</div>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--color-text-main, #0F172A)' }}>{ord.orderDate}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--color-text-main, #0F172A)' }}>{ord.totalCartons} Cartons</td>
                    <td style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)' }}>
                      PKR {ord.grandTotal.toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <Badge status="warning" label="DEBITED (14 DAYS)" />
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      <Button size="sm" variant="outline" onClick={() => setInvoiceModalOrder(ord)}>
                        View Challan
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

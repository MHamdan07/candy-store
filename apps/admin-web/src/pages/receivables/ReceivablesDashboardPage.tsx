import React from 'react';
import { Card, Table, Badge, Button } from '@candi/ui';
import { useNavigate } from 'react-router-dom';
import { INITIAL_INVOICES_AGING } from '../../data/receivablesData';
import { INITIAL_COLLECTION_CASES } from '../../data/collectionFollowUps';
import { CUSTOMERS_DATABASE } from '../../data/customers';

export const ReceivablesDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Metrics
  const totalOutstanding = INITIAL_INVOICES_AGING.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const overdueAmount = INITIAL_INVOICES_AGING
    .filter((inv) => inv.bucket !== 'current')
    .reduce((sum, inv) => sum + inv.balanceDue, 0);
  const dueTodayAmount = INITIAL_INVOICES_AGING
    .filter((inv) => inv.dueDate === '2026-09-17' || inv.bucket === 'current')
    .reduce((sum, inv) => sum + inv.balanceDue, 0);

  const creditHoldCustomers = CUSTOMERS_DATABASE.filter(
    (c) => c.status === 'on_credit_hold' || c.id === 'cust-04' || c.id === 'cust-01'
  );

  const pendingPTPTotal = INITIAL_COLLECTION_CASES
    .filter((c) => c.stage === 'promise_to_pay' && c.promisedAmount)
    .reduce((sum, c) => sum + (c.promisedAmount || 0), 0);

  const columnsOverdue = [
    {
      header: 'Invoice & Customer',
      render: (row: typeof INITIAL_INVOICES_AGING[0]) => (
        <div>
          <div style={{ fontWeight: 800, color: 'var(--color-smoky-black)', fontSize: '13px' }}>
            {row.invoiceNumber}
          </div>
          <div style={{ fontSize: '12px', color: '#565449' }}>
            {row.customerName} ({row.customerCode})
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>
            Route: {row.assignedRoute.split(':')[0]} • Rep: {row.assignedSalesperson}
          </div>
        </div>
      ),
      width: '260px',
    },
    {
      header: 'Due Date & Aging Bucket',
      render: (row: typeof INITIAL_INVOICES_AGING[0]) => {
        let badgeVariant: 'danger' | 'warning' | 'info' | 'neutral' = 'neutral';
        if (row.bucket === 'over_90' || row.bucket === '61_90') badgeVariant = 'danger';
        else if (row.bucket === '31_60' || row.bucket === '1_30') badgeVariant = 'warning';
        else badgeVariant = 'info';

        return (
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600 }}>Due: {row.dueDate}</div>
            <div style={{ marginTop: '2px' }}>
              <Badge variant={badgeVariant}>
                {row.bucket === 'current' ? 'CURRENT' : `${row.daysOverdue} DAYS OVERDUE`}
              </Badge>
            </div>
          </div>
        );
      },
      width: '180px',
    },
    {
      header: 'Outstanding Balance',
      render: (row: typeof INITIAL_INVOICES_AGING[0]) => (
        <div>
          <div style={{ fontWeight: 800, fontSize: '14px', color: '#8C2A2A' }}>
            PKR {row.balanceDue.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#777' }}>
            Total: PKR {row.originalAmount.toLocaleString()}
          </div>
        </div>
      ),
      width: '160px',
    },
    {
      header: 'Credit Hold Risk',
      render: (row: typeof INITIAL_INVOICES_AGING[0]) => (
        <div>
          {row.isCreditHoldTriggered ? (
            <Badge variant="danger">CREDIT HOLD ACTIVE</Badge>
          ) : (
            <Badge variant="neutral">HEALTHY</Badge>
          )}
        </div>
      ),
      width: '160px',
    },
    {
      header: 'Actions',
      render: (row: typeof INITIAL_INVOICES_AGING[0]) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/receivables/statement?customer=${row.customerId}`)}
          >
            Statement
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate(`/receivables/follow-ups?customer=${row.customerId}`)}
          >
            Follow-Up
          </Button>
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
            Receivables Management & Collections Dashboard
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-olive-drab)' }}>
            Monitor wholesale credit exposure, automated credit-hold triggers, aging risks, and upcoming cash recoveries.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="outline" onClick={() => navigate('/receivables/aging')}>
            View Aging Report
          </Button>
          <Button variant="primary" onClick={() => navigate('/receivables/follow-ups')}>
            + Log Recovery Activity
          </Button>
        </div>
      </div>

      {/* Credit Hold Alert Banner */}
      <div
        style={{
          padding: '16px',
          backgroundColor: '#FFF0F0',
          border: '2px solid #D00000',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <span style={{ fontSize: '28px' }}>🚫</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#D00000' }}>
              CREDIT-HOLD ALERT: {creditHoldCustomers.length} Wholesale Accounts Locked
            </div>
            <div style={{ fontSize: '12px', color: '#565449', marginTop: '3px' }}>
              Accounts with invoices overdue &gt; 15 days or exceeding credit covenants are locked from dispatching new wholesale orders until reconciled.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            size="sm"
            variant="danger"
            onClick={() => navigate('/receivables/follow-ups')}
          >
            Review Hold Accounts
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>
        <Card>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-olive-drab)' }}>TOTAL RECEIVABLES</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-smoky-black)', marginTop: '4px' }}>
            PKR {totalOutstanding.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>Across active wholesale khatas</div>
        </Card>

        <Card>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-olive-drab)' }}>OVERDUE AMOUNT</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#8C2A2A', marginTop: '4px' }}>
            PKR {overdueAmount.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#8C2A2A', marginTop: '2px' }}>
            {((overdueAmount / totalOutstanding) * 100).toFixed(1)}% of total receivables
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-olive-drab)' }}>DUE TODAY / CURRENT</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#2D6A4F', marginTop: '4px' }}>
            PKR {dueTodayAmount.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>Within credit agreement terms</div>
        </Card>

        <Card>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-olive-drab)' }}>UPCOMING PTP COMMITTED</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#005F73', marginTop: '4px' }}>
            PKR {pendingPTPTotal.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>Promises to Pay scheduled</div>
        </Card>

        <Card style={{ backgroundColor: 'var(--color-bone)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-olive-drab)' }}>COLLECTION STATUS</div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#1B4332', marginTop: '4px' }}>
            87.5% Efficiency
          </div>
          <div style={{ fontSize: '11px', color: '#565449', marginTop: '2px' }}>Average recovery lead: 4.8 days</div>
        </Card>
      </div>

      {/* Priority Invoices Requiring Follow-Up Table */}
      <Card title="High Priority Overdue Invoices & Collection Queue">
        <Table
          columns={columnsOverdue}
          data={INITIAL_INVOICES_AGING}
          keyExtractor={(inv) => inv.id}
          emptyMessage="No overdue invoices currently requiring recovery action."
        />
      </Card>
    </div>
  );
};

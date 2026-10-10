import React, { useState } from 'react';
import { Card, Table, Badge, Button, Input } from '@candi/ui';
import { useNavigate } from 'react-router-dom';
import { AgingBucket, InvoiceAgingItem } from '@candi/types';
import { INITIAL_INVOICES_AGING } from '../../data/receivablesData';

export const InvoiceAgingReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedBucket, setSelectedBucket] = useState<'ALL' | AgingBucket>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Bucket Totals Calculation
  const bucketTotals = {
    current: INITIAL_INVOICES_AGING.filter((i) => i.bucket === 'current').reduce((s, i) => s + i.balanceDue, 0),
    '1_30': INITIAL_INVOICES_AGING.filter((i) => i.bucket === '1_30').reduce((s, i) => s + i.balanceDue, 0),
    '31_60': INITIAL_INVOICES_AGING.filter((i) => i.bucket === '31_60').reduce((s, i) => s + i.balanceDue, 0),
    '61_90': INITIAL_INVOICES_AGING.filter((i) => i.bucket === '61_90').reduce((s, i) => s + i.balanceDue, 0),
    over_90: INITIAL_INVOICES_AGING.filter((i) => i.bucket === 'over_90').reduce((s, i) => s + i.balanceDue, 0),
  };

  const totalOutstanding = Object.values(bucketTotals).reduce((a, b) => a + b, 0);

  const filteredInvoices = INITIAL_INVOICES_AGING.filter((inv) => {
    const matchesBucket = selectedBucket === 'ALL' || inv.bucket === selectedBucket;
    const matchesSearch =
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBucket && matchesSearch;
  });

  const columns = [
    {
      header: 'Invoice No & Ref',
      render: (row: InvoiceAgingItem) => (
        <div>
          <div style={{ fontWeight: 800, color: 'var(--color-smoky-black)', fontSize: '13px' }}>
            {row.invoiceNumber}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>
            Order: {row.orderNumber} • Challan: {row.challanNumber}
          </div>
        </div>
      ),
      width: '180px',
    },
    {
      header: 'Customer Account',
      render: (row: InvoiceAgingItem) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-smoky-black)', fontSize: '13px' }}>
            {row.customerName}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>
            {row.customerCode} • {row.assignedRoute.split(':')[0]}
          </div>
        </div>
      ),
      width: '240px',
    },
    {
      header: 'Invoice Date & Due Date',
      render: (row: InvoiceAgingItem) => (
        <div style={{ fontSize: '12px' }}>
          <div>Issued: {row.invoiceDate}</div>
          <div style={{ fontWeight: 700, marginTop: '2px', color: row.daysOverdue > 0 ? '#8C2A2A' : '#1B4332' }}>
            Due: {row.dueDate}
          </div>
        </div>
      ),
      width: '180px',
    },
    {
      header: 'Aging Classification',
      render: (row: InvoiceAgingItem) => {
        let variant: 'info' | 'warning' | 'danger' | 'neutral' = 'neutral';
        let label = 'CURRENT (NOT DUE)';

        if (row.bucket === '1_30') {
          variant = 'warning';
          label = `1–30 DAYS (${row.daysOverdue}d)`;
        } else if (row.bucket === '31_60') {
          variant = 'warning';
          label = `31–60 DAYS (${row.daysOverdue}d)`;
        } else if (row.bucket === '61_90') {
          variant = 'danger';
          label = `61–90 DAYS (${row.daysOverdue}d)`;
        } else if (row.bucket === 'over_90') {
          variant = 'danger';
          label = `> 90 DAYS (${row.daysOverdue}d)`;
        }

        return (
          <div>
            <Badge variant={variant}>{label}</Badge>
            {row.isCreditHoldTriggered && (
              <div style={{ fontSize: '10px', color: '#D00000', fontWeight: 800, marginTop: '3px' }}>
                ⚠ CREDIT HOLD TRIGGERED
              </div>
            )}
          </div>
        );
      },
      width: '200px',
    },
    {
      header: 'Original / Paid',
      render: (row: InvoiceAgingItem) => (
        <div style={{ fontSize: '12px' }}>
          <div>Orig: PKR {row.originalAmount.toLocaleString()}</div>
          <div style={{ color: '#2D6A4F', marginTop: '1px' }}>
            Paid: PKR {row.paidAmount.toLocaleString()}
          </div>
        </div>
      ),
      width: '160px',
    },
    {
      header: 'Balance Due',
      render: (row: InvoiceAgingItem) => (
        <div style={{ fontWeight: 800, fontSize: '14px', color: row.daysOverdue > 0 ? '#8C2A2A' : 'var(--color-smoky-black)' }}>
          PKR {row.balanceDue.toLocaleString()}
        </div>
      ),
      width: '150px',
    },
    {
      header: 'Actions',
      render: (row: InvoiceAgingItem) => (
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
            Invoice Aging & Overdue Exposure Report
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-olive-drab)' }}>
            Automated 5-bucket aging classification based on agreed payment terms and transaction due dates.
          </p>
        </div>
        <div>
          <Button variant="outline" onClick={() => alert('Aging schedule exported as Excel spreadsheet (CSV format).')}>
            📥 Export Aging Schedule (Excel)
          </Button>
        </div>
      </div>

      {/* 5-Bucket Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
        <Card
          style={{
            borderTop: selectedBucket === 'current' ? '3px solid #2D6A4F' : '1px solid var(--color-bone)',
            cursor: 'pointer',
          }}
        >
          <div onClick={() => setSelectedBucket(selectedBucket === 'current' ? 'ALL' : 'current')}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-olive-drab)' }}>CURRENT (NOT DUE)</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#2D6A4F', marginTop: '4px' }}>
              PKR {bucketTotals.current.toLocaleString()}
            </div>
            <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
              {((bucketTotals.current / totalOutstanding) * 100).toFixed(1)}% of total
            </div>
          </div>
        </Card>

        <Card
          style={{
            borderTop: selectedBucket === '1_30' ? '3px solid #E6C875' : '1px solid var(--color-bone)',
            cursor: 'pointer',
          }}
        >
          <div onClick={() => setSelectedBucket(selectedBucket === '1_30' ? 'ALL' : '1_30')}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-olive-drab)' }}>1–30 DAYS OVERDUE</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#C27803', marginTop: '4px' }}>
              PKR {bucketTotals['1_30'].toLocaleString()}
            </div>
            <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
              {((bucketTotals['1_30'] / totalOutstanding) * 100).toFixed(1)}% of total
            </div>
          </div>
        </Card>

        <Card
          style={{
            borderTop: selectedBucket === '31_60' ? '3px solid #D08C00' : '1px solid var(--color-bone)',
            cursor: 'pointer',
          }}
        >
          <div onClick={() => setSelectedBucket(selectedBucket === '31_60' ? 'ALL' : '31_60')}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-olive-drab)' }}>31–60 DAYS OVERDUE</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#D08C00', marginTop: '4px' }}>
              PKR {bucketTotals['31_60'].toLocaleString()}
            </div>
            <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
              {((bucketTotals['31_60'] / totalOutstanding) * 100).toFixed(1)}% of total
            </div>
          </div>
        </Card>

        <Card
          style={{
            borderTop: selectedBucket === '61_90' ? '3px solid #D00000' : '1px solid var(--color-bone)',
            cursor: 'pointer',
          }}
        >
          <div onClick={() => setSelectedBucket(selectedBucket === '61_90' ? 'ALL' : '61_90')}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-olive-drab)' }}>61–90 DAYS OVERDUE</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#D00000', marginTop: '4px' }}>
              PKR {bucketTotals['61_90'].toLocaleString()}
            </div>
            <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
              {((bucketTotals['61_90'] / totalOutstanding) * 100).toFixed(1)}% of total
            </div>
          </div>
        </Card>

        <Card
          style={{
            borderTop: selectedBucket === 'over_90' ? '3px solid #8C2A2A' : '1px solid var(--color-bone)',
            cursor: 'pointer',
          }}
        >
          <div onClick={() => setSelectedBucket(selectedBucket === 'over_90' ? 'ALL' : 'over_90')}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-olive-drab)' }}>&gt; 90 DAYS OVERDUE</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#8C2A2A', marginTop: '4px' }}>
              PKR {bucketTotals.over_90.toLocaleString()}
            </div>
            <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
              Critical Recovery Risk
            </div>
          </div>
        </Card>
      </div>

      {/* Distribution Progress Bar */}
      <div
        style={{
          height: '14px',
          display: 'flex',
          borderRadius: '4px',
          overflow: 'hidden',
          backgroundColor: '#E5E5E5',
        }}
      >
        <div style={{ width: `${(bucketTotals.current / totalOutstanding) * 100}%`, backgroundColor: '#2D6A4F' }} title="Current" />
        <div style={{ width: `${(bucketTotals['1_30'] / totalOutstanding) * 100}%`, backgroundColor: '#E6C875' }} title="1-30 Days" />
        <div style={{ width: `${(bucketTotals['31_60'] / totalOutstanding) * 100}%`, backgroundColor: '#D08C00' }} title="31-60 Days" />
        <div style={{ width: `${(bucketTotals['61_90'] / totalOutstanding) * 100}%`, backgroundColor: '#D00000' }} title="61-90 Days" />
        <div style={{ width: `${(bucketTotals.over_90 / totalOutstanding) * 100}%`, backgroundColor: '#8C2A2A' }} title=">90 Days" />
      </div>

      {/* Filters & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px' }}>
        <div style={{ width: '320px' }}>
          <Input
            placeholder="Search Customer, Invoice, or Code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <Button
            size="sm"
            variant={selectedBucket === 'ALL' ? 'primary' : 'outline'}
            onClick={() => setSelectedBucket('ALL')}
          >
            All Invoices ({INITIAL_INVOICES_AGING.length})
          </Button>
          {(['current', '1_30', '31_60', '61_90', 'over_90'] as const).map((b) => (
            <Button
              key={b}
              size="sm"
              variant={selectedBucket === b ? 'primary' : 'outline'}
              onClick={() => setSelectedBucket(b)}
            >
              {b.replace(/_/g, ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Aging Table */}
      <Card>
        <Table
          columns={columns}
          data={filteredInvoices}
          keyExtractor={(inv) => inv.id}
          emptyMessage="No invoices found matching the selected aging bucket."
        />
      </Card>
    </div>
  );
};

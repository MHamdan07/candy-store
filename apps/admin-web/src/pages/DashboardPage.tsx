import React from 'react';
import { Card, Badge, Button, Table } from '@candi/ui';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const metrics = [
    { label: "Today's Wholesale Orders", value: '28', change: '+14% vs yesterday', color: '#E11D48' },
    { label: 'Pending Customer Reviews', value: '5', change: 'Action required', color: '#F59E0B' },
    { label: 'Dispatched for Delivery', value: '18', change: '3 Routes active in Karachi', color: '#0284C7' },
    { label: 'Expected Cash to Reconcile', value: 'PKR 482,500', change: 'Cashier shift open', color: '#059669' },
  ];

  const recentApplications = [
    {
      id: 'APP-1029',
      businessName: 'Mehmood Traders Wholesale',
      customerName: 'Tariq Mehmood',
      type: 'sub_wholesaler',
      city: 'Karachi',
      area: 'Saddar Market',
      zone: 'Zone 3 - Central',
      date: 'Today, 09:40 AM',
      status: 'pending_review',
    },
    {
      id: 'APP-1028',
      businessName: 'Al-Madina Mini Mart',
      customerName: 'Kamran Siddiqui',
      type: 'retailer',
      city: 'Karachi',
      area: 'Gulshan Block 4',
      zone: 'Zone 2 - Gulshan',
      date: 'Yesterday, 04:15 PM',
      status: 'changes_requested',
    },
    {
      id: 'APP-1027',
      businessName: 'Bismillah Candy Corner',
      customerName: 'Muhammad Rizwan',
      type: 'retailer',
      city: 'Karachi',
      area: 'North Nazimabad',
      zone: 'Zone 1 - Nazimabad',
      date: 'Sep 15, 2026',
      status: 'under_review',
    },
  ];

  const columns = [
    { header: 'App ID', accessor: 'id' as const, width: '100px' },
    { header: 'Business / Shop', accessor: 'businessName' as const },
    { header: 'Customer', accessor: 'customerName' as const },
    {
      header: 'Tier',
      render: (row: typeof recentApplications[0]) => (
        <Badge status={row.type} />
      ),
    },
    { header: 'Area / Zone', render: (row: typeof recentApplications[0]) => `${row.area} (${row.zone})` },
    {
      header: 'Status',
      render: (row: typeof recentApplications[0]) => (
        <Badge status={row.status} />
      ),
    },
    {
      header: 'Action',
      render: () => (
        <Button size="sm" variant="outline" onClick={() => navigate('/customers')}>
          Review
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'var(--font-family-base)' }}>
      {/* Top Banner Notice */}
      <div
        style={{
          padding: '14px 20px',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border, #E2E8F0)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px' }}>🎯</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main, #0F172A)' }}>
            Karachi Depot Pilot Active: 1 Warehouse, 1 Depot, Zone 1 & 2 operational.
          </span>
        </div>
        <Badge status="approved" label="SOP Compliance 100%" />
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {metrics.map((m, idx) => (
          <Card key={idx} padding="md" style={{ borderTop: `3px solid ${m.color}` }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted, #64748B)', marginBottom: '8px' }}>
              {m.label}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-text-main, #0F172A)', marginBottom: '4px' }}>
              {m.value}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)', fontWeight: 600 }}>
              {m.change}
            </div>
          </Card>
        ))}
      </div>

      {/* Pending Customer Review Queue */}
      <Card padding="lg">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)', margin: 0 }}>
              Customer Registration & Approval Queue
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted, #64748B)', marginTop: '4px', margin: 0 }}>
              Retailers and sub-wholesalers awaiting business verification before catalog activation.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => navigate('/customers')}>
            View All Applications →
          </Button>
        </div>

        <Table
          columns={columns}
          data={recentApplications}
          keyExtractor={(row) => row.id}
        />
      </Card>

      {/* Quick Action Hubs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <Card padding="md">
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)', marginBottom: '6px' }}>
            📦 Inventory & Dispatch Control
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted, #64748B)', marginBottom: '16px' }}>
            Monitor stock conversions (Carton ↔ Box ↔ Packet) and issue warehouse pick lists.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button size="sm" variant="secondary" onClick={() => navigate('/products')}>
              Manage Products
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/orders')}>
              Review Pick Lists
            </Button>
          </div>
        </Card>

        <Card padding="md">
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)', marginBottom: '6px' }}>
            📥 Receiving & Batch Tracking (GRN)
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted, #64748B)', marginBottom: '16px' }}>
            Record factory dock arrivals, damage segregation, and verified batch/expiry intake.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button size="sm" variant="secondary" onClick={() => navigate('/procurement/grn')}>
              Goods Receipts (GRN)
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/products')}>
              Wholesale Catalog
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

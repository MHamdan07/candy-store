import React, { useState } from 'react';
import { Card, Table, Badge, Button, Input, Dropdown } from '@candi/ui';
import { useNavigate } from 'react-router-dom';
import type { PurchaseOrder } from '@candi/types';

export const INITIAL_POS: PurchaseOrder[] = [
  {
    id: 'po-101',
    poNumber: 'PO-2026-081',
    supplierId: 'sup-01',
    supplierName: 'National Confectionery Industries Ltd.',
    orderDate: '2026-09-15',
    expectedDeliveryDate: '2026-09-22',
    paymentTerms: 'Net 30',
    subtotal: 615000,
    discount: 15000,
    tax: 0,
    total: 600000,
    status: 'approved',
    approvedBy: 'Farhan Zaidi',
    approvedAt: '2026-09-16 10:00',
    items: [
      {
        id: '1',
        sku: 'CND-CHOC-01',
        productName: 'Choco Dream Truffle Bites (24x50g)',
        unit: 'carton',
        orderedQuantity: 150,
        purchasePrice: 2800,
        subtotal: 420000,
        receivedQuantity: 0,
        outstandingQuantity: 150,
      },
      {
        id: '2',
        sku: 'CND-WAF-01',
        productName: 'Crispy Hazelnut Wafers (36 packets)',
        unit: 'carton',
        orderedQuantity: 100,
        purchasePrice: 1950,
        subtotal: 195000,
        receivedQuantity: 0,
        outstandingQuantity: 100,
      },
    ],
    auditTrail: [
      { action: 'Created draft', actor: 'Asim Raza', timestamp: '2026-09-15 14:00' },
      { action: 'Approved by management', actor: 'Farhan Zaidi', timestamp: '2026-09-16 10:00' },
    ],
    createdAt: '2026-09-15 14:00',
    updatedAt: '2026-09-16 10:00',
  },
  {
    id: 'po-102',
    poNumber: 'PO-2026-082',
    supplierId: 'sup-02',
    supplierName: 'Golden Wheat Milling & Bakery Supplies',
    orderDate: '2026-09-16',
    expectedDeliveryDate: '2026-09-24',
    paymentTerms: 'Net 15',
    subtotal: 290000,
    discount: 5000,
    tax: 0,
    total: 285000,
    status: 'pending_approval',
    items: [
      {
        id: '3',
        sku: 'CND-CHOC-02',
        productName: 'Velvet Caramel Bar Bulk Pack (48 pcs)',
        unit: 'box',
        orderedQuantity: 200,
        purchasePrice: 1450,
        subtotal: 290000,
        receivedQuantity: 0,
        outstandingQuantity: 200,
      },
    ],
    auditTrail: [{ action: 'Submitted for approval', actor: 'Asim Raza', timestamp: '2026-09-16 16:30' }],
    createdAt: '2026-09-16 16:30',
    updatedAt: '2026-09-16 16:30',
  },
  {
    id: 'po-103',
    poNumber: 'PO-2026-080',
    supplierId: 'sup-03',
    supplierName: 'FMCG Premier Packaging Group',
    orderDate: '2026-09-10',
    expectedDeliveryDate: '2026-09-14',
    paymentTerms: 'Cash on Delivery',
    subtotal: 120000,
    discount: 0,
    tax: 0,
    total: 120000,
    status: 'partially_received',
    approvedBy: 'Farhan Zaidi',
    approvedAt: '2026-09-11 11:00',
    items: [
      {
        id: '4',
        sku: 'CND-GUM-01',
        productName: 'Fruity Blast Chewy Candies (100 packets)',
        unit: 'carton',
        orderedQuantity: 100,
        purchasePrice: 1200,
        subtotal: 120000,
        receivedQuantity: 60,
        outstandingQuantity: 40,
      },
    ],
    auditTrail: [
      { action: 'Approved', actor: 'Farhan Zaidi', timestamp: '2026-09-11 11:00' },
      { action: 'Partially received 60 cartons at Karachi Depot', actor: 'Asim Raza', timestamp: '2026-09-14 15:00' },
    ],
    createdAt: '2026-09-10 10:00',
    updatedAt: '2026-09-14 15:00',
  },
];

export const PurchaseOrderListPage: React.FC = () => {
  const [pos, setPos] = useState<PurchaseOrder[]>(INITIAL_POS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const navigate = useNavigate();

  const filtered = pos.filter((p) => {
    const matchesSearch =
      p.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { header: 'PO Number', accessor: 'poNumber' as const, width: '130px' },
    {
      header: 'Supplier',
      render: (row: PurchaseOrder) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-smoky-black)' }}>{row.supplierName}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>Terms: {row.paymentTerms}</div>
        </div>
      ),
    },
    { header: 'Order Date', accessor: 'orderDate' as const },
    { header: 'Expected Delivery', accessor: 'expectedDeliveryDate' as const },
    {
      header: 'Total Cost',
      render: (row: PurchaseOrder) => (
        <span style={{ fontWeight: 800, color: 'var(--color-smoky-black)' }}>
          PKR {row.total.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Outstanding Qty',
      render: (row: PurchaseOrder) => {
        const totalOutstanding = row.items.reduce((acc, it) => acc + it.outstandingQuantity, 0);
        return (
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: totalOutstanding > 0 ? 'var(--color-warning)' : 'var(--color-success)',
            }}
          >
            {totalOutstanding} units pending
          </span>
        );
      },
    },
    {
      header: 'Status',
      render: (row: PurchaseOrder) => (
        <Badge status={row.status} label={row.status.replace(/_/g, ' ').toUpperCase()} />
      ),
    },
    {
      header: 'Action',
      render: (row: PurchaseOrder) => (
        <Button size="sm" variant="outline" onClick={() => navigate(`/procurement/orders/${row.id}`)}>
          View & Manage
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card padding="md">
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <Input
              label="Search Purchase Orders"
              placeholder="Search by PO number or supplier name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ width: '220px' }}>
            <Dropdown
              label="PO Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'pending_approval', label: 'Pending Approval' },
                { value: 'approved', label: 'Approved' },
                { value: 'sent_to_supplier', label: 'Sent to Supplier' },
                { value: 'partially_received', label: 'Partially Received' },
                { value: 'fully_received', label: 'Fully Received' },
                { value: 'closed', label: 'Closed' },
              ]}
            />
          </div>

          <Button variant="primary" onClick={() => navigate('/procurement/orders/new')}>
            + Create Purchase Order
          </Button>
        </div>
      </Card>

      <Card padding="lg">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-smoky-black)' }}>
              Supplier Purchase Orders ({filtered.length})
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--color-olive-drab)' }}>
              Controls enforce management approval before sending orders to FMCG confectionery manufacturers.
            </p>
          </div>
        </div>

        <Table columns={columns} data={filtered} keyExtractor={(row) => row.id} />
      </Card>
    </div>
  );
};

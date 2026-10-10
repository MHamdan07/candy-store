import React, { useState } from 'react';
import { Card, Table, Badge, Button, Input, Modal, Alert } from '@candi/ui';
import type { PurchaseRequest } from '@candi/types';

const INITIAL_REQUESTS: PurchaseRequest[] = [
  {
    id: 'pr-01',
    requestNumber: 'PR-2026-012',
    requesterName: 'Asim Raza (Warehouse Lead)',
    requesterRole: 'warehouse_manager',
    requiredDate: '2026-09-22',
    reason: 'Depot stock buffer low for Choco Dream Truffle Bites and Hazelnut Wafers ahead of weekend orders.',
    items: [
      { id: '1', sku: 'CND-CHOC-01', productName: 'Choco Dream Truffle Bites (24x50g)', unit: 'carton', quantity: 150, estimatedUnitPrice: 2800, totalEstimatedCost: 420000 },
      { id: '2', sku: 'CND-WAF-01', productName: 'Crispy Hazelnut Wafers (36 packets)', unit: 'carton', quantity: 100, estimatedUnitPrice: 1950, totalEstimatedCost: 195000 },
    ],
    estimatedTotalCost: 615000,
    status: 'approved',
    approvedBy: 'Farhan Zaidi',
    approvedAt: '2026-09-17 09:30',
    createdAt: '2026-09-16 14:00',
  },
  {
    id: 'pr-02',
    requestNumber: 'PR-2026-013',
    requesterName: 'Adnan Tariq (Sales Team)',
    requesterRole: 'sales_agent',
    requiredDate: '2026-09-25',
    reason: 'Wholesale order surge expected for Jodia Bazaar confectionery festival.',
    items: [
      { id: '3', sku: 'CND-GUM-01', productName: 'Fruity Blast Chewy Candies (100 packets)', unit: 'carton', quantity: 300, estimatedUnitPrice: 1200, totalEstimatedCost: 360000 },
    ],
    estimatedTotalCost: 360000,
    status: 'pending_approval',
    createdAt: '2026-09-17 11:00',
  },
];

export const PurchaseRequestPage: React.FC = () => {
  const [requests, setRequests] = useState<PurchaseRequest[]>(INITIAL_REQUESTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [requiredDate, setRequiredDate] = useState('2026-09-24');
  const [selectedSku, setSelectedSku] = useState('CND-CHOC-02');
  const [qty, setQty] = useState(50);
  const [unitPrice, setUnitPrice] = useState(1450);
  const [notice, setNotice] = useState<string | null>(null);

  const handleCreateRequest = () => {
    const newPr: PurchaseRequest = {
      id: `pr-${Date.now()}`,
      requestNumber: `PR-2026-0${requests.length + 14}`,
      requesterName: 'Farhan Zaidi',
      requesterRole: 'super_admin',
      requiredDate,
      reason,
      items: [
        {
          id: 'item-1',
          sku: selectedSku,
          productName: 'Velvet Caramel Bar Bulk Pack (48 pcs)',
          unit: 'box',
          quantity: Number(qty),
          estimatedUnitPrice: Number(unitPrice),
          totalEstimatedCost: Number(qty) * Number(unitPrice),
        },
      ],
      estimatedTotalCost: Number(qty) * Number(unitPrice),
      status: 'pending_approval',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setRequests([newPr, ...requests]);
    setIsModalOpen(false);
    setNotice(`Purchase Request ${newPr.requestNumber} submitted successfully!`);
    setReason('');
  };

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: 'approved', approvedBy: 'Farhan Zaidi', approvedAt: new Date().toISOString().slice(0, 16) }
          : r
      )
    );
    setNotice(`Purchase request approved and converted into pending supplier PO.`);
  };

  const columns = [
    { header: 'Request No', accessor: 'requestNumber' as const, width: '130px' },
    {
      header: 'Requester',
      render: (row: PurchaseRequest) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-smoky-black)' }}>{row.requesterName}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>Role: {row.requesterRole}</div>
        </div>
      ),
    },
    {
      header: 'Items & Reason',
      render: (row: PurchaseRequest) => (
        <div>
          <div style={{ fontWeight: 600 }}>
            {row.items.map((it) => `${it.quantity} ${it.unit}s (${it.sku})`).join(', ')}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            "{row.reason}"
          </div>
        </div>
      ),
    },
    { header: 'Required Date', accessor: 'requiredDate' as const },
    {
      header: 'Est. Cost',
      render: (row: PurchaseRequest) => (
        <span style={{ fontWeight: 800, color: 'var(--color-smoky-black)' }}>
          PKR {row.estimatedTotalCost.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row: PurchaseRequest) => (
        <Badge status={row.status} label={row.status.replace('_', ' ').toUpperCase()} />
      ),
    },
    {
      header: 'Actions',
      render: (row: PurchaseRequest) =>
        row.status === 'pending_approval' ? (
          <Button size="sm" variant="primary" onClick={() => handleApprove(row.id)}>
            Approve Request
          </Button>
        ) : (
          <span style={{ fontSize: '12px', color: 'var(--color-success)', fontWeight: 600 }}>
            Approved by {row.approvedBy}
          </span>
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
              Procurement: Purchase Requests
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--color-olive-drab)' }}>
              Internal stock replenishment requests from warehouse and sales before issuing purchase orders.
            </p>
          </div>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            + New Purchase Request
          </Button>
        </div>

        <Table columns={columns} data={requests} keyExtractor={(row) => row.id} />
      </Card>

      {/* New Purchase Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Internal Purchase Request"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateRequest} disabled={!reason}>
              Submit for Approval
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Required By Date"
            type="date"
            value={requiredDate}
            onChange={(e) => setRequiredDate(e.target.value)}
          />

          <Input
            label="Procurement Reason / Stock Rationale"
            placeholder="e.g. Replenishing high-demand chocolate stock for wedding season"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Quantity to Order"
              type="number"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />
            <Input
              label="Estimated Unit Price (PKR)"
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(Number(e.target.value))}
            />
          </div>

          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--color-surface-muted)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '13px', color: 'var(--color-olive-drab)' }}>Automatic Total Estimated Cost:</span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-smoky-black)' }}>
              PKR {(qty * unitPrice).toLocaleString()}
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
};

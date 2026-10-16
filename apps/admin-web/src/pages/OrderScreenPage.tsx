import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Badge, Button, Input, Dropdown, Modal } from '@candi/ui';

interface DemoOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  businessName: string;
  customerType: 'retailer' | 'sub_wholesaler';
  zone: string;
  itemsCount: number;
  total: number;
  paymentMethod: string;
  status:
    | 'pending_confirmation'
    | 'confirmed'
    | 'approved_for_picking'
    | 'released_for_picking'
    | 'picked'
    | 'dispatched'
    | 'delivered'
    | 'reconciled';
  createdAt: string;
  appliedTierName?: string;
  lines: {
    name: string;
    unit: string;
    qty: number;
    basePrice: number;
    appliedRule: string;
    price: number;
    subtotal: number;
    bonusQty?: number;
  }[];
}

const ORDERS_DATA: DemoOrder[] = [
  {
    id: 'ord-01',
    orderNumber: 'ORD-2026-089',
    customerName: 'Muhammad Bilal Khan',
    businessName: 'Bilal General Store',
    customerType: 'retailer',
    zone: 'Zone 1 - Nazimabad',
    appliedTierName: 'Tier 2 — Gold Key Accounts',
    itemsCount: 3,
    total: 18400,
    paymentMethod: 'Cash on Delivery (COD)',
    status: 'approved_for_picking',
    createdAt: 'Today, 10:15 AM',
    lines: [
      { name: 'Choco Dream Truffle Bites', unit: 'carton', qty: 3, basePrice: 3200, appliedRule: 'Tier 2 Gold Rate', price: 2980, subtotal: 8940 },
      { name: 'Crispy Hazelnut Wafers', unit: 'carton', qty: 2, basePrice: 2400, appliedRule: 'Tier 2 Gold Rate', price: 2220, subtotal: 4440 },
      { name: 'Velvet Caramel Bar Bulk Pack', unit: 'box', qty: 3, basePrice: 1650, appliedRule: 'Tier 2 Gold Rate', price: 1540, subtotal: 4620 },
    ],
  },
  {
    id: 'ord-02',
    orderNumber: 'ORD-2026-088',
    customerName: 'Tariq Mehmood',
    businessName: 'Mehmood Traders Wholesale',
    customerType: 'sub_wholesaler',
    zone: 'Zone 3 - Saddar',
    appliedTierName: 'Tier 1 — Platinum Sub-Wholesale',
    itemsCount: 3,
    total: 83300,
    paymentMethod: 'Partial Advance + COD',
    status: 'pending_confirmation',
    createdAt: 'Today, 09:50 AM',
    lines: [
      { name: 'Choco Dream Truffle Bites', unit: 'carton', qty: 15, basePrice: 3200, appliedRule: 'Contract CTR-MTW-2026-Q3', price: 2800, subtotal: 42000, bonusQty: 1 },
      { name: 'Fruity Blast Chewy Candies', unit: 'carton', qty: 20, basePrice: 1450, appliedRule: 'Tier 1 Platinum + Monsoon Scheme', price: 1280, subtotal: 25600, bonusQty: 2 },
      { name: 'Sour Berry Gummy Bears Dispenser', unit: 'carton', qty: 4, basePrice: 3800, appliedRule: 'Tier 1 Platinum Rate', price: 3450, subtotal: 13800 },
    ],
  },
  {
    id: 'ord-03',
    orderNumber: 'ORD-2026-087',
    customerName: 'Kamran Siddiqui',
    businessName: 'Al-Madina Mini Mart',
    customerType: 'retailer',
    zone: 'Zone 2 - Gulshan',
    appliedTierName: 'Tier 3 — Silver Regular Retailers',
    itemsCount: 2,
    total: 7200,
    paymentMethod: 'Cash on Delivery (COD)',
    status: 'picked',
    createdAt: 'Today, 08:30 AM',
    lines: [
      { name: 'Fruity Blast Chewy Candies', unit: 'carton', qty: 3, basePrice: 1450, appliedRule: 'Tier 3 Silver Rate', price: 1390, subtotal: 4170 },
      { name: 'Crispy Hazelnut Wafers', unit: 'carton', qty: 1, basePrice: 2400, appliedRule: 'Standard Retail Rate', price: 2400, subtotal: 2400 },
    ],
  },
  {
    id: 'ord-04',
    orderNumber: 'ORD-2026-086',
    customerName: 'Rashid Ali',
    businessName: 'Ali & Sons Candy Mart',
    customerType: 'sub_wholesaler',
    zone: 'Zone 4 - Korangi',
    appliedTierName: 'Tier 1 — Platinum Sub-Wholesale',
    itemsCount: 2,
    total: 45600,
    paymentMethod: 'Credit Terms',
    status: 'dispatched',
    createdAt: 'Yesterday, 04:00 PM',
    lines: [
      { name: 'Velvet Caramel Bar Bulk Pack', unit: 'box', qty: 20, basePrice: 1650, appliedRule: 'Contract CTR-ALI-2026-V1', price: 1420, subtotal: 28400 },
      { name: 'Dairy Rich Powdered Milk Sachets', unit: 'box', qty: 15, basePrice: 1150, appliedRule: 'Tier 1 Platinum Rate', price: 1040, subtotal: 15600 },
    ],
  },
];

export const OrderScreenPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<DemoOrder[]>(ORDERS_DATA);
  const [selectedOrder, setSelectedOrder] = useState<DemoOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'ALL') return true;
    return o.status === statusFilter;
  });

  const handleUpdateStatus = (orderId: string, newStatus: DemoOrder['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const columns = [
    { header: 'Order No', accessor: 'orderNumber' as const, width: '130px' },
    {
      header: 'Customer & Business',
      render: (row: DemoOrder) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-smoky-black)' }}>{row.businessName}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>{row.customerName}</div>
        </div>
      ),
    },
    {
      header: 'Delivery Zone',
      accessor: 'zone' as const,
    },
    {
      header: 'Total Amount',
      render: (row: DemoOrder) => (
        <div>
          <div style={{ fontWeight: 800, color: 'var(--color-smoky-black)' }}>
            PKR {row.total.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>
            {row.itemsCount} lines • {row.paymentMethod}
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (row: DemoOrder) => <Badge status={row.status} label={row.status.replace(/_/g, ' ')} />,
    },
    { header: 'Created', accessor: 'createdAt' as const },
    {
      header: 'Actions',
      render: (row: DemoOrder) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <Button size="sm" variant="outline" onClick={() => setSelectedOrder(row)}>
            View Order
          </Button>
          {(row.status === 'released_for_picking' || row.status === 'approved_for_picking') && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate('/orders/verification')}
            >
              Pick Slip
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 5-Stage Verification Callout Banner */}
      <div
        style={{
          backgroundColor: '#FFF1F2',
          border: '1px solid #FECDD3',
          borderRadius: '8px',
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#9F1239' }}>
            5-Stage WhatsApp & Tele-Sales Conversational Verification Desk
          </div>
          <div style={{ fontSize: '12px', color: '#BE123C' }}>
            Multi-channel confirmation tracking, live phone quantity adjustments, khata credit check, and warehouse wave picking release engine.
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/orders/verification')}
        >
          Open 5-Stage Verification Queue →
        </Button>
      </div>

      {/* Filters Bar */}
      <Card padding="md">
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ width: '220px' }}>
            <Dropdown
              label="Order Operational Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Orders' },
                { value: 'pending_confirmation', label: 'Pending Confirmation' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'approved_for_picking', label: 'Approved for Picking' },
                { value: 'released_for_picking', label: 'Released for Picking' },
                { value: 'picked', label: 'Picked' },
                { value: 'dispatched', label: 'Dispatched' },
                { value: 'delivered', label: 'Delivered' },
              ]}
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setStatusFilter('ALL')}
          >
            Clear Filter
          </Button>
        </div>
      </Card>

      {/* Orders Table */}
      <Card padding="lg">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-smoky-black)' }}>
              Wholesale Customer Orders ({filteredOrders.length})
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--color-olive-drab)' }}>
              Order-to-cash lifecycle tracking from WhatsApp confirmation to cashier reconciliation.
            </p>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredOrders}
          keyExtractor={(row) => row.id}
          emptyMessage="No orders found"
        />
      </Card>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Order: ${selectedOrder.orderNumber}`}
          maxWidth="640px"
          footer={
            <div style={{ display: 'flex', gap: '8px' }}>
              {selectedOrder.status === 'pending_confirmation' && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'confirmed')}
                >
                  Confirm WhatsApp Verification
                </Button>
              )}
              {selectedOrder.status === 'confirmed' && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'approved_for_picking')}
                >
                  Approve for Warehouse Picking
                </Button>
              )}
              {(selectedOrder.status === 'approved_for_picking' || selectedOrder.status === 'released_for_picking') && (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'picked')}
                  >
                    Mark as Picked & Packed
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate('/orders/verification')}
                  >
                    View Wave Pick Slip →
                  </Button>
                </>
              )}
              {selectedOrder.status === 'picked' && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'dispatched')}
                >
                  Assign to Driver Manifest
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header info */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: 'var(--color-surface-muted)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-smoky-black)' }}>
                  {selectedOrder.businessName}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-olive-drab)' }}>
                  {selectedOrder.customerName} • {selectedOrder.zone}
                </div>
              </div>
              <div>
                <Badge status={selectedOrder.status} label={selectedOrder.status.replace(/_/g, ' ')} />
              </div>
            </div>

            {/* Line items table */}
            <div style={{ border: '1px solid var(--color-bone)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead style={{ backgroundColor: 'var(--color-surface-muted)', borderBottom: '1px solid var(--color-bone)' }}>
                  <tr>
                    <th style={{ padding: '8px 12px' }}>Product</th>
                    <th style={{ padding: '8px 12px' }}>Unit</th>
                    <th style={{ padding: '8px 12px' }}>Qty</th>
                    <th style={{ padding: '8px 12px' }}>Base Price</th>
                    <th style={{ padding: '8px 12px' }}>Applied Pricing Rule</th>
                    <th style={{ padding: '8px 12px' }}>Exact Price Used</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.lines.map((l, idx) => (
                    <React.Fragment key={idx}>
                      <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600 }}>{l.name}</td>
                        <td style={{ padding: '8px 12px' }}>{l.unit}</td>
                        <td style={{ padding: '8px 12px' }}>{l.qty}</td>
                        <td style={{ padding: '8px 12px', color: '#777' }}>PKR {l.basePrice ? l.basePrice.toLocaleString() : l.price.toLocaleString()}</td>
                        <td style={{ padding: '8px 12px', fontSize: '11px', color: 'var(--color-olive-drab)' }}>
                          <span style={{ backgroundColor: 'var(--color-bone)', padding: '2px 6px', borderRadius: '4px' }}>
                            {l.appliedRule || 'Standard Rate'}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px', fontWeight: 800, color: '#1B4332' }}>
                          PKR {l.price.toLocaleString()}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>
                          PKR {l.subtotal.toLocaleString()}
                        </td>
                      </tr>
                      {l.bonusQty ? (
                        <tr style={{ backgroundColor: '#F0F9F5', borderBottom: '1px solid var(--color-bone)' }}>
                          <td style={{ padding: '6px 12px', color: '#1B4332', fontSize: '11px' }}>
                            Trade Scheme Bonus: {l.name}
                          </td>
                          <td style={{ padding: '6px 12px', fontSize: '11px' }}>{l.unit}</td>
                          <td style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 700 }}>+{l.bonusQty}</td>
                          <td style={{ padding: '6px 12px', fontSize: '11px', color: '#777' }}>PKR 0</td>
                          <td style={{ padding: '6px 12px', fontSize: '11px', color: '#1B4332' }}>Promotional FOC Bonus</td>
                          <td style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 700 }}>PKR 0 (Free)</td>
                          <td style={{ padding: '6px 12px', textAlign: 'right', fontSize: '11px', fontWeight: 700 }}>PKR 0</td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '24px', padding: '0 8px' }}>
              <div style={{ fontSize: '13px', color: 'var(--color-olive-drab)' }}>Grand Total:</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-smoky-black)' }}>
                PKR {selectedOrder.total.toLocaleString()}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

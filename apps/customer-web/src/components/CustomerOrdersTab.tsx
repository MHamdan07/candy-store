import React, { useState } from 'react';
import { Card, Badge, Button } from '@candi/ui';
import { useWholesaleOrder } from '../context/WholesaleOrderContext';

export const CustomerOrdersTab: React.FC = () => {
  const { orders, setActiveTrackingOrder, setInvoiceModalOrder, reorder } = useWholesaleOrder();
  const [filter, setFilter] = useState<'all' | 'active' | 'delivered'>('all');

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return o.orderStatus !== 'delivered';
    if (filter === 'delivered') return o.orderStatus === 'delivered';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font-family-base)' }}>
      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)', margin: '0 0 4px 0' }}>
            My Wholesale Orders & Delivery History
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted, #64748B)', margin: 0 }}>
            Live status of your van dispatches from Candi Central Warehouse across Karachi.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('all')}
            type="button"
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              border: `1px solid ${filter === 'all' ? 'var(--color-primary, #1e2023)' : 'var(--color-border, #E2E8F0)'}`,
              backgroundColor: filter === 'all' ? 'var(--color-primary, #1e2023)' : '#FFFFFF',
              color: filter === 'all' ? '#FFFFFF' : 'var(--color-text-muted, #64748B)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            All Orders ({orders.length})
          </button>

          <button
            onClick={() => setFilter('active')}
            type="button"
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              border: `1px solid ${filter === 'active' ? 'var(--color-primary, #1e2023)' : 'var(--color-border, #E2E8F0)'}`,
              backgroundColor: filter === 'active' ? 'var(--color-primary, #1e2023)' : '#FFFFFF',
              color: filter === 'active' ? '#FFFFFF' : 'var(--color-text-muted, #64748B)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            In-Transit / Active ({orders.filter((o) => o.orderStatus !== 'delivered').length})
          </button>

          <button
            onClick={() => setFilter('delivered')}
            type="button"
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              border: `1px solid ${filter === 'delivered' ? 'var(--color-primary, #1e2023)' : 'var(--color-border, #E2E8F0)'}`,
              backgroundColor: filter === 'delivered' ? 'var(--color-primary, #1e2023)' : '#FFFFFF',
              color: filter === 'delivered' ? '#FFFFFF' : 'var(--color-text-muted, #64748B)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Delivered ({orders.filter((o) => o.orderStatus === 'delivered').length})
          </button>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card padding="lg">
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted, #64748B)' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📋</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)', marginBottom: '4px' }}>
              No Orders Found in this View
            </div>
            <p style={{ fontSize: '12px', margin: 0 }}>
              Use the Wholesale Catalog to build your confectionery order for prompt Karachi van delivery.
            </p>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredOrders.map((ord) => (
            <Card key={ord.id} padding="lg">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Order Top Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)' }}>
                        {ord.orderNumber}
                      </span>
                      <Badge
                        status={
                          ord.orderStatus === 'delivered'
                            ? 'approved'
                            : ord.orderStatus === 'dispatched'
                            ? 'warning'
                            : 'info'
                        }
                        label={ord.orderStatus.replace(/_/g, ' ').toUpperCase()}
                      />
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #64748B)', marginTop: '4px' }}>
                      Booked on {ord.orderDate} • Slot: <strong>{ord.deliverySlot}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)', fontWeight: 600 }}>Net Invoice Amount:</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--color-primary, #1e2023)' }}>
                      PKR {ord.grandTotal.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)', marginTop: '2px' }}>
                      {ord.paymentMethod === 'cash_on_delivery'
                        ? 'Cash on Delivery'
                        : ord.paymentMethod === 'credit_khata'
                        ? 'Wholesale Khata (14-Day Credit)'
                        : 'Direct Bank Transfer'}
                    </div>
                  </div>
                </div>

                {/* Items Summary Strip */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border, #E2E8F0)',
                    fontSize: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                    color: 'var(--color-text-main, #0F172A)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <span>
                      📦 Total Units: <strong>{ord.totalCartons} Cartons</strong>
                    </span>
                    <span>
                      🍬 Products: <strong>{ord.items.length} SKUs</strong>
                    </span>
                    <span>
                      📍 Address: <strong>{ord.deliveryAddress.area}</strong>
                    </span>
                    {ord.driverName && (
                      <span>
                        🚐 Van: <strong>{ord.deliveryVanPlate || 'KHI-VAN-7821'}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Item Line Pills */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {ord.items.map((item) => (
                    <span
                      key={item.sku}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--color-border, #E2E8F0)',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--color-text-main, #0F172A)',
                      }}
                    >
                      {item.quantity}x {item.name} ({item.unit})
                    </span>
                  ))}
                </div>

                {/* Actions Bar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--color-border, #E2E8F0)',
                    flexWrap: 'wrap',
                  }}
                >
                  <Button size="sm" variant="outline" onClick={() => setInvoiceModalOrder(ord)}>
                    📄 Tax Invoice & Challan
                  </Button>

                  <Button size="sm" variant="secondary" onClick={() => setActiveTrackingOrder(ord)}>
                    🚚 Track Live Dispatch
                  </Button>

                  <Button size="sm" variant="primary" onClick={() => reorder(ord)}>
                    🔁 1-Click Re-Order
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

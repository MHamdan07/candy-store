import React from 'react';
import { Badge, Button } from '@candi/ui';
import { WholesaleOrderRecord } from '../data/wholesaleCatalogData';
import { useWholesaleOrder } from '../context/WholesaleOrderContext';

export interface OrderTrackingDrawerProps {
  order?: WholesaleOrderRecord | null;
}

export const OrderTrackingDrawer: React.FC<OrderTrackingDrawerProps> = ({ order: propOrder }) => {
  const { activeTrackingOrder, setActiveTrackingOrder, setInvoiceModalOrder, reorder } = useWholesaleOrder();
  const order = propOrder !== undefined ? propOrder : activeTrackingOrder;

  if (!order) return null;

  const handleOpenInvoice = () => {
    setInvoiceModalOrder(order);
  };

  const handleReorder = () => {
    reorder(order);
    setActiveTrackingOrder(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
        fontFamily: 'var(--font-family-base)',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={() => setActiveTrackingOrder(null)}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
        }}
      />

      {/* Drawer */}
      <div
        className="order-tracking-drawer-container"
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#FFFFFF',
          height: '100%',
          boxShadow: '-8px 0 32px rgba(15, 23, 42, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 10000,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--color-border, #E2E8F0)',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)' }}>
                {order.orderNumber}
              </span>
              <Badge
                status={
                  order.orderStatus === 'delivered'
                    ? 'approved'
                    : order.orderStatus === 'dispatched'
                    ? 'warning'
                    : 'info'
                }
                label={order.orderStatus.toUpperCase()}
              />
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #64748B)', marginTop: '2px' }}>
              Booked on {order.orderDate} • {order.totalCartons} Units
            </div>
          </div>

          <button
            onClick={() => setActiveTrackingOrder(null)}
            type="button"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: 'var(--color-text-muted, #64748B)',
              padding: '6px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Dispatch Van Card */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #E2E8F0)',
              padding: '16px',
              display: 'flex',
              gap: '14px',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border, #E2E8F0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}
            >
              🚐
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)' }}>
                {order.driverName || 'Karachi Route Delivery Team'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #64748B)', marginTop: '2px' }}>
                Van Plate: <strong>{order.deliveryVanPlate || 'KHI-VAN-7821'}</strong> • Direct Driver Contact:{' '}
                <strong>{order.driverPhone || '+92 301 5552391'}</strong>
              </div>
              <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px', fontWeight: 700 }}>
                ✓ GPS Telemetry Active • Karachi Central Hub Route
              </div>
            </div>
          </div>

          {/* Stepper Progress */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #E2E8F0)',
              padding: '16px 20px',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)', marginBottom: '14px' }}>
              Live Delivery Route Timeline:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Step 1 */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#059669', marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-main, #0F172A)' }}>Order Booked & Validated</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)' }}>
                    Commercial terms approved, entered into Karachi dispatch roster
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)' }}>{order.orderDate}</span>
              </div>

              {/* Step 2 */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#059669', marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-main, #0F172A)' }}>Warehouse Picking & Palletizing</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)' }}>
                    Inspected by quality control at Jodia Bazaar central warehouse
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)' }}>Completed</span>
              </div>

              {/* Step 3 */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: order.orderStatus === 'dispatched' || order.orderStatus === 'delivered' ? '#059669' : 'var(--color-border, #E2E8F0)',
                    marginTop: '2px',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-main, #0F172A)' }}>
                    En Route on Delivery Van ({order.deliverySlot})
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)' }}>
                    Out for delivery to {order.deliveryAddress.area}
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)' }}>
                  {order.orderStatus === 'delivered' ? 'Done' : 'In Transit'}
                </span>
              </div>

              {/* Step 4 */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: order.orderStatus === 'delivered' ? '#059669' : 'var(--color-border, #E2E8F0)',
                    marginTop: '2px',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-main, #0F172A)' }}>Counter Handover & Cash/Challan Settlement</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)' }}>
                    Recipient verified and physical delivery receipt signed
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)' }}>
                  {order.orderStatus === 'delivered' ? 'Delivered' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Location & Notes */}
          <div
            style={{
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #E2E8F0)',
              backgroundColor: '#FFFFFF',
              fontSize: '12px',
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: '6px', color: 'var(--color-text-main, #0F172A)' }}>
              Delivery Destination & Instructions:
            </div>
            <div style={{ color: 'var(--color-text-main, #0F172A)' }}>
              <strong>{order.deliveryAddress.recipientName}</strong> ({order.deliveryAddress.phone})
            </div>
            <div style={{ color: 'var(--color-text-muted, #64748B)', marginTop: '2px' }}>
              {order.deliveryAddress.addressLine}, {order.deliveryAddress.area}, {order.deliveryAddress.city}
            </div>
            {order.riderNote && (
              <div style={{ marginTop: '8px', padding: '6px 10px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--color-border, #E2E8F0)', color: 'var(--color-text-main, #0F172A)' }}>
                📝 <strong>Rider Instruction:</strong> {order.riderNote}
              </div>
            )}
          </div>

          {/* Ordered Line Items */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)', marginBottom: '8px' }}>
              Ordered Items ({order.items.length}):
            </div>
            <div style={{ border: '1px solid var(--color-border, #E2E8F0)', borderRadius: '8px', overflow: 'hidden' }}>
              {order.items.map((line) => (
                <div
                  key={line.sku}
                  style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--color-border, #E2E8F0)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--color-text-main, #0F172A)' }}>{line.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)' }}>
                      {line.quantity} {line.unit}(s) ({line.piecesCount} total pieces) • {line.sku}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: 'var(--color-text-main, #0F172A)' }}>PKR {line.subtotal.toLocaleString()}</div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted, #64748B)' }}>
                      @ PKR {line.unitPrice.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div
            style={{
              padding: '14px',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #E2E8F0)',
              fontSize: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted, #64748B)' }}>
              <span>Gross Subtotal:</span>
              <span style={{ fontWeight: 700, color: 'var(--color-text-main, #0F172A)' }}>PKR {order.subtotal.toLocaleString()}</span>
            </div>
            {order.bulkDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 700 }}>
                <span>Bulk Trade Incentive (5%):</span>
                <span>-PKR {order.bulkDiscount.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted, #64748B)' }}>
              <span>Advance Income Tax WHT (0.5%):</span>
              <span>+PKR {order.taxAmount.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted, #64748B)' }}>
              <span>Van Delivery Charges:</span>
              <span style={{ color: '#059669', fontWeight: 700 }}>
                {order.deliveryFee === 0 ? 'FREE' : `+PKR ${order.deliveryFee}`}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '15px',
                fontWeight: 900,
                color: 'var(--color-primary, #1e2023)',
                paddingTop: '6px',
                borderTop: '1px solid var(--color-border, #E2E8F0)',
              }}
            >
              <span>Net Invoice Amount:</span>
              <span>PKR {order.grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className="order-tracking-drawer-footer"
          style={{
            padding: '16px 20px',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
            borderTop: '1px solid var(--color-border, #E2E8F0)',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            gap: '12px',
          }}
        >
          <Button variant="outline" style={{ flex: 1 }} onClick={handleOpenInvoice}>
            📄 View Tax Invoice & Challan
          </Button>

          <Button variant="primary" style={{ flex: 1 }} onClick={handleReorder}>
            🔁 1-Click Re-Order Items
          </Button>
        </div>
      </div>
    </div>
  );
};

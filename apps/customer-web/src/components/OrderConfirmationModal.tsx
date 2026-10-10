import React from 'react';
import { Modal, Button, Badge } from '@candi/ui';
import { useAuth } from '@candi/auth';
import { useWholesaleOrder } from '../context/WholesaleOrderContext';

export const OrderConfirmationModal: React.FC = () => {
  const { profile, customerAccount } = useAuth();
  const {
    confirmationModalOrder,
    setConfirmationModalOrder,
    setActiveTrackingOrder,
    setInvoiceModalOrder,
  } = useWholesaleOrder();

  if (!confirmationModalOrder) return null;

  const order = confirmationModalOrder;

  const handleTrackOrder = () => {
    setActiveTrackingOrder(order);
    setConfirmationModalOrder(null);
  };

  const handlePrintInvoice = () => {
    setInvoiceModalOrder(order);
    setConfirmationModalOrder(null);
  };

  const handleClose = () => {
    setConfirmationModalOrder(null);
  };

  return (
    <Modal
      isOpen={Boolean(confirmationModalOrder)}
      onClose={handleClose}
      title="Wholesale Order Booked Successfully! 🎉"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <Button variant="outline" onClick={handleClose}>
            Back to Catalog
          </Button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" onClick={handlePrintInvoice}>
              📄 View Tax Invoice & Challan
            </Button>
            <Button variant="primary" onClick={handleTrackOrder}>
              🚚 Track Live Van Dispatch
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'center' }}>
        {/* Big Celebratory Checkmark */}
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-success-bg)',
            border: '2px solid var(--color-success)',
            color: 'var(--color-success)',
            fontSize: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            boxShadow: '0 8px 24px rgba(104, 123, 98, 0.25)',
          }}
        >
          ✓
        </div>

        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-smoky-black)', margin: '0 0 6px 0' }}>
            Order Booked: {order.orderNumber}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-olive-drab)', margin: 0 }}>
            Assigned to Karachi Central Warehouse Dispatch Hub (Jodia Bazaar Grid)
          </p>
        </div>

        {/* WhatsApp Notification Simulator Banner */}
        <div
          style={{
            backgroundColor: '#E8F5E9',
            border: '1.5px solid #81C784',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <div style={{ fontSize: '24px' }}>💬</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#1B5E20' }}>
              WhatsApp Booking Notification Dispatched
            </div>
            <div style={{ fontSize: '11px', color: '#2E7D32', marginTop: '2px', lineHeight: 1.4 }}>
              An automated receipt with itemized cartons list, gate-pass challan number, and rider live link has been sent to{' '}
              <strong>{order.deliveryAddress.phone}</strong>.
            </div>
          </div>
          <Badge status="approved" label="SENT" />
        </div>

        {/* Dispatch & Delivery Timeline */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border, #E2E8F0)',
            padding: '16px',
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)', marginBottom: '12px' }}>
            Wholesale Dispatch Lifecycle:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
              <div style={{ flex: 1, fontSize: '12px' }}>
                <strong>Order Confirmed</strong> • Digital invoice logged in ERP system
              </div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>Just now</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-promo-warm-amber)' }} />
              <div style={{ flex: 1, fontSize: '12px' }}>
                <strong>Warehouse Picking</strong> • Karachi Central Depot picking {order.totalCartons} cartons
              </div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>In Progress</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.6 }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-border, #E2E8F0)' }} />
              <div style={{ flex: 1, fontSize: '12px' }}>
                <strong>Van Loading & Dispatch</strong> • Scheduled for {order.deliverySlot}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>Pending</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.6 }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-border, #E2E8F0)' }} />
              <div style={{ flex: 1, fontSize: '12px' }}>
                <strong>Store Counter Unloading & Sign-off</strong> • {order.deliveryAddress.addressLine}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>Pending</span>
            </div>
          </div>
        </div>

        {/* Order Summary Snapshot */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            backgroundColor: 'var(--color-surface-muted)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ color: 'var(--color-text-dim)' }}>Total Units:</div>
            <div style={{ fontSize: '14px', fontWeight: 800 }}>{order.totalCartons} Cartons</div>
          </div>
          <div>
            <div style={{ color: 'var(--color-text-dim)' }}>Payment Terms:</div>
            <div style={{ fontSize: '14px', fontWeight: 800 }}>
              {order.paymentMethod === 'cash_on_delivery'
                ? 'COD Cash'
                : order.paymentMethod === 'credit_khata'
                ? 'Wholesale Khata'
                : 'Bank Transfer'}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--color-text-dim)' }}>Net Payable:</div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--color-promo-crimson)' }}>
              PKR {order.grandTotal.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

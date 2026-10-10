import React from 'react';
import { Modal, Button } from '@candi/ui';
import { useWholesaleOrder } from '../context/WholesaleOrderContext';

export const WholesaleInvoiceModal: React.FC = () => {
  const { invoiceModalOrder, setInvoiceModalOrder } = useWholesaleOrder();

  if (!invoiceModalOrder) return null;

  const order = invoiceModalOrder;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={Boolean(invoiceModalOrder)}
      onClose={() => setInvoiceModalOrder(null)}
      title="Wholesale Tax Invoice & Delivery Gate Challan"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Button variant="outline" onClick={() => setInvoiceModalOrder(null)}>
            Close
          </Button>

          <Button variant="primary" onClick={handlePrint}>
            🖨️ Print Formal Invoice & Challan
          </Button>
        </div>
      }
    >
      <div
        id="wholesale-printable-invoice"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1.5px solid var(--color-smoky-black)',
          padding: '24px',
          borderRadius: 'var(--radius-sm)',
          fontFamily: 'var(--font-family-mono)',
          color: 'var(--color-smoky-black)',
          fontSize: '12px',
        }}
      >
        {/* Invoice Letterhead */}
        <div
          style={{
            borderBottom: '2px solid var(--color-smoky-black)',
            paddingBottom: '14px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '0.5px' }}>
              CANDI SUPER STORE WHOLESALE LTD
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
              Central Confectionery Warehouse & FMCG Distribution Hub
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>
              Plot 42-B, Commercial Area, Jodia Bazaar / Korangi Industrial Zone, Karachi
            </div>
            <div style={{ fontSize: '11px', marginTop: '4px' }}>
              <strong>NTN:</strong> 4120938-4 • <strong>STRN (Sales Tax):</strong> 17-00-4120-938-19
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                backgroundColor: 'var(--color-smoky-black)',
                color: '#FFFFFF',
                padding: '4px 10px',
                fontWeight: 900,
                fontSize: '12px',
                borderRadius: '2px',
                display: 'inline-block',
                marginBottom: '6px',
              }}
            >
              COMMERCIAL TAX INVOICE
            </div>
            <div style={{ fontWeight: 800 }}>Invoice #: INV-{order.orderNumber.replace('ORD-', '')}</div>
            <div style={{ color: 'var(--color-olive-drab)' }}>Order #: {order.orderNumber}</div>
            <div>Date: {order.orderDate}</div>
          </div>
        </div>

        {/* Billed To / Shipped To Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            backgroundColor: 'var(--color-surface-muted)',
            padding: '12px 14px',
            borderRadius: '4px',
            marginBottom: '16px',
          }}
        >
          <div>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, color: 'var(--color-olive-drab)' }}>
              CONSIGNEE / RETAILER SHOP:
            </div>
            <div style={{ fontSize: '14px', fontWeight: 900, marginTop: '2px' }}>
              {order.deliveryAddress.recipientName}
            </div>
            <div style={{ fontWeight: 700 }}>{order.deliveryAddress.label}</div>
            <div>{order.deliveryAddress.addressLine}</div>
            <div>{order.deliveryAddress.area}, {order.deliveryAddress.city}</div>
            <div>Phone: {order.deliveryAddress.phone}</div>
          </div>

          <div>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, color: 'var(--color-olive-drab)' }}>
              DISPATCH & ROUTING DETAILS:
            </div>
            <div>Delivery Slot: <strong>{order.deliverySlot}</strong></div>
            <div>Van Registration: <strong>{order.deliveryVanPlate || 'KHI-VAN-7821'}</strong></div>
            <div>Rider: <strong>{order.driverName || 'Muhammad Tariq'}</strong></div>
            <div>
              Payment Terms:{' '}
              <strong>
                {order.paymentMethod === 'cash_on_delivery'
                  ? 'Cash on Delivery (COD)'
                  : order.paymentMethod === 'credit_khata'
                  ? '14-Day Credit Khata'
                  : 'Direct IBFT Bank Transfer'}
              </strong>
            </div>
            <div>Status: <strong>{order.orderStatus.toUpperCase()}</strong></div>
          </div>
        </div>

        {/* Line Items Table */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '11px',
            marginBottom: '16px',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: 'var(--color-smoky-black)', color: '#FFFFFF', textAlign: 'left' }}>
              <th style={{ padding: '6px 8px' }}>#</th>
              <th style={{ padding: '6px 8px' }}>SKU</th>
              <th style={{ padding: '6px 8px' }}>Product Description</th>
              <th style={{ padding: '6px 8px' }}>Unit</th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>Qty</th>
              <th style={{ padding: '6px 8px', textAlign: 'right' }}>Wholesale Rate (PKR)</th>
              <th style={{ padding: '6px 8px', textAlign: 'right' }}>Total (PKR)</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((line, index) => (
              <tr key={line.sku} style={{ borderBottom: '1px solid var(--color-border, #E2E8F0)' }}>
                <td style={{ padding: '6px 8px' }}>{index + 1}</td>
                <td style={{ padding: '6px 8px', fontWeight: 700 }}>{line.sku}</td>
                <td style={{ padding: '6px 8px' }}>{line.name}</td>
                <td style={{ padding: '6px 8px' }}>{line.unit.toUpperCase()}</td>
                <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 800 }}>{line.quantity}</td>
                <td style={{ padding: '6px 8px', textAlign: 'right' }}>PKR {line.unitPrice.toLocaleString()}</td>
                <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800 }}>
                  PKR {line.subtotal.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals & Tax Box */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Gross Total:</span>
              <span style={{ fontWeight: 700 }}>PKR {order.subtotal.toLocaleString()}</span>
            </div>

            {order.bulkDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#386641' }}>
                <span>Less Trade Promotion (5%):</span>
                <span>-PKR {order.bulkDiscount.toLocaleString()}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Advance Tax (0.5% Sec 236H Filer):</span>
              <span>+PKR {order.taxAmount.toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Karachi Delivery Van Freight:</span>
              <span>{order.deliveryFee === 0 ? 'FREE' : `+PKR ${order.deliveryFee}`}</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '6px',
                borderTop: '2px solid var(--color-smoky-black)',
                fontSize: '14px',
                fontWeight: 900,
              }}
            >
              <span>Net Payable (PKR):</span>
              <span style={{ color: 'var(--color-promo-crimson)' }}>
                PKR {order.grandTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Official Sign-off and Gate Pass Section */}
        <div
          style={{
            borderTop: '1px dashed var(--color-smoky-black)',
            paddingTop: '16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '16px',
            fontSize: '10px',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ height: '40px' }} />
            <div style={{ borderTop: '1px solid var(--color-smoky-black)', paddingTop: '4px', fontWeight: 700 }}>
              Warehouse Dispatcher
            </div>
            <div>Candi Central Hub Karachi</div>
          </div>

          <div>
            <div style={{ height: '40px' }} />
            <div style={{ borderTop: '1px solid var(--color-smoky-black)', paddingTop: '4px', fontWeight: 700 }}>
              Van Delivery Driver
            </div>
            <div>Physical Cartons Handed Over</div>
          </div>

          <div>
            <div style={{ height: '40px' }} />
            <div style={{ borderTop: '1px solid var(--color-smoky-black)', paddingTop: '4px', fontWeight: 700 }}>
              Shop Receiver Signature & Stamp
            </div>
            <div>Received In Good Sealed Condition</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

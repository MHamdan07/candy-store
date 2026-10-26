import React, { useState } from 'react';
import { Modal, Button, Badge, Alert } from '@candi/ui';
import { useAuth } from '@candi/auth';
import { useWholesaleOrder } from '../context/WholesaleOrderContext';
import { KARACHI_DELIVERY_SLOTS } from '../data/wholesaleCatalogData';

export const CheckoutModal: React.FC = () => {
  const { profile } = useAuth();
  const {
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    cartItems,
    totalCartons,
    subtotal,
    bulkDiscount,
    taxFilerAdvance,
    deliveryFee,
    grandTotal,
    placeOrder,
    creditLimit,
    availableCredit,
  } = useWholesaleOrder();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSlot, setSelectedSlot] = useState(KARACHI_DELIVERY_SLOTS[0].label);
  const [riderNote, setRiderNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'credit_khata' | 'bank_transfer_ibft'>('cash_on_delivery');
  const [bankRef, setBankRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Address selection
  const defaultAddress = {
    label: 'Main Shop Counter',
    recipientName: profile?.fullName || 'Muhammad Bilal Khan',
    phone: profile?.phone || '+92 300 1111111',
    addressLine: 'Shop 4, Block H, Main Commercial Road',
    area: 'North Nazimabad',
    city: 'Karachi',
  };

  const [deliveryAddress] = useState(defaultAddress);

  if (!isCheckoutModalOpen) return null;

  const handleClose = () => {
    if (isSubmitting) return;
    setIsCheckoutModalOpen(false);
    setStep(1);
  };

  const handleCompleteOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      placeOrder({
        deliverySlot: selectedSlot,
        deliveryAddress,
        paymentMethod,
        riderNote: riderNote + (bankRef ? ` [IBFT Ref: ${bankRef}]` : ''),
      });
      setIsSubmitting(false);
      setIsCheckoutModalOpen(false);
      setStep(1);
    }, 1200);
  };

  const canUseCredit = availableCredit >= grandTotal;

  return (
    <Modal
      isOpen={isCheckoutModalOpen}
      onClose={handleClose}
      title="Wholesale Self-Service Checkout (Karachi Hub)"
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 4px)',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)', fontWeight: 600 }}>Total Payable:</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--color-primary, #1e2023)' }}>
              PKR {grandTotal.toLocaleString()}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep((prev) => (prev - 1) as any)} disabled={isSubmitting}>
                ← Back
              </Button>
            )}

            {step < 3 ? (
              <Button variant="primary" onClick={() => setStep((prev) => (prev + 1) as any)}>
                Continue to Step {step + 1} →
              </Button>
            ) : (
              <Button variant="primary" onClick={handleCompleteOrder} disabled={isSubmitting}>
                {isSubmitting ? 'Booking Order...' : '✓ Place Wholesale Order'}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font-family-base)' }}>
        {/* Step Stepper Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC',
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid var(--color-border, #E2E8F0)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: step >= 1 ? 'var(--color-primary, #1e2023)' : 'var(--color-border, #E2E8F0)',
                color: step >= 1 ? '#FFFFFF' : 'var(--color-text-muted, #64748B)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 800,
              }}
            >
              1
            </div>
            <span style={{ fontSize: '12px', fontWeight: step === 1 ? 800 : 600, color: 'var(--color-text-main, #0F172A)' }}>
              Address & Routing
            </span>
          </div>

          <span style={{ color: 'var(--color-border, #E2E8F0)' }}>→</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: step >= 2 ? 'var(--color-primary, #1e2023)' : 'var(--color-border, #E2E8F0)',
                color: step >= 2 ? '#FFFFFF' : 'var(--color-text-muted, #64748B)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 800,
              }}
            >
              2
            </div>
            <span style={{ fontSize: '12px', fontWeight: step === 2 ? 800 : 600, color: 'var(--color-text-main, #0F172A)' }}>
              Payment Terms
            </span>
          </div>

          <span style={{ color: 'var(--color-border, #E2E8F0)' }}>→</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: step === 3 ? 'var(--color-primary, #1e2023)' : 'var(--color-border, #E2E8F0)',
                color: step === 3 ? '#FFFFFF' : 'var(--color-text-muted, #64748B)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 800,
              }}
            >
              3
            </div>
            <span style={{ fontSize: '12px', fontWeight: step === 3 ? 800 : 600, color: 'var(--color-text-main, #0F172A)' }}>
              Review & Book
            </span>
          </div>
        </div>

        {/* STEP 1: Address & Delivery Route */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)', marginBottom: '4px' }}>
                1. Delivery Destination (Kiryana / Shop Counter)
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted, #64748B)', margin: '0 0 10px 0' }}>
                Orders are dispatched from our Karachi depot directly to your verified commercial premises.
              </p>

              <div
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--color-primary, #1e2023)',
                  backgroundColor: '#FFF1F2',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 800, fontSize: '13px', color: 'var(--color-text-main, #0F172A)' }}>{deliveryAddress.label}</span>
                    <Badge status="approved" label="PRIMARY" />
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted, #64748B)' }}>
                    Zone: {deliveryAddress.area}
                  </span>
                </div>

                <div style={{ fontSize: '13px', marginTop: '6px', color: 'var(--color-text-main, #0F172A)', fontWeight: 600 }}>
                  {deliveryAddress.addressLine}, {deliveryAddress.area}, {deliveryAddress.city}
                </div>

                <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)', marginTop: '4px' }}>
                  Recipient: {deliveryAddress.recipientName} ({deliveryAddress.phone})
                </div>
              </div>
            </div>

            {/* Time Slot Selection */}
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)', marginBottom: '8px' }}>
                2. Select Karachi Van Route Time Slot
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {KARACHI_DELIVERY_SLOTS.map((slot) => {
                  const isSelected = selectedSlot === slot.label;
                  return (
                    <div
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot.label)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: `1.5px solid ${isSelected ? 'var(--color-primary, #1e2023)' : 'var(--color-border, #E2E8F0)'}`,
                        backgroundColor: isSelected ? '#FFF1F2' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)' }}>
                          {slot.label}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)', marginTop: '2px' }}>
                          {slot.description}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: slot.fee === 0 ? '#059669' : 'var(--color-text-main, #0F172A)' }}>
                          {slot.fee === 0 ? 'FREE' : `+PKR ${slot.fee}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rider Special Notes */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px', color: 'var(--color-text-main, #0F172A)' }}>
                Drop-Off Notes for Van Driver (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Call 15 mins before arrival, deliver to rear godown door..."
                value={riderNote}
                onChange={(e) => setRiderNote(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border, #E2E8F0)',
                  fontFamily: 'inherit',
                  fontSize: '12px',
                  outline: 'none',
                  color: 'var(--color-text-main, #0F172A)',
                }}
              />
            </div>
          </div>
        )}

        {/* STEP 2: Payment Terms & Wholesale Khata */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)', marginBottom: '4px' }}>
                Choose Wholesale Settlement Terms
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted, #64748B)', margin: 0 }}>
                Select how your kiryana shop will settle this invoice upon Karachi warehouse van delivery.
              </p>
            </div>

            {/* Payment Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Option 1: Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod('cash_on_delivery')}
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  border: `1.5px solid ${paymentMethod === 'cash_on_delivery' ? 'var(--color-primary, #1e2023)' : 'var(--color-border, #E2E8F0)'}`,
                  backgroundColor: paymentMethod === 'cash_on_delivery' ? '#FFF1F2' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ fontSize: '20px' }}>💵</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)' }}>
                      Cash on Delivery (COD at Shop Counter)
                    </span>
                    <Badge status="approved" label="RECOMMENDED" />
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                    Pay physical cash to the delivery van driver after inspecting cartons and signing the physical gate-pass delivery challan.
                  </p>
                </div>
              </div>

              {/* Option 2: Wholesale Khata (14-Day Credit) */}
              <div
                onClick={() => {
                  if (canUseCredit) setPaymentMethod('credit_khata');
                }}
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  border: `1.5px solid ${paymentMethod === 'credit_khata' ? 'var(--color-primary, #1e2023)' : 'var(--color-border, #E2E8F0)'}`,
                  backgroundColor: paymentMethod === 'credit_khata' ? '#FFF1F2' : '#FFFFFF',
                  cursor: canUseCredit ? 'pointer' : 'not-allowed',
                  opacity: canUseCredit ? 1 : 0.65,
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ fontSize: '20px' }}>📒</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)' }}>
                      Wholesale Khata (14-Day Rolling Credit)
                    </span>
                    <Badge
                      status={canUseCredit ? 'approved' : 'rejected'}
                      label={canUseCredit ? 'CREDIT APPROVED' : 'INSUFFICIENT LIMIT'}
                    />
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                    Debit directly to your verified wholesale khata ledger. 14 days payment cycle.
                  </p>

                  {/* Credit Status Pill */}
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '8px 10px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid var(--color-border, #E2E8F0)',
                      borderRadius: '6px',
                      fontSize: '11px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: 'var(--color-text-main, #0F172A)',
                    }}
                  >
                    <span>
                      Total Limit: <strong>PKR {creditLimit.toLocaleString()}</strong>
                    </span>
                    <span>
                      Available: <strong>PKR {availableCredit.toLocaleString()}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Option 3: Direct Bank Transfer (IBFT / Raast) */}
              <div
                onClick={() => setPaymentMethod('bank_transfer_ibft')}
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  border: `1.5px solid ${paymentMethod === 'bank_transfer_ibft' ? 'var(--color-primary, #1e2023)' : 'var(--color-border, #E2E8F0)'}`,
                  backgroundColor: paymentMethod === 'bank_transfer_ibft' ? '#FFF1F2' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ fontSize: '20px' }}>🏛️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)' }}>
                    Direct Bank Transfer (IBFT / 1LINK Raast)
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                    Instant electronic settlement via Meezan Bank or HBL business account before van dispatch.
                  </p>

                  {paymentMethod === 'bank_transfer_ibft' && (
                    <div
                      style={{
                        marginTop: '10px',
                        padding: '10px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border, #E2E8F0)',
                        fontSize: '11px',
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--color-text-main, #0F172A)' }}>Bank Account Details:</div>
                      <div>Bank: <strong>Meezan Bank Ltd (Jodia Bazaar Branch)</strong></div>
                      <div>Account Title: <strong>Candi Super Store Wholesale Ltd</strong></div>
                      <div>IBAN: <strong>PK36MEZN0001020304050607</strong></div>

                      <div style={{ marginTop: '8px' }}>
                        <label style={{ fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                          Transaction / Raast Ref Number:
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. FT2610078829"
                          value={bankRef}
                          onChange={(e) => setBankRef(e.target.value)}
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '6px 8px',
                            border: '1px solid var(--color-border, #E2E8F0)',
                            borderRadius: '4px',
                            fontFamily: 'inherit',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Book */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Alert type="info" title="Final Order Review & Verification">
              Please inspect line items and total pricing below. A digital tax invoice and WhatsApp booking summary will be generated immediately upon confirmation.
            </Alert>

            {/* Itemized lines mini-table */}
            <div
              style={{
                border: '1px solid var(--color-border, #E2E8F0)',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: 800,
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--color-border, #E2E8F0)',
                }}
              >
                <span>Item Description ({cartItems.length} Products, {totalCartons} Units)</span>
                <span>Amount (PKR)</span>
              </div>

              <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
                {cartItems.map((item) => (
                  <div
                    key={item.productId}
                    style={{
                      padding: '8px 12px',
                      borderBottom: '1px solid var(--color-border, #E2E8F0)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12px',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--color-text-main, #0F172A)' }}>{item.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-muted, #64748B)' }}>
                        {item.quantity} {item.unit}(s) @ PKR {item.unitPrice.toLocaleString()} • {item.sku}
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--color-text-main, #0F172A)' }}>
                      PKR {(item.quantity * item.unitPrice).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--color-border, #E2E8F0)',
                fontSize: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted, #64748B)' }}>
                <span>Wholesale Gross Total:</span>
                <span style={{ fontWeight: 700, color: 'var(--color-text-main, #0F172A)' }}>PKR {subtotal.toLocaleString()}</span>
              </div>
              {bulkDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 700 }}>
                  <span>5% Bulk Promotion Discount:</span>
                  <span>-PKR {bulkDiscount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted, #64748B)' }}>
                <span>Filer Advance Tax (0.5% Section 236H):</span>
                <span>+PKR {taxFilerAdvance.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted, #64748B)' }}>
                <span>Karachi Route Delivery:</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>
                  {deliveryFee === 0 ? 'FREE' : `+PKR ${deliveryFee}`}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '6px',
                  borderTop: '1.5px solid var(--color-border, #E2E8F0)',
                  fontSize: '15px',
                  fontWeight: 900,
                  color: 'var(--color-primary, #1e2023)',
                }}
              >
                <span>Net Invoice Payable:</span>
                <span>PKR {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Dispatch details snippet */}
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)', lineHeight: 1.5 }}>
              📍 <strong>Delivery Address:</strong> {deliveryAddress.addressLine}, {deliveryAddress.area}
              <br />
              ⏰ <strong>Route Slot:</strong> {selectedSlot}
              <br />
              💳 <strong>Payment Terms:</strong>{' '}
              {paymentMethod === 'cash_on_delivery'
                ? 'Cash on Delivery (COD)'
                : paymentMethod === 'credit_khata'
                ? 'Wholesale Khata (14 Days)'
                : 'Direct Bank Transfer'}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

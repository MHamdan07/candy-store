import React from 'react';
import { Button } from '@candi/ui';
import { useWholesaleOrder } from '../context/WholesaleOrderContext';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartItemCount,
    totalCartons,
    subtotal,
    bulkDiscount,
    isFreeDelivery,
    freeDeliveryShortfall,
    taxFilerAdvance,
    deliveryFee,
    grandTotal,
    setIsCheckoutModalOpen,
  } = useWholesaleOrder();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
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
        onClick={() => setIsCartOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
        }}
      />

      {/* Slide-over Content Drawer */}
      <div
        className="cart-drawer-container"
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#FFFFFF',
          height: '100%',
          boxShadow: '-8px 0 32px rgba(15, 23, 42, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 10000,
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--color-border, #E2E8F0)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main, #1e1f22)' }}>
              Wholesale Order Basket
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #4c4e51)', marginTop: '2px' }}>
              {cartItemCount} Products • {totalCartons} Units
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                type="button"
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#EF4444',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              type="button"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: 'var(--color-text-muted, #64748B)',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Free Delivery Meter Banner in Drawer */}
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: isFreeDelivery ? '#ECFDF5' : '#FFFBEB',
            borderBottom: `1px solid ${isFreeDelivery ? '#A7F3D0' : '#FDE68A'}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>
            <span style={{ color: isFreeDelivery ? '#065F46' : '#92400E' }}>🚚 Karachi Delivery:</span>
            <span style={{ color: isFreeDelivery ? '#059669' : '#D97706' }}>
              {isFreeDelivery ? 'QUALIFIED FOR FREE DELIVERY!' : `Add PKR ${freeDeliveryShortfall.toLocaleString()} for Free Delivery`}
            </span>
          </div>

          <div
            style={{
              height: '6px',
              backgroundColor: isFreeDelivery ? '#D1FAE5' : '#FEF3C7',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, Math.round((subtotal / 5000) * 100))}%`,
                backgroundColor: isFreeDelivery ? '#059669' : '#F59E0B',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Cart Item Lines List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {cartItems.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: 'var(--color-text-muted, #64748B)',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)', marginBottom: '8px' }}>
                Your Wholesale Basket is Empty
              </div>
              <p style={{ fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
                Explore factory-direct chocolates, candies, wafers, and toffees from the catalog to build your order.
              </p>
            </div>
          ) : (
            cartItems.map((item) => {
              const lineTotal = item.unitPrice * item.quantity;
              return (
                <div
                  key={item.productId}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border, #E2E8F0)',
                    backgroundColor: '#F8FAFC',
                  }}
                >
                  {/* Accent Color stripe */}
                  <div
                    style={{
                      width: '4px',
                      borderRadius: '2px',
                      backgroundColor: item.accentColor,
                    }}
                  />

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)' }}>
                        {item.name}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        type="button"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-text-muted, #64748B)',
                          cursor: 'pointer',
                          fontSize: '13px',
                          padding: '0 4px',
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #64748B)', marginTop: '2px' }}>
                      {item.brand} • {item.sku}
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--color-text-main, #0F172A)', marginTop: '4px', fontWeight: 700 }}>
                      PKR {item.unitPrice.toLocaleString()} / {item.unit}
                    </div>

                    {/* Stepper & Line Total */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '10px',
                      }}
                    >
                      {/* Quantity Stepper */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid var(--color-border, #E2E8F0)',
                          borderRadius: '6px',
                          backgroundColor: '#FFFFFF',
                          overflow: 'hidden',
                        }}
                      >
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          type="button"
                          style={{
                            padding: '4px 10px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            fontWeight: 800,
                            fontSize: '13px',
                            color: 'var(--color-text-main, #0F172A)',
                          }}
                        >
                          −
                        </button>
                        <span
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: 800,
                            minWidth: '24px',
                            textAlign: 'center',
                            color: 'var(--color-text-main, #0F172A)',
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          type="button"
                          style={{
                            padding: '4px 10px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            fontWeight: 800,
                            fontSize: '13px',
                            color: 'var(--color-text-main, #0F172A)',
                          }}
                        >
                          +
                        </button>
                      </div>

                      {/* Line Subtotal */}
                      <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--color-text-main, #0F172A)' }}>
                        PKR {lineTotal.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Bottom Checkout Summary */}
        {cartItems.length > 0 && (
          <div
            className="cart-drawer-footer"
            style={{
              padding: '16px 20px',
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
              borderTop: '1px solid var(--color-border, #E2E8F0)',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 -4px 16px rgba(15, 23, 42, 0.05)',
            }}
          >
            {/* Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted, #4c4e51)' }}>
                <span>Gross Catalog Subtotal:</span>
                <span style={{ fontWeight: 700, color: 'var(--color-text-main, #1e1f22)' }}>PKR {subtotal.toLocaleString()}</span>
              </div>

              {bulkDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 700 }}>
                  <span>Bulk Trade Incentive (5%):</span>
                  <span>-PKR {bulkDiscount.toLocaleString()}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted, #4c4e51)' }}>
                <span>Advance Income Tax WHT (0.5% Filer):</span>
                <span>+PKR {taxFilerAdvance.toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted, #4c4e51)' }}>
                <span>Karachi Wholesale Route Delivery:</span>
                <span>
                  {deliveryFee === 0 ? (
                    <strong style={{ color: '#059669' }}>FREE Standard Delivery</strong>
                  ) : (
                    `+PKR ${deliveryFee}`
                  )}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '16px',
                  fontWeight: 900,
                  color: 'var(--color-text-main, #1e1f22)',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--color-border, #E2E8F0)',
                }}
              >
                <span>Estimated Net Payable:</span>
                <span style={{ color: 'var(--color-primary, #1e2023)' }}>
                  PKR {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Checkout button */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleProceedToCheckout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 800,
                fontSize: '14px',
              }}
            >
              <span>Proceed to Self-Service Checkout</span>
              <span>→</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

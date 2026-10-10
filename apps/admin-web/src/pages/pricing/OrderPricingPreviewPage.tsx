import React, { useState, useMemo } from 'react';
import { Card, Badge, Button, Input, Modal } from '@candi/ui';
import { CustomerRecord } from '@candi/types';
import { CUSTOMERS_DATABASE } from '../../data/customers';
import { INITIAL_PRICE_LIST } from '../../data/priceLists';
import { evaluateOrderPricing } from '../../data/pricingEngine';

export const OrderPricingPreviewPage: React.FC = () => {
  // Input selectors
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(CUSTOMERS_DATABASE[0].id);
  const [selectedProductId, setSelectedProductId] = useState<string>(INITIAL_PRICE_LIST[0].productId);
  const [quantity, setQuantity] = useState<number>(10);
  const [asOfDate, setAsOfDate] = useState<string>('2026-09-17');
  const [manualDiscountPct, setManualDiscountPct] = useState<number>(0);
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [isSupervisorApproved, setIsSupervisorApproved] = useState<boolean>(false);
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState<boolean>(false);

  // Evaluate pricing dynamically
  const pricingResult = useMemo(() => {
    return evaluateOrderPricing({
      customerId: selectedCustomerId,
      productId: selectedProductId,
      quantity: Math.max(1, quantity),
      asOfDate,
      manualDiscountPct,
      overrideReason,
      isSupervisorApproved,
    });
  }, [selectedCustomerId, selectedProductId, quantity, asOfDate, manualDiscountPct, overrideReason, isSupervisorApproved]);

  const selectedCustomer = CUSTOMERS_DATABASE.find((c: CustomerRecord) => c.id === selectedCustomerId);
  const selectedProduct = INITIAL_PRICE_LIST.find((p) => p.productId === selectedProductId);

  // Quick preset loader
  const handleLoadPreset = (presetType: 'customer_specific' | 'tier_pricing' | 'trade_offer' | 'standard_fallback' | 'exceptional_discount') => {
    setIsSupervisorApproved(false);
    if (presetType === 'customer_specific') {
      // Mehmood Traders has contract CTR-MTW-2026-Q3 for prod-01 (Choco Dream) at PKR 2800
      setSelectedCustomerId('cust-01');
      setSelectedProductId('prod-01');
      setQuantity(15);
      setManualDiscountPct(0);
      setOverrideReason('');
    } else if (presetType === 'trade_offer') {
      // Bilal General Store (Gold Tier) orders 10 cartons of prod-01 -> triggers Buy 10 Get 1 Bonus
      setSelectedCustomerId('cust-03');
      setSelectedProductId('prod-01');
      setQuantity(10);
      setManualDiscountPct(0);
      setOverrideReason('');
    } else if (presetType === 'tier_pricing') {
      // Ali & Sons (Silver) orders 5 boxes of prod-03
      setSelectedCustomerId('cust-02');
      setSelectedProductId('prod-03');
      setQuantity(5);
      setManualDiscountPct(0);
      setOverrideReason('');
    } else if (presetType === 'standard_fallback') {
      // Walk-in standard customer or expired product
      setSelectedCustomerId('cust-04');
      setSelectedProductId('prod-07'); // Butter crunch is expired, falls back to standard
      setQuantity(3);
      setManualDiscountPct(0);
      setOverrideReason('');
    } else if (presetType === 'exceptional_discount') {
      setSelectedCustomerId('cust-03');
      setSelectedProductId('prod-02');
      setQuantity(8);
      setManualDiscountPct(8.5);
      setOverrideReason('Commercial competitive match request for Liaquatabad retail cluster.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--color-smoky-black)' }}>
            Order Pricing Preview & Waterfall Engine
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-olive-drab)' }}>
            Real-time price resolver verifying customer contracts, tier rate tables, active trade promotions, and exceptional discount gates.
          </p>
        </div>

        {/* Quick Simulation Presets */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-olive-drab)' }}>TEST PRESETS:</span>
          <Button size="sm" variant="outline" onClick={() => handleLoadPreset('customer_specific')}>
            1. Account Contract
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleLoadPreset('tier_pricing')}>
            2. Customer Tier
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleLoadPreset('trade_offer')}>
            3. Trade Offer
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleLoadPreset('standard_fallback')}>
            4. Standard Fallback
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleLoadPreset('exceptional_discount')}>
            5. Discount Gate
          </Button>
        </div>
      </div>

      {/* Exceptional Discount Alert / Supervisor Gate */}
      {pricingResult.requiresSupervisorApproval && (
        <div
          style={{
            padding: '16px',
            backgroundColor: pricingResult.supervisorApprovalStatus === 'approved' ? '#EBF7EE' : '#FFF0F0',
            border: `1px solid ${pricingResult.supervisorApprovalStatus === 'approved' ? '#2D6A4F' : '#D00000'}`,
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: '14px', color: pricingResult.supervisorApprovalStatus === 'approved' ? '#2D6A4F' : '#D00000' }}>
              {pricingResult.supervisorApprovalStatus === 'approved'
                ? '✓ Exceptional Discount Approved by Commercial Supervisor'
                : '⚠ Exceptional Discount Override Requires Supervisor Approval'}
            </div>
            <div style={{ fontSize: '12px', color: '#565449', marginTop: '2px' }}>
              Manual discount of {manualDiscountPct}% exceeds standard covenant threshold (5.0%).
              {overrideReason ? ` Reason: "${overrideReason}"` : ' Reason not provided!'}
            </div>
          </div>
          <div>
            {pricingResult.supervisorApprovalStatus === 'approved' ? (
              <Badge variant="success">APPROVED BY SUPERVISOR</Badge>
            ) : (
              <Button
                variant="primary"
                onClick={() => {
                  if (!overrideReason.trim()) {
                    alert('Please enter a mandatory override justification reason before approving.');
                    return;
                  }
                  setIsSupervisorApproved(true);
                }}
              >
                Sign Off & Approve Discount
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Main Layout: Controls Left, Waterfall & Breakdown Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '20px' }}>
        {/* Left Column: Order Parameters Simulator */}
        <Card title="Order Parameters Simulator">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
            {/* Customer Selector */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Customer Account
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value);
                  setIsSupervisorApproved(false);
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-bone)',
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '13px',
                }}
              >
                {CUSTOMERS_DATABASE.map((cust: CustomerRecord) => (
                  <option key={cust.id} value={cust.id}>
                    {cust.name} ({cust.tierLabel})
                  </option>
                ))}
              </select>
              {selectedCustomer && (
                <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--color-olive-drab)' }}>
                  Tier: <strong>{selectedCustomer.tierLabel}</strong> • Terms: <strong>{selectedCustomer.paymentTerms}</strong>
                </div>
              )}
            </div>

            {/* Product Selector */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Wholesale Product / SKU
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setIsSupervisorApproved(false);
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-bone)',
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '13px',
                }}
              >
                {INITIAL_PRICE_LIST.map((p) => (
                  <option key={p.productId} value={p.productId}>
                    {p.productName} ({p.sku}) - {p.packagingUnit}
                  </option>
                ))}
              </select>
              {selectedProduct && (
                <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--color-olive-drab)' }}>
                  Base Catalog Price: <strong>PKR {selectedProduct.standardPrice.toLocaleString()}</strong> / {selectedProduct.packagingUnit}
                </div>
              )}
            </div>

            {/* Quantity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label={`Order Quantity (${pricingResult.packagingUnit}s)`}
                type="number"
                min="1"
                value={String(quantity)}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              />
              <Input
                label="As-of Pricing Date"
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
              />
            </div>

            {/* Manual Discount Override */}
            <div style={{ borderTop: '1px solid var(--color-bone)', paddingTop: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-smoky-black)', marginBottom: '8px' }}>
                Exceptional Pricing Override (Sales Rep)
              </div>
              <Input
                label="Manual Discount Override (%)"
                type="number"
                min="0"
                max="30"
                step="0.5"
                value={String(manualDiscountPct)}
                onChange={(e) => {
                  setManualDiscountPct(Number(e.target.value));
                  setIsSupervisorApproved(false);
                }}
              />
              <div style={{ marginTop: '10px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Override Justification Reason {manualDiscountPct > 0 && <span style={{ color: '#8C2A2A' }}>*</span>}
                </label>
                <textarea
                  placeholder="Required if requesting exceptional discount > 5%..."
                  rows={2}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-bone)',
                    fontFamily: 'var(--font-family-mono)',
                    fontSize: '12px',
                  }}
                />
              </div>
            </div>

            {/* Action Buttons to View Simulated Order and Invoice */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              <Button
                variant="primary"
                onClick={() => setOrderModalOpen(true)}
                disabled={pricingResult.requiresSupervisorApproval && pricingResult.supervisorApprovalStatus !== 'approved'}
              >
                View Exact Price on Order
              </Button>
              <Button
                variant="outline"
                onClick={() => setInvoiceModalOpen(true)}
                disabled={pricingResult.requiresSupervisorApproval && pricingResult.supervisorApprovalStatus !== 'approved'}
              >
                Preview Customer Invoice
              </Button>
            </div>
          </div>
        </Card>

        {/* Right Column: Pricing Waterfall & Final Calculation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Step-by-Step 4-Level Pricing Priority Waterfall */}
          <Card title="Pricing Priority Waterfall Hierarchy">
            <div style={{ fontSize: '12px', color: 'var(--color-olive-drab)', marginBottom: '14px' }}>
              Enforced Priority: <strong>Customer-Specific Price</strong> ➔ <strong>Customer-Tier Price</strong> ➔ <strong>Promotional Price / Trade Offer</strong> ➔ <strong>Standard Price</strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pricingResult.steps.map((step) => {
                const isMatched = step.isMatched;
                const isBypassed = !step.isEvaluated;

                let borderCol = 'var(--color-bone)';
                let bgCol = '#FFFDF9';
                let icon = '⚪';

                if (isMatched) {
                  borderCol = '#2D6A4F';
                  bgCol = '#F2FBF5';
                  icon = '🟢 MATCHED & APPLIED';
                } else if (isBypassed) {
                  borderCol = '#E5E3D8';
                  bgCol = '#FBFBFA';
                  icon = '⚪ BYPASSED';
                } else {
                  borderCol = '#E6C875';
                  bgCol = '#FFFDF5';
                  icon = '🟡 EVALUATED (NOT APPLIED)';
                }

                return (
                  <div
                    key={step.step}
                    style={{
                      border: `2px solid ${borderCol}`,
                      backgroundColor: bgCol,
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px 16px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '13px', color: 'var(--color-smoky-black)' }}>
                          Step {step.step}: {step.levelName}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: isMatched ? '#2D6A4F' : '#777',
                        }}
                      >
                        {icon}
                      </span>
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '12px', color: '#444', lineHeight: 1.4 }}>
                      {step.details}
                    </div>
                    {step.resolvedPrice && (
                      <div style={{ marginTop: '4px', fontSize: '12px', fontWeight: 800, color: '#1B4332' }}>
                        Resolved Unit Rate: PKR {step.resolvedPrice.toLocaleString()} / {pricingResult.packagingUnit}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Pricing Summary Card */}
          <Card title="Calculated Commercial Pricing Summary">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '16px' }}>
              <div style={{ border: '1px solid var(--color-bone)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>BASE CATALOG PRICE</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-smoky-black)', marginTop: '4px' }}>
                  PKR {pricingResult.baseCatalogPrice.toLocaleString()}
                </div>
                <div style={{ fontSize: '10px', color: '#888' }}>Standard wholesale unit</div>
              </div>

              <div style={{ border: '1px solid var(--color-bone)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>APPLIED PRICE LIST</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#2D6A4F', marginTop: '4px' }}>
                  {pricingResult.appliedPriceSourceName}
                </div>
                <div style={{ fontSize: '10px', color: '#888' }}>Rate: PKR {pricingResult.resolvedUnitPrice.toLocaleString()}</div>
              </div>

              <div style={{ border: '1px solid var(--color-bone)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>TRADE PROMOTIONS</div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: pricingResult.tradeOfferApplied ? '#006D77' : '#888', marginTop: '4px' }}>
                  {pricingResult.tradeOfferApplied ? pricingResult.tradeOfferDescription : 'None Applicable'}
                </div>
                <div style={{ fontSize: '10px', color: '#888' }}>
                  {pricingResult.tradeOfferBonusQty ? `+${pricingResult.tradeOfferBonusQty} Free Stock Bonus` : 'No bonus items'}
                </div>
              </div>

              <div style={{ border: '2px solid var(--color-smoky-black)', backgroundColor: 'var(--color-bone)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-smoky-black)' }}>FINAL UNIT PRICE</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-smoky-black)', marginTop: '2px' }}>
                  PKR {pricingResult.finalUnitPrice.toLocaleString()}
                </div>
                <div style={{ fontSize: '10px', color: '#565449' }}>Per {pricingResult.packagingUnit}</div>
              </div>
            </div>

            {/* Line items totals breakdown */}
            <div
              style={{
                backgroundColor: 'var(--color-floral-white)',
                border: '1px solid var(--color-bone)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                fontSize: '13px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Gross Catalog Value ({quantity} {pricingResult.packagingUnit}s × PKR {pricingResult.baseCatalogPrice.toLocaleString()}):</span>
                <span>PKR {pricingResult.lineSubtotal.toLocaleString()}</span>
              </div>

              {pricingResult.totalDiscountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2D6A4F', marginBottom: '6px' }}>
                  <span>Tier & Commercial Discounts Deducted:</span>
                  <span>- PKR {pricingResult.totalDiscountAmount.toLocaleString()}</span>
                </div>
              )}

              {pricingResult.tradeOfferBonusQty ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#006D77', marginBottom: '6px' }}>
                  <span>Trade Offer Bonus Stock (FOC):</span>
                  <span>+{pricingResult.tradeOfferBonusQty} {pricingResult.packagingUnit}s Free</span>
                </div>
              ) : null}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '2px solid var(--color-smoky-black)',
                  paddingTop: '8px',
                  fontWeight: 900,
                  fontSize: '16px',
                  color: 'var(--color-smoky-black)',
                }}
              >
                <span>Net Payable Total:</span>
                <span>PKR {pricingResult.netLineTotal.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Simulated Order Modal */}
      {orderModalOpen && (
        <Modal
          isOpen={orderModalOpen}
          onClose={() => setOrderModalOpen(false)}
          title={`Simulated Order Slip (Exact Applied Price Display)`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--color-bone)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontWeight: 800, fontSize: '14px' }}>CANDI WHOLESALE DISTRIBUTION ORDER</div>
              <div style={{ marginTop: '4px' }}>Customer: <strong>{pricingResult.customerName}</strong> ({pricingResult.customerTierName})</div>
              <div>Payment Terms: <strong>{selectedCustomer?.paymentTerms || 'Cash on Delivery'}</strong></div>
            </div>

            <div style={{ fontWeight: 700 }}>Line Items & Exact Applied Price:</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-smoky-black)', color: 'var(--color-floral-white)' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Product / SKU</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Base Price</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Applied Rule</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Exact Price</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--color-bone)' }}>
                  <td style={{ padding: '8px' }}>
                    <strong>{pricingResult.productName}</strong> ({pricingResult.sku})
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{pricingResult.quantity}</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>PKR {pricingResult.baseCatalogPrice.toLocaleString()}</td>
                  <td style={{ padding: '8px' }}>{pricingResult.appliedPriceSourceName}</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: 800, color: '#1B4332' }}>
                    PKR {pricingResult.finalUnitPrice.toLocaleString()}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: 800 }}>
                    PKR {pricingResult.netLineTotal.toLocaleString()}
                  </td>
                </tr>
                {pricingResult.tradeOfferBonusQty ? (
                  <tr style={{ backgroundColor: '#EDF6F9', color: '#006D77' }}>
                    <td style={{ padding: '8px' }}>
                      🎁 BONUS: {pricingResult.productName} (Scheme: {pricingResult.tradeOfferApplied?.offerCode})
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>+{pricingResult.tradeOfferBonusQty}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>PKR 0</td>
                    <td style={{ padding: '8px' }}>Trade Promotion Free Stock</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 800 }}>PKR 0 (Free)</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 800 }}>PKR 0</td>
                  </tr>
                ) : null}
              </tbody>
            </table>

            <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: 800, marginTop: '8px' }}>
              Final Order Value: PKR {pricingResult.netLineTotal.toLocaleString()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <Button variant="outline" onClick={() => setOrderModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Simulated Customer Invoice Modal */}
      {invoiceModalOpen && (
        <Modal
          isOpen={invoiceModalOpen}
          onClose={() => setInvoiceModalOpen(false)}
          title={`Simulated Tax Invoice (With Pricing Governance Stamp)`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-bone)', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ margin: 0 }}>CANDI SUPER STORE WHOLESALE</h3>
                <div style={{ fontSize: '11px', color: '#666' }}>NTN: 8294719-4 • STRN: 3277876123456</div>
                <div style={{ fontSize: '11px', color: '#666' }}>Plot 48/B, Confectionery Hub, Karachi</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: '13px' }}>INVOICE: INV-SIM-2026-099</div>
                <div>Date: {asOfDate}</div>
                <Badge variant="success">PRICE GOVERNED</Badge>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ color: 'var(--color-olive-drab)' }}>Billed To:</span>
                <div style={{ fontWeight: 800 }}>{pricingResult.customerName}</div>
                <div>Tier Classification: {pricingResult.customerTierName}</div>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)' }}>Pricing Audit Trail:</span>
                <div>Resolved Rule: {pricingResult.appliedPriceSourceName}</div>
                {pricingResult.requiresSupervisorApproval && (
                  <div>Authorized By: {pricingResult.supervisorApprovedBy || 'Pending'}</div>
                )}
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bone)' }}>
                  <th style={{ padding: '6px', textAlign: 'left' }}>Item Description</th>
                  <th style={{ padding: '6px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Catalog Rate</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Net Unit Price</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Extended Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '6px' }}>{pricingResult.productName} ({pricingResult.packagingUnit})</td>
                  <td style={{ padding: '6px', textAlign: 'center' }}>{pricingResult.quantity}</td>
                  <td style={{ padding: '6px', textAlign: 'right' }}>PKR {pricingResult.baseCatalogPrice.toLocaleString()}</td>
                  <td style={{ padding: '6px', textAlign: 'right', fontWeight: 700 }}>PKR {pricingResult.finalUnitPrice.toLocaleString()}</td>
                  <td style={{ padding: '6px', textAlign: 'right', fontWeight: 800 }}>PKR {pricingResult.netLineTotal.toLocaleString()}</td>
                </tr>
                {pricingResult.tradeOfferBonusQty ? (
                  <tr style={{ color: '#006D77' }}>
                    <td style={{ padding: '6px' }}>🎁 Scheme Bonus: {pricingResult.productName}</td>
                    <td style={{ padding: '6px', textAlign: 'center' }}>{pricingResult.tradeOfferBonusQty}</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>-</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>F.O.C.</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>PKR 0</td>
                  </tr>
                ) : null}
              </tbody>
            </table>

            <div style={{ borderTop: '2px solid var(--color-smoky-black)', paddingTop: '8px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
              <div>Gross Total: PKR {pricingResult.lineSubtotal.toLocaleString()}</div>
              <div>Commercial Discount: - PKR {pricingResult.totalDiscountAmount.toLocaleString()}</div>
              <div style={{ fontWeight: 900, fontSize: '15px' }}>NET INVOICE PAYABLE: PKR {pricingResult.netLineTotal.toLocaleString()}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Button variant="outline" onClick={() => setInvoiceModalOpen(false)}>
                Close Invoice Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

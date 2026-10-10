import React, { useState } from 'react';
import { Card, Table, Badge, Button, Modal, Input, Alert } from '@candi/ui';
import { TradeOffer, CustomerTier } from '@candi/types';
import { INITIAL_TRADE_OFFERS } from '../../data/tradeOffers';
import { INITIAL_PRICE_LIST } from '../../data/priceLists';

export const TradeOffersPage: React.FC = () => {
  const [offers, setOffers] = useState<TradeOffer[]>(INITIAL_TRADE_OFFERS);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'approved' | 'pending_approval' | 'expired'>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOfferForDetail, setSelectedOfferForDetail] = useState<TradeOffer | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Create Form State
  const [formData, setFormData] = useState({
    offerCode: `TO-2026-0${INITIAL_TRADE_OFFERS.length + 1}`,
    name: '',
    description: '',
    eligibleTiers: ['tier_1_platinum', 'tier_2_gold'] as CustomerTier[],
    eligibleProductId: 'prod-01',
    requiredQuantity: 10,
    benefitType: 'bonus_quantity' as TradeOffer['benefitType'],
    discountPercentage: 5,
    bonusQuantity: 1,
    bonusProductId: 'prod-01',
    startDate: '2026-09-17',
    endDate: '2026-10-31',
  });

  const filteredOffers = offers.filter((o) => {
    const isExp = !o.isActive || o.approvalStatus === 'expired' || o.endDate < '2026-09-17';
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'expired') return isExp;
    return o.approvalStatus === statusFilter && !isExp;
  });

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const product = INITIAL_PRICE_LIST.find((p) => p.productId === formData.eligibleProductId);

    const newOffer: TradeOffer = {
      id: `to-${Date.now()}`,
      offerCode: formData.offerCode,
      name: formData.name,
      description: formData.description,
      eligibleTiers: formData.eligibleTiers,
      eligibleCustomerIds: [],
      eligibleProductIds: [formData.eligibleProductId],
      requiredQuantity: Number(formData.requiredQuantity),
      benefitType: formData.benefitType,
      discountPercentage: formData.benefitType === 'discount_percentage' ? Number(formData.discountPercentage) : undefined,
      bonusQuantity: formData.benefitType === 'bonus_quantity' ? Number(formData.bonusQuantity) : undefined,
      bonusProductId: formData.eligibleProductId,
      bonusProductName: product?.productName || 'Wholesale Unit',
      startDate: formData.startDate,
      endDate: formData.endDate,
      approvalStatus: 'pending_approval',
      isActive: true,
      usageCount: 0,
    };

    setOffers([newOffer, ...offers]);
    setIsCreateModalOpen(false);
    setSuccessMsg(`Trade offer "${formData.name}" created and queued for Commercial Director approval.`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleApproveOffer = (offerId: string) => {
    setOffers((prev) =>
      prev.map((o) =>
        o.id === offerId
          ? {
              ...o,
              approvalStatus: 'approved',
              approvedBy: 'Kashif Razzaq (Commercial Director)',
              approvedAt: '2026-09-17',
            }
          : o
      )
    );
    setSuccessMsg('Trade offer approved and activated in the live pricing engine.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleToggleTier = (tierKey: CustomerTier) => {
    if (formData.eligibleTiers.includes(tierKey)) {
      setFormData({
        ...formData,
        eligibleTiers: formData.eligibleTiers.filter((t) => t !== tierKey),
      });
    } else {
      setFormData({
        ...formData,
        eligibleTiers: [...formData.eligibleTiers, tierKey],
      });
    }
  };

  const columns = [
    {
      header: 'Offer Scheme & Code',
      render: (row: TradeOffer) => (
        <div>
          <div style={{ fontWeight: 800, color: 'var(--color-smoky-black)', fontSize: '13px' }}>
            {row.name}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            Code: <span style={{ fontWeight: 700 }}>{row.offerCode}</span> • Redeemed {row.usageCount} times
          </div>
          <div style={{ fontSize: '12px', color: '#565449', marginTop: '4px', maxWidth: '340px' }}>
            {row.description}
          </div>
        </div>
      ),
      width: '320px',
    },
    {
      header: 'Eligible Tiers & Products',
      render: (row: TradeOffer) => {
        const prod = INITIAL_PRICE_LIST.find((p) => row.eligibleProductIds.includes(p.productId));
        return (
          <div style={{ fontSize: '12px' }}>
            <div>
              <span style={{ color: 'var(--color-olive-drab)' }}>Eligible SKU: </span>
              <strong>{prod ? prod.productName : row.eligibleProductIds.join(', ')}</strong>
            </div>
            <div style={{ marginTop: '4px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {row.eligibleTiers.map((t, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: 'var(--color-bone)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 700,
                  }}
                >
                  {t.replace(/tier_\d+_/, '').toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        );
      },
      width: '260px',
    },
    {
      header: 'Required MOQ & Benefit',
      render: (row: TradeOffer) => (
        <div style={{ fontSize: '12px' }}>
          <div>
            <span style={{ color: 'var(--color-olive-drab)' }}>MOQ: </span>
            <strong>Min {row.requiredQuantity} Units</strong>
          </div>
          <div style={{ marginTop: '4px' }}>
            {row.benefitType === 'bonus_quantity' ? (
              <span style={{ color: '#1B4332', fontWeight: 800 }}>
                +{row.bonusQuantity} Bonus {row.bonusProductName || 'Unit'}
              </span>
            ) : row.benefitType === 'discount_percentage' ? (
              <span style={{ color: '#005F73', fontWeight: 800 }}>
                {row.discountPercentage}% Price Rebate
              </span>
            ) : (
              <span>PKR {row.flatRebatePKR} Rebate</span>
            )}
          </div>
        </div>
      ),
      width: '200px',
    },
    {
      header: 'Validity Window',
      render: (row: TradeOffer) => {
        const isExp = row.endDate < '2026-09-17' || row.approvalStatus === 'expired';
        return (
          <div style={{ fontSize: '11px' }}>
            <div>{row.startDate}</div>
            <div style={{ color: isExp ? '#D00000' : 'inherit', fontWeight: isExp ? 800 : 400 }}>
              to {row.endDate}
            </div>
            {isExp && <span style={{ color: '#D00000', fontSize: '10px' }}>[Expired]</span>}
          </div>
        );
      },
      width: '140px',
    },
    {
      header: 'Status',
      render: (row: TradeOffer) => {
        const isExp = row.endDate < '2026-09-17' || row.approvalStatus === 'expired';
        if (isExp) return <Badge variant="danger">EXPIRED</Badge>;

        return (
          <div>
            <Badge
              variant={
                row.approvalStatus === 'approved'
                  ? 'success'
                  : row.approvalStatus === 'pending_approval'
                  ? 'warning'
                  : 'neutral'
              }
            >
              {row.approvalStatus.replace(/_/g, ' ').toUpperCase()}
            </Badge>
            {row.approvedBy && (
              <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                Approved by {row.approvedBy.split(' ')[0]}
              </div>
            )}
          </div>
        );
      },
      width: '140px',
    },
    {
      header: 'Actions',
      render: (row: TradeOffer) => {
        const isPending = row.approvalStatus === 'pending_approval';
        return (
          <div style={{ display: 'flex', gap: '6px' }}>
            {isPending && (
              <Button size="sm" variant="primary" onClick={() => handleApproveOffer(row.id)}>
                Approve
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => setSelectedOfferForDetail(row)}>
              Details
            </Button>
          </div>
        );
      },
      width: '160px',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--color-smoky-black)' }}>
            Trade Offers & Promotional Schemes
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-olive-drab)' }}>
            Configure volume discounts, bonus carton rules, and promotional eligibility windows for wholesale channels.
          </p>
        </div>
        <div>
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            + Create Trade Offer
          </Button>
        </div>
      </div>

      {successMsg && (
        <Alert type="success" title="Promotion Updated">
          {successMsg}
        </Alert>
      )}

      {/* Governance Rule Card */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#EDF6F9',
          border: '1px solid #83C5BE',
          borderRadius: 'var(--radius-sm)',
          fontSize: '12px',
          color: '#006D77',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '18px' }}>🎁</span>
        <div>
          <strong>Trade Offer Rule Governance:</strong> Trade offers are strictly enforced and automatically validated by the order pricing engine. Offers will NOT apply if the customer’s tier is excluded, the required MOQ is not satisfied, or the transaction falls outside the start/end dates.
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {(['ALL', 'approved', 'pending_approval', 'expired'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: statusFilter === status ? 'var(--color-smoky-black)' : 'var(--color-bone)',
              color: statusFilter === status ? 'var(--color-floral-white)' : 'var(--color-smoky-black)',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {status.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          data={filteredOffers}
          keyExtractor={(o) => o.id}
          emptyMessage="No promotional trade offers found matching your criteria."
        />
      </Card>

      {/* Create Trade Offer Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Wholesale Trade Offer"
        >
          <form onSubmit={handleCreateOffer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Offer Scheme Name"
                placeholder="e.g. Monsoon Bulk Push"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Offer Code"
                value={formData.offerCode}
                onChange={(e) => setFormData({ ...formData, offerCode: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Description & Terms
              </label>
              <textarea
                placeholder="Describe terms for sales reps and retailer invoice printouts..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                required
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-bone)',
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '13px',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Eligible Target SKU
              </label>
              <select
                value={formData.eligibleProductId}
                onChange={(e) => setFormData({ ...formData, eligibleProductId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-bone)',
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '13px',
                }}
              >
                {INITIAL_PRICE_LIST.map((prod) => (
                  <option key={prod.productId} value={prod.productId}>
                    {prod.productName} ({prod.sku}) - {prod.packagingUnit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Eligible Customer Tiers (Select applicable)
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {(
                  [
                    { key: 'tier_1_platinum', label: 'Platinum' },
                    { key: 'tier_2_gold', label: 'Gold' },
                    { key: 'tier_3_silver', label: 'Silver' },
                    { key: 'standard_retail', label: 'Standard Retail' },
                  ] as const
                ).map(({ key, label }) => {
                  const isChecked = formData.eligibleTiers.includes(key);
                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => handleToggleTier(key)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: isChecked ? '2px solid var(--color-smoky-black)' : '1px solid var(--color-bone)',
                        backgroundColor: isChecked ? 'var(--color-smoky-black)' : 'var(--color-bone)',
                        color: isChecked ? 'var(--color-floral-white)' : 'var(--color-smoky-black)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {isChecked ? '✓ ' : '+ '} {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Required Order Quantity (MOQ)"
                type="number"
                min="1"
                value={String(formData.requiredQuantity)}
                onChange={(e) => setFormData({ ...formData, requiredQuantity: Number(e.target.value) })}
                required
              />
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Benefit Incentive Type
                </label>
                <select
                  value={formData.benefitType}
                  onChange={(e) => setFormData({ ...formData, benefitType: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-bone)',
                    fontFamily: 'var(--font-family-mono)',
                    fontSize: '13px',
                  }}
                >
                  <option value="bonus_quantity">Bonus Quantity (Free Units / Buy X Get Y)</option>
                  <option value="discount_percentage">Percentage Discount Rebate (%)</option>
                </select>
              </div>
            </div>

            {formData.benefitType === 'bonus_quantity' ? (
              <Input
                label="Bonus Quantity (Free Units per MOQ)"
                type="number"
                min="1"
                value={String(formData.bonusQuantity)}
                onChange={(e) => setFormData({ ...formData, bonusQuantity: Number(e.target.value) })}
                required
              />
            ) : (
              <Input
                label="Discount Rebate Percentage (%)"
                type="number"
                step="0.5"
                min="0.5"
                max="50"
                value={String(formData.discountPercentage)}
                onChange={(e) => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
                required
              />
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
              <Input
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Submit Scheme for Approval
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Offer Detail Modal */}
      {selectedOfferForDetail && (
        <Modal
          isOpen={Boolean(selectedOfferForDetail)}
          onClose={() => setSelectedOfferForDetail(null)}
          title={`Trade Offer Details: ${selectedOfferForDetail.name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--color-bone)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontWeight: 800, fontSize: '15px' }}>{selectedOfferForDetail.name}</div>
              <div style={{ fontSize: '12px', color: '#565449', marginTop: '4px' }}>
                Code: {selectedOfferForDetail.offerCode} • Status: {selectedOfferForDetail.approvalStatus.toUpperCase()}
              </div>
            </div>

            <div>
              <strong>Description:</strong>
              <p style={{ margin: '4px 0', color: '#444' }}>{selectedOfferForDetail.description}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ border: '1px solid var(--color-bone)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>BENEFIT TYPE</span>
                <div style={{ fontWeight: 700, marginTop: '2px' }}>
                  {selectedOfferForDetail.benefitType === 'bonus_quantity'
                    ? `Bonus Stock: +${selectedOfferForDetail.bonusQuantity} ${selectedOfferForDetail.bonusProductName || 'Unit'}`
                    : `${selectedOfferForDetail.discountPercentage}% Discount Rebate`}
                </div>
              </div>
              <div style={{ border: '1px solid var(--color-bone)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>MINIMUM REQUIRED MOQ</span>
                <div style={{ fontWeight: 700, marginTop: '2px' }}>
                  {selectedOfferForDetail.requiredQuantity} Units
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ border: '1px solid var(--color-bone)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>START DATE</span>
                <div style={{ fontWeight: 700, marginTop: '2px' }}>{selectedOfferForDetail.startDate}</div>
              </div>
              <div style={{ border: '1px solid var(--color-bone)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>END DATE</span>
                <div style={{ fontWeight: 700, marginTop: '2px' }}>{selectedOfferForDetail.endDate}</div>
              </div>
            </div>

            <div>
              <strong>Eligible Customer Tiers:</strong>
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                {selectedOfferForDetail.eligibleTiers.map((t, idx) => (
                  <Badge key={idx} variant="neutral">
                    {t.replace(/tier_\d+_/, '').toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>

            {selectedOfferForDetail.approvedBy && (
              <div style={{ fontSize: '11px', color: '#666' }}>
                Approved by <strong>{selectedOfferForDetail.approvedBy}</strong> on {selectedOfferForDetail.approvedAt}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Button variant="outline" onClick={() => setSelectedOfferForDetail(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

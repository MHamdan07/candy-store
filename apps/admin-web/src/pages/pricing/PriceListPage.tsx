import React, { useState } from 'react';
import { Card, Table, Badge, Button, Modal, Input, Alert } from '@candi/ui';
import { PriceListItem, PriceChangeAuditEntry } from '@candi/types';
import { INITIAL_PRICE_LIST } from '../../data/priceLists';

export const PriceListPage: React.FC = () => {
  const [priceList, setPriceList] = useState<PriceListItem[]>(INITIAL_PRICE_LIST);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'approved' | 'pending_approval' | 'expired'>('ALL');
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<PriceListItem | null>(null);
  const [selectedItemForAudit, setSelectedItemForAudit] = useState<PriceListItem | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [authError, setAuthError] = useState('');

  // Authorized user check simulation
  const currentUser = {
    name: 'Kashif Razzaq',
    role: 'Commercial Director',
    isAuthorizedForPriceChanges: true,
  };

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    standardPrice: 0,
    tier1Platinum: 0,
    tier2Gold: 0,
    tier3Silver: 0,
    minQuantity: 1,
    effectiveDate: '',
    expiryDate: '',
    approvalStatus: 'approved' as PriceListItem['approvalStatus'],
    changeReason: '',
  });

  const filteredItems = priceList.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'expired'
        ? item.isExpired || item.approvalStatus === 'expired'
        : item.approvalStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenEdit = (item: PriceListItem) => {
    if (!currentUser.isAuthorizedForPriceChanges) {
      setAuthError('Access Denied: Only authorized commercial roles can modify wholesale price lists.');
      return;
    }
    setAuthError('');
    setSelectedItemForEdit(item);
    setEditFormData({
      standardPrice: item.standardPrice,
      tier1Platinum: item.tierPrices.tier_1_platinum,
      tier2Gold: item.tierPrices.tier_2_gold,
      tier3Silver: item.tierPrices.tier_3_silver,
      minQuantity: item.minQuantity,
      effectiveDate: item.effectiveDate,
      expiryDate: item.expiryDate,
      approvalStatus: item.approvalStatus,
      changeReason: '',
    });
  };

  const handleSavePriceChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForEdit) return;

    if (!editFormData.changeReason.trim()) {
      setAuthError('Governance Rule Violation: Pricing overrides and changes must include a recorded reason.');
      return;
    }

    const todayStr = '2026-09-17';
    const isNowExpired = editFormData.expiryDate < todayStr;

    // Detect changes for audit log
    const changes: PriceChangeAuditEntry[] = [];
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    if (editFormData.standardPrice !== selectedItemForEdit.standardPrice) {
      changes.push({
        id: `pch-${Date.now()}-1`,
        changedAt: timestamp,
        changedBy: currentUser.name,
        actorRole: currentUser.role,
        field: 'standardPrice',
        oldValue: selectedItemForEdit.standardPrice,
        newValue: editFormData.standardPrice,
        reason: editFormData.changeReason,
        approvalRef: `APP-DIR-${Date.now().toString().slice(-4)}`,
      });
    }

    if (editFormData.tier1Platinum !== selectedItemForEdit.tierPrices.tier_1_platinum) {
      changes.push({
        id: `pch-${Date.now()}-2`,
        changedAt: timestamp,
        changedBy: currentUser.name,
        actorRole: currentUser.role,
        field: 'tierPrices.tier_1_platinum',
        oldValue: selectedItemForEdit.tierPrices.tier_1_platinum,
        newValue: editFormData.tier1Platinum,
        reason: editFormData.changeReason,
        approvalRef: `APP-DIR-${Date.now().toString().slice(-4)}`,
      });
    }

    if (editFormData.tier2Gold !== selectedItemForEdit.tierPrices.tier_2_gold) {
      changes.push({
        id: `pch-${Date.now()}-3`,
        changedAt: timestamp,
        changedBy: currentUser.name,
        actorRole: currentUser.role,
        field: 'tierPrices.tier_2_gold',
        oldValue: selectedItemForEdit.tierPrices.tier_2_gold,
        newValue: editFormData.tier2Gold,
        reason: editFormData.changeReason,
        approvalRef: `APP-DIR-${Date.now().toString().slice(-4)}`,
      });
    }

    if (editFormData.tier3Silver !== selectedItemForEdit.tierPrices.tier_3_silver) {
      changes.push({
        id: `pch-${Date.now()}-4`,
        changedAt: timestamp,
        changedBy: currentUser.name,
        actorRole: currentUser.role,
        field: 'tierPrices.tier_3_silver',
        oldValue: selectedItemForEdit.tierPrices.tier_3_silver,
        newValue: editFormData.tier3Silver,
        reason: editFormData.changeReason,
        approvalRef: `APP-DIR-${Date.now().toString().slice(-4)}`,
      });
    }

    // If dates changed
    if (editFormData.expiryDate !== selectedItemForEdit.expiryDate) {
      changes.push({
        id: `pch-${Date.now()}-5`,
        changedAt: timestamp,
        changedBy: currentUser.name,
        actorRole: currentUser.role,
        field: 'expiryDate',
        oldValue: selectedItemForEdit.expiryDate,
        newValue: editFormData.expiryDate,
        reason: editFormData.changeReason,
      });
    }

    const updated = priceList.map((p) =>
      p.id === selectedItemForEdit.id
        ? {
            ...p,
            standardPrice: Number(editFormData.standardPrice),
            tierPrices: {
              ...p.tierPrices,
              tier_1_platinum: Number(editFormData.tier1Platinum),
              tier_2_gold: Number(editFormData.tier2Gold),
              tier_3_silver: Number(editFormData.tier3Silver),
              standard_retail: Number(editFormData.standardPrice),
            },
            minQuantity: Number(editFormData.minQuantity),
            effectiveDate: editFormData.effectiveDate,
            expiryDate: editFormData.expiryDate,
            isExpired: isNowExpired,
            approvalStatus: (isNowExpired ? 'expired' : editFormData.approvalStatus) as PriceListItem['approvalStatus'],
            approvedBy: currentUser.name,
            approvedAt: todayStr,
            priceChangeHistory: [...changes, ...p.priceChangeHistory],
          }
        : p
    );

    setPriceList(updated);
    setSelectedItemForEdit(null);
    setActionSuccessMsg(
      `Price revision for "${selectedItemForEdit.productName}" approved and logged to audit trail.`
    );
    setTimeout(() => setActionSuccessMsg(''), 5000);
  };

  const columns = [
    {
      header: 'Product / SKU',
      render: (row: PriceListItem) => (
        <div>
          <div style={{ fontWeight: 800, color: 'var(--color-smoky-black)', fontSize: '13px' }}>
            {row.productName}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>
            SKU: <span style={{ fontWeight: 700 }}>{row.sku}</span> • {row.category} ({row.packagingUnit})
          </div>
        </div>
      ),
      width: '240px',
    },
    {
      header: 'Standard Price',
      render: (row: PriceListItem) => (
        <div>
          <div style={{ fontWeight: 800, color: 'var(--color-smoky-black)', fontSize: '14px' }}>
            PKR {row.standardPrice.toLocaleString()}
          </div>
          <div style={{ fontSize: '10px', color: '#777' }}>Base catalog unit rate</div>
        </div>
      ),
      width: '140px',
    },
    {
      header: 'Customer-Tier Prices',
      render: (row: PriceListItem) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <span style={{ color: '#666' }}>Platinum:</span>
            <strong style={{ color: '#1B4332' }}>PKR {row.tierPrices.tier_1_platinum.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <span style={{ color: '#666' }}>Gold:</span>
            <strong style={{ color: '#7A5B04' }}>PKR {row.tierPrices.tier_2_gold.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <span style={{ color: '#666' }}>Silver:</span>
            <strong style={{ color: '#495057' }}>PKR {row.tierPrices.tier_3_silver.toLocaleString()}</strong>
          </div>
        </div>
      ),
      width: '180px',
    },
    {
      header: 'MOQ',
      render: (row: PriceListItem) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: '12px' }}>
            {row.minQuantity} {row.packagingUnit}s
          </div>
          <div style={{ fontSize: '10px', color: '#888' }}>Tier eligibility MOQ</div>
        </div>
      ),
      width: '110px',
    },
    {
      header: 'Effective / Expiry Dates',
      render: (row: PriceListItem) => {
        const isExp = row.isExpired || row.expiryDate < '2026-09-17';
        return (
          <div style={{ fontSize: '11px' }}>
            <div>
              <span style={{ color: '#777' }}>Eff: </span>
              <strong>{row.effectiveDate}</strong>
            </div>
            <div>
              <span style={{ color: '#777' }}>Exp: </span>
              <strong style={{ color: isExp ? '#D00000' : 'inherit' }}>
                {row.expiryDate} {isExp ? '(Expired)' : ''}
              </strong>
            </div>
            {isExp && (
              <div style={{ fontSize: '10px', color: '#D00000', fontWeight: 700 }}>
                ⚠ Cannot be applied
              </div>
            )}
          </div>
        );
      },
      width: '180px',
    },
    {
      header: 'Approval Status',
      render: (row: PriceListItem) => {
        const isExp = row.isExpired || row.expiryDate < '2026-09-17';
        if (isExp) {
          return <Badge variant="danger">EXPIRED</Badge>;
        }
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
                by {row.approvedBy.split(' ')[0]}
              </div>
            )}
          </div>
        );
      },
      width: '150px',
    },
    {
      header: 'Actions',
      render: (row: PriceListItem) => (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <Button size="sm" variant="outline" onClick={() => handleOpenEdit(row)}>
            Revise Price
          </Button>
          <Button
            size="sm"
            variant="ghost"
            style={{ fontSize: '11px' }}
            onClick={() => setSelectedItemForAudit(row)}
          >
            Audit Log ({row.priceChangeHistory.length})
          </Button>
        </div>
      ),
      width: '200px',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--color-smoky-black)' }}>
            Wholesale Price List Management
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-olive-drab)' }}>
            Govern SKU standard pricing, customer-tier price covenants, validity date windows, and immutable audit logs.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              padding: '6px 12px',
              backgroundColor: 'var(--color-bone)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              color: 'var(--color-smoky-black)',
            }}
          >
            Authorized Role: <strong>{currentUser.name}</strong> ({currentUser.role})
          </div>
        </div>
      </div>

      {actionSuccessMsg && (
        <Alert type="success" title="Success">
          {actionSuccessMsg}
        </Alert>
      )}

      {authError && (
        <Alert type="danger" title="Governance Control Alert">
          {authError}
        </Alert>
      )}

      {/* Governance Banner */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#FFF8EA',
          border: '1px solid #E6C875',
          borderRadius: 'var(--radius-sm)',
          fontSize: '12px',
          color: '#565449',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '18px' }}>🛡️</span>
        <div>
          <strong>Mandatory Pricing Controls Enforced:</strong> Prices must have valid effective dates. Expired prices are strictly rejected by the pricing engine and fallback to valid covenants. All pricing modifications require an authorized commercial sign-off and mandatory justification log.
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ width: '320px' }}>
          <Input
            placeholder="Search SKU, Product Name, Category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

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
      </div>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          data={filteredItems}
          keyExtractor={(p) => p.id}
          emptyMessage="No price list items found matching your filters."
        />
      </Card>

      {/* Revise Price Modal */}
      {selectedItemForEdit && (
        <Modal
          isOpen={Boolean(selectedItemForEdit)}
          onClose={() => setSelectedItemForEdit(null)}
          title={`Revise Pricing: ${selectedItemForEdit.productName} (${selectedItemForEdit.sku})`}
        >
          <form onSubmit={handleSavePriceChange} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: 'var(--color-bone)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
              }}
            >
              Packaging Unit: <strong>{selectedItemForEdit.packagingUnit}</strong> • Category: <strong>{selectedItemForEdit.category}</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Standard Catalog Base Price (PKR)"
                type="number"
                value={String(editFormData.standardPrice)}
                onChange={(e) => setEditFormData({ ...editFormData, standardPrice: Number(e.target.value) })}
                required
              />
              <Input
                label="Tier Minimum Order Quantity (MOQ)"
                type="number"
                value={String(editFormData.minQuantity)}
                onChange={(e) => setEditFormData({ ...editFormData, minQuantity: Number(e.target.value) })}
                required
              />
            </div>

            <div style={{ borderTop: '1px solid var(--color-bone)', paddingTop: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, marginBottom: '8px', color: 'var(--color-smoky-black)' }}>
                Customer-Tier Prices (PKR)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <Input
                  label="Tier 1 Platinum"
                  type="number"
                  value={String(editFormData.tier1Platinum)}
                  onChange={(e) => setEditFormData({ ...editFormData, tier1Platinum: Number(e.target.value) })}
                  required
                />
                <Input
                  label="Tier 2 Gold"
                  type="number"
                  value={String(editFormData.tier2Gold)}
                  onChange={(e) => setEditFormData({ ...editFormData, tier2Gold: Number(e.target.value) })}
                  required
                />
                <Input
                  label="Tier 3 Silver"
                  type="number"
                  value={String(editFormData.tier3Silver)}
                  onChange={(e) => setEditFormData({ ...editFormData, tier3Silver: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Effective Date"
                type="date"
                value={editFormData.effectiveDate}
                onChange={(e) => setEditFormData({ ...editFormData, effectiveDate: e.target.value })}
                required
              />
              <Input
                label="Expiry Date"
                type="date"
                value={editFormData.expiryDate}
                onChange={(e) => setEditFormData({ ...editFormData, expiryDate: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px', color: '#8C2A2A' }}>
                * Mandatory Reason for Price Change / Revision
              </label>
              <textarea
                placeholder="Specify commercial reason (e.g. supplier price change, competitive matching, seasonal incentive)..."
                value={editFormData.changeReason}
                onChange={(e) => setEditFormData({ ...editFormData, changeReason: e.target.value })}
                rows={3}
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
              <span style={{ fontSize: '11px', color: '#666' }}>
                This justification will be permanently saved into the price audit log under your user ID.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <Button type="button" variant="outline" onClick={() => setSelectedItemForEdit(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Approve & Save Price Change
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Audit Log Modal */}
      {selectedItemForAudit && (
        <Modal
          isOpen={Boolean(selectedItemForAudit)}
          onClose={() => setSelectedItemForAudit(null)}
          title={`Price Change Audit Trail: ${selectedItemForAudit.productName} (${selectedItemForAudit.sku})`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-olive-drab)' }}>
              All modifications to standard prices, tier rates, and validity date windows are recorded permanently with the actor role and justification.
            </div>

            {selectedItemForAudit.priceChangeHistory.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
                No price modifications have occurred since baseline setup.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto' }}>
                {selectedItemForAudit.priceChangeHistory.map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      border: '1px solid var(--color-bone)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px',
                      backgroundColor: 'var(--color-floral-white)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 800, fontSize: '13px', color: 'var(--color-smoky-black)' }}>
                        Field: {entry.field}
                      </span>
                      <span style={{ fontSize: '11px', color: '#888' }}>{entry.changedAt}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '12px' }}>
                      <span style={{ color: '#8C2A2A' }}>
                        Old Value: <strong>{String(entry.oldValue)}</strong>
                      </span>
                      <span>➔</span>
                      <span style={{ color: '#1B4332' }}>
                        New Value: <strong>{String(entry.newValue)}</strong>
                      </span>
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '12px', color: '#444' }}>
                      <strong>Reason:</strong> {entry.reason}
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '11px', color: '#777' }}>
                      Authorized By: <strong>{entry.changedBy}</strong> ({entry.actorRole})
                      {entry.approvalRef && ` • Ref: ${entry.approvalRef}`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Button variant="outline" onClick={() => setSelectedItemForAudit(null)}>
                Close Audit Log
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

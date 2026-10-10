import React, { useState } from 'react';
import { Modal, Button, Dropdown, Input, Badge } from '@candi/ui';
import {
  ConversationalVerificationRecord,
  PickingReleaseDetails,
  PickingBinAllocation,
} from '@candi/types';
import {
  WAREHOUSE_WAVES,
  WAREHOUSE_PICKERS,
  SKU_BIN_MAPPINGS,
  WarehouseWave,
  WarehousePicker,
} from '../../data/conversationalVerification';

export interface PickingReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: ConversationalVerificationRecord[];
  onConfirmRelease: (orders: ConversationalVerificationRecord[], releaseDetails: PickingReleaseDetails) => void;
}

export const PickingReleaseModal: React.FC<PickingReleaseModalProps> = ({
  isOpen,
  onClose,
  orders,
  onConfirmRelease,
}) => {
  const [selectedWaveId, setSelectedWaveId] = useState<string>(WAREHOUSE_WAVES[0]?.id || 'wave-1');
  const [selectedPickerId, setSelectedPickerId] = useState<string>(WAREHOUSE_PICKERS[0]?.id || 'picker-01');
  const [priority, setPriority] = useState<'standard' | 'express' | 'urgent'>('standard');
  const [warehouseNotes, setWarehouseNotes] = useState<string>('');

  if (!isOpen || orders.length === 0) return null;

  const currentWave = WAREHOUSE_WAVES.find((w) => w.id === selectedWaveId) || WAREHOUSE_WAVES[0];
  const currentPicker = WAREHOUSE_PICKERS.find((p) => p.id === selectedPickerId) || WAREHOUSE_PICKERS[0];

  const totalCartons = orders.reduce(
    (sum, ord) => sum + ord.lines.reduce((lSum, line) => lSum + (line.unit === 'carton' ? line.quantity : 0), 0),
    0
  );
  const totalBoxes = orders.reduce(
    (sum, ord) => sum + ord.lines.reduce((lSum, line) => lSum + (line.unit === 'box' ? line.quantity : 0), 0),
    0
  );
  const totalValue = orders.reduce((sum, ord) => sum + ord.totalAmount, 0);

  // Consolidate bin allocations across selected orders
  const consolidatedBinAllocations: PickingBinAllocation[] = [];
  orders.forEach((ord) => {
    ord.lines.forEach((line) => {
      consolidatedBinAllocations.push({
        skuId: line.skuId,
        skuName: line.skuName,
        binLocation: line.binLocation || SKU_BIN_MAPPINGS[line.skuId] || 'Bay General (Dock)',
        quantity: line.quantity,
        unit: line.unit,
        batchCode: `LOT-2026-${line.skuId.toUpperCase()}-${Math.floor(10 + Math.random() * 89)}`,
      });
    });
  });

  const handleRelease = () => {
    const manifestCode = `WPK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const releaseDetails: PickingReleaseDetails = {
      releasedAt: 'Today, Just Now',
      releasedBy: 'Operations Dispatch Lead',
      waveId: currentWave.id,
      waveName: currentWave.name,
      assignedPickerId: currentPicker.id,
      assignedPickerName: `${currentPicker.name} (${currentPicker.role})`,
      pickingPriority: priority,
      binLocations: consolidatedBinAllocations,
      status: 'released_to_floor',
      manifestCode,
      warehouseNotes: warehouseNotes || `Wave batch release for ${currentWave.zone}. Verify cartons and pack tightly.`,
    };

    onConfirmRelease(orders, releaseDetails);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Release to Warehouse Picking Floor: ${orders.length} Order(s)`}
      maxWidth="860px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            Stage 5 of 5: Physical Stock Reservation & Wave Pick Slip Generation
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button size="sm" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={handleRelease}>
              🚀 Authorize & Release Wave to Floor
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Release Summary Header Banner */}
        <div
          style={{
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: '8px',
            padding: '14px 18px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#047857', fontWeight: 700 }}>ORDERS TO RELEASE</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#065F46' }}>
              {orders.length} Wholesale Order(s)
            </div>
            <div style={{ fontSize: '11px', color: '#047857', marginTop: '2px' }}>
              {orders.map((o) => o.orderNumber).join(', ')}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#047857', fontWeight: 700 }}>TOTAL VOLUME TO PICK</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#065F46' }}>
              {totalCartons} Cartons, {totalBoxes} Boxes
            </div>
            <div style={{ fontSize: '11px', color: '#047857', marginTop: '2px' }}>
              Total Value: PKR {totalValue.toLocaleString()}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#047857', fontWeight: 700 }}>INVENTORY RESERVATION</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#065F46', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>🔒 100% Stock Allocated</span>
            </div>
            <div style={{ fontSize: '11px', color: '#047857', marginTop: '2px' }}>
              FMCG Bays & Racks Mapped
            </div>
          </div>
        </div>

        {/* Wave and Picker Configuration Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          <div>
            <Dropdown
              label="Select Departure Picking Wave"
              value={selectedWaveId}
              onChange={(e) => setSelectedWaveId(e.target.value)}
              options={WAREHOUSE_WAVES.map((w) => ({
                value: w.id,
                label: `${w.code} • ${w.name} (Cutoff: ${w.cutoffTime})`,
              }))}
            />
            {currentWave && (
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                Vehicle: <strong style={{ color: '#0F172A' }}>{currentWave.vehicleAssigned}</strong> • Departure: {currentWave.departureTime}
              </div>
            )}
          </div>

          <div>
            <Dropdown
              label="Assign Warehouse Picker"
              value={selectedPickerId}
              onChange={(e) => setSelectedPickerId(e.target.value)}
              options={WAREHOUSE_PICKERS.map((p) => ({
                value: p.id,
                label: `${p.name} — ${p.role} (${p.status})`,
              }))}
            />
            {currentPicker && (
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                Active Waves: <strong style={{ color: '#0F172A' }}>{currentPicker.currentAssignedWaves}</strong> • Status: <span style={{ color: '#059669', fontWeight: 600 }}>{currentPicker.status.toUpperCase()}</span>
              </div>
            )}
          </div>

          <div>
            <Dropdown
              label="Picking Floor Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'standard' | 'express' | 'urgent')}
              options={[
                { value: 'standard', label: 'Standard Route Delivery' },
                { value: 'express', label: '⚡ Express Priority Dispatch' },
                { value: 'urgent', label: '🔥 Urgent Cutoff Emergency' },
              ]}
            />
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
              Affects warehouse cart sequencing and staging order.
            </div>
          </div>
        </div>

        {/* Warehouse Notes */}
        <div>
          <Input
            label="Warehouse Floor Staging / Pallet Instructions"
            placeholder="e.g. Ensure confectionery cartons are stacked on plastic pallets; check heat sensitivity..."
            value={warehouseNotes}
            onChange={(e) => setWarehouseNotes(e.target.value)}
          />
        </div>

        {/* FMCG Warehouse Bay / Bin Allocation Preview */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
              FMCG Warehouse Storage Bay & Bin Allocations ({consolidatedBinAllocations.length} Line Picks)
            </div>
            <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
              ✓ Stock Lock Pre-Verified
            </span>
          </div>

          <div style={{ border: '1px solid #E2E8F0', borderRadius: '6px', maxHeight: '200px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0 }}>
                <tr>
                  <th style={{ padding: '8px 12px' }}>Warehouse Storage Location</th>
                  <th style={{ padding: '8px 12px' }}>Product SKU</th>
                  <th style={{ padding: '8px 12px' }}>Quantity to Pick</th>
                  <th style={{ padding: '8px 12px' }}>Assigned Batch / Lot</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Reservation</th>
                </tr>
              </thead>
              <tbody>
                {consolidatedBinAllocations.map((alloc, idx) => (
                  <tr key={`${alloc.skuId}-${idx}`} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '8px 12px' }}>
                      <span
                        style={{
                          backgroundColor: '#EFF6FF',
                          color: '#1D4ED8',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontSize: '11px',
                        }}
                      >
                        {alloc.binLocation}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0F172A' }}>
                      {alloc.skuName}
                    </td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0F172A' }}>
                      {alloc.quantity} {alloc.unit}(s)
                    </td>
                    <td style={{ padding: '8px 12px', color: '#64748B', fontFamily: 'monospace' }}>
                      {alloc.batchCode}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <Badge status="delivered" label="Locked" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
};

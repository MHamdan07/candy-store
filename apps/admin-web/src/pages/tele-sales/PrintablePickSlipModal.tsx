import React from 'react';
import { Modal, Button, Badge } from '@candi/ui';
import { ConversationalVerificationRecord } from '@candi/types';

export interface PrintablePickSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ConversationalVerificationRecord | null;
}

export const PrintablePickSlipModal: React.FC<PrintablePickSlipModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  if (!isOpen || !record) return null;

  const release = record.pickingRelease;
  const manifestCode = release?.manifestCode || `WPK-2026-${record.orderNumber.replace(/[^0-9]/g, '')}`;
  const waveName = release?.waveName || 'Zone Delivery Wave';
  const pickerName = release?.assignedPickerName || 'Assigned Warehouse Associate';
  const releaseTime = release?.releasedAt || record.verifiedAt || 'Today, 10:00 AM';

  const totalCartons = record.lines.reduce(
    (sum, l) => sum + (l.unit === 'carton' ? l.quantity : 0),
    0
  );
  const totalBoxes = record.lines.reduce(
    (sum, l) => sum + (l.unit === 'box' ? l.quantity : 0),
    0
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Warehouse Picking Slip & Route Manifest: ${manifestCode}`}
      maxWidth="880px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            Authorized Candi Super Store Warehouse Fulfillment Document
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button size="sm" variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button size="sm" variant="primary" onClick={handlePrint}>
              🖨️ Print Official Pick Slip
            </Button>
          </div>
        </div>
      }
    >
      <div
        className="printable-pickslip-container"
        style={{
          fontFamily: 'var(--font-family-base, sans-serif)',
          color: '#0F172A',
          backgroundColor: '#FFFFFF',
          padding: '16px',
          border: '1px solid #CBD5E1',
          borderRadius: '8px',
        }}
      >
        {/* Document Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid #0F172A',
            paddingBottom: '14px',
            marginBottom: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>🍬</span>
              <div>
                <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#E11D48', letterSpacing: '-0.5px' }}>
                  CANDI SUPER STORE
                </h1>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Wholesale Fulfillment Tower • Central Distribution Hub
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                display: 'inline-block',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.5px',
              }}
            >
              PICKING SLIP / LOAD MANIFEST
            </div>
            <div style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', marginTop: '4px', letterSpacing: '0.5px' }}>
              {manifestCode}
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
              ||| | |||| | ||| | ||||| | ||
            </div>
          </div>
        </div>

        {/* Metadata Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '12px 16px',
            marginBottom: '16px',
            fontSize: '12px',
          }}
        >
          <div>
            <div style={{ color: '#64748B', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>
              RETAILER / DESTINATION
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
              {record.businessName}
            </div>
            <div style={{ color: '#334155' }}>Proprietor: {record.customerName}</div>
            <div style={{ color: '#334155' }}>Phone: {record.phoneNumber}</div>
            <div style={{ color: '#64748B', marginTop: '4px' }}>
              <strong>Address:</strong> {record.deliveryAddress}
            </div>
            <div style={{ marginTop: '4px' }}>
              <Badge status="neutral" label={`Territory: ${record.deliveryZone}`} />
            </div>
          </div>

          <div>
            <div style={{ color: '#64748B', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>
              FULFILLMENT & WAVE LOGISTICS
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
              Order #: <strong style={{ color: '#E11D48' }}>{record.orderNumber}</strong>
            </div>
            <div style={{ color: '#334155' }}>Wave: {waveName}</div>
            <div style={{ color: '#334155' }}>Assigned Picker: <strong>{pickerName}</strong></div>
            <div style={{ color: '#334155' }}>Release Timestamp: {releaseTime}</div>
            <div style={{ color: '#334155', marginTop: '4px' }}>
              Payment Method: <strong>{record.paymentMethod.replace(/_/g, ' ').toUpperCase()}</strong>
            </div>
            <div style={{ marginTop: '4px' }}>
              <Badge status="delivered" label="Stock Reserved & Verified" />
            </div>
          </div>
        </div>

        {/* Picking Table */}
        <div style={{ marginBottom: '16px' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12px',
              textAlign: 'left',
              border: '1px solid #CBD5E1',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '2px solid #94A3B8' }}>
                <th style={{ padding: '8px 10px', width: '35px', textAlign: 'center' }}>Seq</th>
                <th style={{ padding: '8px 10px', width: '190px' }}>FMCG Warehouse Bay / Bin</th>
                <th style={{ padding: '8px 10px' }}>Product SKU & Packaging Master</th>
                <th style={{ padding: '8px 10px', width: '80px', textAlign: 'center' }}>Unit</th>
                <th style={{ padding: '8px 10px', width: '90px', textAlign: 'center' }}>Verified Qty</th>
                <th style={{ padding: '8px 10px', width: '60px', textAlign: 'center' }}>Picked</th>
                <th style={{ padding: '8px 10px', width: '130px' }}>QC Staging Notes</th>
              </tr>
            </thead>
            <tbody>
              {record.lines.map((line, idx) => (
                <tr key={line.id} style={{ borderBottom: '1px solid #E2E8F0', height: '38px' }}>
                  <td style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 700, color: '#64748B' }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: '6px 10px' }}>
                    <span
                      style={{
                        backgroundColor: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        color: '#1E40AF',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        display: 'inline-block',
                      }}
                    >
                      {line.binLocation || 'Bay A-01 (General)'}
                    </span>
                  </td>
                  <td style={{ padding: '6px 10px' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{line.skuName}</div>
                    {line.tradeSchemeApplied && (
                      <div style={{ fontSize: '10px', color: '#059669' }}>Scheme: {line.tradeSchemeApplied}</div>
                    )}
                  </td>
                  <td style={{ padding: '6px 10px', textAlign: 'center', textTransform: 'capitalize' }}>
                    {line.unit}
                  </td>
                  <td style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 800, fontSize: '13px', color: '#0F172A' }}>
                    {line.quantity}
                    {line.bonusQuantity ? (
                      <span style={{ fontSize: '11px', color: '#059669', marginLeft: '4px' }}>
                        (+{line.bonusQuantity} Bonus)
                      </span>
                    ) : null}
                  </td>
                  <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        border: '2px solid #475569',
                        borderRadius: '3px',
                        margin: '0 auto',
                      }}
                    />
                  </td>
                  <td style={{ padding: '6px 10px', color: '#94A3B8', fontSize: '11px' }}>
                    _________________
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Volume Summary Strip */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '10px 14px',
            marginBottom: '18px',
            fontSize: '12px',
          }}
        >
          <div>
            <span style={{ fontWeight: 700, color: '#0F172A' }}>Volume Breakdown: </span>
            <span style={{ color: '#475569' }}>
              {totalCartons} Outer Cartons • {totalBoxes} Display Boxes • {record.lines.length} Line Items
            </span>
          </div>

          <div>
            <span style={{ fontWeight: 700, color: '#0F172A' }}>Total Invoice Value: </span>
            <span style={{ fontWeight: 800, color: '#E11D48', fontSize: '13px' }}>
              PKR {record.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Sign-Off Blocks */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            borderTop: '1px dashed #CBD5E1',
            paddingTop: '14px',
            fontSize: '11px',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, color: '#475569', marginBottom: '24px' }}>
              1. WAREHOUSE PICKER
            </div>
            <div style={{ borderTop: '1px solid #94A3B8', paddingTop: '4px' }}>
              Signature: ___________________
            </div>
            <div style={{ color: '#64748B', marginTop: '2px' }}>Name: {pickerName.split(' ')[0]}</div>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: '#475569', marginBottom: '24px' }}>
              2. STAGING & QC AUDITOR
            </div>
            <div style={{ borderTop: '1px solid #94A3B8', paddingTop: '4px' }}>
              Signature: ___________________
            </div>
            <div style={{ color: '#64748B', marginTop: '2px' }}>Carton Seal Checked [✓]</div>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: '#475569', marginBottom: '24px' }}>
              3. ROUTE DRIVER / DISPATCH
            </div>
            <div style={{ borderTop: '1px solid #94A3B8', paddingTop: '4px' }}>
              Signature: ___________________
            </div>
            <div style={{ color: '#64748B', marginTop: '2px' }}>Truck Loaded & Verified [✓]</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

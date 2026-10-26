import React from 'react';
import { Modal, Button, Badge } from '@candi/ui';
import { TripManifest } from '@candi/types';

export interface PrintableTripManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripManifest | null;
}

export const PrintableTripManifestModal: React.FC<PrintableTripManifestModalProps> = ({
  isOpen,
  onClose,
  trip,
}) => {
  if (!isOpen || !trip) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Vehicle Trip Loading Manifest: ${trip.manifestNumber}`}
      maxWidth="920px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            Official Driver Delivery Manifest & Gate Loading Pass
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button size="sm" variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button size="sm" variant="primary" onClick={handlePrint}>
              🖨️ Print Driver Loading Manifest
            </Button>
          </div>
        </div>
      }
    >
      <div
        className="printable-manifest-container"
        style={{
          fontFamily: 'var(--font-family-base, sans-serif)',
          color: '#0F172A',
          backgroundColor: '#FFFFFF',
          padding: '18px',
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
              <span style={{ fontSize: '26px' }}>🚚</span>
              <div>
                <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#1e2023', letterSpacing: '-0.5px' }}>
                  CANDI SUPER STORE FLEET LOGISTICS
                </h1>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Last-Mile Delivery Dispatch • Route Manifest & Loading Challan
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
              OFFICIAL VEHICLE TRIP MANIFEST
            </div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', marginTop: '4px', letterSpacing: '0.5px' }}>
              {trip.manifestNumber}
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
              |||| | ||||| | ||| |||| | |||||
            </div>
          </div>
        </div>

        {/* Fleet & Logistics Metadata Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
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
              BEAT ROUTE & TERRITORY
            </div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
              {trip.beatRouteCode} — {trip.beatRouteName}
            </div>
            <div style={{ color: '#475569', marginTop: '2px' }}>Zone: <strong>{trip.deliveryZone}</strong></div>
            <div style={{ color: '#64748B', marginTop: '2px' }}>Dispatcher: {trip.dispatcherName}</div>
          </div>

          <div>
            <div style={{ color: '#64748B', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>
              FLEET VEHICLE & DRIVER
            </div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
              Plate: <strong style={{ color: '#1e2023' }}>{trip.vehiclePlate}</strong> ({trip.vehicleModel})
            </div>
            <div style={{ color: '#475569', marginTop: '2px' }}>
              Driver: <strong>{trip.driverName}</strong>
            </div>
            <div style={{ color: '#0284C7', fontWeight: 600, marginTop: '2px' }}>
              📞 {trip.driverPhone}
            </div>
          </div>

          <div>
            <div style={{ color: '#64748B', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>
              TIMING & CARGO TOTALS
            </div>
            <div style={{ color: '#334155', marginTop: '2px' }}>
              Scheduled Departure: <strong>{trip.scheduledDepartureTime}</strong>
            </div>
            <div style={{ color: '#334155' }}>
              Estimated Return: <strong>{trip.estimatedReturnTime}</strong>
            </div>
            <div style={{ color: '#059669', fontWeight: 700, marginTop: '2px' }}>
              Cargo: {trip.totalCartonsCount} Cartons ({trip.totalWeightKg} kg)
            </div>
          </div>
        </div>

        {/* Sequenced Stops Table */}
        <div style={{ marginBottom: '16px' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '11px',
              textAlign: 'left',
              border: '1px solid #CBD5E1',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '2px solid #94A3B8' }}>
                <th style={{ padding: '8px 8px', width: '30px', textAlign: 'center' }}>Seq</th>
                <th style={{ padding: '8px 10px', width: '180px' }}>Retail Store & Contact</th>
                <th style={{ padding: '8px 10px' }}>Delivery Address & Landmark</th>
                <th style={{ padding: '8px 10px', width: '110px' }}>Invoices</th>
                <th style={{ padding: '8px 10px', width: '80px', textAlign: 'center' }}>Cartons</th>
                <th style={{ padding: '8px 10px', width: '100px', textAlign: 'right' }}>COD Expected</th>
                <th style={{ padding: '8px 10px', width: '90px', textAlign: 'right' }}>Cash Received</th>
                <th style={{ padding: '8px 10px', width: '100px', textAlign: 'center' }}>Customer Stamp</th>
              </tr>
            </thead>
            <tbody>
              {trip.stops.map((stop) => (
                <tr key={stop.id} style={{ borderBottom: '1px solid #E2E8F0', height: '44px' }}>
                  <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 800, color: '#0F172A' }}>
                    {stop.stopSequence}
                  </td>
                  <td style={{ padding: '6px 10px' }}>
                    <div style={{ fontWeight: 800, color: '#0F172A' }}>{stop.businessName}</div>
                    <div style={{ color: '#64748B', fontSize: '10px' }}>
                      {stop.customerName} • {stop.phoneNumber}
                    </div>
                  </td>
                  <td style={{ padding: '6px 10px' }}>
                    <div style={{ color: '#334155' }}>{stop.deliveryAddress}</div>
                    <div style={{ color: '#0284C7', fontSize: '10px' }}>{stop.areaLandmark}</div>
                  </td>
                  <td style={{ padding: '6px 10px', fontFamily: 'monospace', fontSize: '10px', color: '#475569' }}>
                    {stop.orderNumber}
                    <br />
                    {stop.invoiceNumber}
                  </td>
                  <td style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 700 }}>
                    {stop.totalCartons} ctn
                    {stop.totalBoxes > 0 && <span style={{ fontSize: '10px', color: '#64748B' }}><br />+{stop.totalBoxes} bx</span>}
                  </td>
                  <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>
                    {stop.expectedCodAmount > 0 ? `PKR ${stop.expectedCodAmount.toLocaleString()}` : 'Credit'}
                  </td>
                  <td style={{ padding: '6px 10px', textAlign: 'right' }}>
                    {stop.actualCashCollected ? (
                      <span style={{ fontWeight: 800, color: '#059669' }}>
                        PKR {stop.actualCashCollected.toLocaleString()}
                      </span>
                    ) : (
                      <div
                        style={{
                          border: '1px solid #94A3B8',
                          height: '22px',
                          borderRadius: '3px',
                          backgroundColor: '#F8FAFC',
                        }}
                      />
                    )}
                  </td>
                  <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                    {stop.proofOfDelivery?.stampVerified ? (
                      <span style={{ fontSize: '10px', color: '#059669', fontWeight: 700 }}>✓ STAMP VERIFIED</span>
                    ) : (
                      <div
                        style={{
                          border: '1px dashed #94A3B8',
                          height: '24px',
                          borderRadius: '3px',
                          backgroundColor: '#FAFAFA',
                        }}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary Banner */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            padding: '10px 16px',
            marginBottom: '18px',
            fontSize: '12px',
          }}
        >
          <div>
            <span style={{ fontWeight: 700, color: '#0F172A' }}>Manifest Totals: </span>
            <span style={{ color: '#475569' }}>
              {trip.stops.length} Delivery Stops • {trip.totalCartonsCount} Outer Cartons ({trip.totalWeightKg} kg)
            </span>
          </div>

          <div>
            <span style={{ fontWeight: 700, color: '#0F172A' }}>Total Expected COD Cash: </span>
            <span style={{ fontWeight: 900, color: '#1e2023', fontSize: '14px' }}>
              PKR {trip.expectedTotalCod.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Handover & Reconciliation Signatures */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            borderTop: '1px dashed #94A3B8',
            paddingTop: '14px',
            fontSize: '11px',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, color: '#475569', marginBottom: '28px' }}>
              1. LOADING BAY DISPATCHER
            </div>
            <div style={{ borderTop: '1px solid #94A3B8', paddingTop: '4px' }}>
              Signature: ___________________
            </div>
            <div style={{ color: '#64748B', marginTop: '2px' }}>Name: Zubair Siddiqui</div>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: '#475569', marginBottom: '28px' }}>
              2. ASSIGNED DRIVER HANDOVER
            </div>
            <div style={{ borderTop: '1px solid #94A3B8', paddingTop: '4px' }}>
              Signature: ___________________
            </div>
            <div style={{ color: '#64748B', marginTop: '2px' }}>Name: {trip.driverName}</div>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: '#475569', marginBottom: '28px' }}>
              3. CASHIER DEPOT VAULT RETURN
            </div>
            <div style={{ borderTop: '1px solid #94A3B8', paddingTop: '4px' }}>
              Signature: ___________________
            </div>
            <div style={{ color: '#64748B', marginTop: '2px' }}>Cash Reconciled Zero Variance [✓]</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

import React, { useState } from 'react';
import { Modal, Button, Badge } from '@candi/ui';
import { TripManifest, TripDeliveryStop, StopDeliveryStatus, TripManifestStatus } from '@candi/types';

export interface TripExecutionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripManifest | null;
  onUpdateTrip: (updatedTrip: TripManifest) => void;
  onOpenPrintManifest: (trip: TripManifest) => void;
}

export const TripExecutionDrawer: React.FC<TripExecutionDrawerProps> = ({
  isOpen,
  onClose,
  trip,
  onUpdateTrip,
  onOpenPrintManifest,
}) => {
  if (!isOpen || !trip) return null;

  const [activeStopId, setActiveStopId] = useState<string | null>(null);

  const totalCollectedCod = trip.stops.reduce(
    (sum, s) => sum + (s.actualCashCollected || 0),
    0
  );
  const completedStops = trip.stops.filter(
    (s) => s.status === 'delivered_collected' || s.status === 'refused_returned'
  ).length;

  const progressPercent = Math.round((completedStops / (trip.stops.length || 1)) * 100);

  // Dispatch vehicle to road
  const handleDispatchTrip = () => {
    const updated: TripManifest = {
      ...trip,
      status: 'dispatched_in_transit',
      actualDepartureTime: 'Today, Just Now',
      stops: trip.stops.map((s) => ({
        ...s,
        status: s.status === 'pending_dispatch' ? 'in_transit' : s.status,
      })),
    };
    onUpdateTrip(updated);
  };

  // Mark specific stop as arrived
  const handleMarkStopArrived = (stopId: string) => {
    const updatedStops = trip.stops.map((s) =>
      s.id === stopId
        ? {
            ...s,
            status: 'arrived_at_shop' as StopDeliveryStatus,
            arrivedAt: 'Today, Just Now',
          }
        : s
    );

    const updated: TripManifest = {
      ...trip,
      stops: updatedStops,
    };
    onUpdateTrip(updated);
  };

  // Complete delivery and record collected cash
  const handleCompleteStopDelivery = (stopId: string) => {
    const stop = trip.stops.find((s) => s.id === stopId);
    if (!stop) return;

    const collectedCash = stop.expectedCodAmount;

    const updatedStops = trip.stops.map((s) =>
      s.id === stopId
        ? {
            ...s,
            status: 'delivered_collected' as StopDeliveryStatus,
            completedAt: 'Today, Just Now',
            actualCashCollected: collectedCash,
            proofOfDelivery: {
              receivedByName: `${stop.customerName} (Proprietor)`,
              signatureRecorded: true,
              stampVerified: true,
              geoCoordinates: '24.8930° N, 67.0280° E',
              remarks: 'Delivered in full. Cash collected without variance.',
            },
          }
        : s
    );

    const newCompletedCount = updatedStops.filter(
      (s) => s.status === 'delivered_collected' || s.status === 'refused_returned'
    ).length;

    const isAllDone = newCompletedCount === updatedStops.length;

    const updated: TripManifest = {
      ...trip,
      completedStopsCount: newCompletedCount,
      collectedTotalCod: updatedStops.reduce((sum, s) => sum + (s.actualCashCollected || 0), 0),
      status: isAllDone ? 'completed_delivered' : trip.status,
      actualReturnTime: isAllDone ? 'Today, Just Now' : trip.actualReturnTime,
      stops: updatedStops,
    };

    onUpdateTrip(updated);
  };

  // Mark stop as refused
  const handleMarkStopRefused = (stopId: string) => {
    const reason = window.prompt('Enter reason for customer delivery refusal (e.g. Shopkeeper out of town, Cash shortage, Refused booking):');
    if (!reason) return;

    const updatedStops = trip.stops.map((s) =>
      s.id === stopId
        ? {
            ...s,
            status: 'refused_returned' as StopDeliveryStatus,
            completedAt: 'Today, Just Now',
            actualCashCollected: 0,
            refusalReason: reason,
          }
        : s
    );

    const newCompletedCount = updatedStops.filter(
      (s) => s.status === 'delivered_collected' || s.status === 'refused_returned'
    ).length;

    const isAllDone = newCompletedCount === updatedStops.length;

    const updated: TripManifest = {
      ...trip,
      completedStopsCount: newCompletedCount,
      status: isAllDone ? 'completed_delivered' : trip.status,
      actualReturnTime: isAllDone ? 'Today, Just Now' : trip.actualReturnTime,
      stops: updatedStops,
    };

    onUpdateTrip(updated);
  };

  // Final reconcile with vault
  const handleReconcileTrip = () => {
    const updated: TripManifest = {
      ...trip,
      status: 'reconciled_closed',
      cashierReconciliationId: `rec-${Date.now()}`,
    };
    onUpdateTrip(updated);
  };

  const getStopStatusBadge = (status: StopDeliveryStatus) => {
    switch (status) {
      case 'delivered_collected':
        return <Badge status="delivered" label="✓ Delivered & Collected" />;
      case 'arrived_at_shop':
        return <Badge status="overdue" label="📍 Arrived at Shop" />;
      case 'in_transit':
        return <Badge status="pending" label="🚚 In Transit" />;
      case 'pending_dispatch':
        return <Badge status="draft" label="Staged at Dock" />;
      case 'refused_returned':
        return <Badge status="cancelled" label="❌ Refused / Return" />;
      default:
        return <Badge status="draft" label={status} />;
    }
  };

  const getTripStatusBadge = (status: TripManifestStatus) => {
    switch (status) {
      case 'dispatched_in_transit':
        return <Badge status="pending" label="🚚 In Transit on Road" />;
      case 'staged_loading':
        return <Badge status="overdue" label="📦 Staged at Loading Dock" />;
      case 'completed_delivered':
        return <Badge status="delivered" label="🏁 Delivered (Return at Depot)" />;
      case 'reconciled_closed':
        return <Badge status="delivered" label="🔐 Reconciled & Closed" />;
      default:
        return <Badge status="draft" label={status} />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Live Trip Console: ${trip.manifestNumber} — ${trip.beatRouteCode}`}
      maxWidth="960px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenPrintManifest(trip)}
            >
              🖨️ Print Driver Loading Manifest
            </Button>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {trip.status === 'staged_loading' && (
              <Button size="sm" variant="primary" onClick={handleDispatchTrip}>
                🚀 Dispatch Vehicle to Road
              </Button>
            )}

            {trip.status === 'completed_delivered' && (
              <Button size="sm" variant="primary" onClick={handleReconcileTrip}>
                🔐 Cashier Vault Handover & Reconcile
              </Button>
            )}

            <Button size="sm" variant="outline" onClick={onClose}>
              Close Console
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Top Operational Status Banner */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>BEAT & ROUTE</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
              {trip.beatRouteCode} • {trip.beatRouteName}
            </div>
            <div style={{ fontSize: '12px', color: '#0284C7', fontWeight: 600 }}>{trip.deliveryZone}</div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>VEHICLE & DRIVER</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
              {trip.vehiclePlate} ({trip.vehicleModel.split(' ')[0]})
            </div>
            <div style={{ fontSize: '12px', color: '#334155' }}>
              Driver: <strong>{trip.driverName}</strong> • <a href={`tel:${trip.driverPhone}`} style={{ color: '#0284C7', textDecoration: 'none' }}>{trip.driverPhone}</a>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>TRIP PROGRESS & STATUS</div>
            <div style={{ marginTop: '2px' }}>{getTripStatusBadge(trip.status)}</div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
              {completedStops} of {trip.stops.length} stops completed ({progressPercent}%)
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>COD CASH ACCUMULATOR</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e2023', marginTop: '2px' }}>
              PKR {totalCollectedCod.toLocaleString()}{' '}
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 400 }}>
                / {trip.expectedTotalCod.toLocaleString()} expected
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
              Zero Unreconciled Variance
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              backgroundColor: progressPercent === 100 ? '#10B981' : '#1e2023',
              borderRadius: '999px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Sequenced Delivery Stops Timeline */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
              Sequenced Beat Route Stops ({trip.stops.length} Stops)
            </h3>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              Simulate real-time driver mobile app updates:
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {trip.stops.map((stop) => {
              const isDelivered = stop.status === 'delivered_collected';
              const isArrived = stop.status === 'arrived_at_shop';
              const isRefused = stop.status === 'refused_returned';

              return (
                <div
                  key={stop.id}
                  style={{
                    backgroundColor: isDelivered ? '#F0FDF4' : isArrived ? '#FFFBEB' : '#FFFFFF',
                    border: isDelivered ? '1px solid #BBF7D0' : isArrived ? '1px solid #FDE68A' : '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: isDelivered ? '#10B981' : isArrived ? '#F59E0B' : '#0F172A',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isDelivered ? '✓' : stop.stopSequence}
                      </div>

                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                          {stop.businessName}{' '}
                          <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748B' }}>
                            ({stop.customerName})
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#475569' }}>
                          📍 {stop.deliveryAddress} • <span style={{ color: '#0284C7' }}>{stop.areaLandmark}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      {getStopStatusBadge(stop.status)}
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                        Order: <strong>{stop.orderNumber}</strong> • Invoice: <strong>{stop.invoiceNumber}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Stop Cargo & COD Row */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: 'rgba(241, 245, 249, 0.6)',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div>
                      <span style={{ color: '#64748B' }}>Consignment: </span>
                      <strong style={{ color: '#0F172A' }}>
                        {stop.totalCartons} Cartons, {stop.totalBoxes} Boxes ({stop.totalWeightKg} kg)
                      </strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748B' }}>COD Collection: </span>
                      <strong style={{ color: '#1e2023', fontSize: '13px' }}>
                        PKR {stop.expectedCodAmount.toLocaleString()}
                      </strong>
                      {isDelivered && (
                        <span style={{ color: '#059669', marginLeft: '6px', fontWeight: 700 }}>
                          (PKR {stop.actualCashCollected?.toLocaleString()} Collected)
                        </span>
                      )}
                    </div>

                    {/* Interactive Action Buttons */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {!isDelivered && !isRefused && (
                        <>
                          {!isArrived && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkStopArrived(stop.id)}
                            >
                              📍 Mark Arrived
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleCompleteStopDelivery(stop.id)}
                          >
                            ✓ Collect COD & Deliver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkStopRefused(stop.id)}
                          >
                            Refuse
                          </Button>
                        </>
                      )}

                      {isDelivered && stop.proofOfDelivery && (
                        <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                          📝 mPOD Signed: {stop.proofOfDelivery.receivedByName}
                        </span>
                      )}

                      {isRefused && stop.refusalReason && (
                        <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 600 }}>
                          Reason: {stop.refusalReason}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};

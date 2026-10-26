import React, { useState } from 'react';
import { Modal, Button, Dropdown, Input, Badge } from '@candi/ui';
import {
  TripManifest,
  TripDeliveryStop,
  BeatRoute,
  DeliveryVehicle,
  DeliveryDriver,
} from '@candi/types';
import {
  INITIAL_BEAT_ROUTES,
  INITIAL_FLEET_VEHICLES,
  INITIAL_DELIVERY_DRIVERS,
} from '../../data/fleetLogisticsData';

export interface BeatClusteringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmTrip: (newTrip: TripManifest) => void;
}

interface CandidateOrder {
  id: string;
  orderNumber: string;
  invoiceNumber: string;
  customerAccountId: string;
  customerName: string;
  businessName: string;
  phoneNumber: string;
  deliveryAddress: string;
  areaLandmark: string;
  totalCartons: number;
  totalBoxes: number;
  totalWeightKg: number;
  paymentMethod: 'cash_on_delivery' | 'credit' | 'partial_advance';
  expectedCodAmount: number;
  zone: string;
}

const CANDIDATE_PICKED_ORDERS: CandidateOrder[] = [
  {
    id: 'cand-01',
    orderNumber: 'ORD-2026-115',
    invoiceNumber: 'INV-2026-0051',
    customerAccountId: 'cust-15',
    customerName: 'Muhammad Tariq',
    businessName: 'Tariq Super Mart',
    phoneNumber: '+92 300 1234567',
    deliveryAddress: 'Shop 10, Gol Market Chowk, Nazimabad No. 3, Karachi',
    areaLandmark: 'Opposite Shell Petrol Pump',
    totalCartons: 8,
    totalBoxes: 4,
    totalWeightKg: 95,
    paymentMethod: 'cash_on_delivery',
    expectedCodAmount: 26400,
    zone: 'Zone 1 - Nazimabad',
  },
  {
    id: 'cand-02',
    orderNumber: 'ORD-2026-116',
    invoiceNumber: 'INV-2026-0052',
    customerAccountId: 'cust-16',
    customerName: 'Hafiz Bilal',
    businessName: 'Madina Confectionery House',
    phoneNumber: '+92 321 9876543',
    deliveryAddress: 'Shop 3, Block 2, Liaquatabad, Karachi',
    areaLandmark: 'Near Liaquatabad Flying Coach Stop',
    totalCartons: 12,
    totalBoxes: 6,
    totalWeightKg: 145,
    paymentMethod: 'cash_on_delivery',
    expectedCodAmount: 38200,
    zone: 'Zone 1 - Nazimabad',
  },
  {
    id: 'cand-03',
    orderNumber: 'ORD-2026-117',
    invoiceNumber: 'INV-2026-0053',
    customerAccountId: 'cust-17',
    customerName: 'Shakeel Ahmed',
    businessName: 'New Karachi Cash & Carry',
    phoneNumber: '+92 333 1122334',
    deliveryAddress: 'Sector 5-E, Main Road, New Karachi',
    areaLandmark: 'Near Sindhi Hotel Stop',
    totalCartons: 15,
    totalBoxes: 10,
    totalWeightKg: 180,
    paymentMethod: 'cash_on_delivery',
    expectedCodAmount: 49500,
    zone: 'Zone 1 - Nazimabad',
  },
  {
    id: 'cand-04',
    orderNumber: 'ORD-2026-118',
    invoiceNumber: 'INV-2026-0054',
    customerAccountId: 'cust-18',
    customerName: 'Zubair Memon',
    businessName: 'Memon General Store',
    phoneNumber: '+92 345 5566778',
    deliveryAddress: 'Plot 4, Paposh Nagar Market, Nazimabad, Karachi',
    areaLandmark: 'Near Chandni Chowk Paposh',
    totalCartons: 6,
    totalBoxes: 4,
    totalWeightKg: 72,
    paymentMethod: 'credit',
    expectedCodAmount: 0,
    zone: 'Zone 1 - Nazimabad',
  },
  {
    id: 'cand-05',
    orderNumber: 'ORD-2026-119',
    invoiceNumber: 'INV-2026-0055',
    customerAccountId: 'cust-19',
    customerName: 'Noman Siddiqui',
    businessName: 'Al-Khair Super Store',
    phoneNumber: '+92 312 3344556',
    deliveryAddress: 'Shop 8, Block H, North Nazimabad, Karachi',
    areaLandmark: 'Near Hydri Super Market',
    totalCartons: 10,
    totalBoxes: 5,
    totalWeightKg: 120,
    paymentMethod: 'cash_on_delivery',
    expectedCodAmount: 34100,
    zone: 'Zone 1 - Nazimabad',
  },
];

export const BeatClusteringModal: React.FC<BeatClusteringModalProps> = ({
  isOpen,
  onClose,
  onConfirmTrip,
}) => {
  const [selectedBeatId, setSelectedBeatId] = useState<string>(INITIAL_BEAT_ROUTES[0].id);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(INITIAL_FLEET_VEHICLES[3].id);
  const [selectedDriverId, setSelectedDriverId] = useState<string>(INITIAL_DELIVERY_DRIVERS[2].id);
  const [departureTime, setDepartureTime] = useState<string>('Today, 11:30 AM');
  const [estimatedReturnTime, setEstimatedReturnTime] = useState<string>('Today, 03:00 PM');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>(['cand-01', 'cand-02', 'cand-04']);
  const [tripNotes, setTripNotes] = useState<string>('Express replenishment wave for north beat retailers.');

  if (!isOpen) return null;

  const currentBeat = INITIAL_BEAT_ROUTES.find((b) => b.id === selectedBeatId) || INITIAL_BEAT_ROUTES[0];
  const currentVehicle = INITIAL_FLEET_VEHICLES.find((v) => v.id === selectedVehicleId) || INITIAL_FLEET_VEHICLES[0];
  const currentDriver = INITIAL_DELIVERY_DRIVERS.find((d) => d.id === selectedDriverId) || INITIAL_DELIVERY_DRIVERS[0];

  const clusteredOrders = CANDIDATE_PICKED_ORDERS.filter((o) => selectedOrderIds.includes(o.id));

  const totalCartons = clusteredOrders.reduce((sum, o) => sum + o.totalCartons, 0);
  const totalBoxes = clusteredOrders.reduce((sum, o) => sum + o.totalBoxes, 0);
  const totalWeight = clusteredOrders.reduce((sum, o) => sum + o.totalWeightKg, 0);
  const totalCod = clusteredOrders.reduce((sum, o) => sum + o.expectedCodAmount, 0);

  const payloadWeightUtilization = Math.round((totalWeight / (currentVehicle.payloadCapacityKg || 1)) * 100);
  const cartonVolumeUtilization = Math.round((totalCartons / (currentVehicle.cartonCapacity || 1)) * 100);

  const isOverweight = totalWeight > currentVehicle.payloadCapacityKg;
  const isOverVolume = totalCartons > currentVehicle.cartonCapacity;

  const toggleOrderSelection = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateTrip = () => {
    if (clusteredOrders.length === 0) {
      alert('Please select at least one delivery stop to generate trip manifest.');
      return;
    }

    const manifestSeq = Math.floor(100 + Math.random() * 900);
    const manifestNumber = `TRIP-2026-MNF-${manifestSeq}`;

    const stops: TripDeliveryStop[] = clusteredOrders.map((o, idx) => ({
      id: `stop-${manifestSeq}-${idx + 1}`,
      stopSequence: idx + 1,
      orderId: o.id,
      orderNumber: o.orderNumber,
      invoiceNumber: o.invoiceNumber,
      customerAccountId: o.customerAccountId,
      customerName: o.customerName,
      businessName: o.businessName,
      phoneNumber: o.phoneNumber,
      deliveryAddress: o.deliveryAddress,
      areaLandmark: o.areaLandmark,
      totalCartons: o.totalCartons,
      totalBoxes: o.totalBoxes,
      totalWeightKg: o.totalWeightKg,
      paymentMethod: o.paymentMethod,
      expectedCodAmount: o.expectedCodAmount,
      status: 'pending_dispatch',
    }));

    const newTrip: TripManifest = {
      id: `mnf-${manifestSeq}`,
      manifestNumber,
      beatRouteId: currentBeat.id,
      beatRouteCode: currentBeat.code,
      beatRouteName: currentBeat.name,
      deliveryZone: currentBeat.zone,
      vehicleId: currentVehicle.id,
      vehiclePlate: currentVehicle.registrationNumber,
      vehicleModel: currentVehicle.modelName,
      driverId: currentDriver.id,
      driverName: currentDriver.fullName,
      driverPhone: currentDriver.phoneNumber,
      status: 'staged_loading',
      scheduledDepartureTime: departureTime,
      estimatedReturnTime,
      totalStops: stops.length,
      completedStopsCount: 0,
      totalCartonsCount: totalCartons,
      totalBoxesCount: totalBoxes,
      totalWeightKg: totalWeight,
      payloadUtilizationPercent: Math.max(payloadWeightUtilization, cartonVolumeUtilization),
      expectedTotalCod: totalCod,
      collectedTotalCod: 0,
      cashVariance: 0,
      dispatcherName: 'Zubair Siddiqui (Dispatch Supervisor)',
      notes: tripNotes,
      stops,
    };

    onConfirmTrip(newTrip);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Beat Route Cluster & Vehicle Trip Manifest"
      maxWidth="900px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            {clusteredOrders.length} stop(s) clustered • Total Weight: {totalWeight} kg
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button size="sm" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              disabled={isOverweight || isOverVolume || clusteredOrders.length === 0}
              onClick={handleCreateTrip}
            >
              🚀 Generate Trip Manifest & Stage Vehicle
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Route, Vehicle & Driver Grid */}
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
              label="Select FMCG Beat Route"
              value={selectedBeatId}
              onChange={(e) => setSelectedBeatId(e.target.value)}
              options={INITIAL_BEAT_ROUTES.map((b) => ({
                value: b.id,
                label: `${b.code} • ${b.name}`,
              }))}
            />
            {currentBeat && (
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                Zone: <strong style={{ color: '#0F172A' }}>{currentBeat.zone}</strong> • Est: {currentBeat.estimatedTransitMinutes}m ({currentBeat.distanceKm} km)
              </div>
            )}
          </div>

          <div>
            <Dropdown
              label="Assign Delivery Fleet Vehicle"
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              options={INITIAL_FLEET_VEHICLES.map((v) => ({
                value: v.id,
                label: `${v.registrationNumber} • ${v.modelName} (${v.status.replace(/_/g, ' ')})`,
              }))}
            />
            {currentVehicle && (
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                Capacity: <strong>{currentVehicle.payloadCapacityKg} kg</strong> • Volume: <strong>{currentVehicle.cartonCapacity} cartons</strong>
              </div>
            )}
          </div>

          <div>
            <Dropdown
              label="Assign Delivery Driver"
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              options={INITIAL_DELIVERY_DRIVERS.map((d) => ({
                value: d.id,
                label: `${d.fullName} • Rating: ${d.rating}★ (${d.status.replace(/_/g, ' ')})`,
              }))}
            />
            {currentDriver && (
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                Phone: <strong style={{ color: '#0F172A' }}>{currentDriver.phoneNumber}</strong> • Accuracy: {currentDriver.codCollectionAccuracyPercent}%
              </div>
            )}
          </div>
        </div>

        {/* Schedule & Notes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div>
            <Input
              label="Scheduled Departure Time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
            />
          </div>
          <div>
            <Input
              label="Estimated Depot Return Time"
              value={estimatedReturnTime}
              onChange={(e) => setEstimatedReturnTime(e.target.value)}
            />
          </div>
          <div>
            <Input
              label="Dispatch & Route Notes"
              value={tripNotes}
              onChange={(e) => setTripNotes(e.target.value)}
              placeholder="e.g. Morning priority delivery..."
            />
          </div>
        </div>

        {/* Vehicle Payload & Volume Capacity Utilization Meter */}
        <div
          style={{
            backgroundColor: isOverweight || isOverVolume ? '#FEF2F2' : '#F0FDF4',
            border: isOverweight || isOverVolume ? '1px solid #FECACA' : '1px solid #BBF7D0',
            borderRadius: '8px',
            padding: '14px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span style={{ fontWeight: 700, color: '#334155' }}>
                Payload Weight: {totalWeight} / {currentVehicle.payloadCapacityKg} KG ({payloadWeightUtilization}%)
              </span>
              {isOverweight && <span style={{ color: '#DC2626', fontWeight: 800 }}>⚠️ OVERWEIGHT</span>}
            </div>
            <div style={{ height: '8px', backgroundColor: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, payloadWeightUtilization)}%`,
                  height: '100%',
                  backgroundColor: isOverweight ? '#DC2626' : '#10B981',
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span style={{ fontWeight: 700, color: '#334155' }}>
                Carton Volume: {totalCartons} / {currentVehicle.cartonCapacity} Cartons ({cartonVolumeUtilization}%)
              </span>
              {isOverVolume && <span style={{ color: '#DC2626', fontWeight: 800 }}>⚠️ EXCEEDED</span>}
            </div>
            <div style={{ height: '8px', backgroundColor: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, cartonVolumeUtilization)}%`,
                  height: '100%',
                  backgroundColor: isOverVolume ? '#DC2626' : '#0284C7',
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>EXPECTED COD CASH TO RECOVER</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#1e2023' }}>
              PKR {totalCod.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Order Clustering Checklist */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
              Select Candidate Picked Orders for Route Clustering ({CANDIDATE_PICKED_ORDERS.length} Available)
            </div>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              Check orders to include in this sequenced trip manifest.
            </span>
          </div>

          <div style={{ border: '1px solid #E2E8F0', borderRadius: '6px', maxHeight: '240px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0 }}>
                <tr>
                  <th style={{ padding: '8px 12px', width: '35px' }}></th>
                  <th style={{ padding: '8px 12px' }}>Order #</th>
                  <th style={{ padding: '8px 12px' }}>Retailer & Destination Landmark</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Volume</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Weight</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>COD Expected</th>
                </tr>
              </thead>
              <tbody>
                {CANDIDATE_PICKED_ORDERS.map((ord) => {
                  const isChecked = selectedOrderIds.includes(ord.id);
                  return (
                    <tr
                      key={ord.id}
                      onClick={() => toggleOrderSelection(ord.id)}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        cursor: 'pointer',
                        backgroundColor: isChecked ? '#F0FDF4' : '#FFFFFF',
                      }}
                    >
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0F172A' }}>
                        {ord.orderNumber}
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{ord.businessName}</div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                          {ord.deliveryAddress} ({ord.areaLandmark})
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        {ord.totalCartons} ctn, {ord.totalBoxes} box
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600 }}>
                        {ord.totalWeightKg} kg
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: ord.expectedCodAmount > 0 ? '#1e2023' : '#64748B' }}>
                        {ord.expectedCodAmount > 0 ? `PKR ${ord.expectedCodAmount.toLocaleString()}` : 'Credit / Advance'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
};

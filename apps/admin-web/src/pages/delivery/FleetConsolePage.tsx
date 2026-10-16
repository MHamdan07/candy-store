import React, { useState } from 'react';
import { Card, Table, Badge, Button, Input, Dropdown, Alert } from '@candi/ui';
import {
  TripManifest,
  DeliveryVehicle,
  DeliveryDriver,
  BeatRoute,
  TripManifestStatus,
} from '@candi/types';
import {
  INITIAL_TRIP_MANIFESTS,
  INITIAL_FLEET_VEHICLES,
  INITIAL_DELIVERY_DRIVERS,
  INITIAL_BEAT_ROUTES,
  calculateFleetKpis,
} from '../../data/fleetLogisticsData';
import { BeatClusteringModal } from './BeatClusteringModal';
import { TripExecutionDrawer } from './TripExecutionDrawer';
import { PrintableTripManifestModal } from './PrintableTripManifestModal';

export const FleetConsolePage: React.FC = () => {
  const [trips, setTrips] = useState<TripManifest[]>(INITIAL_TRIP_MANIFESTS);
  const [vehicles, setVehicles] = useState<DeliveryVehicle[]>(INITIAL_FLEET_VEHICLES);
  const [drivers, setDrivers] = useState<DeliveryDriver[]>(INITIAL_DELIVERY_DRIVERS);
  const [beatRoutes] = useState<BeatRoute[]>(INITIAL_BEAT_ROUTES);

  const [activeTab, setActiveTab] = useState<'all' | 'in_transit' | 'staged' | 'completed' | 'reconciled' | 'vehicles' | 'routes'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState('ALL');

  // Modals state
  const [isClusteringModalOpen, setIsClusteringModalOpen] = useState(false);
  const [selectedTripForConsole, setSelectedTripForConsole] = useState<TripManifest | null>(null);
  const [selectedTripForPrint, setSelectedTripForPrint] = useState<TripManifest | null>(null);

  // Notification Banner
  const [notification, setNotification] = useState<string | null>(null);

  const kpis = calculateFleetKpis(trips, vehicles);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  // Add new clustered trip
  const handleConfirmNewTrip = (newTrip: TripManifest) => {
    setTrips((prev) => [newTrip, ...prev]);

    // Update vehicle status to loading_dock
    setVehicles((prev) =>
      prev.map((v) => (v.id === newTrip.vehicleId ? { ...v, status: 'loading_dock' } : v))
    );

    setIsClusteringModalOpen(false);
    showNotification(`Trip Manifest ${newTrip.manifestNumber} generated & staged for loading on ${newTrip.beatRouteCode}!`);
  };

  // Update existing trip from drawer
  const handleUpdateTrip = (updatedTrip: TripManifest) => {
    setTrips((prev) => prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
    setSelectedTripForConsole(updatedTrip);

    // If trip completed, update vehicle status
    if (updatedTrip.status === 'completed_delivered') {
      setVehicles((prev) =>
        prev.map((v) => (v.id === updatedTrip.vehicleId ? { ...v, status: 'active_service' } : v))
      );
      showNotification(`Trip ${updatedTrip.manifestNumber} completed! Vehicle returned to depot. Ready for vault handover.`);
    } else if (updatedTrip.status === 'dispatched_in_transit') {
      setVehicles((prev) =>
        prev.map((v) => (v.id === updatedTrip.vehicleId ? { ...v, status: 'in_transit' } : v))
      );
      showNotification(`Trip ${updatedTrip.manifestNumber} dispatched to road! Driver is on route.`);
    } else if (updatedTrip.status === 'reconciled_closed') {
      showNotification(`Trip ${updatedTrip.manifestNumber} successfully reconciled with Cashier Vault. Closed.`);
    }
  };

  // Filter trips
  const filteredTrips = trips.filter((t) => {
    if (activeTab === 'in_transit' && t.status !== 'dispatched_in_transit') return false;
    if (activeTab === 'staged' && t.status !== 'staged_loading') return false;
    if (activeTab === 'completed' && t.status !== 'completed_delivered') return false;
    if (activeTab === 'reconciled' && t.status !== 'reconciled_closed') return false;

    if (zoneFilter !== 'ALL' && t.deliveryZone !== zoneFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = t.manifestNumber.toLowerCase().includes(q);
      const matchBeat = t.beatRouteCode.toLowerCase().includes(q) || t.beatRouteName.toLowerCase().includes(q);
      const matchPlate = t.vehiclePlate.toLowerCase().includes(q);
      const matchDriver = t.driverName.toLowerCase().includes(q);
      if (!matchNum && !matchBeat && !matchPlate && !matchDriver) return false;
    }

    return true;
  });

  const getStatusBadge = (status: TripManifestStatus) => {
    switch (status) {
      case 'dispatched_in_transit':
        return <Badge status="pending" label="In Transit on Road" />;
      case 'staged_loading':
        return <Badge status="overdue" label="Staged at Loading Dock" />;
      case 'completed_delivered':
        return <Badge status="delivered" label="Completed (At Depot)" />;
      case 'reconciled_closed':
        return <Badge status="delivered" label="Reconciled & Closed" />;
      case 'draft_clustering':
        return <Badge status="draft" label="Draft Cluster" />;
      default:
        return <Badge status="draft" label={status} />;
    }
  };

  const tripColumns = [
    {
      header: 'Trip Manifest & Status',
      render: (t: TripManifest) => (
        <div>
          <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '13px' }}>{t.manifestNumber}</div>
          <div style={{ marginTop: '3px' }}>{getStatusBadge(t.status)}</div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
            Departure: {t.actualDepartureTime || t.scheduledDepartureTime}
          </div>
        </div>
      ),
    },
    {
      header: 'Beat Route & Territory',
      render: (t: TripManifest) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>
            <span style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', marginRight: '6px' }}>
              {t.beatRouteCode}
            </span>
            {t.beatRouteName}
          </div>
          <div style={{ fontSize: '11px', color: '#0284C7', fontWeight: 600, marginTop: '2px' }}>
            {t.deliveryZone}
          </div>
        </div>
      ),
    },
    {
      header: 'Vehicle & Driver',
      render: (t: TripManifest) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>
            {t.vehiclePlate} • <span style={{ fontSize: '11px', color: '#475569' }}>{t.vehicleModel.split(' ')[0]}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px' }}>
            Driver: <strong>{t.driverName}</strong>
          </div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>{t.driverPhone}</div>
        </div>
      ),
    },
    {
      header: 'Cargo & Payload Utilization',
      render: (t: TripManifest) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '12px' }}>
            {t.totalCartonsCount} Cartons ({t.totalWeightKg} kg)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <div style={{ width: '80px', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, t.payloadUtilizationPercent)}%`,
                  height: '100%',
                  backgroundColor: t.payloadUtilizationPercent > 90 ? '#DC2626' : '#10B981',
                }}
              />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
              {t.payloadUtilizationPercent}%
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Stops Progress',
      render: (t: TripManifest) => {
        const pct = Math.round((t.completedStopsCount / (t.totalStops || 1)) * 100);
        return (
          <div>
            <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '13px' }}>
              {t.completedStopsCount} / {t.totalStops} Stops
            </div>
            <div style={{ fontSize: '11px', color: pct === 100 ? '#059669' : '#0284C7', fontWeight: 600, marginTop: '2px' }}>
              {pct}% Completed
            </div>
          </div>
        );
      },
    },
    {
      header: 'COD Cash Collection',
      render: (t: TripManifest) => (
        <div>
          <div style={{ fontWeight: 800, color: '#E11D48', fontSize: '13px' }}>
            PKR {t.collectedTotalCod.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>
            / {t.expectedTotalCod.toLocaleString()} expected
          </div>
        </div>
      ),
    },
    {
      header: 'Actions',
      render: (t: TripManifest) => (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setSelectedTripForConsole(t)}
          >
            Live Console
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedTripForPrint(t)}
          >
            Print Manifest
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {notification && (
        <Alert
          type="info"
          title="Fleet Operations Notification"
          onClose={() => setNotification(null)}
        >
          {notification}
        </Alert>
      )}

      {/* KPI Metrics Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
        }}
      >
        <Card padding="md">
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Fleet Vehicles Active
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>
            {kpis.activeVehiclesOnRoad} / {kpis.totalVehiclesCount} on Road
          </div>
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
            {kpis.totalVehiclesCount - kpis.activeVehiclesOnRoad} Ready at Depot
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Active Dispatches In Transit
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0284C7', marginTop: '6px' }}>
            {kpis.inTransitTripsCount} Trips
          </div>
          <div style={{ fontSize: '12px', color: '#0284C7', fontWeight: 600, marginTop: '2px' }}>
            Live GPS telemetry active
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            On-Time Delivery Rate
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', marginTop: '6px' }}>
            {kpis.overallOnTimeDeliveryRate}%
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            Target: &ge; 95% SLA adherence
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            COD Cash Collected Today
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#E11D48', marginTop: '6px' }}>
            PKR {kpis.totalCodCollectedToday.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            Expected: PKR {kpis.totalCodExpectedToday.toLocaleString()}
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Avg Payload Utilization
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>
            {kpis.averagePayloadUtilizationPercent}%
          </div>
          <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 600, marginTop: '2px' }}>
            Optimized route density
          </div>
        </Card>
      </div>

      {/* Filter Tabs and Actions Bar */}
      <Card padding="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeTab === 'all' ? 700 : 500,
                backgroundColor: activeTab === 'all' ? '#0F172A' : '#F1F5F9',
                color: activeTab === 'all' ? '#FFFFFF' : '#475569',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              All Trips ({trips.length})
            </button>

            <button
              onClick={() => setActiveTab('in_transit')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeTab === 'in_transit' ? 700 : 500,
                backgroundColor: activeTab === 'in_transit' ? '#0284C7' : '#F1F5F9',
                color: activeTab === 'in_transit' ? '#FFFFFF' : '#475569',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              In Transit ({trips.filter((t) => t.status === 'dispatched_in_transit').length})
            </button>

            <button
              onClick={() => setActiveTab('staged')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeTab === 'staged' ? 700 : 500,
                backgroundColor: activeTab === 'staged' ? '#D97706' : '#F1F5F9',
                color: activeTab === 'staged' ? '#FFFFFF' : '#475569',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Staged at Dock ({trips.filter((t) => t.status === 'staged_loading').length})
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeTab === 'completed' ? 700 : 500,
                backgroundColor: activeTab === 'completed' ? '#059669' : '#F1F5F9',
                color: activeTab === 'completed' ? '#FFFFFF' : '#475569',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Completed ({trips.filter((t) => t.status === 'completed_delivered').length})
            </button>

            <button
              onClick={() => setActiveTab('reconciled')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeTab === 'reconciled' ? 700 : 500,
                backgroundColor: activeTab === 'reconciled' ? '#6B21A8' : '#F1F5F9',
                color: activeTab === 'reconciled' ? '#FFFFFF' : '#475569',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Reconciled & Closed ({trips.filter((t) => t.status === 'reconciled_closed').length})
            </button>

            <button
              onClick={() => setActiveTab('vehicles')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeTab === 'vehicles' ? 700 : 500,
                backgroundColor: activeTab === 'vehicles' ? '#0F172A' : '#F1F5F9',
                color: activeTab === 'vehicles' ? '#FFFFFF' : '#475569',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Fleet Vehicles ({vehicles.length})
            </button>

            <button
              onClick={() => setActiveTab('routes')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeTab === 'routes' ? 700 : 500,
                backgroundColor: activeTab === 'routes' ? '#0F172A' : '#F1F5F9',
                color: activeTab === 'routes' ? '#FFFFFF' : '#475569',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Beat Routes ({beatRoutes.length})
            </button>
          </div>

          {/* Search, Filter, and "+ Cluster New Beat Trip" Button */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '12px', flex: '1 1 500px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 260px' }}>
                <Input
                  label="Search by Manifest #, Beat Route, Vehicle Plate, or Driver"
                  placeholder="e.g. TRIP-2026-MNF-01, BEAT-N1, KHI-8821, Asif..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={{ width: '220px' }}>
                <Dropdown
                  label="Territory Delivery Zone"
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                  options={[
                    { value: 'ALL', label: 'All Territory Zones' },
                    { value: 'Zone 1 - Nazimabad', label: 'Zone 1 - Nazimabad' },
                    { value: 'Zone 2 - Gulshan', label: 'Zone 2 - Gulshan' },
                    { value: 'Zone 3 - Saddar', label: 'Zone 3 - Saddar' },
                    { value: 'Zone 4 - Korangi', label: 'Zone 4 - Korangi' },
                    { value: 'Zone 5 - Clifton & DHA', label: 'Zone 5 - Clifton & DHA' },
                  ]}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end', flexWrap: 'wrap' }}>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setZoneFilter('ALL');
                  setActiveTab('all');
                }}
              >
                Reset Filters
              </Button>

              <Button
                variant="primary"
                onClick={() => setIsClusteringModalOpen(true)}
              >
                + Cluster New Beat Trip
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* VIEW 1: TRIPS TABLE (Tabs: all, in_transit, staged, completed, reconciled) */}
      {(activeTab === 'all' || activeTab === 'in_transit' || activeTab === 'staged' || activeTab === 'completed' || activeTab === 'reconciled') && (
        <Card padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                Vehicle Trip Manifests Console ({filteredTrips.length} Trips)
              </h2>
              <p style={{ fontSize: '12px', color: '#64748B' }}>
                Real-time last-mile distribution tracking, driver delivery manifests, and cashier COD reconciliation.
              </p>
            </div>
          </div>

          <Table
            columns={tripColumns}
            data={filteredTrips}
            keyExtractor={(t) => t.id}
            emptyMessage="No trip manifests found matching the filter criteria."
          />
        </Card>
      )}

      {/* VIEW 2: FLEET VEHICLES ROSTER */}
      {activeTab === 'vehicles' && (
        <Card padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                Distribution Fleet Vehicles Master ({vehicles.length} Vehicles)
              </h2>
              <p style={{ fontSize: '12px', color: '#64748B' }}>
                Vehicle payload capacities, carton volumetric thresholds, fuel status, and assigned drivers.
              </p>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <tr>
                <th style={{ padding: '10px 12px' }}>Registration Plate</th>
                <th style={{ padding: '10px 12px' }}>Make & Model</th>
                <th style={{ padding: '10px 12px' }}>Vehicle Class</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Payload Capacity</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Carton Volume</th>
                <th style={{ padding: '10px 12px' }}>Assigned Driver</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Fuel Level</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Operational Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0F172A' }}>
                    {v.registrationNumber}
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{v.modelName}</td>
                  <td style={{ padding: '10px 12px', textTransform: 'capitalize', color: '#64748B' }}>
                    {v.vehicleType.replace(/_/g, ' ')}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#0F172A' }}>
                    {v.payloadCapacityKg} kg
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#0284C7' }}>
                    {v.cartonCapacity} cartons
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {v.assignedDriverName ? (
                      <span style={{ fontWeight: 600, color: '#0F172A' }}>{v.assignedDriverName}</span>
                    ) : (
                      <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Unassigned</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '11px' }}>{v.fuelLevelPercent}%</span>
                      <div style={{ width: '40px', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: `${v.fuelLevelPercent}%`, height: '100%', backgroundColor: '#10B981' }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    {v.status === 'in_transit' ? (
                      <Badge status="pending" label="In Transit" />
                    ) : v.status === 'loading_dock' ? (
                      <Badge status="overdue" label="Loading Dock" />
                    ) : v.status === 'active_service' ? (
                      <Badge status="delivered" label="Available" />
                    ) : (
                      <Badge status="draft" label={v.status.replace(/_/g, ' ')} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* VIEW 3: BEAT ROUTE DIRECTORY */}
      {activeTab === 'routes' && (
        <Card padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                Karachi Wholesale Commercial Beat Routes ({beatRoutes.length} Active Beats)
              </h2>
              <p style={{ fontSize: '12px', color: '#64748B' }}>
                Defined delivery corridors, key commercial bazaar hubs, transit times, and vehicle suitability.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {beatRoutes.map((b) => (
              <div
                key={b.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span
                      style={{
                        backgroundColor: '#EFF6FF',
                        color: '#1D4ED8',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      {b.code}
                    </span>
                    <h3 style={{ margin: '6px 0 0 0', fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                      {b.name}
                    </h3>
                  </div>
                  <Badge status="delivered" label="Active Beat" />
                </div>

                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Territory: <strong style={{ color: '#0F172A' }}>{b.zone}</strong>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, marginBottom: '4px' }}>
                    KEY COMMERCIAL HUBS COVERED:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {b.keyCommercialHubs.map((hub, hIdx) => (
                      <span
                        key={hIdx}
                        style={{
                          backgroundColor: '#F1F5F9',
                          color: '#475569',
                          fontSize: '10px',
                          fontWeight: 600,
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {hub}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #F1F5F9',
                    paddingTop: '8px',
                    fontSize: '11px',
                    color: '#475569',
                  }}
                >
                  <span>Avg Orders: <strong>{b.avgDailyOrdersCount}/day</strong></span>
                  <span>Transit: <strong>{b.estimatedTransitMinutes}m</strong></span>
                  <span>Dist: <strong>{b.distanceKm} km</strong></span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* MODAL 1: BEAT ROUTE CLUSTERING MODAL */}
      <BeatClusteringModal
        isOpen={isClusteringModalOpen}
        onClose={() => setIsClusteringModalOpen(false)}
        onConfirmTrip={handleConfirmNewTrip}
      />

      {/* MODAL 2: LIVE TRIP EXECUTION DRAWER */}
      <TripExecutionDrawer
        isOpen={Boolean(selectedTripForConsole)}
        onClose={() => setSelectedTripForConsole(null)}
        trip={selectedTripForConsole}
        onUpdateTrip={handleUpdateTrip}
        onOpenPrintManifest={(t) => {
          setSelectedTripForConsole(null);
          setSelectedTripForPrint(t);
        }}
      />

      {/* MODAL 3: PRINTABLE DRIVER TRIP MANIFEST */}
      <PrintableTripManifestModal
        isOpen={Boolean(selectedTripForPrint)}
        onClose={() => setSelectedTripForPrint(null)}
        trip={selectedTripForPrint}
      />
    </div>
  );
};

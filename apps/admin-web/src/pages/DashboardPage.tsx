import React, { useMemo } from 'react';
import { Card, Button } from '@candi/ui';
import { useNavigate } from 'react-router-dom';
import {
  IconOrders,
  IconVerification,
  IconFleet,
  IconCash,
  IconKhata,
  IconInvoice,
  IconAlert,
  IconGoodsReceipt,
} from '../components/Icons';

// Live Demo Stores
import {
  INITIAL_VERIFICATION_RECORDS,
  calculateVerificationKpis,
} from '../data/conversationalVerification';
import { INITIAL_TRIP_MANIFESTS } from '../data/fleetLogisticsData';
import { INITIAL_CASH_COLLECTIONS } from '../data/cashManagement';
import { CUSTOMERS_DATABASE } from '../data/customers';
import { INITIAL_INVOICES_AGING } from '../data/receivablesData';
import { INITIAL_PRODUCTS_DATA } from '../data/products';
import { INITIAL_GRNS } from '../data/goodsReceipts';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // 1. Orders & 5-Stage Verification KPIs
  const verificationKpis = useMemo(() => {
    return calculateVerificationKpis(INITIAL_VERIFICATION_RECORDS || []);
  }, []);

  const totalOrdersCount = INITIAL_VERIFICATION_RECORDS.length;
  const pendingConfirmationsCount = verificationKpis.totalPendingOrders;
  const pendingConfirmationsValue = verificationKpis.totalPendingValue;

  // 2. Fleet & Trip Manifest KPIs
  const fleetKpis = useMemo(() => {
    const inTransit = INITIAL_TRIP_MANIFESTS.filter((t) => t.status === 'dispatched_in_transit').length;
    const completed = INITIAL_TRIP_MANIFESTS.filter(
      (t) => t.status === 'completed_delivered' || t.status === 'reconciled_closed'
    ).length;
    const totalToday = INITIAL_TRIP_MANIFESTS.length;
    return { inTransit, completed, totalToday };
  }, []);

  // 3. COD Cash Settlement KPIs
  const cashKpis = useMemo(() => {
    const unreconciledCollections = INITIAL_CASH_COLLECTIONS.filter(
      (c) => c.handoverStatus !== 'reconciled'
    );
    const unreconciledAmount = unreconciledCollections.reduce(
      (sum, c) => sum + (c.amountReceived || 0),
      0
    );
    return {
      unreconciledAmount,
      unreconciledCount: unreconciledCollections.length,
    };
  }, []);

  // 4. Khata & Outstanding Receivables KPIs
  const khataKpis = useMemo(() => {
    const totalKhata = CUSTOMERS_DATABASE.reduce(
      (sum, c) => sum + (c.currentBalance || 0),
      0
    );
    const customersWithBalance = CUSTOMERS_DATABASE.filter(
      (c) => (c.currentBalance || 0) > 0
    ).length;
    return { totalKhata, customersWithBalance };
  }, []);

  // 5. Overdue Invoices KPIs
  const invoiceAgingKpis = useMemo(() => {
    const overdueList = INITIAL_INVOICES_AGING.filter(
      (inv) => inv.status === 'overdue' || (inv.daysOverdue || 0) > 0
    );
    const overdueBalance = overdueList.reduce(
      (sum, inv) => sum + (inv.balanceDue || 0),
      0
    );
    return {
      overdueCount: overdueList.length,
      overdueBalance,
    };
  }, []);

  // 6. Inventory Low Stock & Expiry Alerts
  const inventoryAlerts = useMemo(() => {
    const lowStockSkus = INITIAL_PRODUCTS_DATA.filter(
      (p) => p.availableStock <= 50
    );
    const now = new Date();
    const nearExpiryBatches = INITIAL_GRNS.flatMap((grn) => grn.items).filter((item) => {
      if (!item.expiryDate) return false;
      const expiry = new Date(item.expiryDate);
      const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 90 && diffDays > 0;
    });

    return {
      lowStockCount: lowStockSkus.length,
      nearExpiryCount: nearExpiryBatches.length,
      totalAlerts: lowStockSkus.length + nearExpiryBatches.length,
    };
  }, []);

  // 7 Core Blueprint KPIs
  const kpiWidgets = [
    {
      id: 'pending-confirmations',
      label: 'Pending Confirmations',
      value: pendingConfirmationsCount.toString(),
      subtext: pendingConfirmationsValue > 0
        ? `PKR ${pendingConfirmationsValue.toLocaleString()} requiring customer action`
        : 'All orders confirmed',
      icon: <IconVerification size={20} color="#F59E0B" />,
      borderColor: '#F59E0B',
      route: '/orders/verification',
    },
    {
      id: 'verification-stages',
      label: 'Orders by Verification Stage',
      value: `${totalOrdersCount} Orders`,
      subtext: `S1: ${verificationKpis.stage1Count} | S2: ${verificationKpis.stage2Count} | S3: ${verificationKpis.stage3Count} | S4: ${verificationKpis.stage4Count} | S5: ${verificationKpis.stage5Count}`,
      icon: <IconOrders size={20} color="#0284C7" />,
      borderColor: '#0284C7',
      route: '/orders/verification',
    },
    {
      id: 'fleet-in-transit',
      label: 'Deliveries / Trips in Progress',
      value: fleetKpis.inTransit.toString(),
      subtext: `${fleetKpis.completed} completed · ${fleetKpis.totalToday} total trips today`,
      icon: <IconFleet size={20} color="#0D9488" />,
      borderColor: '#0D9488',
      route: '/delivery/fleet-console',
    },
    {
      id: 'cod-cash-reconciliation',
      label: 'COD Cash to Reconcile',
      value: `PKR ${cashKpis.unreconciledAmount.toLocaleString()}`,
      subtext: cashKpis.unreconciledCount > 0
        ? `${cashKpis.unreconciledCount} route collections pending vault deposit`
        : 'Zero variance · All cash settled',
      icon: <IconCash size={20} color="#10B981" />,
      borderColor: '#10B981',
      route: '/cash/reconciliation',
    },
    {
      id: 'outstanding-khata',
      label: 'Outstanding Khata Exposure',
      value: `PKR ${khataKpis.totalKhata.toLocaleString()}`,
      subtext: `Active across ${khataKpis.customersWithBalance} credit accounts`,
      icon: <IconKhata size={20} color="#8B5CF6" />,
      borderColor: '#8B5CF6',
      route: '/receivables/dashboard',
    },
    {
      id: 'overdue-invoices',
      label: 'Overdue Invoices',
      value: invoiceAgingKpis.overdueCount.toString(),
      subtext: invoiceAgingKpis.overdueBalance > 0
        ? `PKR ${invoiceAgingKpis.overdueBalance.toLocaleString()} past credit term`
        : 'No overdue invoices',
      icon: <IconInvoice size={20} color="#EF4444" />,
      borderColor: '#EF4444',
      route: '/receivables/aging',
    },
    {
      id: 'stock-alerts',
      label: 'Low Stock & Expiry Alerts',
      value: `${inventoryAlerts.totalAlerts} Alerts`,
      subtext: `${inventoryAlerts.lowStockCount} SKU(s) below reorder threshold · ${inventoryAlerts.nearExpiryCount} near expiry`,
      icon: <IconAlert size={20} color="#E11D48" />,
      borderColor: '#E11D48',
      route: '/products',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'var(--font-family-base)' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)', margin: 0 }}>
            Operational Control Tower
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted, #64748B)', marginTop: '4px', margin: 0 }}>
            Real-time wholesale fulfillment, 5-stage order verification, route dispatches, and cash settlement.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" size="sm" onClick={() => navigate('/orders/verification')}>
            Verification Queue
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/orders')}>
            New Wholesale Order
          </Button>
        </div>
      </div>

      {/* 7 Core KPI Widgets */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {kpiWidgets.map((kpi) => (
          <Card
            key={kpi.id}
            padding="md"
            style={{
              borderTop: `3px solid ${kpi.borderColor}`,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onClick={() => navigate(kpi.route)}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted, #64748B)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {kpi.label}
                </span>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {kpi.icon}
                </div>
              </div>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 900,
                  color: 'var(--color-text-main, #0F172A)',
                  marginBottom: '6px',
                }}
              >
                {kpi.value}
              </div>
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-text-muted, #64748B)',
                fontWeight: 500,
                borderTop: '1px solid #F1F5F9',
                paddingTop: '8px',
                marginTop: '4px',
              }}
            >
              {kpi.subtext}
            </div>
          </Card>
        ))}
      </div>

      {/* 5-Stage Order Verification Pipeline Live Monitor */}
      <Card padding="lg">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)', margin: 0 }}>
              5-Stage Order Verification Pipeline (Report §2)
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted, #64748B)', marginTop: '4px', margin: 0 }}>
              Automated progression: Ingestion → WhatsApp 2-Way → Telephony Escalation → Warehouse Picking Release → Exception/Cancel.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/orders/verification')}>
            Open Verification Desk →
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {[
            { stage: 'Stage 1', name: 'Order Ingestion', count: verificationKpis.stage1Count, desc: 'Capture & fraud audit', color: '#64748B' },
            { stage: 'Stage 2', name: 'WhatsApp Confirm', count: verificationKpis.stage2Count, desc: 'Interactive button prompt', color: '#0284C7' },
            { stage: 'Stage 3', name: 'Telephony Call', count: verificationKpis.stage3Count, desc: 'Voice desk escalation', color: '#F59E0B' },
            { stage: 'Stage 4', name: 'Release to Pick', count: verificationKpis.stage4Count, desc: 'Warehouse queue release', color: '#10B981' },
            { stage: 'Stage 5', name: 'Exception / Cancel', count: verificationKpis.stage5Count, desc: 'Discrepancy / rejection', color: '#EF4444' },
          ].map((s) => (
            <div
              key={s.stage}
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '12px 14px',
                borderLeft: `4px solid ${s.color}`,
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: s.color, textTransform: 'uppercase' }}>
                {s.stage}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                {s.name}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', marginTop: '6px' }}>
                {s.count}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                {s.desc}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Operational Workflow Drill-downs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        <Card padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <IconFleet size={20} color="#0D9488" />
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)', margin: 0 }}>
              Fleet Manifests & Beat Optimization
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted, #64748B)', marginBottom: '14px', lineHeight: 1.5 }}>
            Dispatch delivery vehicles, track geocoded drop-offs, and monitor real-time POD execution across Karachi wholesale beats.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button size="sm" variant="secondary" onClick={() => navigate('/delivery/fleet-console')}>
              Fleet Console
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/cash/collections')}>
              Cash Collections
            </Button>
          </div>
        </Card>

        <Card padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <IconGoodsReceipt size={20} color="#6366F1" />
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)', margin: 0 }}>
              Goods Receipt & Expiry Auditing (GRN)
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted, #64748B)', marginBottom: '14px', lineHeight: 1.5 }}>
            Log confectionery factory dock arrivals, record manufacturer batch codes, and enforce 90-day expiry quarantines.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button size="sm" variant="secondary" onClick={() => navigate('/procurement/grn')}>
              Log Intake (GRN)
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/products')}>
              Product Master
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

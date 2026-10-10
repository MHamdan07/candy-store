import React, { useState, useMemo } from 'react';
import { Card, Badge, Button, Input, Modal, Alert } from '@candi/ui';
import { INITIAL_CASH_HANDOVERS, INITIAL_CASH_COLLECTIONS } from '../../data/cashManagement';
import { validateHandoverDualConfirmation } from '@candi/validation';
import type { CashHandoverRecord } from '@candi/types';

export const CashHandoverPage: React.FC = () => {
  const [handovers, setHandovers] = useState<CashHandoverRecord[]>(INITIAL_CASH_HANDOVERS);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeHandover, setActiveHandover] = useState<CashHandoverRecord | null>(null);
  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  // New Handover Form State
  const [driverName, setDriverName] = useState<string>('Zubair Shah (Driver Fleet Van #1)');
  const [handoverDate, setHandoverDate] = useState<string>('2026-09-18');
  const [expectedAmount, setExpectedAmount] = useState<number>(48000);
  const [actualTendered, setActualTendered] = useState<number>(48000);
  const [discrepancyReason, setDiscrepancyReason] = useState<string>('');
  const [cashierName, setCashierName] = useState<string>('Farhan Zaidi (Vault Cashier)');
  const [collectorSignature, setCollectorSignature] = useState<boolean>(true);
  const [receiverSignature, setReceiverSignature] = useState<boolean>(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered handovers
  const filtered = useMemo(() => {
    return handovers.filter((h) => {
      const matchStatus = selectedStatus === 'all' || h.status === selectedStatus;
      const q = searchQuery.toLowerCase();
      const matchQ =
        h.handoverNumber.toLowerCase().includes(q) ||
        h.collectorName.toLowerCase().includes(q) ||
        h.receiverName.toLowerCase().includes(q) ||
        (h.discrepancyReason && h.discrepancyReason.toLowerCase().includes(q));
      return matchStatus && matchQ;
    }).sort((a, b) => b.handoverDate.localeCompare(a.handoverDate));
  }, [handovers, selectedStatus, searchQuery]);

  // Aggregate stats
  const stats = useMemo(() => {
    let totalConfirmed = 0;
    let totalDiscrepancies = 0;
    let netVariance = 0;

    handovers.forEach((h) => {
      if (h.status === 'confirmed') totalConfirmed += h.actualCash;
      if (h.difference !== 0) {
        totalDiscrepancies += 1;
        netVariance += h.difference;
      }
    });

    return { totalConfirmed, totalDiscrepancies, netVariance };
  }, [handovers]);

  // Handle Create Handover
  const handleCreateHandover = (e: React.FormEvent) => {
    e.preventDefault();

    const val = validateHandoverDualConfirmation(
      Number(expectedAmount),
      Number(actualTendered),
      collectorSignature,
      receiverSignature,
      discrepancyReason
    );

    if (!val.isConfirmed) {
      setFormError(val.error || 'Dual-party confirmation error.');
      return;
    }

    const difference = Math.round((Number(actualTendered) - Number(expectedAmount)) * 100) / 100;
    const status = difference === 0 ? 'confirmed' : 'discrepancy_flagged';
    const handoverNumber = `HND-2026-00${Math.floor(50 + Math.random() * 50)}`;

    const newHandover: CashHandoverRecord = {
      id: `hnd-${Date.now()}`,
      handoverNumber,
      collectorId: 'staff-driver',
      collectorName: driverName,
      handoverDate,
      expectedCash: Number(expectedAmount),
      actualCash: Number(actualTendered),
      difference,
      receiverId: 'staff-cashier',
      receiverName: cashierName,
      collectionIds: ['col-004', 'col-005'],
      status,
      collectorConfirmedAt: `${handoverDate} ${new Date().toLocaleTimeString().slice(0, 5)}`,
      receiverConfirmedAt: `${handoverDate} ${new Date().toLocaleTimeString().slice(0, 5)}`,
      discrepancyReason: difference !== 0 ? discrepancyReason : undefined,
      notes: difference === 0 ? 'All currency verified and accepted into depot vault.' : 'Shortage flagged.',
      createdAt: `${handoverDate} ${new Date().toLocaleTimeString().slice(0, 5)}`,
    };

    setHandovers((prev) => [newHandover, ...prev]);
    setIsModalOpen(false);
    setFormError(null);
    setAlertNotice(
      `Cash handover ${newHandover.handoverNumber} logged with status: ${newHandover.status.toUpperCase()}.`
    );
  };

  // Sign-off Pending Handover
  const handleConfirmHandover = (handoverId: string) => {
    setHandovers((prev) =>
      prev.map((h) => {
        if (h.id === handoverId) {
          return {
            ...h,
            status: 'confirmed',
            receiverConfirmedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          };
        }
        return h;
      })
    );
    setAlertNotice(`Handover ${handoverId} confirmed by vault cashier.`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success">Dual-Party Confirmed</Badge>;
      case 'discrepancy_flagged':
        return <Badge variant="danger">Discrepancy Flagged</Badge>;
      case 'pending_confirmation':
        return <Badge variant="warning">Awaiting Cashier Sign-off</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-text, #11120D)' }}>
              Cash Handover & Shift Settlement
            </h1>
            <Badge variant="brand">Dual-Party Confirmation Gate</Badge>
          </div>
          <p style={{ margin: '6px 0 0 0', color: 'var(--color-secondary-text, #565449)', fontSize: '14px' }}>
            Enforce mutual sign-off between field delivery drivers and depot vault cashiers. Any difference between expected route cash and physically tendered notes is flagged immediately.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Record Shift Handover
        </Button>
      </div>

      {alertNotice && (
        <Alert type="success">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{alertNotice}</span>
            <button
              onClick={() => setAlertNotice(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        </Alert>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Card style={{ borderLeft: '4px solid #2E7D32', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            Confirmed Handover Inflow
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#2E7D32', marginTop: '4px' }}>
            PKR {stats.totalConfirmed.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#565449', marginTop: '2px' }}>Deposited in depot vault</div>
        </Card>

        <Card style={{ borderLeft: '4px solid #C62828', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            Handover Discrepancies
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#C62828', marginTop: '4px' }}>
            {stats.totalDiscrepancies} Flagged
          </div>
          <div style={{ fontSize: '12px', color: '#565449', marginTop: '2px' }}>
            Net Variance: PKR {stats.netVariance.toLocaleString()}
          </div>
        </Card>

        <Card style={{ borderLeft: '4px solid #11120D', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            Dual-Confirmation Compliance
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#11120D', marginTop: '4px' }}>
            100%
          </div>
          <div style={{ fontSize: '12px', color: '#2E7D32', marginTop: '2px', fontWeight: 600 }}>
            Both Driver & Cashier Signatures
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: 'All Handovers' },
              { key: 'confirmed', label: 'Confirmed (In Vault)' },
              { key: 'discrepancy_flagged', label: 'Discrepancy Flagged' },
              { key: 'pending_confirmation', label: 'Pending Confirmation' },
            ].map((st) => (
              <button
                key={st.key}
                onClick={() => setSelectedStatus(st.key)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: selectedStatus === st.key ? '#11120D' : '#D8CFBC',
                  background: selectedStatus === st.key ? '#11120D' : '#FFFBF4',
                  color: selectedStatus === st.key ? '#FFFBF4' : '#11120D',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div style={{ minWidth: '260px' }}>
            <Input
              placeholder="Search HND-, collector, cashier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Handover List Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#ECE6D9', borderBottom: '1px solid #D8CFBC' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Handover #</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Field Collector</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Vault Receiver</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D', textAlign: 'right' }}>Expected (PKR)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D', textAlign: 'right' }}>Actual Tendered</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D', textAlign: 'right' }}>Difference</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Confirmation Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D', textAlign: 'center' }}>Voucher</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#565449' }}>
                    No cash handovers found matching filter.
                  </td>
                </tr>
              ) : (
                filtered.map((h, idx) => (
                  <tr
                    key={h.id}
                    style={{
                      borderBottom: '1px solid #EFEAE0',
                      background: idx % 2 === 0 ? '#FFFFFF' : '#FAF6EE',
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#1565C0' }}>
                        {h.handoverNumber}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#565449', whiteSpace: 'nowrap' }}>{h.handoverDate}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#11120D' }}>{h.collectorName}</td>
                    <td style={{ padding: '12px 16px', color: '#565449' }}>{h.receiverName}</td>
                    <td
                      style={{
                        padding: '12px 16px',
                        textAlign: 'right',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        color: '#11120D',
                      }}
                    >
                      PKR {h.expectedCash.toLocaleString()}
                    </td>
                    <td
                      style={{
                        padding: '12px 16px',
                        textAlign: 'right',
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        color: '#2E7D32',
                      }}
                    >
                      PKR {h.actualCash.toLocaleString()}
                    </td>
                    <td
                      style={{
                        padding: '12px 16px',
                        textAlign: 'right',
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        color: h.difference === 0 ? '#2E7D32' : '#C62828',
                      }}
                    >
                      {h.difference === 0 ? 'PKR 0' : `PKR ${h.difference.toLocaleString()}`}
                    </td>
                    <td style={{ padding: '12px 16px' }}>{getStatusBadge(h.status)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => setActiveHandover(h)}
                        style={{
                          padding: '4px 8px',
                          background: '#FFFBF4',
                          border: '1px solid #D8CFBC',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          color: '#1565C0',
                        }}
                      >
                        Inspect Proof
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Shift Handover Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setFormError(null);
          }}
          title="Record Shift Cash Handover to Depot Vault"
        >
          <form onSubmit={handleCreateHandover} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {formError && <Alert type="danger">{formError}</Alert>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#11120D' }}>
                  Field Collector / Driver *
                </label>
                <select
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #D8CFBC',
                    background: '#FFFBF4',
                    fontSize: '13px',
                  }}
                >
                  <option value="Zubair Shah (Driver Fleet Van #1)">Zubair Shah (Fleet Van #1 - Route 01)</option>
                  <option value="Asif Nawaz (Driver Fleet Van #3)">Asif Nawaz (Fleet Van #3 - Route 02)</option>
                  <option value="Tariq Mehmood (Field Recovery Lead)">Tariq Mehmood (Recovery Lead)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#11120D' }}>
                  Vault Receiver (Cashier) *
                </label>
                <Input value={cashierName} onChange={(e) => setCashierName(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#11120D' }}>
                  Expected Route Collections (PKR) *
                </label>
                <Input
                  type="number"
                  value={expectedAmount.toString()}
                  onChange={(e) => setExpectedAmount(parseFloat(e.target.value) || 0)}
                  required
                />
                <div style={{ fontSize: '11px', color: '#7E7A6B', marginTop: '2px' }}>
                  Total of receipts RCP-CSH-0084 + RCP-CSH-0085
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#11120D' }}>
                  Actual Cash Notes Tendered (PKR) *
                </label>
                <Input
                  type="number"
                  value={actualTendered.toString()}
                  onChange={(e) => setActualTendered(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>

            {/* Live Difference Badge */}
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: actualTendered - expectedAmount === 0 ? '#2E7D32' : '#C62828',
                background: actualTendered - expectedAmount === 0 ? '#E8F5E9' : '#FFEBEE',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, color: actualTendered - expectedAmount === 0 ? '#2E7D32' : '#C62828' }}>
                {actualTendered - expectedAmount === 0
                  ? '✓ Balanced Handover ($0 Variance)'
                  : `⚠️ Discrepancy: PKR ${(actualTendered - expectedAmount).toLocaleString()}`}
              </span>
              <Badge variant={actualTendered - expectedAmount === 0 ? 'success' : 'danger'}>
                {actualTendered - expectedAmount === 0 ? 'MATCH' : 'FLAGGED'}
              </Badge>
            </div>

            {/* Mandatory explanation if discrepancy */}
            {actualTendered - expectedAmount !== 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#C62828' }}>
                  Mandatory Discrepancy Explanation *
                </label>
                <Input
                  placeholder="Document why actual cash differs from receipts (e.g. damaged note, credit extension)..."
                  value={discrepancyReason}
                  onChange={(e) => setDiscrepancyReason(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Dual Signatures */}
            <div
              style={{
                background: '#FAF6EE',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #D8CFBC',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#11120D' }}>
                Mandatory Dual-Party Authorization
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={collectorSignature}
                  onChange={(e) => setCollectorSignature(e.target.checked)}
                />
                <span>
                  <strong>Collector Acknowledgment:</strong> I confirm physical handover of PKR {actualTendered.toLocaleString()} to depot cashier.
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={receiverSignature}
                  onChange={(e) => setReceiverSignature(e.target.checked)}
                />
                <span>
                  <strong>Cashier Acknowledgment:</strong> I have physically counted and accepted PKR {actualTendered.toLocaleString()} into the central vault.
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setFormError(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={!collectorSignature || !receiverSignature}>
                Confirm & Lock Handover
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Handover Detail Modal */}
      {activeHandover && (
        <Modal
          isOpen={!!activeHandover}
          onClose={() => setActiveHandover(null)}
          title={`Handover Certificate: ${activeHandover.handoverNumber}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, display: 'block' }}>Collector / Driver</span>
                <span style={{ fontWeight: 700, color: '#11120D' }}>{activeHandover.collectorName}</span>
                <span style={{ fontSize: '11px', color: '#2E7D32', display: 'block' }}>
                  ✓ Signed at {activeHandover.collectorConfirmedAt || 'N/A'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, display: 'block' }}>Vault Receiver</span>
                <span style={{ fontWeight: 700, color: '#11120D' }}>{activeHandover.receiverName}</span>
                <span style={{ fontSize: '11px', color: '#2E7D32', display: 'block' }}>
                  ✓ Signed at {activeHandover.receiverConfirmedAt || 'N/A'}
                </span>
              </div>
            </div>

            <div style={{ background: '#FAF6EE', padding: '12px', borderRadius: '6px', border: '1px solid #D8CFBC' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, display: 'block' }}>Expected Cash</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>
                    PKR {activeHandover.expectedCash.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, display: 'block' }}>Actual Tendered</span>
                  <span style={{ fontWeight: 800, color: '#2E7D32', fontFamily: 'monospace' }}>
                    PKR {activeHandover.actualCash.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, display: 'block' }}>Difference</span>
                  <span
                    style={{
                      fontWeight: 800,
                      color: activeHandover.difference === 0 ? '#2E7D32' : '#C62828',
                      fontFamily: 'monospace',
                    }}
                  >
                    PKR {activeHandover.difference.toLocaleString()}
                  </span>
                </div>
              </div>

              {activeHandover.discrepancyReason && (
                <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #D8CFBC', color: '#C62828' }}>
                  <strong>Documented Discrepancy Reason:</strong> {activeHandover.discrepancyReason}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button variant="secondary" onClick={() => window.print()}>
                🖨️ Print Handover Voucher
              </Button>
              <Button variant="primary" onClick={() => setActiveHandover(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

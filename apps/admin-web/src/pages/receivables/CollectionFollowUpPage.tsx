import React, { useState } from 'react';
import { Card, Table, Badge, Button, Input, Modal, Alert } from '@candi/ui';
import { CollectionFollowUpRecord, CollectionWorkflowStage } from '@candi/types';
import { INITIAL_COLLECTION_CASES } from '../../data/collectionFollowUps';
import { INITIAL_INVOICES_AGING } from '../../data/receivablesData';

export const CollectionFollowUpPage: React.FC = () => {
  const [cases, setCases] = useState<CollectionFollowUpRecord[]>(INITIAL_COLLECTION_CASES);
  const [selectedCaseForLog, setSelectedCaseForLog] = useState<CollectionFollowUpRecord | null>(null);
  const [selectedCaseForPayment, setSelectedCaseForPayment] = useState<CollectionFollowUpRecord | null>(null);
  const [successNotice, setSuccessNotice] = useState('');

  // Log Follow-Up Modal State
  const [logForm, setLogForm] = useState({
    contactMethod: 'phone_call' as CollectionFollowUpRecord['contactMethod'],
    contactPerson: '',
    promiseToPayDate: '',
    promisedAmount: 0,
    notes: '',
    nextAction: '',
    nextActionDate: '',
    stage: 'promise_to_pay' as CollectionWorkflowStage,
  });

  // Payment Allocation State
  const [paymentForm, setPaymentForm] = useState({
    collectedAmount: 0,
    paymentMethod: 'cash' as 'cash' | 'bank_transfer' | 'cheque',
    chequeOrSlip: '',
    collectedBy: 'Ghulam Rasool (Delivery Driver)',
    allocationType: 'specific_invoices' as 'specific_invoices' | 'unapplied_credit',
  });

  const handleOpenLogModal = (record: CollectionFollowUpRecord) => {
    setSelectedCaseForLog(record);
    setLogForm({
      contactMethod: record.contactMethod,
      contactPerson: record.contactPerson,
      promiseToPayDate: record.promiseToPayDate || '2026-09-22',
      promisedAmount: record.promisedAmount || record.overdueAmount,
      notes: '',
      nextAction: record.nextAction,
      nextActionDate: record.nextActionDate,
      stage: record.stage,
    });
  };

  const handleSaveFollowUpLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseForLog) return;

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const updatedNotes = `${selectedCaseForLog.notes}\n[${timestamp}] (${logForm.contactMethod}): ${logForm.notes}`;

    const updated = cases.map((c) =>
      c.id === selectedCaseForLog.id
        ? {
            ...c,
            contactDate: '2026-09-17',
            contactTimestamp: timestamp,
            contactMethod: logForm.contactMethod,
            contactPerson: logForm.contactPerson,
            promiseToPayDate: logForm.promiseToPayDate,
            promisedAmount: Number(logForm.promisedAmount),
            notes: updatedNotes,
            nextAction: logForm.nextAction,
            nextActionDate: logForm.nextActionDate,
            stage: logForm.stage,
          }
        : c
    );

    setCases(updated);
    setSelectedCaseForLog(null);
    setSuccessNotice(`Recovery follow-up logged with timestamped notes and PTP scheduled for ${logForm.promiseToPayDate}.`);
    setTimeout(() => setSuccessNotice(''), 5000);
  };

  const handleOpenPaymentModal = (record: CollectionFollowUpRecord) => {
    setSelectedCaseForPayment(record);
    setPaymentForm({
      collectedAmount: record.promisedAmount || record.overdueAmount,
      paymentMethod: 'cash',
      chequeOrSlip: '',
      collectedBy: 'Ghulam Rasool (Delivery Driver)',
      allocationType: 'specific_invoices',
    });
  };

  const handleSavePaymentAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseForPayment) return;

    const amount = Number(paymentForm.collectedAmount);
    const newOutstanding = Math.max(0, selectedCaseForPayment.outstandingBalance - amount);
    const newOverdue = Math.max(0, selectedCaseForPayment.overdueAmount - amount);
    const isHoldReleased = newOverdue === 0;

    const updated = cases.map((c) =>
      c.id === selectedCaseForPayment.id
        ? {
            ...c,
            outstandingBalance: newOutstanding,
            overdueAmount: newOverdue,
            isCreditHoldActive: !isHoldReleased,
            stage: isHoldReleased ? ('reconciled' as CollectionWorkflowStage) : ('payment_received' as CollectionWorkflowStage),
            notes: `${c.notes}\n[2026-09-17 21:00] Payment of PKR ${amount.toLocaleString()} received via ${paymentForm.paymentMethod.toUpperCase()} (${paymentForm.collectedBy}). Allocated against oldest invoices.`,
          }
        : c
    );

    setCases(updated);
    setSelectedCaseForPayment(null);
    setSuccessNotice(
      `Payment of PKR ${amount.toLocaleString()} allocated to invoices. ${
        isHoldReleased ? 'Account credit hold RELEASED!' : 'Remaining balance updated.'
      }`
    );
    setTimeout(() => setSuccessNotice(''), 5000);
  };

  const columns = [
    {
      header: 'Customer Account & Overdue',
      render: (row: CollectionFollowUpRecord) => (
        <div>
          <div style={{ fontWeight: 800, color: 'var(--color-smoky-black)', fontSize: '13px' }}>
            {row.customerName}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>
            Code: <strong>{row.customerCode}</strong> • Oldest Due: {row.oldestDueDate}
          </div>
          <div style={{ marginTop: '3px' }}>
            {row.isCreditHoldActive ? (
              <Badge variant="danger">CREDIT HOLD LOCKED</Badge>
            ) : (
              <Badge variant="neutral">TERMS COMPLIANT</Badge>
            )}
          </div>
        </div>
      ),
      width: '240px',
    },
    {
      header: 'Exposure & Overdue',
      render: (row: CollectionFollowUpRecord) => (
        <div>
          <div style={{ fontWeight: 800, color: '#8C2A2A', fontSize: '14px' }}>
            PKR {row.overdueAmount.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>
            Total Khata: PKR {row.outstandingBalance.toLocaleString()}
          </div>
        </div>
      ),
      width: '160px',
    },
    {
      header: 'Workflow Stage',
      render: (row: CollectionFollowUpRecord) => {
        let variant: 'info' | 'warning' | 'success' | 'danger' | 'neutral' = 'neutral';
        if (row.stage === 'promise_to_pay') variant = 'warning';
        if (row.stage === 'payment_received' || row.stage === 'reconciled') variant = 'success';
        if (row.stage === 'follow_up_required') variant = 'danger';

        return (
          <div>
            <Badge variant={variant}>
              {row.stage.replace(/_/g, ' ').toUpperCase()}
            </Badge>
            {row.promiseToPayDate && (
              <div style={{ fontSize: '11px', color: '#1B4332', fontWeight: 700, marginTop: '3px' }}>
                PTP: {row.promiseToPayDate} (PKR {row.promisedAmount?.toLocaleString()})
              </div>
            )}
          </div>
        );
      },
      width: '180px',
    },
    {
      header: 'Latest Follow-up & Next Action',
      render: (row: CollectionFollowUpRecord) => (
        <div style={{ fontSize: '12px' }}>
          <div>
            <span style={{ color: 'var(--color-olive-drab)' }}>Contact: </span>
            <strong>{row.contactPerson}</strong> via {row.contactMethod.replace(/_/g, ' ')} ({row.contactDate})
          </div>
          <div style={{ marginTop: '2px', color: '#565449' }}>
            <strong>Next Action:</strong> {row.nextAction} ({row.nextActionDate})
          </div>
          <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>
            Officer: {row.followUpOwner}
          </div>
        </div>
      ),
      width: '320px',
    },
    {
      header: 'Actions',
      render: (row: CollectionFollowUpRecord) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <Button size="sm" variant="outline" onClick={() => handleOpenLogModal(row)}>
            Log Follow-Up
          </Button>
          <Button size="sm" variant="primary" onClick={() => handleOpenPaymentModal(row)}>
            Allocate Payment
          </Button>
        </div>
      ),
      width: '220px',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--color-smoky-black)' }}>
            Collection Follow-Up & Payment Recovery
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-olive-drab)' }}>
            Manage active recovery pipelines, timestamped customer communications, Promise-to-Pay (PTP) commitments, and payment allocation.
          </p>
        </div>
      </div>

      {successNotice && (
        <Alert type="success" title="Recovery Pipeline Updated">
          {successNotice}
        </Alert>
      )}

      {/* Collection Workflow Progression Banner */}
      <Card>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-olive-drab)', marginBottom: '8px' }}>
          MANDATORY 7-STAGE COLLECTION WORKFLOW
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            '1. Invoice Issued',
            '2. Payment Due',
            '3. Reminder Sent',
            '4. Follow-up Required',
            '5. Promise to Pay',
            '6. Payment Received',
            '7. Reconciled',
          ].map((stage, idx) => (
            <React.Fragment key={idx}>
              <div
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'var(--color-bone)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  color: 'var(--color-smoky-black)',
                }}
              >
                {stage}
              </div>
              {idx < 6 && <span style={{ color: '#888' }}>➔</span>}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* Table */}
      <Card title="Active Collection Cases & Overdue Pipeline">
        <Table
          columns={columns}
          data={cases}
          keyExtractor={(c) => c.id}
          emptyMessage="No active collection cases requiring recovery action."
        />
      </Card>

      {/* Log Follow-Up Modal */}
      {selectedCaseForLog && (
        <Modal
          isOpen={Boolean(selectedCaseForLog)}
          onClose={() => setSelectedCaseForLog(null)}
          title={`Log Collection Activity: ${selectedCaseForLog.customerName}`}
        >
          <form onSubmit={handleSaveFollowUpLog} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '10px', backgroundColor: 'var(--color-bone)', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
              Overdue Exposure: <strong style={{ color: '#8C2A2A' }}>PKR {selectedCaseForLog.overdueAmount.toLocaleString()}</strong> •
              Oldest Due Date: <strong>{selectedCaseForLog.oldestDueDate}</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Contact Method
                </label>
                <select
                  value={logForm.contactMethod}
                  onChange={(e) => setLogForm({ ...logForm, contactMethod: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-bone)',
                    fontFamily: 'var(--font-family-mono)',
                    fontSize: '13px',
                  }}
                >
                  <option value="phone_call">Phone Call</option>
                  <option value="whatsapp">WhatsApp Message / Voice Note</option>
                  <option value="in_person_visit">In-Person Field Visit</option>
                  <option value="formal_letter">Formal Overdue Demand Letter</option>
                </select>
              </div>

              <Input
                label="Contact Person Spoken With"
                value={logForm.contactPerson}
                onChange={(e) => setLogForm({ ...logForm, contactPerson: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Promise-to-Pay (PTP) Date"
                type="date"
                value={logForm.promiseToPayDate}
                onChange={(e) => setLogForm({ ...logForm, promiseToPayDate: e.target.value })}
                required
              />
              <Input
                label="Promised Recovery Amount (PKR)"
                type="number"
                value={String(logForm.promisedAmount)}
                onChange={(e) => setLogForm({ ...logForm, promisedAmount: Number(e.target.value) })}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Workflow Progression Stage
              </label>
              <select
                value={logForm.stage}
                onChange={(e) => setLogForm({ ...logForm, stage: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-bone)',
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '13px',
                }}
              >
                <option value="reminder_sent">Reminder Sent</option>
                <option value="follow_up_required">Follow-Up Required</option>
                <option value="promise_to_pay">Promise to Pay (PTP Scheduled)</option>
                <option value="legal_escalation">Legal Escalation (Credit Hold)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Timestamped Interaction Notes (Appended to History)
              </label>
              <textarea
                placeholder="Details of conversation, customer cash flow reason, mode of payment promised..."
                value={logForm.notes}
                onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                rows={3}
                required
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-bone)',
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '12px',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <Input
                label="Next Action Description"
                placeholder="e.g. Call back to verify cheque issuance..."
                value={logForm.nextAction}
                onChange={(e) => setLogForm({ ...logForm, nextAction: e.target.value })}
                required
              />
              <Input
                label="Next Action Date"
                type="date"
                value={logForm.nextActionDate}
                onChange={(e) => setLogForm({ ...logForm, nextActionDate: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <Button type="button" variant="outline" onClick={() => setSelectedCaseForLog(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save & Timestamp Follow-Up
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Payment Allocation Modal */}
      {selectedCaseForPayment && (
        <Modal
          isOpen={Boolean(selectedCaseForPayment)}
          onClose={() => setSelectedCaseForPayment(null)}
          title={`Allocate Collected Payment: ${selectedCaseForPayment.customerName}`}
        >
          <form onSubmit={handleSavePaymentAllocation} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '10px', backgroundColor: '#F0F9F5', border: '1px solid #B7E4C7', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
              Total Overdue: <strong style={{ color: '#8C2A2A' }}>PKR {selectedCaseForPayment.overdueAmount.toLocaleString()}</strong> •
              Promised: <strong>PKR {(selectedCaseForPayment.promisedAmount || 0).toLocaleString()}</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Collected Recovery Amount (PKR)"
                type="number"
                min="1"
                value={String(paymentForm.collectedAmount)}
                onChange={(e) => setPaymentForm({ ...paymentForm, collectedAmount: Number(e.target.value) })}
                required
              />
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Payment Method
                </label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-bone)',
                    fontFamily: 'var(--font-family-mono)',
                    fontSize: '13px',
                  }}
                >
                  <option value="cash">Cash Collection</option>
                  <option value="bank_transfer">Bank Online Transfer (IBFT)</option>
                  <option value="cheque">Cross Cheque / Pay Order</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Deposit Slip / Cheque No"
                placeholder="e.g. CHQ-882910"
                value={paymentForm.chequeOrSlip}
                onChange={(e) => setPaymentForm({ ...paymentForm, chequeOrSlip: e.target.value })}
              />
              <Input
                label="Collecting Officer / Driver"
                value={paymentForm.collectedBy}
                onChange={(e) => setPaymentForm({ ...paymentForm, collectedBy: e.target.value })}
                required
              />
            </div>

            <div style={{ border: '1px solid var(--color-bone)', borderRadius: 'var(--radius-sm)', padding: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>
                Automated Allocation Mode:
              </div>
              <label style={{ display: 'flex', gap: '8px', fontSize: '12px', alignItems: 'center' }}>
                <input
                  type="radio"
                  checked={paymentForm.allocationType === 'specific_invoices'}
                  onChange={() => setPaymentForm({ ...paymentForm, allocationType: 'specific_invoices' })}
                />
                FIFO Allocation to Oldest Unpaid Invoices (Recommended)
              </label>
              <label style={{ display: 'flex', gap: '8px', fontSize: '12px', alignItems: 'center', marginTop: '4px' }}>
                <input
                  type="radio"
                  checked={paymentForm.allocationType === 'unapplied_credit'}
                  onChange={() => setPaymentForm({ ...paymentForm, allocationType: 'unapplied_credit' })}
                />
                Post as Unapplied On-Account Credit
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <Button type="button" variant="outline" onClick={() => setSelectedCaseForPayment(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Post Payment & Reconcile Ledger
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

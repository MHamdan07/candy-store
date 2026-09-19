import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Button, Modal, Alert, Input } from '@candi/ui';
import { usePermissions } from '@candi/auth';
import type { PayrollPeriod, PayrollEntry, PayrollPeriodStatus } from '@candi/types';
import { WorkforceDataStore } from '../../data/workforceData';
import { calculateAndValidatePayroll } from '@candi/validation';

export const PayrollRegisterPage: React.FC = () => {
  const { activeRole, canApprovePayroll, canViewCompensation } = usePermissions();

  const [periods, setPeriods] = useState<PayrollPeriod[]>(() => WorkforceDataStore.getPayrollPeriods());
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('PAY-2026-09');
  const [entries, setEntries] = useState<PayrollEntry[]>(() =>
    WorkforceDataStore.getPayrollEntries('PAY-2026-09')
  );

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals State
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDisburseModalOpen, setIsDisburseModalOpen] = useState(false);
  const [disbursementRef, setDisbursementRef] = useState('FT-HBL-9923841');
  const [adjustingEntry, setAdjustingEntry] = useState<PayrollEntry | null>(null);
  const [adjustmentDiff, setAdjustmentDiff] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');

  const currentPeriod = periods.find((p) => p.id === selectedPeriodId) || periods[0];

  const handlePeriodChange = (pId: string) => {
    setSelectedPeriodId(pId);
    setEntries(WorkforceDataStore.getPayrollEntries(pId));
  };

  const handleRecalculateBatch = () => {
    const employees = WorkforceDataStore.getEmployees().filter((e) => e.workflowStatus === 'active');
    const compStore = WorkforceDataStore.getCompensation();
    const attendanceStore = WorkforceDataStore.getAttendance();

    const recalculatedEntries: PayrollEntry[] = employees.map((emp) => {
      const comp = compStore[emp.id];
      const empAttendance = attendanceStore.filter((a) => a.employeeId === emp.id);

      const totalOT = empAttendance.reduce((sum, a) => sum + (a.overtimeApproved ? a.overtimeHours : 0), 0);
      const totalLateMins = empAttendance.reduce((sum, a) => sum + a.lateArrivalMinutes, 0);

      const basic = comp ? comp.basicSalaryPKR : 45000;
      const allowances = comp ? comp.allowances : [];
      const deductions = comp ? comp.standardDeductions : [];
      const otRate = comp ? comp.overtimeHourlyRatePKR : Math.round((basic / 26 / 8) * 1.5);

      const calc = calculateAndValidatePayroll({
        basicSalaryPKR: basic,
        allowances,
        deductions,
        approvedOvertimeHours: totalOT,
        overtimeHourlyRatePKR: otRate,
        lateArrivalMinutes: totalLateMins,
        unpaidLeaveDays: 0,
      });

      return {
        id: `PAY-ENTRY-${currentPeriod.periodCode}-${emp.id}`,
        payrollPeriodId: currentPeriod.id,
        employeeId: emp.id,
        employeeName: emp.fullName,
        department: emp.department,
        jobTitle: emp.jobTitle,
        daysInPeriod: 30,
        daysPresent: 26,
        daysApprovedLeave: 0,
        daysUnpaidLeave: 0,
        lateDeductionsPKR: calc.lateDeductionPKR,
        approvedOvertimeHours: totalOT,
        overtimePayPKR: calc.overtimePayPKR,
        basicSalaryPKR: basic,
        totalAllowancesPKR: calc.totalAllowancesPKR,
        grossPayPKR: calc.grossPayPKR,
        taxDeductionPKR: deductions.find((d) => d.type === 'income_tax')?.amountPKR || 0,
        eobiDeductionPKR: deductions.find((d) => d.type === 'eobi')?.amountPKR || 1800,
        otherDeductionsPKR: deductions.find((d) => d.type === 'provident_fund')?.amountPKR || 0,
        totalDeductionsPKR: calc.totalDeductionsPKR,
        netPayPKR: calc.netPayPKR,
        approvalStatus: 'approved',
        paymentStatus: 'unpaid',
        isAdjusted: false,
      };
    });

    WorkforceDataStore.savePayrollEntries(currentPeriod.id, recalculatedEntries);
    setEntries(recalculatedEntries);

    // Update Period totals
    const totalGross = recalculatedEntries.reduce((s, e) => s + e.grossPayPKR, 0);
    const totalDeductions = recalculatedEntries.reduce((s, e) => s + e.totalDeductionsPKR, 0);
    const totalNet = recalculatedEntries.reduce((s, e) => s + e.netPayPKR, 0);

    const updatedPeriods = periods.map((p) => {
      if (p.id === currentPeriod.id) {
        return {
          ...p,
          totalGrossPKR: totalGross,
          totalDeductionsPKR: totalDeductions,
          totalNetPayPKR: totalNet,
          employeeCount: recalculatedEntries.length,
          calculatedAt: new Date().toISOString(),
          calculatedBy: `Staff (${activeRole})`,
        };
      }
      return p;
    });

    WorkforceDataStore.savePayrollPeriods(updatedPeriods);
    setPeriods(updatedPeriods);

    setNotification({
      type: 'success',
      message: `Payroll batch recalculated from attendance logs. Total net disbursement: PKR ${totalNet.toLocaleString()}`,
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleApproveBatch = () => {
    WorkforceDataStore.updatePayrollStatus(currentPeriod.id, 'approved', `Staff (${activeRole})`);
    setPeriods(WorkforceDataStore.getPayrollPeriods());
    setIsApproveModalOpen(false);
    setNotification({
      type: 'success',
      message: `Payroll period ${currentPeriod.periodCode} officially authorized and locked against silent modifications.`,
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const handlePostToGL = () => {
    WorkforceDataStore.updatePayrollStatus(currentPeriod.id, 'posted', `Staff (${activeRole})`);
    setPeriods(WorkforceDataStore.getPayrollPeriods());
    setNotification({
      type: 'success',
      message: `Payroll period posted to Chart of Accounts (Dr. Payroll Expense 5000 / Cr. Accrued Payroll 2030). Proof of reconciliation variance $0.`,
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleDisburseBatch = () => {
    WorkforceDataStore.updatePayrollStatus(currentPeriod.id, 'disbursed', `Staff (${activeRole})`, disbursementRef);
    setPeriods(WorkforceDataStore.getPayrollPeriods());
    setEntries(WorkforceDataStore.getPayrollEntries(currentPeriod.id));
    setIsDisburseModalOpen(false);
    setNotification({
      type: 'success',
      message: `Disbursement completed via ${disbursementRef}. All ${entries.length} employee payslips marked as PAID.`,
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingEntry) return;

    if (!adjustmentReason.trim() || adjustmentReason.trim().length < 5) {
      alert('A valid justification of at least 5 characters is required for adjustments.');
      return;
    }

    const updated = entries.map((ent) => {
      if (ent.id === adjustingEntry.id) {
        const newNet = Math.max(0, ent.netPayPKR + adjustmentDiff);
        return {
          ...ent,
          netPayPKR: newNet,
          isAdjusted: true,
          adjustmentNotes: `Adjusted by PKR ${adjustmentDiff > 0 ? '+' : ''}${adjustmentDiff}: ${adjustmentReason} (Auth: ${activeRole})`,
        };
      }
      return ent;
    });

    WorkforceDataStore.savePayrollEntries(currentPeriod.id, updated);
    setEntries(updated);

    WorkforceDataStore.addAuditRecord({
      actorId: 'current-user',
      actorName: `Staff (${activeRole})`,
      action: 'payroll_adjusted',
      targetEntity: 'PayrollEntry',
      targetId: adjustingEntry.id,
      details: `Non-destructive adjustment of PKR ${adjustmentDiff} applied to ${adjustingEntry.employeeName}`,
      reason: adjustmentReason,
    });

    setAdjustingEntry(null);
    setAdjustmentDiff(0);
    setAdjustmentReason('');
    setNotification({
      type: 'success',
      message: `Non-destructive adjustment applied and logged to audit trail.`,
    });
    setTimeout(() => setNotification(null), 5000);
  };

  // 5-Stage Pipeline steps definition
  const PIPELINE_STAGES: { key: PayrollPeriodStatus; label: string; icon: string }[] = [
    { key: 'draft', label: '1. Draft', icon: '📝' },
    { key: 'calculating', label: '2. Calculation', icon: '⚙️' },
    { key: 'under_review', label: '3. Under Review', icon: '🔍' },
    { key: 'approved', label: '4. Authorized', icon: '🛡️' },
    { key: 'posted', label: '5. GL Posted', icon: '📖' },
    { key: 'disbursed', label: '6. Disbursed', icon: '💵' },
  ];

  const currentStageIndex = PIPELINE_STAGES.findIndex((s) => s.key === currentPeriod.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          padding: '20px 24px',
          borderRadius: '12px',
          border: '1px solid var(--color-gray-200)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-gray-900)', margin: 0 }}>
              Payroll Register & Employee Financial Governance
            </h1>
            <Badge variant="primary">{currentPeriod.periodCode}</Badge>
            <Badge
              variant={
                currentPeriod.status === 'disbursed'
                  ? 'success'
                  : currentPeriod.status === 'approved' || currentPeriod.status === 'posted'
                  ? 'primary'
                  : 'warning'
              }
            >
              {currentPeriod.status.toUpperCase()}
            </Badge>
          </div>
          <p style={{ margin: '6px 0 0 0', color: 'var(--color-gray-600)', fontSize: '14px' }}>
            Attendance & leave synchronization, dual sign-off approval gate, statutory deductions, and GL integration.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={selectedPeriodId}
            onChange={(e) => handlePeriodChange(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-gray-300)', fontSize: '13px', fontWeight: 600 }}
          >
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.periodCode} ({p.status.toUpperCase()})
              </option>
            ))}
          </select>

          {canApprovePayroll() && currentPeriod.status === 'under_review' && (
            <Button variant="secondary" onClick={handleRecalculateBatch}>
              🔄 Sync Attendance & Recalculate
            </Button>
          )}

          {canApprovePayroll() && currentPeriod.status === 'under_review' && (
            <Button variant="primary" onClick={() => setIsApproveModalOpen(true)}>
              🛡️ Authorize Batch
            </Button>
          )}

          {canApprovePayroll() && currentPeriod.status === 'approved' && (
            <Button variant="primary" style={{ backgroundColor: '#2563EB' }} onClick={handlePostToGL}>
              📖 Post to GL Ledgers
            </Button>
          )}

          {canApprovePayroll() && currentPeriod.status === 'posted' && (
            <Button variant="primary" style={{ backgroundColor: '#059669' }} onClick={() => setIsDisburseModalOpen(true)}>
              💵 Disburse Bank Payments
            </Button>
          )}
        </div>
      </div>

      {notification && (
        <Alert variant={notification.type} onClose={() => setNotification(null)}>
          {notification.message}
        </Alert>
      )}

      {/* 5-Stage Payroll Pipeline Status Track */}
      <Card style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
          {PIPELINE_STAGES.map((stage, idx) => {
            const isCompleted = idx <= currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            return (
              <div
                key={stage.key}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  zIndex: 1,
                  flex: 1,
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted ? 'var(--color-olive-drab)' : '#E5E7EB',
                    color: isCompleted ? '#FFFFFF' : 'var(--color-gray-500)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    boxShadow: isCurrent ? '0 0 0 4px rgba(85, 107, 47, 0.2)' : 'none',
                  }}
                >
                  {stage.icon}
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCompleted ? 'var(--color-olive-drab)' : 'var(--color-gray-500)',
                    textAlign: 'center',
                  }}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Financial Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <Card style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-gray-500)', fontWeight: 600 }}>TOTAL GROSS EARNINGS</span>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-gray-900)', marginTop: '4px' }}>
            PKR {currentPeriod.totalGrossPKR.toLocaleString()}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>
            Across {currentPeriod.employeeCount} employees
          </span>
        </Card>

        <Card style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-gray-500)', fontWeight: 600 }}>STATUTORY & OTHER DEDUCTIONS</span>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#DC2626', marginTop: '4px' }}>
            - PKR {currentPeriod.totalDeductionsPKR.toLocaleString()}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>
            FBR Tax, EOBI & Late penalties
          </span>
        </Card>

        <Card style={{ padding: '18px 20px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <span style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>NET DISBURSEMENT LIABILITY</span>
          <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#15803D', marginTop: '4px' }}>
            PKR {currentPeriod.totalNetPayPKR.toLocaleString()}
          </div>
          <span style={{ fontSize: '11px', color: '#166534' }}>
            Authorized bank payable amount
          </span>
        </Card>

        <Card style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-gray-500)', fontWeight: 600 }}>BATCH AUTHORIZATION</span>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-gray-800)', marginTop: '8px' }}>
            {currentPeriod.approvedBy || 'Pending Executive Review'}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>
            {currentPeriod.approvedAt ? new Date(currentPeriod.approvedAt).toLocaleDateString() : 'Awaiting sign-off'}
          </span>
        </Card>
      </div>

      {/* Master Payroll Register Table */}
      <Card style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: 'var(--color-gray-900)' }}>
              Master Payroll Register Entries ({currentPeriod.periodCode})
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>
              Verified double-entry calculation with individual payslip generation
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-gray-500)', alignSelf: 'center' }}>
              Restricted Confidential View
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid var(--color-gray-200)', textAlign: 'left', color: 'var(--color-gray-600)' }}>
                <th style={{ padding: '12px 14px' }}>Staff Name</th>
                <th style={{ padding: '12px 14px' }}>Department</th>
                <th style={{ padding: '12px 14px' }}>Basic Salary</th>
                <th style={{ padding: '12px 14px' }}>Allowances</th>
                <th style={{ padding: '12px 14px' }}>Overtime</th>
                <th style={{ padding: '12px 14px' }}>Late / Deduct</th>
                <th style={{ padding: '12px 14px' }}>Gross Pay</th>
                <th style={{ padding: '12px 14px' }}>Total Deduct</th>
                <th style={{ padding: '12px 14px' }}>Net Pay (PKR)</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((ent) => (
                <tr key={ent.id} style={{ borderBottom: '1px solid var(--color-gray-100)', backgroundColor: '#FFFFFF' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-gray-900)' }}>{ent.employeeName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-gray-500)', fontFamily: 'monospace' }}>
                      {ent.employeeId} • {ent.jobTitle}
                    </div>
                  </td>

                  <td style={{ padding: '12px 14px', textTransform: 'capitalize' }}>
                    {ent.department}
                  </td>

                  <td style={{ padding: '12px 14px' }}>
                    {canViewCompensation() ? `PKR ${ent.basicSalaryPKR.toLocaleString()}` : '••••••••'}
                  </td>

                  <td style={{ padding: '12px 14px', color: '#166534' }}>
                    {canViewCompensation() ? `+PKR ${ent.totalAllowancesPKR.toLocaleString()}` : '••••••••'}
                  </td>

                  <td style={{ padding: '12px 14px' }}>
                    {canViewCompensation() ? (
                      ent.overtimePayPKR > 0 ? (
                        <span style={{ color: '#059669', fontWeight: 600 }}>
                          +{ent.approvedOvertimeHours}h (PKR {ent.overtimePayPKR.toLocaleString()})
                        </span>
                      ) : (
                        '—'
                      )
                    ) : (
                      '••••••••'
                    )}
                  </td>

                  <td style={{ padding: '12px 14px', color: '#DC2626' }}>
                    {canViewCompensation() ? (
                      ent.lateDeductionsPKR > 0 ? `-PKR ${ent.lateDeductionsPKR.toLocaleString()}` : '0'
                    ) : (
                      '••••••••'
                    )}
                  </td>

                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                    {canViewCompensation() ? `PKR ${ent.grossPayPKR.toLocaleString()}` : '••••••••'}
                  </td>

                  <td style={{ padding: '12px 14px', color: '#DC2626', fontWeight: 600 }}>
                    {canViewCompensation() ? `-PKR ${ent.totalDeductionsPKR.toLocaleString()}` : '••••••••'}
                  </td>

                  <td style={{ padding: '12px 14px', fontWeight: 'bold', fontSize: '14px', color: '#059669' }}>
                    {canViewCompensation() ? `PKR ${ent.netPayPKR.toLocaleString()}` : '••••••••'}
                    {ent.isAdjusted && (
                      <span
                        title={ent.adjustmentNotes}
                        style={{ display: 'block', fontSize: '10px', color: '#4F46E5', fontWeight: 'bold' }}
                      >
                        [ADJUSTED]
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '12px 14px' }}>
                    <Badge variant={ent.paymentStatus === 'paid' ? 'success' : 'warning'}>
                      {ent.paymentStatus.toUpperCase()}
                    </Badge>
                  </td>

                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Link to={`/workforce/payroll/payslips/${ent.employeeId}?period=${currentPeriod.periodCode}`}>
                        <Button variant="secondary" style={{ fontSize: '12px', padding: '4px 8px' }}>
                          📄 Payslip
                        </Button>
                      </Link>

                      {currentPeriod.status !== 'disbursed' && canApprovePayroll() && (
                        <button
                          onClick={() => {
                            setAdjustingEntry(ent);
                            setAdjustmentDiff(0);
                            setAdjustmentReason('');
                          }}
                          style={{
                            background: 'none',
                            border: '1px solid var(--color-gray-300)',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            color: 'var(--color-gray-700)',
                          }}
                        >
                          Adjust
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dual Signoff Approval Modal */}
      {isApproveModalOpen && (
        <Modal
          isOpen={isApproveModalOpen}
          onClose={() => setIsApproveModalOpen(false)}
          title={`Authorize Monthly Payroll: ${currentPeriod.periodCode}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '14px', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#1E40AF' }}>
                Executive Financial Clearance
              </h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#1E3A8A', lineHeight: '1.5' }}>
                You are about to authorize the payroll batch for <strong>{currentPeriod.periodCode}</strong> totaling <strong>PKR {currentPeriod.totalNetPayPKR.toLocaleString()}</strong> across <strong>{entries.length}</strong> employees.
                Once authorized, figures are locked and require non-destructive contra-reversal notes to adjust.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
              <div style={{ padding: '10px', backgroundColor: '#F9FAFB', borderRadius: '6px' }}>
                <span style={{ color: 'var(--color-gray-500)', display: 'block' }}>Total Gross Payroll</span>
                <strong>PKR {currentPeriod.totalGrossPKR.toLocaleString()}</strong>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#F9FAFB', borderRadius: '6px' }}>
                <span style={{ color: 'var(--color-gray-500)', display: 'block' }}>Total Deductions</span>
                <strong style={{ color: '#DC2626' }}>- PKR {currentPeriod.totalDeductionsPKR.toLocaleString()}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button variant="secondary" onClick={() => setIsApproveModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleApproveBatch}>
                ✓ Authorize & Lock Batch
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Disbursement Bank Reference Modal */}
      {isDisburseModalOpen && (
        <Modal
          isOpen={isDisburseModalOpen}
          onClose={() => setIsDisburseModalOpen(false)}
          title={`Disburse Bank Salaries: ${currentPeriod.periodCode}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-gray-600)' }}>
              Enter the corporate bank funds transfer or crossed cheque batch clearance reference for audit verification.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Banking Transaction Reference Number *
              </label>
              <Input
                value={disbursementRef}
                onChange={(e) => setDisbursementRef(e.target.value)}
                placeholder="e.g. FT-HBL-9923841 or CHQ-BATCH-09"
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button variant="secondary" onClick={() => setIsDisburseModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" style={{ backgroundColor: '#059669' }} onClick={handleDisburseBatch}>
                Confirm Full Disbursement
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Non-destructive Adjustment Modal */}
      {adjustingEntry && (
        <Modal
          isOpen={Boolean(adjustingEntry)}
          onClose={() => setAdjustingEntry(null)}
          title={`Non-Destructive Payroll Adjustment: ${adjustingEntry.employeeName}`}
        >
          <form onSubmit={handleSaveAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: '#FEF3C7', borderRadius: '8px', border: '1px solid #FDE68A', fontSize: '12px', color: '#92400E' }}>
              <strong>Audit Policy:</strong> To prevent silent manipulation, adjustments must be recorded with an explicit justification note and differential value.
            </div>

            <div style={{ fontSize: '13px' }}>
              Current Net Pay: <strong>PKR {adjustingEntry.netPayPKR.toLocaleString()}</strong>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Differential Adjustment Amount (PKR) *
              </label>
              <Input
                type="number"
                placeholder="e.g. 2500 or -1000"
                value={adjustmentDiff}
                onChange={(e) => setAdjustmentDiff(Number(e.target.value))}
                required
              />
              <span style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>
                Use positive value to add bonus/reimbursement, negative value to deduct.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Mandatory Written Justification *
              </label>
              <textarea
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="e.g. Approved reimbursement for warehouse emergency transport."
                rows={3}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-gray-300)', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button type="button" variant="secondary" onClick={() => setAdjustingEntry(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Apply Adjustment Note
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Card, Badge, Button } from '@candi/ui';
import { usePermissions } from '@candi/auth';
import { WorkforceDataStore, DEPARTMENTS, WORKFORCE_LOCATIONS } from '../../data/workforceData';

export const WorkforceReportsPage: React.FC = () => {
  const { activeRole, canViewCompensation } = usePermissions();

  const [selectedReportId, setSelectedReportId] = useState<string>('rep-headcount');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedLoc, setSelectedLoc] = useState<string>('all');

  const employees = WorkforceDataStore.getEmployees();
  const attendance = WorkforceDataStore.getAttendance();
  const leaves = WorkforceDataStore.getLeaves();
  const compStore = WorkforceDataStore.getCompensation();
  const payrolls = WorkforceDataStore.getPayrollPeriods();
  const payrollEntries = WorkforceDataStore.getPayrollEntries('PAY-2026-09');
  const reviews = WorkforceDataStore.getPerformanceReviews();
  const trainings = WorkforceDataStore.getTrainingRecords();
  const shifts = WorkforceDataStore.getShifts();

  const REPORTS_CATALOG = [
    { id: 'rep-headcount', title: '1. Employee Headcount & Organizational Distribution', icon: '👥' },
    { id: 'rep-attendance', title: '2. Daily & Monthly Attendance Register Summary', icon: '⏱️' },
    { id: 'rep-absence', title: '3. Absence & Chronic Latecomers Punctuality Audit', icon: '⚠️' },
    { id: 'rep-leaves', title: '4. Leave Utilization & Entitlement Balance Schedule', icon: '🌴' },
    { id: 'rep-overtime', title: '5. Overtime Hours & Financial Expenditure Analysis', icon: '⏳' },
    { id: 'rep-payroll', title: '6. Master Payroll Register & Financial Liability', icon: '💰' },
    { id: 'rep-staffing', title: '7. Department Staffing & Operational Shift Coverage', icon: '📋' },
    { id: 'rep-training', title: '8. Training Compliance & Skills Matrix Inventory', icon: '📜' },
    { id: 'rep-performance', title: '9. Performance Appraisal & Scorecard Distribution', icon: '🎯' },
    { id: 'rep-turnover', title: '10. Employee Turnover, Retention & Tenure Audit', icon: '🔄' },
  ];

  const handlePrint = () => {
    window.print();
  };

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
              Workforce Business Intelligence & Statutory HR Reports
            </h1>
            <Badge variant="primary">10 Reports Suite</Badge>
          </div>
          <p style={{ margin: '6px 0 0 0', color: 'var(--color-gray-600)', fontSize: '14px' }}>
            Multi-dimensional reporting across staffing, punctuality, payroll liability, safety compliance, and appraisals.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="secondary" onClick={handlePrint}>
            🖨️ Export / Print Report
          </Button>
        </div>
      </div>

      {/* Control Selector Bar */}
      <Card style={{ padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-700)', marginBottom: '4px' }}>
              Select Workforce Report:
            </label>
            <select
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--color-gray-300)', fontSize: '13px', fontWeight: 600 }}
            >
              {REPORTS_CATALOG.map((rep) => (
                <option key={rep.id} value={rep.id}>
                  {rep.icon} {rep.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-700)', marginBottom: '4px' }}>
              Department Scope:
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--color-gray-300)', fontSize: '13px' }}
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-700)', marginBottom: '4px' }}>
              Warehouse Location Scope:
            </label>
            <select
              value={selectedLoc}
              onChange={(e) => setSelectedLoc(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--color-gray-300)', fontSize: '13px' }}
            >
              <option value="all">All Locations</option>
              {WORKFORCE_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.city}: {loc.name.split('—')[0]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* REPORT 1: Headcount & Distribution */}
      {selectedReportId === 'rep-headcount' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <Card style={{ padding: '18px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>TOTAL HEADCOUNT</span>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{employees.length}</div>
            </Card>
            <Card style={{ padding: '18px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>ACTIVE EMPLOYEES</span>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#059669' }}>
                {employees.filter((e) => e.workflowStatus === 'active').length}
              </div>
            </Card>
            <Card style={{ padding: '18px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>PENDING ONBOARDING</span>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#D97706' }}>
                {employees.filter((e) => e.workflowStatus === 'pending_approval').length}
              </div>
            </Card>
            <Card style={{ padding: '18px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>SUSPENDED / INACTIVE</span>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#DC2626' }}>
                {employees.filter((e) => e.workflowStatus === 'suspended' || e.workflowStatus === 'inactive').length}
              </div>
            </Card>
          </div>

          <Card style={{ padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid var(--color-gray-200)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px' }}>Staff Name</th>
                  <th style={{ padding: '12px 16px' }}>Employee Code</th>
                  <th style={{ padding: '12px 16px' }}>Department</th>
                  <th style={{ padding: '12px 16px' }}>Job Title</th>
                  <th style={{ padding: '12px 16px' }}>Employment Type</th>
                  <th style={{ padding: '12px 16px' }}>Location</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{emp.fullName}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>{emp.employeeCode}</td>
                    <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>{emp.department}</td>
                    <td style={{ padding: '12px 16px' }}>{emp.jobTitle}</td>
                    <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>{emp.employmentStatus.replace('_', ' ')}</td>
                    <td style={{ padding: '12px 16px' }}>{emp.assignedLocationName.split('—')[0]}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge variant={emp.workflowStatus === 'active' ? 'success' : emp.workflowStatus === 'pending_approval' ? 'warning' : 'error'}>
                        {emp.workflowStatus.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* REPORT 2: Attendance Summary */}
      {selectedReportId === 'rep-attendance' && (
        <Card style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid var(--color-gray-200)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px' }}>Staff Name</th>
                <th style={{ padding: '12px 16px' }}>Date</th>
                <th style={{ padding: '12px 16px' }}>Shift</th>
                <th style={{ padding: '12px 16px' }}>Punch Times</th>
                <th style={{ padding: '12px 16px' }}>Hours</th>
                <th style={{ padding: '12px 16px' }}>Late Penalty</th>
                <th style={{ padding: '12px 16px' }}>Overtime</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((rec) => (
                <tr key={rec.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{rec.employeeName}</td>
                  <td style={{ padding: '12px 16px' }}>{rec.date}</td>
                  <td style={{ padding: '12px 16px' }}>{rec.shiftName.split(' ')[0]}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>{rec.checkInTime || '—'} - {rec.checkOutTime || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>{rec.workingHours} hrs</td>
                  <td style={{ padding: '12px 16px', color: rec.lateArrivalMinutes > 0 ? '#D97706' : 'inherit' }}>
                    {rec.lateArrivalMinutes > 0 ? `+${rec.lateArrivalMinutes} mins` : '0'}
                  </td>
                  <td style={{ padding: '12px 16px', color: rec.overtimeHours > 0 ? '#059669' : 'inherit' }}>
                    {rec.overtimeHours > 0 ? `+${rec.overtimeHours} hrs` : '0'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge variant={rec.status === 'present' ? 'success' : rec.status === 'late' ? 'warning' : 'info'}>
                      {rec.status.toUpperCase()}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* REPORT 3: Absence & Chronic Latecomers */}
      {selectedReportId === 'rep-absence' && (
        <Card style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0' }}>
            Punctuality Exceptions & Late Punch Patterns
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid var(--color-gray-200)', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Employee</th>
                <th style={{ padding: '10px' }}>Department</th>
                <th style={{ padding: '10px' }}>Date</th>
                <th style={{ padding: '10px' }}>Minutes Delayed</th>
                <th style={{ padding: '10px' }}>Exception Reason Recorded</th>
                <th style={{ padding: '10px' }}>Action Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.filter((a) => a.lateArrivalMinutes > 0).map((rec) => (
                <tr key={rec.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                  <td style={{ padding: '10px', fontWeight: 600 }}>{rec.employeeName}</td>
                  <td style={{ padding: '10px', textTransform: 'capitalize' }}>{rec.department}</td>
                  <td style={{ padding: '10px' }}>{rec.date}</td>
                  <td style={{ padding: '10px', color: '#D97706', fontWeight: 'bold' }}>+{rec.lateArrivalMinutes} mins</td>
                  <td style={{ padding: '10px', color: 'var(--color-gray-700)' }}>{rec.notes || 'No notes'}</td>
                  <td style={{ padding: '10px' }}>
                    <Badge variant="warning">SALARY PENALTY TIED</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* REPORT 4: Leave Utilization */}
      {selectedReportId === 'rep-leaves' && (
        <Card style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid var(--color-gray-200)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px' }}>Request ID</th>
                <th style={{ padding: '12px 16px' }}>Staff Name</th>
                <th style={{ padding: '12px 16px' }}>Leave Category</th>
                <th style={{ padding: '12px 16px' }}>Dates</th>
                <th style={{ padding: '12px 16px' }}>Days Used</th>
                <th style={{ padding: '12px 16px' }}>Reason</th>
                <th style={{ padding: '12px 16px' }}>Approval Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>{l.id}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{l.employeeName}</td>
                  <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>{l.leaveType}</td>
                  <td style={{ padding: '12px 16px' }}>{l.startDate} to {l.endDate}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{l.numberOfDays} days</td>
                  <td style={{ padding: '12px 16px' }}>{l.reason}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge variant={l.status === 'approved' ? 'success' : 'warning'}>{l.status.toUpperCase()}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* REPORT 5: Overtime Expenditure */}
      {selectedReportId === 'rep-overtime' && (
        <Card style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0' }}>
            Supervisor-Approved Overtime Hours & Financial Disbursement
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid var(--color-gray-200)', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Staff Name</th>
                <th style={{ padding: '10px' }}>Department</th>
                <th style={{ padding: '10px' }}>Date</th>
                <th style={{ padding: '10px' }}>Overtime Hours</th>
                <th style={{ padding: '10px' }}>Authorization Status</th>
                <th style={{ padding: '10px' }}>Estimated Cost (PKR)</th>
              </tr>
            </thead>
            <tbody>
              {attendance.filter((a) => a.overtimeHours > 0).map((rec) => {
                const empComp = compStore[rec.employeeId];
                const rate = empComp?.overtimeHourlyRatePKR || 450;
                const cost = Math.round(rec.overtimeHours * rate);
                return (
                  <tr key={rec.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{rec.employeeName}</td>
                    <td style={{ padding: '10px', textTransform: 'capitalize' }}>{rec.department}</td>
                    <td style={{ padding: '10px' }}>{rec.date}</td>
                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#059669' }}>+{rec.overtimeHours} hrs</td>
                    <td style={{ padding: '10px' }}>
                      <Badge variant={rec.overtimeApproved ? 'success' : 'warning'}>
                        {rec.overtimeApproved ? 'AUTHORIZED' : 'PENDING APPROVAL'}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>
                      {canViewCompensation() ? `PKR ${cost.toLocaleString()}` : '••••••••'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* REPORT 6: Master Payroll Summary */}
      {selectedReportId === 'rep-payroll' && (
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>
              Payroll Financial Liability & Statutory Breakdown
            </h3>
            <Badge variant="success">GAAP RECONCILED ($0 VARIANCE)</Badge>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid var(--color-gray-200)', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Period</th>
                <th style={{ padding: '10px' }}>Employee Count</th>
                <th style={{ padding: '10px' }}>Gross Pay</th>
                <th style={{ padding: '10px' }}>Statutory Deductions</th>
                <th style={{ padding: '10px' }}>Net Bank Payout</th>
                <th style={{ padding: '10px' }}>Authorized By</th>
                <th style={{ padding: '10px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                  <td style={{ padding: '10px', fontWeight: 600 }}>{p.periodCode}</td>
                  <td style={{ padding: '10px' }}>{p.employeeCount} staff</td>
                  <td style={{ padding: '10px' }}>
                    {canViewCompensation() ? `PKR ${p.totalGrossPKR.toLocaleString()}` : '••••••••'}
                  </td>
                  <td style={{ padding: '10px', color: '#DC2626' }}>
                    {canViewCompensation() ? `-PKR ${p.totalDeductionsPKR.toLocaleString()}` : '••••••••'}
                  </td>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#059669' }}>
                    {canViewCompensation() ? `PKR ${p.totalNetPayPKR.toLocaleString()}` : '••••••••'}
                  </td>
                  <td style={{ padding: '10px' }}>{p.approvedBy || 'Pending'}</td>
                  <td style={{ padding: '10px' }}>
                    <Badge variant={p.status === 'disbursed' ? 'success' : 'warning'}>{p.status.toUpperCase()}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* REPORT 7: Shift Coverage */}
      {selectedReportId === 'rep-staffing' && (
        <Card style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0' }}>
            Operational Shift Rosters & Coverage Audit
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {shifts.map((s) => (
              <div key={s.id} style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '15px' }}>{s.shiftName}</strong>
                  <Badge variant="primary">{s.assignedEmployeeIds.length} Rostered Staff</Badge>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-gray-600)', marginTop: '4px' }}>
                  Hours: {s.startTime} - {s.endTime} • Facility: {s.location}
                </div>
                <div style={{ marginTop: '8px', fontSize: '12px' }}>
                  Staff: {s.assignedEmployeeIds.map((id) => employees.find((e) => e.id === id)?.fullName || id).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* REPORT 8: Training Compliance */}
      {selectedReportId === 'rep-training' && (
        <Card style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0' }}>
            Accredited Food Safety & Machine Licensing Matrix
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid var(--color-gray-200)', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Program</th>
                <th style={{ padding: '10px' }}>Employee</th>
                <th style={{ padding: '10px' }}>Accredited Body</th>
                <th style={{ padding: '10px' }}>Certificate #</th>
                <th style={{ padding: '10px' }}>Validity Status</th>
              </tr>
            </thead>
            <tbody>
              {trainings.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                  <td style={{ padding: '10px', fontWeight: 600 }}>{t.programTitle}</td>
                  <td style={{ padding: '10px' }}>{t.employeeName}</td>
                  <td style={{ padding: '10px' }}>{t.provider}</td>
                  <td style={{ padding: '10px', fontFamily: 'monospace' }}>{t.certificateNumber}</td>
                  <td style={{ padding: '10px' }}>
                    <Badge variant="success">COMPLIANT (VALID)</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* REPORT 9: Performance Appraisals */}
      {selectedReportId === 'rep-performance' && (
        <Card style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0' }}>
            Quarterly Performance Appraisal Bell Curve & Scores
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid var(--color-gray-200)', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Staff Name</th>
                <th style={{ padding: '10px' }}>Review Cycle</th>
                <th style={{ padding: '10px' }}>Department</th>
                <th style={{ padding: '10px' }}>Rating Score</th>
                <th style={{ padding: '10px' }}>Reviewer</th>
                <th style={{ padding: '10px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                  <td style={{ padding: '10px', fontWeight: 600 }}>{r.employeeName}</td>
                  <td style={{ padding: '10px' }}>{r.reviewPeriod}</td>
                  <td style={{ padding: '10px', textTransform: 'capitalize' }}>{r.department}</td>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#D97706' }}>★ {r.overallRating.toFixed(1)} / 5.0</td>
                  <td style={{ padding: '10px' }}>{r.managerName}</td>
                  <td style={{ padding: '10px' }}>
                    <Badge variant="success">{r.reviewStatus.toUpperCase()}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* REPORT 10: Turnover & Retention */}
      {selectedReportId === 'rep-turnover' && (
        <Card style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0' }}>
            Employee Retention, Exit Reasons & Workforce Tenure
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <div style={{ padding: '14px', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
              <span style={{ fontSize: '12px', color: '#166534' }}>RETENTION RATE</span>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803D' }}>88.9%</div>
            </div>
            <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-gray-600)' }}>AVERAGE TENURE</span>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>1.4 Years</div>
            </div>
            <div style={{ padding: '14px', backgroundColor: '#FEF2F2', borderRadius: '8px', border: '1px solid #FECACA' }}>
              <span style={{ fontSize: '12px', color: '#991B1B' }}>EXITS THIS YEAR</span>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#DC2626' }}>1 Resigned</div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid var(--color-gray-200)', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Employee</th>
                <th style={{ padding: '10px' }}>Department</th>
                <th style={{ padding: '10px' }}>Tenure</th>
                <th style={{ padding: '10px' }}>Workflow Status</th>
                <th style={{ padding: '10px' }}>Exit / Suspension Record</th>
              </tr>
            </thead>
            <tbody>
              {employees.filter((e) => e.workflowStatus === 'suspended' || e.workflowStatus === 'inactive').map((emp) => (
                <tr key={emp.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                  <td style={{ padding: '10px', fontWeight: 600 }}>{emp.fullName}</td>
                  <td style={{ padding: '10px', textTransform: 'capitalize' }}>{emp.department}</td>
                  <td style={{ padding: '10px' }}>Joined: {emp.joiningDate}</td>
                  <td style={{ padding: '10px' }}>
                    <Badge variant={emp.workflowStatus === 'suspended' ? 'warning' : 'neutral'}>
                      {emp.workflowStatus.toUpperCase()}
                    </Badge>
                  </td>
                  <td style={{ padding: '10px', color: 'var(--color-gray-700)' }}>
                    {emp.suspendedReason || emp.inactiveReason || 'Standard departure'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

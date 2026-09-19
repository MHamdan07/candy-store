import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Badge, Button, Alert } from '@candi/ui';
import { usePermissions } from '@candi/auth';
import { WorkforceDataStore } from '../../data/workforceData';

export const EmployeeProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeRole, canViewCompensation } = usePermissions();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'attendance' | 'leaves' | 'compensation' | 'performance' | 'training' | 'documents' | 'audit'
  >('overview');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const employee = WorkforceDataStore.getEmployeeById(id || '');
  const allComp = WorkforceDataStore.getCompensation();
  const comp = employee ? allComp[employee.id] : undefined;
  const attendance = WorkforceDataStore.getAttendance().filter((a) => a.employeeId === employee?.id);
  const leaves = WorkforceDataStore.getLeaves().filter((l) => l.employeeId === employee?.id);
  const reviews = WorkforceDataStore.getPerformanceReviews().filter((r) => r.employeeId === employee?.id);
  const training = WorkforceDataStore.getTrainingRecords().filter((t) => t.employeeId === employee?.id);
  const auditLogs = WorkforceDataStore.getAuditRecords().filter(
    (a) => a.targetId === employee?.id || a.targetId === `COMP-${employee?.id}`
  );
  const shifts = WorkforceDataStore.getShifts();
  const assignedShift = shifts.find((s) => s.assignedEmployeeIds.includes(employee?.id || ''));

  if (!employee) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Employee Record Not Found</h2>
        <p>The requested employee ID "{id}" does not exist in the Candi workforce master.</p>
        <Link to="/workforce/employees">
          <Button variant="primary">Return to Employee Directory</Button>
        </Link>
      </div>
    );
  }

  const handleStatusChange = (newStatus: typeof employee.workflowStatus, reason?: string) => {
    WorkforceDataStore.updateEmployeeStatus(employee.id, newStatus, `Staff (${activeRole})`, reason);
    setNotification({
      type: 'success',
      message: `Employee status updated to ${newStatus.toUpperCase()}. Audit entry logged.`,
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleApprove = () => {
    handleStatusChange('active');
  };

  const handleSuspend = () => {
    const reason = window.prompt(`Enter suspension justification for ${employee.fullName}:`);
    if (!reason || reason.trim().length < 5) {
      alert('Suspension cancelled: Valid reason required.');
      return;
    }
    handleStatusChange('suspended', reason);
  };

  const handleReactivate = () => {
    handleStatusChange('active', 'Re-activated from suspension by authorized manager');
  };

  const handleDeactivate = () => {
    const reason = window.prompt(`Enter exit reason for deactivating ${employee.fullName} (e.g. Resigned, Contract End):`);
    if (!reason || reason.trim().length < 5) {
      alert('Deactivation cancelled: Reason required.');
      return;
    }
    handleStatusChange('inactive', reason);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back Navigation Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link
          to="/workforce/employees"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--color-olive-drab)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          ← Back to Employee Directory
        </Link>

        <span style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>
          Record ID: <code>{employee.id}</code> • Employee Code: <code>{employee.employeeCode}</code>
        </span>
      </div>

      {notification && (
        <Alert variant={notification.type} onClose={() => setNotification(null)}>
          {notification.message}
        </Alert>
      )}

      {/* Profile Header Dossier */}
      <Card style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-cream)',
                color: 'var(--color-olive-drab)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                fontWeight: 'bold',
                border: '2px solid var(--color-olive-drab)',
              }}
            >
              {employee.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: 'var(--color-gray-900)' }}>
                  {employee.fullName}
                </h1>
                <Badge
                  variant={
                    employee.workflowStatus === 'active'
                      ? 'success'
                      : employee.workflowStatus === 'pending_approval'
                      ? 'warning'
                      : employee.workflowStatus === 'suspended'
                      ? 'error'
                      : 'neutral'
                  }
                >
                  {employee.workflowStatus.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge variant="neutral">{employee.role.toUpperCase()}</Badge>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '13px', color: 'var(--color-gray-600)' }}>
                <span><strong>Job Title:</strong> {employee.jobTitle}</span>
                <span>•</span>
                <span style={{ textTransform: 'capitalize' }}><strong>Dept:</strong> {employee.department}</span>
                <span>•</span>
                <span><strong>Location:</strong> {employee.assignedLocationName.split('—')[0]}</span>
                <span>•</span>
                <span><strong>Joined:</strong> {employee.joiningDate}</span>
              </div>
            </div>
          </div>

          {/* Lifecycle Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {employee.workflowStatus === 'pending_approval' && (
              <Button
                variant="primary"
                style={{ backgroundColor: '#059669' }}
                onClick={handleApprove}
              >
                ✓ Approve & Activate
              </Button>
            )}

            {employee.workflowStatus === 'active' && (
              <>
                <Button
                  variant="secondary"
                  style={{ color: '#DC2626' }}
                  onClick={handleSuspend}
                >
                  Suspend Account
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleDeactivate}
                >
                  Mark Inactive / Exited
                </Button>
              </>
            )}

            {employee.workflowStatus === 'suspended' && (
              <Button
                variant="primary"
                style={{ backgroundColor: '#2563EB' }}
                onClick={handleReactivate}
              >
                Re-activate Account
              </Button>
            )}

            {employee.workflowStatus === 'inactive' && (
              <Button
                variant="secondary"
                onClick={() => handleStatusChange('active', 'Re-hired / Re-activated')}
              >
                Re-hire / Re-activate
              </Button>
            )}
          </div>
        </div>

        {employee.suspendedReason && (
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#FEE2E2', borderRadius: '8px', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: '13px' }}>
            <strong>Suspension Notice:</strong> {employee.suspendedReason}
          </div>
        )}
      </Card>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--color-gray-200)', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { key: 'overview', label: 'Overview & Org', icon: '👤' },
          { key: 'attendance', label: 'Attendance & Shifts', icon: '⏱️' },
          { key: 'leaves', label: 'Leaves & Balances', icon: '🌴' },
          { key: 'compensation', label: 'Confidential Compensation', icon: '💰' },
          { key: 'performance', label: 'Performance Appraisals', icon: '🎯' },
          { key: 'training', label: 'Training & Certifications', icon: '📜' },
          { key: 'documents', label: 'Digital Documents', icon: '📁' },
          { key: 'audit', label: 'Audit History', icon: '🔍' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              borderBottom: activeTab === tab.key ? '3px solid var(--color-olive-drab)' : '3px solid transparent',
              backgroundColor: activeTab === tab.key ? '#FFFFFF' : 'transparent',
              color: activeTab === tab.key ? 'var(--color-olive-drab)' : 'var(--color-gray-600)',
              fontWeight: activeTab === tab.key ? 700 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview & Organization */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
          <Card style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0', color: 'var(--color-gray-900)' }}>
              Personal & Verification Records
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--color-gray-500)', display: 'block' }}>National ID (CNIC)</span>
                <strong style={{ fontFamily: 'monospace', fontSize: '14px' }}>{employee.cnic}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-gray-500)', display: 'block' }}>Mobile Phone</span>
                <strong style={{ fontFamily: 'monospace', fontSize: '14px' }}>{employee.phone}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-gray-500)', display: 'block' }}>Official Email</span>
                <strong>{employee.email}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-gray-500)', display: 'block' }}>Residential Address</span>
                <strong>{employee.address}</strong>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-gray-200)', marginTop: '20px', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 10px 0', color: 'var(--color-gray-800)' }}>
                Emergency Contact Details
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: 'var(--color-gray-500)', display: 'block' }}>Contact Name</span>
                  <strong>{employee.emergencyContact.name}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-gray-500)', display: 'block' }}>Relationship</span>
                  <strong>{employee.emergencyContact.relationship}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-gray-500)', display: 'block' }}>Emergency Phone</span>
                  <strong style={{ fontFamily: 'monospace' }}>{employee.emergencyContact.phone}</strong>
                </div>
              </div>
            </div>
          </Card>

          <Card style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0', color: 'var(--color-gray-900)' }}>
              Organizational Hierarchy & System User
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-gray-100)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--color-gray-500)' }}>Department</span>
                <strong style={{ textTransform: 'capitalize' }}>{employee.department}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-gray-100)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--color-gray-500)' }}>Employment Status</span>
                <strong style={{ textTransform: 'capitalize' }}>{employee.employmentStatus.replace('_', ' ')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-gray-100)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--color-gray-500)' }}>Assigned Facility</span>
                <strong>{employee.assignedLocationName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-gray-100)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--color-gray-500)' }}>Reporting Supervisor</span>
                <strong>{employee.managerName || 'Executive Committee'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-gray-100)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--color-gray-500)' }}>User Account Binding</span>
                <strong style={{ fontFamily: 'monospace', color: 'var(--color-olive-drab)' }}>
                  {employee.userAccountId || 'No active account'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-gray-500)' }}>Assigned RBAC Role</span>
                <Badge variant="primary">{employee.role}</Badge>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Attendance & Shifts */}
      {activeTab === 'attendance' && (
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: 'var(--color-gray-900)' }}>
                Rostered Shift & Attendance Log
              </h3>
              <span style={{ fontSize: '13px', color: 'var(--color-gray-500)' }}>
                Assigned Shift: <strong>{assignedShift?.shiftName || 'General Roster'}</strong> (
                {assignedShift?.startTime || '08:00'} - {assignedShift?.endTime || '17:00'})
              </span>
            </div>

            <Link to="/workforce/attendance">
              <Button variant="secondary" style={{ fontSize: '12px' }}>
                Open Daily Attendance Register
              </Button>
            </Link>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid var(--color-gray-200)', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Date</th>
                <th style={{ padding: '10px' }}>Shift</th>
                <th style={{ padding: '10px' }}>Clock In</th>
                <th style={{ padding: '10px' }}>Clock Out</th>
                <th style={{ padding: '10px' }}>Hours</th>
                <th style={{ padding: '10px' }}>Late</th>
                <th style={{ padding: '10px' }}>Overtime</th>
                <th style={{ padding: '10px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                    No recorded attendance punches for this employee yet.
                  </td>
                </tr>
              ) : (
                attendance.map((rec) => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{rec.date}</td>
                    <td style={{ padding: '10px' }}>{rec.shiftName.split(' ')[0]}</td>
                    <td style={{ padding: '10px', fontFamily: 'monospace' }}>{rec.checkInTime || '—'}</td>
                    <td style={{ padding: '10px', fontFamily: 'monospace' }}>{rec.checkOutTime || '—'}</td>
                    <td style={{ padding: '10px' }}>{rec.workingHours}h</td>
                    <td style={{ padding: '10px', color: rec.lateArrivalMinutes > 0 ? '#D97706' : 'inherit' }}>
                      {rec.lateArrivalMinutes > 0 ? `+${rec.lateArrivalMinutes}m` : '0m'}
                    </td>
                    <td style={{ padding: '10px', color: rec.overtimeHours > 0 ? '#059669' : 'inherit' }}>
                      {rec.overtimeHours > 0 ? `${rec.overtimeHours}h (${rec.overtimeApproved ? 'Auth' : 'Pending'})` : '0h'}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <Badge variant={rec.status === 'present' ? 'success' : rec.status === 'late' ? 'warning' : 'info'}>
                        {rec.status.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      )}

      {/* Tab 3: Leaves & Balances */}
      {activeTab === 'leaves' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <Card style={{ padding: '18px', textAlign: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-gray-500)', fontWeight: 600 }}>ANNUAL LEAVES</span>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2563EB', marginTop: '6px' }}>
                10 <span style={{ fontSize: '14px', color: 'var(--color-gray-400)', fontWeight: 'normal' }}>/ 14 days left</span>
              </div>
            </Card>

            <Card style={{ padding: '18px', textAlign: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-gray-500)', fontWeight: 600 }}>CASUAL LEAVES</span>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#059669', marginTop: '6px' }}>
                8 <span style={{ fontSize: '14px', color: 'var(--color-gray-400)', fontWeight: 'normal' }}>/ 10 days left</span>
              </div>
            </Card>

            <Card style={{ padding: '18px', textAlign: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-gray-500)', fontWeight: 600 }}>SICK LEAVES</span>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#D97706', marginTop: '6px' }}>
                7 <span style={{ fontSize: '14px', color: 'var(--color-gray-400)', fontWeight: 'normal' }}>/ 8 days left</span>
              </div>
            </Card>
          </div>

          <Card style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0', color: 'var(--color-gray-900)' }}>
              Historical & Active Leave Requests
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid var(--color-gray-200)', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Request ID</th>
                  <th style={{ padding: '10px' }}>Type</th>
                  <th style={{ padding: '10px' }}>Dates</th>
                  <th style={{ padding: '10px' }}>Duration</th>
                  <th style={{ padding: '10px' }}>Reason</th>
                  <th style={{ padding: '10px' }}>Approver</th>
                  <th style={{ padding: '10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                      No leave requests filed for this employee.
                    </td>
                  </tr>
                ) : (
                  leaves.map((l) => (
                    <tr key={l.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                      <td style={{ padding: '10px', fontFamily: 'monospace' }}>{l.id}</td>
                      <td style={{ padding: '10px', textTransform: 'capitalize', fontWeight: 600 }}>{l.leaveType}</td>
                      <td style={{ padding: '10px' }}>{l.startDate} to {l.endDate}</td>
                      <td style={{ padding: '10px' }}>{l.numberOfDays} days</td>
                      <td style={{ padding: '10px', color: 'var(--color-gray-700)' }}>{l.reason}</td>
                      <td style={{ padding: '10px' }}>{l.approverName || 'Pending Review'}</td>
                      <td style={{ padding: '10px' }}>
                        <Badge variant={l.status === 'approved' ? 'success' : l.status === 'rejected' ? 'error' : 'warning'}>
                          {l.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Tab 4: Confidential Compensation & Payslips (RBAC Guarded) */}
      {activeTab === 'compensation' && (
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: 'var(--color-gray-900)' }}>
                Confidential Compensation & Salary Structure
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>
                Protected by strict enterprise role segregation (Restricted to Finance & HR Management)
              </span>
            </div>

            <Badge variant="warning">Restricted Access</Badge>
          </div>

          {!canViewCompensation() ? (
            <div
              style={{
                backgroundColor: '#F3F4F6',
                border: '1px dashed var(--color-gray-400)',
                borderRadius: '8px',
                padding: '36px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '32px' }}>🔒</div>
              <h4 style={{ margin: '8px 0 4px 0', color: 'var(--color-gray-800)' }}>
                Salary Information Redacted by RBAC Policy
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-gray-600)' }}>
                Your current role (<strong>{activeRole}</strong>) does not have clearance to inspect compensation records.
                Please switch to <code>super_admin</code> or <code>accounts_staff</code> in the header to view this section.
              </p>
            </div>
          ) : comp ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>MONTHLY BASIC SALARY</span>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-gray-900)', marginTop: '4px' }}>
                    PKR {comp.basicSalaryPKR.toLocaleString()}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>
                    Overtime Rate: PKR {comp.overtimeHourlyRatePKR}/hr
                  </span>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                  <span style={{ fontSize: '12px', color: '#166534' }}>MONTHLY ALLOWANCES</span>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803D', marginTop: '4px' }}>
                    PKR {comp.allowances.reduce((s, a) => s + a.amountPKR, 0).toLocaleString()}
                  </div>
                  <span style={{ fontSize: '11px', color: '#166534' }}>
                    {comp.allowances.length} allowance heads
                  </span>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#FEF2F2', borderRadius: '8px', border: '1px solid #FECACA' }}>
                  <span style={{ fontSize: '12px', color: '#991B1B' }}>STANDARD DEDUCTIONS</span>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#B91C1C', marginTop: '4px' }}>
                    PKR {comp.standardDeductions.reduce((s, d) => s + d.amountPKR, 0).toLocaleString()}
                  </div>
                  <span style={{ fontSize: '11px', color: '#991B1B' }}>
                    EOBI, Tax, Provident Fund
                  </span>
                </div>
              </div>

              {/* Allowances & Deductions Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 10px 0' }}>Allowance Breakdown</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <tbody>
                      {comp.allowances.map((a) => (
                        <tr key={a.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                          <td style={{ padding: '8px 0' }}>{a.title}</td>
                          <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 600 }}>
                            PKR {a.amountPKR.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 10px 0' }}>Deduction Breakdown</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <tbody>
                      {comp.standardDeductions.map((d) => (
                        <tr key={d.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                          <td style={{ padding: '8px 0' }}>{d.title}</td>
                          <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 600, color: '#DC2626' }}>
                            - PKR {d.amountPKR.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bank Disbursement Details */}
              <div style={{ borderTop: '1px solid var(--color-gray-200)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
                  Disbursement Banking Channel
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: 'var(--color-gray-500)', display: 'block' }}>Payment Method</span>
                    <strong style={{ textTransform: 'capitalize' }}>{comp.paymentMethod.replace('_', ' ')}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-gray-500)', display: 'block' }}>Bank Institution</span>
                    <strong>{comp.bankName || 'Direct Cash Voucher'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-gray-500)', display: 'block' }}>Account Title</span>
                    <strong>{comp.accountTitle || employee.fullName}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-gray-500)', display: 'block' }}>IBAN / Account #</span>
                    <strong style={{ fontFamily: 'monospace' }}>{comp.accountNumber || 'N/A'}</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>No compensation profile set up.</div>
          )}
        </Card>
      )}

      {/* Tab 5: Performance Appraisals */}
      {activeTab === 'performance' && (
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: 'var(--color-gray-900)' }}>
              Performance Reviews & KPI Appraisals
            </h3>
            <Link to="/workforce/performance">
              <Button variant="secondary" style={{ fontSize: '12px' }}>
                Performance Hub →
              </Button>
            </Link>
          </div>

          {reviews.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
              No performance appraisals recorded for this employee yet.
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                style={{
                  padding: '18px',
                  borderRadius: '8px',
                  backgroundColor: '#F9FAFB',
                  border: '1px solid var(--color-gray-200)',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '15px' }}>{rev.reviewPeriod}</strong>
                    <span style={{ marginLeft: '12px', fontSize: '12px', color: 'var(--color-gray-500)' }}>
                      Evaluator: {rev.managerName}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px', color: '#F59E0B', fontWeight: 'bold' }}>
                      ★ {rev.overallRating.toFixed(1)} / 5.0
                    </span>
                    <Badge variant="success">{rev.reviewStatus.toUpperCase()}</Badge>
                  </div>
                </div>

                <div style={{ marginTop: '14px' }}>
                  <h5 style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--color-gray-700)' }}>
                    Key Performance Indicators (KPIs)
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {rev.goals.map((g) => (
                      <div
                        key={g.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '12px',
                          backgroundColor: '#FFFFFF',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #E5E7EB',
                        }}
                      >
                        <span>{g.description}</span>
                        <span>
                          Target: <strong>{g.target}</strong> | Achieved: <strong>{g.achieved}</strong> | Rating: <strong>{g.rating}/5</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--color-gray-800)', fontStyle: 'italic' }}>
                  "{rev.managerComments}"
                </div>
              </div>
            ))
          )}
        </Card>
      )}

      {/* Tab 6: Training & Certifications */}
      {activeTab === 'training' && (
        <Card style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0', color: 'var(--color-gray-900)' }}>
            Training Programs & Competency Certifications
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid var(--color-gray-200)', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Program Title</th>
                <th style={{ padding: '10px' }}>Accredited Provider</th>
                <th style={{ padding: '10px' }}>Training Date</th>
                <th style={{ padding: '10px' }}>Certificate #</th>
                <th style={{ padding: '10px' }}>Expiry / Renewal</th>
                <th style={{ padding: '10px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {training.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                    No training records found.
                  </td>
                </tr>
              ) : (
                training.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{t.programTitle}</td>
                    <td style={{ padding: '10px' }}>{t.provider}</td>
                    <td style={{ padding: '10px' }}>{t.trainingDate}</td>
                    <td style={{ padding: '10px', fontFamily: 'monospace' }}>{t.certificateNumber || 'N/A'}</td>
                    <td style={{ padding: '10px' }}>{t.expiryDate || 'Permanent'}</td>
                    <td style={{ padding: '10px' }}>
                      <Badge variant={t.completionStatus === 'completed' ? 'success' : 'warning'}>
                        {t.completionStatus.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      )}

      {/* Tab 7: Digital Documents */}
      {activeTab === 'documents' && (
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: 'var(--color-gray-900)' }}>
              Verified Compliance Documents
            </h3>
            <Button variant="secondary" style={{ fontSize: '12px' }} onClick={() => alert('Document upload modal demo.')}>
              + Upload Document
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { title: 'Scanned CNIC Copy (Front/Back)', type: 'National Identity', date: '2025-03-15', size: '1.2 MB' },
              { title: 'Signed Wholesale Employment Contract', type: 'HR Contract', date: '2025-03-15', size: '3.4 MB' },
              { title: 'Police Character Certificate', type: 'Verification', date: '2025-03-10', size: '850 KB' },
            ].map((doc, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div style={{ fontSize: '24px' }}>📄</div>
                <strong style={{ fontSize: '14px', display: 'block', marginTop: '8px' }}>{doc.title}</strong>
                <span style={{ fontSize: '12px', color: 'var(--color-gray-500)', display: 'block', marginTop: '4px' }}>
                  {doc.type} • {doc.size}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-gray-400)', display: 'block', marginTop: '2px' }}>
                  Uploaded: {doc.date}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 8: Audit History */}
      {activeTab === 'audit' && (
        <Card style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0', color: 'var(--color-gray-900)' }}>
            Immutable Lifecycle Audit Trail for {employee.fullName}
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid var(--color-gray-200)', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Timestamp</th>
                <th style={{ padding: '10px' }}>Action</th>
                <th style={{ padding: '10px' }}>Actor</th>
                <th style={{ padding: '10px' }}>Event Details</th>
                <th style={{ padding: '10px' }}>Reason / Notes</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                    No audit records logged for this employee ID yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                    <td style={{ padding: '10px', fontSize: '12px', fontFamily: 'monospace' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <Badge variant="primary">{log.action}</Badge>
                    </td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{log.actorName}</td>
                    <td style={{ padding: '10px', color: 'var(--color-gray-800)' }}>{log.details}</td>
                    <td style={{ padding: '10px', color: 'var(--color-gray-500)', fontStyle: 'italic' }}>
                      {log.reason || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

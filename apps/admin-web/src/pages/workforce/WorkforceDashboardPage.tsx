import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Button } from '@candi/ui';
import { usePermissions } from '@candi/auth';
import { WorkforceDataStore } from '../../data/workforceData';

export const WorkforceDashboardPage: React.FC = () => {
  const { activeRole, canApproveLeave, canApprovePayroll } = usePermissions();

  const employees = WorkforceDataStore.getEmployees();
  const shifts = WorkforceDataStore.getShifts();
  const attendance = WorkforceDataStore.getAttendance();
  const leaves = WorkforceDataStore.getLeaves();
  const payrolls = WorkforceDataStore.getPayrollPeriods();

  // Metrics calculations
  const activeEmployees = employees.filter((e) => e.workflowStatus === 'active');
  const pendingApprovalEmployees = employees.filter((e) => e.workflowStatus === 'pending_approval');
  const suspendedEmployees = employees.filter((e) => e.workflowStatus === 'suspended');

  const presentToday = attendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const lateToday = attendance.filter((a) => a.status === 'late').length;
  const leaveToday = attendance.filter((a) => a.status === 'leave').length;
  const absentToday = Math.max(0, activeEmployees.length - presentToday - leaveToday);

  const pendingLeaves = leaves.filter((l) => l.status === 'manager_review');
  const pendingOvertime = attendance.filter((a) => a.overtimeHours > 0 && !a.overtimeApproved);
  const currentPayroll = payrolls.find((p) => p.id === 'PAY-2026-09');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner & Quick Context */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          padding: '20px 24px',
          borderRadius: '12px',
          border: '1px solid var(--color-gray-200)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-gray-900)', margin: 0 }}>
              Workforce Command & Operational Control
            </h1>
            <Badge variant="primary">Phase 5 Live</Badge>
            <span
              style={{
                fontSize: '12px',
                padding: '4px 10px',
                backgroundColor: 'var(--color-cream)',
                borderRadius: '16px',
                color: 'var(--color-olive-drab)',
                fontWeight: 600,
                border: '1px solid var(--color-olive-drab)',
              }}
            >
              Role: {activeRole}
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', color: 'var(--color-gray-600)', fontSize: '14px' }}>
            Real-time workforce deployment across central warehouse, field distribution fleets, and financial administration.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/workforce/employees">
            <Button variant="primary">👥 Employee Directory</Button>
          </Link>
          <Link to="/workforce/attendance">
            <Button variant="secondary">⏱️ Attendance Punch</Button>
          </Link>
          <Link to="/workforce/payroll">
            <Button variant="secondary">💰 Payroll Hub</Button>
          </Link>
        </div>
      </div>

      {/* Action Alerts / Pending Review Callouts */}
      {(pendingApprovalEmployees.length > 0 || pendingLeaves.length > 0 || pendingOvertime.length > 0) && (
        <div
          style={{
            backgroundColor: '#FEF3C7',
            border: '1px solid #F59E0B',
            borderRadius: '10px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '22px' }}>⚠️</span>
            <div>
              <strong style={{ color: '#92400E', fontSize: '15px' }}>
                Operational Approvals Requiring Authorization:
              </strong>
              <div style={{ color: '#B45309', fontSize: '13px', marginTop: '2px', display: 'flex', gap: '16px' }}>
                {pendingApprovalEmployees.length > 0 && (
                  <span>• <strong>{pendingApprovalEmployees.length}</strong> new employee onboarding profiles awaiting activation</span>
                )}
                {pendingLeaves.length > 0 && (
                  <span>• <strong>{pendingLeaves.length}</strong> pending leave applications awaiting review</span>
                )}
                {pendingOvertime.length > 0 && (
                  <span>• <strong>{pendingOvertime.length}</strong> overtime punch logs awaiting manager signoff</span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {pendingApprovalEmployees.length > 0 && (
              <Link to="/workforce/employees">
                <Button variant="primary" style={{ fontSize: '12px', padding: '6px 12px' }}>
                  Review Onboarding ({pendingApprovalEmployees.length})
                </Button>
              </Link>
            )}
            {pendingLeaves.length > 0 && (
              <Link to="/workforce/leaves">
                <Button variant="secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
                  Review Leaves ({pendingLeaves.length})
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Primary KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
        <Card style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '13px', color: 'var(--color-gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                Active Workforce
              </span>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-gray-900)', marginTop: '4px' }}>
                {activeEmployees.length}
                <span style={{ fontSize: '14px', color: 'var(--color-gray-500)', fontWeight: 'normal', marginLeft: '6px' }}>
                  / {employees.length} total
                </span>
              </div>
            </div>
            <div style={{ backgroundColor: '#E0F2FE', padding: '10px', borderRadius: '10px', fontSize: '20px' }}>
              👥
            </div>
          </div>
          <div style={{ marginTop: '14px', fontSize: '12px', color: 'var(--color-gray-600)', display: 'flex', gap: '8px' }}>
            <span style={{ color: '#059669', fontWeight: 600 }}>{activeEmployees.length} Active</span>
            <span>•</span>
            <span style={{ color: '#D97706', fontWeight: 600 }}>{pendingApprovalEmployees.length} Pending</span>
            <span>•</span>
            <span style={{ color: '#DC2626', fontWeight: 600 }}>{suspendedEmployees.length} Suspended</span>
          </div>
        </Card>

        <Card style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '13px', color: 'var(--color-gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                Present Today
              </span>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#059669', marginTop: '4px' }}>
                {presentToday}
                <span style={{ fontSize: '14px', color: 'var(--color-gray-500)', fontWeight: 'normal', marginLeft: '6px' }}>
                  on duty
                </span>
              </div>
            </div>
            <div style={{ backgroundColor: '#D1FAE5', padding: '10px', borderRadius: '10px', fontSize: '20px' }}>
              ✅
            </div>
          </div>
          <div style={{ marginTop: '14px', fontSize: '12px', color: 'var(--color-gray-600)', display: 'flex', gap: '8px' }}>
            <span style={{ color: '#D97706' }}>{lateToday} Late Punches</span>
            <span>•</span>
            <span style={{ color: '#2563EB' }}>{leaveToday} Approved Leave</span>
            <span>•</span>
            <span style={{ color: '#DC2626' }}>{absentToday} Absent</span>
          </div>
        </Card>

        <Card style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '13px', color: 'var(--color-gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                Overtime Duty
              </span>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#B45309', marginTop: '4px' }}>
                {attendance.reduce((sum, a) => sum + (a.overtimeApproved ? a.overtimeHours : 0), 0).toFixed(1)}
                <span style={{ fontSize: '14px', color: 'var(--color-gray-500)', fontWeight: 'normal', marginLeft: '6px' }}>
                  hours auth
                </span>
              </div>
            </div>
            <div style={{ backgroundColor: '#FEF3C7', padding: '10px', borderRadius: '10px', fontSize: '20px' }}>
              ⏳
            </div>
          </div>
          <div style={{ marginTop: '14px', fontSize: '12px', color: 'var(--color-gray-600)' }}>
            {pendingOvertime.length > 0 ? (
              <span style={{ color: '#D97706', fontWeight: 600 }}>{pendingOvertime.length} punch records awaiting authorization</span>
            ) : (
              <span style={{ color: '#059669' }}>All logged overtime authorized</span>
            )}
          </div>
        </Card>

        <Card style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '13px', color: 'var(--color-gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                Payroll Pipeline
              </span>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--color-gray-900)', marginTop: '8px' }}>
                {currentPayroll ? currentPayroll.periodCode : 'SEP-2026'}
              </div>
            </div>
            <div style={{ backgroundColor: '#EDE9FE', padding: '10px', borderRadius: '10px', fontSize: '20px' }}>
              💵
            </div>
          </div>
          <div style={{ marginTop: '14px', fontSize: '12px', color: 'var(--color-gray-600)' }}>
            <Badge variant="warning">{currentPayroll?.status?.toUpperCase() || 'CALCULATED'}</Badge>
            <span style={{ marginLeft: '8px', color: 'var(--color-gray-700)', fontWeight: 600 }}>
              PKR {currentPayroll?.totalNetPayPKR.toLocaleString()}
            </span>
          </div>
        </Card>
      </div>

      {/* Middle Section: Shift Rosters & Live Attendance Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '20px' }}>
        {/* Active Shift Coverage */}
        <Card style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: 'var(--color-gray-900)' }}>
              Operational Shift Coverage
            </h2>
            <Link to="/workforce/shifts" style={{ fontSize: '13px', color: 'var(--color-olive-drab)', fontWeight: 600 }}>
              View Rosters →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {shifts.map((s) => {
              const assignedCount = s.assignedEmployeeIds.length;
              return (
                <div
                  key={s.id}
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    backgroundColor: '#F9FAFB',
                    border: '1px solid var(--color-gray-200)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-gray-900)' }}>
                      {s.shiftName}
                    </span>
                    <Badge variant={s.status === 'active' ? 'success' : 'neutral'}>{s.status}</Badge>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-gray-500)', marginTop: '4px' }}>
                    ⏰ {s.startTime} - {s.endTime} ({s.breakDurationMinutes}m break) • {s.location}
                  </div>
                  <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-gray-600)' }}>
                      Assigned: <strong>{assignedCount} staff</strong>
                    </div>
                    <div
                      style={{
                        height: '6px',
                        width: '120px',
                        backgroundColor: '#E5E7EB',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, (assignedCount / 4) * 100)}%`,
                          backgroundColor: assignedCount >= 3 ? '#059669' : '#F59E0B',
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Today's Attendance Real-time Register */}
        <Card style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: 'var(--color-gray-900)' }}>
                Today's Daily Attendance Punch Register
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>Date: 2026-09-19 (Live Warehouse Logs)</span>
            </div>
            <Link to="/workforce/attendance" style={{ fontSize: '13px', color: 'var(--color-olive-drab)', fontWeight: 600 }}>
              Full Log & Overrides →
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-gray-200)', textAlign: 'left', color: 'var(--color-gray-600)' }}>
                  <th style={{ padding: '10px 8px' }}>Staff Member</th>
                  <th style={{ padding: '10px 8px' }}>Shift</th>
                  <th style={{ padding: '10px 8px' }}>Clock In</th>
                  <th style={{ padding: '10px 8px' }}>Clock Out</th>
                  <th style={{ padding: '10px 8px' }}>Late / OT</th>
                  <th style={{ padding: '10px 8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((rec) => (
                  <tr key={rec.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--color-gray-900)' }}>
                      {rec.employeeName}
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-gray-500)', textTransform: 'capitalize' }}>
                        {rec.department}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', color: 'var(--color-gray-600)' }}>
                      {rec.shiftName.split(' ')[0]}
                    </td>
                    <td style={{ padding: '12px 8px', fontFamily: 'monospace' }}>
                      {rec.checkInTime || '—'}
                    </td>
                    <td style={{ padding: '12px 8px', fontFamily: 'monospace' }}>
                      {rec.checkOutTime || '—'}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      {rec.lateArrivalMinutes > 0 && (
                        <span style={{ color: '#D97706', fontSize: '11px', fontWeight: 600, display: 'block' }}>
                          +{rec.lateArrivalMinutes}m late
                        </span>
                      )}
                      {rec.overtimeHours > 0 && (
                        <span style={{ color: '#059669', fontSize: '11px', fontWeight: 600, display: 'block' }}>
                          +{rec.overtimeHours}h OT ({rec.overtimeApproved ? 'Auth' : 'Pending'})
                        </span>
                      )}
                      {rec.lateArrivalMinutes === 0 && rec.overtimeHours === 0 && (
                        <span style={{ color: 'var(--color-gray-400)', fontSize: '11px' }}>On Schedule</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <Badge
                        variant={
                          rec.status === 'present'
                            ? 'success'
                            : rec.status === 'late'
                            ? 'warning'
                            : rec.status === 'leave'
                            ? 'info'
                            : 'error'
                        }
                      >
                        {rec.status.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Bottom Grid: Department Distribution & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <Card style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 12px 0', color: 'var(--color-gray-900)' }}>
            Workforce by Department
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { name: 'Warehouse & Logistics', count: employees.filter((e) => e.department === 'warehouse').length, color: '#3B82F6' },
              { name: 'Wholesale Sales', count: employees.filter((e) => e.department === 'sales').length, color: '#10B981' },
              { name: 'Finance & Accounts', count: employees.filter((e) => e.department === 'finance').length, color: '#8B5CF6' },
              { name: 'Fleet Delivery', count: employees.filter((e) => e.department === 'delivery').length, color: '#F59E0B' },
              { name: 'Operations & HR Admin', count: employees.filter((e) => e.department === 'administration').length, color: '#6B7280' },
            ].map((d) => (
              <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-gray-700)' }}>{d.name}</span>
                <span style={{ fontWeight: 'bold', color: d.color }}>{d.count} staff</span>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 12px 0', color: 'var(--color-gray-900)' }}>
            Governance & Controls Summary
          </h3>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--color-gray-600)', lineHeight: '1.7' }}>
            <li>2-Tier Maker-Checker onboarding active</li>
            <li>Self-leave approval blocked by policy</li>
            <li>Manual attendance edits mandate written reason</li>
            <li>Salary figures masked for unauthorized roles</li>
            <li>Double-entry GL tied to closed period guards</li>
          </ul>
        </Card>

        <Card style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 12px 0', color: 'var(--color-gray-900)' }}>
            Workforce Management Shortcuts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link to="/workforce/reports" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '10px 12px', backgroundColor: '#F3F4F6', borderRadius: '6px', fontSize: '13px', color: 'var(--color-gray-800)', fontWeight: 500 }}>
                📊 10 Statutory & Management HR Reports
              </div>
            </Link>
            <Link to="/workforce/performance" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '10px 12px', backgroundColor: '#F3F4F6', borderRadius: '6px', fontSize: '13px', color: 'var(--color-gray-800)', fontWeight: 500 }}>
                🎯 Performance Appraisals & Goal Tracking
              </div>
            </Link>
            <Link to="/workforce/training" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '10px 12px', backgroundColor: '#F3F4F6', borderRadius: '6px', fontSize: '13px', color: 'var(--color-gray-800)', fontWeight: 500 }}>
                📜 Food Safety & Reach-Truck Certifications
              </div>
            </Link>
            <Link to="/admin/roles" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '10px 12px', backgroundColor: '#F3F4F6', borderRadius: '6px', fontSize: '13px', color: 'var(--color-gray-800)', fontWeight: 500 }}>
                🛡️ 10-Module RBAC Matrix & Role Switcher
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

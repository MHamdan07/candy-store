import React from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Card, Button, Badge } from '@candi/ui';
import { usePermissions } from '@candi/auth';
import { WorkforceDataStore } from '../../data/workforceData';

export const PayslipViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const periodCode = searchParams.get('period') || 'SEP-2026';
  const { canViewCompensation } = usePermissions();

  const employee = WorkforceDataStore.getEmployeeById(id || '');
  const periods = WorkforceDataStore.getPayrollPeriods();
  const period = periods.find((p) => p.periodCode === periodCode) || periods[0];
  const entries = WorkforceDataStore.getPayrollEntries(period.id);
  const entry = entries.find((e) => e.employeeId === id) || entries[0];
  const comp = employee ? WorkforceDataStore.getCompensation()[employee.id] : undefined;

  if (!employee || !entry) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Payslip Not Found</h2>
        <p>No payslip record matching employee "{id}" and period "{periodCode}".</p>
        <Link to="/workforce/payroll">
          <Button variant="primary">Return to Payroll Register</Button>
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link
          to="/workforce/payroll"
          style={{ color: 'var(--color-olive-drab)', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}
        >
          ← Back to Payroll Register
        </Link>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="secondary" onClick={handlePrint}>
            🖨️ Print / Download PDF
          </Button>
        </div>
      </div>

      {!canViewCompensation() && (
        <div style={{ padding: '16px', backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '8px', color: '#92400E', fontSize: '13px' }}>
          <strong>Notice:</strong> You are viewing this document in restricted clearance mode. Sensitive financial values are masked.
        </div>
      )}

      {/* Official Printable Payslip Container */}
      <Card
        style={{
          padding: '40px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          border: '2px solid var(--color-gray-200)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header Branding */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--color-olive-drab)', paddingBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-olive-drab)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '18px',
                }}
              >
                C
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0, color: 'var(--color-gray-900)' }}>
                Candi Super Store Platform
              </h2>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--color-gray-500)', display: 'block', marginTop: '4px' }}>
              Wholesale Confectionery, FMCG Logistics & Central Distribution Network
            </span>
            <span style={{ fontSize: '11px', color: 'var(--color-gray-500)', display: 'block' }}>
              NTN: 8941290-7 • Sales Tax Registration: STRN-32009841
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'var(--color-olive-drab)',
                textTransform: 'uppercase',
                display: 'block',
              }}
            >
              SALARY PAYSLIP
            </span>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-gray-900)', marginTop: '4px' }}>
              {period.periodCode}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-gray-500)', display: 'block' }}>
              Period: {period.startDate} to {period.endDate}
            </span>
            <Badge variant={entry.paymentStatus === 'paid' ? 'success' : 'warning'} style={{ marginTop: '6px' }}>
              STATUS: {entry.paymentStatus.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Employee & Bank Info Matrix */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            backgroundColor: '#F9FAFB',
            padding: '16px',
            borderRadius: '8px',
            margin: '20px 0',
            fontSize: '12px',
          }}
        >
          <div>
            <span style={{ color: 'var(--color-gray-500)', display: 'block' }}>Employee Name</span>
            <strong style={{ fontSize: '13px', color: 'var(--color-gray-900)' }}>{employee.fullName}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-gray-500)', display: 'block' }}>Employee Code / ID</span>
            <strong style={{ fontFamily: 'monospace' }}>{employee.employeeCode} ({employee.id})</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-gray-500)', display: 'block' }}>Department</span>
            <strong style={{ textTransform: 'capitalize' }}>{employee.department}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-gray-500)', display: 'block' }}>Job Title</span>
            <strong>{employee.jobTitle}</strong>
          </div>

          <div>
            <span style={{ color: 'var(--color-gray-500)', display: 'block' }}>CNIC (National ID)</span>
            <strong style={{ fontFamily: 'monospace' }}>{employee.cnic}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-gray-500)', display: 'block' }}>Disbursement Bank</span>
            <strong>{comp?.bankName || 'Direct Cash'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-gray-500)', display: 'block' }}>Account / IBAN</span>
            <strong style={{ fontFamily: 'monospace' }}>{comp?.accountNumber || '—'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-gray-500)', display: 'block' }}>Payment Transaction Ref</span>
            <strong style={{ fontFamily: 'monospace', color: 'var(--color-olive-drab)' }}>
              {entry.paymentReference || 'FT-HBL-9923841'}
            </strong>
          </div>
        </div>

        {/* Attendance Summary Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            border: '1px solid var(--color-gray-200)',
            borderRadius: '6px',
            padding: '10px 16px',
            marginBottom: '20px',
            fontSize: '12px',
            color: 'var(--color-gray-700)',
          }}
        >
          <span>Calendar Days: <strong>{entry.daysInPeriod}</strong></span>
          <span>Worked Days: <strong>{entry.daysPresent}</strong></span>
          <span>Paid Leaves: <strong>{entry.daysApprovedLeave}</strong></span>
          <span>Unpaid Absences: <strong>{entry.daysUnpaidLeave}</strong></span>
          <span>Overtime Auth: <strong>{entry.approvedOvertimeHours} hrs</strong></span>
        </div>

        {/* Earnings & Deductions Tables */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', fontSize: '13px' }}>
          {/* Earnings */}
          <div>
            <div
              style={{
                backgroundColor: 'var(--color-cream)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontWeight: 'bold',
                color: 'var(--color-olive-drab)',
                marginBottom: '10px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>EARNINGS & ALLOWANCES</span>
              <span>AMOUNT (PKR)</span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                  <td style={{ padding: '8px 0' }}>Basic Salary</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 600 }}>
                    {canViewCompensation() ? entry.basicSalaryPKR.toLocaleString() : '••••••••'}
                  </td>
                </tr>
                {comp?.allowances.map((al) => (
                  <tr key={al.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                    <td style={{ padding: '8px 0', color: 'var(--color-gray-700)' }}>{al.title}</td>
                    <td style={{ padding: '8px 0', textAlign: 'right' }}>
                      {canViewCompensation() ? al.amountPKR.toLocaleString() : '••••••••'}
                    </td>
                  </tr>
                ))}
                {entry.overtimePayPKR > 0 && (
                  <tr style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                    <td style={{ padding: '8px 0', color: '#059669' }}>
                      Overtime Pay ({entry.approvedOvertimeHours}h)
                    </td>
                    <td style={{ padding: '8px 0', textAlign: 'right', color: '#059669', fontWeight: 600 }}>
                      {canViewCompensation() ? entry.overtimePayPKR.toLocaleString() : '••••••••'}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--color-gray-300)', fontWeight: 'bold' }}>
                  <td style={{ padding: '10px 0' }}>Total Gross Earnings</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', fontSize: '15px' }}>
                    {canViewCompensation() ? `PKR ${entry.grossPayPKR.toLocaleString()}` : '••••••••'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Deductions */}
          <div>
            <div
              style={{
                backgroundColor: '#FEE2E2',
                padding: '8px 12px',
                borderRadius: '6px',
                fontWeight: 'bold',
                color: '#991B1B',
                marginBottom: '10px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>DEDUCTIONS & TAX</span>
              <span>AMOUNT (PKR)</span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                  <td style={{ padding: '8px 0' }}>EOBI Statutory Contribution</td>
                  <td style={{ padding: '8px 0', textAlign: 'right' }}>
                    {canViewCompensation() ? entry.eobiDeductionPKR.toLocaleString() : '••••••••'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                  <td style={{ padding: '8px 0' }}>Income Tax Withholding (FBR)</td>
                  <td style={{ padding: '8px 0', textAlign: 'right' }}>
                    {canViewCompensation() ? entry.taxDeductionPKR.toLocaleString() : '••••••••'}
                  </td>
                </tr>
                {entry.lateDeductionsPKR > 0 && (
                  <tr style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                    <td style={{ padding: '8px 0', color: '#DC2626' }}>Late Arrival Penalty</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', color: '#DC2626' }}>
                      {canViewCompensation() ? entry.lateDeductionsPKR.toLocaleString() : '••••••••'}
                    </td>
                  </tr>
                )}
                {entry.otherDeductionsPKR > 0 && (
                  <tr style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                    <td style={{ padding: '8px 0' }}>Provident Fund</td>
                    <td style={{ padding: '8px 0', textAlign: 'right' }}>
                      {canViewCompensation() ? entry.otherDeductionsPKR.toLocaleString() : '••••••••'}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--color-gray-300)', fontWeight: 'bold' }}>
                  <td style={{ padding: '10px 0' }}>Total Deductions</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', fontSize: '15px', color: '#DC2626' }}>
                    {canViewCompensation() ? `-PKR ${entry.totalDeductionsPKR.toLocaleString()}` : '••••••••'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Net Take-Home Pay Banner */}
        <div
          style={{
            backgroundColor: '#F0FDF4',
            border: '2px solid #BBF7D0',
            borderRadius: '10px',
            padding: '20px',
            marginTop: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: '12px', color: '#166534', fontWeight: 600, textTransform: 'uppercase' }}>
              NET TAKE-HOME DISBURSEMENT
            </span>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#15803D', marginTop: '2px' }}>
              {canViewCompensation() ? `PKR ${entry.netPayPKR.toLocaleString()}` : '•••••••• PKR'}
            </div>
            <span style={{ fontSize: '11px', color: '#166534' }}>
              Directly credited to verified banking channel
            </span>
          </div>

          <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--color-gray-500)' }}>
            <div>Payment Mode: <strong>{comp?.paymentMethod?.toUpperCase() || 'BANK TRANSFER'}</strong></div>
            <div>Bank Ref: <strong>{entry.paymentReference || 'FT-HBL-9923841'}</strong></div>
          </div>
        </div>

        {/* Signatures & Verification Stamps */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '48px', paddingTop: '20px', borderTop: '1px solid var(--color-gray-200)', fontSize: '12px', color: 'var(--color-gray-600)' }}>
          <div style={{ textAlign: 'center', width: '220px' }}>
            <div style={{ borderBottom: '1px solid var(--color-gray-400)', height: '40px', marginBottom: '6px' }} />
            <span>Prepared by (Accounts & Payroll)</span>
          </div>

          <div style={{ textAlign: 'center', width: '220px' }}>
            <div style={{ borderBottom: '1px solid var(--color-gray-400)', height: '40px', marginBottom: '6px', fontWeight: 'bold', color: 'var(--color-olive-drab)' }}>
              Farhan Zaidi (Director)
            </div>
            <span>Authorized Signatory</span>
          </div>

          <div style={{ textAlign: 'center', width: '220px' }}>
            <div style={{ borderBottom: '1px solid var(--color-gray-400)', height: '40px', marginBottom: '6px' }} />
            <span>Employee Acknowledgment</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '10px', color: 'var(--color-gray-400)' }}>
          This is an official computer-generated payslip from Candi Super Store Enterprise Control Tower. No manual signature alteration is permitted.
        </div>
      </Card>
    </div>
  );
};

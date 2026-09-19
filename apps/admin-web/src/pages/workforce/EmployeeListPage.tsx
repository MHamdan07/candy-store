import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Button, Input, Modal, Alert } from '@candi/ui';
import { usePermissions } from '@candi/auth';
import type { Employee, DepartmentType, EmploymentType, StaffRoleName } from '@candi/types';
import { WorkforceDataStore, DEPARTMENTS, WORKFORCE_LOCATIONS } from '../../data/workforceData';
import { validateEmployeeOnboarding } from '@candi/validation';

export const EmployeeListPage: React.FC = () => {
  const { activeRole } = usePermissions();

  const [employees, setEmployees] = useState<Employee[]>(() => WorkforceDataStore.getEmployees());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  // Maker-Checker Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    fullName: string;
    cnic: string;
    phone: string;
    email: string;
    address: string;
    emergencyName: string;
    emergencyRel: string;
    emergencyPhone: string;
    department: DepartmentType;
    jobTitle: string;
    employmentStatus: EmploymentType;
    joiningDate: string;
    assignedLocationId: string;
    managerId: string;
    role: StaffRoleName;
    basicSalary: number;
    paymentMethod: 'bank_transfer' | 'cheque' | 'cash';
    bankName: string;
    accountTitle: string;
    accountNumber: string;
  }>({
    fullName: '',
    cnic: '',
    phone: '',
    email: '',
    address: '',
    emergencyName: '',
    emergencyRel: '',
    emergencyPhone: '',
    department: 'warehouse',
    jobTitle: '',
    employmentStatus: 'full_time',
    joiningDate: new Date().toISOString().split('T')[0],
    assignedLocationId: WORKFORCE_LOCATIONS[0].id,
    managerId: 'EMP-1002',
    role: 'warehouse_staff',
    basicSalary: 45000,
    paymentMethod: 'bank_transfer',
    bankName: 'Habib Bank Limited (HBL)',
    accountTitle: '',
    accountNumber: '',
  });

  const reloadEmployees = () => {
    setEmployees(WorkforceDataStore.getEmployees());
  };

  const handleApprove = (id: string, name: string) => {
    WorkforceDataStore.updateEmployeeStatus(id, 'active', `Active User (${activeRole})`);
    reloadEmployees();
    setSuccessMessage(`Employee ${name} successfully approved and activated! User login enabled.`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleSuspend = (id: string, name: string) => {
    const reason = window.prompt(`Please enter the suspension reason for ${name}:`);
    if (!reason || reason.trim().length < 5) {
      alert('Suspension cancelled: A valid reason of at least 5 characters is required.');
      return;
    }
    WorkforceDataStore.updateEmployeeStatus(id, 'suspended', `Active User (${activeRole})`, reason);
    reloadEmployees();
    setSuccessMessage(`Account for ${name} has been suspended.`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleReactivate = (id: string, name: string) => {
    WorkforceDataStore.updateEmployeeStatus(id, 'active', `Active User (${activeRole})`, 'Re-activated from suspension');
    reloadEmployees();
    setSuccessMessage(`Account for ${name} has been re-activated.`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedLoc = WORKFORCE_LOCATIONS.find((l) => l.id === formData.assignedLocationId);
    const selectedMgr = employees.find((emp) => emp.id === formData.managerId);

    const draftEmployee: Partial<Employee> = {
      fullName: formData.fullName,
      cnic: formData.cnic,
      phone: formData.phone,
      department: formData.department,
      jobTitle: formData.jobTitle,
      assignedLocationId: formData.assignedLocationId,
      emergencyContact: {
        name: formData.emergencyName,
        relationship: formData.emergencyRel,
        phone: formData.emergencyPhone,
      },
    };

    const validation = validateEmployeeOnboarding(draftEmployee);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    const nextIdNum = 1000 + employees.length + 1;
    const newId = `EMP-${nextIdNum}`;
    const newCode = `CS-0${nextIdNum}`;

    const newEmployee: Employee = {
      id: newId,
      employeeCode: newCode,
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email || `${formData.fullName.toLowerCase().replace(/\s+/g, '.')}@candi.pk`,
      cnic: formData.cnic,
      department: formData.department,
      jobTitle: formData.jobTitle,
      employmentStatus: formData.employmentStatus,
      workflowStatus: 'pending_approval', // 2-Tier Maker-Checker rule!
      joiningDate: formData.joiningDate,
      assignedLocationId: formData.assignedLocationId,
      assignedLocationName: selectedLoc?.name || 'Central Distribution Depot',
      managerId: formData.managerId,
      managerName: selectedMgr?.fullName || 'Farhan Zaidi',
      emergencyContact: {
        name: formData.emergencyName,
        relationship: formData.emergencyRel,
        phone: formData.emergencyPhone,
      },
      address: formData.address || 'Lahore, Pakistan',
      userAccountId: `usr-auto-${nextIdNum}`,
      role: formData.role,
      createdBy: `Staff (${activeRole})`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to Store
    WorkforceDataStore.addEmployee(newEmployee, `Staff (${activeRole})`);

    // Add Initial Compensation Record
    const allComp = WorkforceDataStore.getCompensation();
    allComp[newId] = {
      id: `COMP-${newId}`,
      employeeId: newId,
      salaryStructure: 'monthly_salaried',
      basicSalaryPKR: formData.basicSalary,
      allowances: [
        { id: `al-${Date.now()}-1`, type: 'house_rent', title: 'House Rent Allowance', amountPKR: Math.round(formData.basicSalary * 0.3), isTaxable: false },
        { id: `al-${Date.now()}-2`, type: 'conveyance', title: 'Conveyance Allowance', amountPKR: 8000, isTaxable: false },
      ],
      standardDeductions: [
        { id: `de-${Date.now()}-1`, type: 'eobi', title: 'EOBI Contribution', amountPKR: 1800 },
      ],
      overtimeHourlyRatePKR: Math.round((formData.basicSalary / 26 / 8) * 1.5),
      paymentMethod: formData.paymentMethod,
      bankName: formData.bankName,
      accountTitle: formData.accountTitle || formData.fullName,
      accountNumber: formData.accountNumber || 'PK00BANK00000000000000',
      effectiveDate: formData.joiningDate,
      payrollStatus: 'active',
      updatedAt: new Date().toISOString(),
    };
    WorkforceDataStore.saveCompensation(allComp);

    reloadEmployees();
    setIsNewModalOpen(false);
    setModalStep(1);
    setValidationErrors([]);
    setSuccessMessage(
      `New employee ${newEmployee.fullName} (${newEmployee.employeeCode}) onboarded in "Pending Approval" status. Awaiting executive authorization.`
    );
  };

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.cnic.includes(searchQuery) ||
      emp.phone.includes(searchQuery) ||
      emp.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'all' || emp.department === selectedDept;
    const matchesStatus = selectedStatusTab === 'all' || emp.workflowStatus === selectedStatusTab;
    const matchesLoc = selectedLocation === 'all' || emp.assignedLocationId === selectedLocation;

    return matchesSearch && matchesDept && matchesStatus && matchesLoc;
  });

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
              Employee Master Directory & Workforce Governance
            </h1>
            <Badge variant="primary">{employees.length} Total Staff</Badge>
          </div>
          <p style={{ margin: '6px 0 0 0', color: 'var(--color-gray-600)', fontSize: '14px' }}>
            Centralized employee list, organizational placement, 2-Tier Maker-Checker lifecycle, and user accounts.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsNewModalOpen(true)}>
          ➕ Onboard New Employee
        </Button>
      </div>

      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-gray-200)', paddingBottom: '8px' }}>
        {[
          { key: 'all', label: 'All Employees', count: employees.length },
          { key: 'active', label: 'Active', count: employees.filter((e) => e.workflowStatus === 'active').length },
          { key: 'pending_approval', label: 'Pending Approval', count: employees.filter((e) => e.workflowStatus === 'pending_approval').length },
          { key: 'suspended', label: 'Suspended', count: employees.filter((e) => e.workflowStatus === 'suspended').length },
          { key: 'inactive', label: 'Inactive / Left', count: employees.filter((e) => e.workflowStatus === 'inactive').length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedStatusTab(tab.key)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: selectedStatusTab === tab.key ? 'var(--color-olive-drab)' : '#F3F4F6',
              color: selectedStatusTab === tab.key ? '#FFFFFF' : 'var(--color-gray-700)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {tab.label}
            <span
              style={{
                backgroundColor: selectedStatusTab === tab.key ? 'rgba(255,255,255,0.3)' : 'var(--color-gray-300)',
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: '11px',
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter Toolbar */}
      <Card style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <Input
              placeholder="Search by Name, Employee Code (e.g. CS-01001), CNIC, or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ width: '220px' }}>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid var(--color-gray-300)',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ width: '260px' }}>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid var(--color-gray-300)',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
              }}
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

      {/* Employee List Table */}
      <Card style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid var(--color-gray-200)', textAlign: 'left', color: 'var(--color-gray-600)' }}>
                <th style={{ padding: '12px 16px' }}>Code & Name</th>
                <th style={{ padding: '12px 16px' }}>Department & Role</th>
                <th style={{ padding: '12px 16px' }}>Contact & CNIC</th>
                <th style={{ padding: '12px 16px' }}>Location / Warehouse</th>
                <th style={{ padding: '12px 16px' }}>Supervisor</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                    No employees found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} style={{ borderBottom: '1px solid var(--color-gray-100)', backgroundColor: '#FFFFFF' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-cream)',
                            color: 'var(--color-olive-drab)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            border: '1px solid var(--color-olive-drab)',
                          }}
                        >
                          {emp.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <Link
                            to={`/workforce/employees/${emp.id}`}
                            style={{ fontWeight: 600, color: 'var(--color-gray-900)', textDecoration: 'none' }}
                          >
                            {emp.fullName}
                          </Link>
                          <div style={{ fontSize: '11px', color: 'var(--color-gray-500)', fontFamily: 'monospace' }}>
                            {emp.employeeCode} • {emp.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 500, color: 'var(--color-gray-900)' }}>{emp.jobTitle}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-gray-500)', textTransform: 'capitalize' }}>
                        {emp.department} • {emp.employmentStatus.replace('_', ' ')}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontFamily: 'monospace', color: 'var(--color-gray-800)' }}>{emp.phone}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-gray-500)', fontFamily: 'monospace' }}>
                        CNIC: {emp.cnic}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', color: 'var(--color-gray-700)' }}>
                      {emp.assignedLocationName.split('—')[0]}
                    </td>

                    <td style={{ padding: '14px 16px', color: 'var(--color-gray-700)' }}>
                      {emp.managerName || 'Executive Committee'}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <Badge
                        variant={
                          emp.workflowStatus === 'active'
                            ? 'success'
                            : emp.workflowStatus === 'pending_approval'
                            ? 'warning'
                            : emp.workflowStatus === 'suspended'
                            ? 'error'
                            : 'neutral'
                        }
                      >
                        {emp.workflowStatus.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Link to={`/workforce/employees/${emp.id}`}>
                          <Button variant="secondary" style={{ fontSize: '12px', padding: '5px 10px' }}>
                            360° Profile
                          </Button>
                        </Link>

                        {emp.workflowStatus === 'pending_approval' && (
                          <Button
                            variant="primary"
                            style={{ fontSize: '12px', padding: '5px 10px', backgroundColor: '#059669' }}
                            onClick={() => handleApprove(emp.id, emp.fullName)}
                          >
                            ✓ Approve
                          </Button>
                        )}

                        {emp.workflowStatus === 'active' && (
                          <Button
                            variant="secondary"
                            style={{ fontSize: '12px', padding: '5px 10px', color: '#DC2626' }}
                            onClick={() => handleSuspend(emp.id, emp.fullName)}
                          >
                            Suspend
                          </Button>
                        )}

                        {emp.workflowStatus === 'suspended' && (
                          <Button
                            variant="primary"
                            style={{ fontSize: '12px', padding: '5px 10px', backgroundColor: '#2563EB' }}
                            onClick={() => handleReactivate(emp.id, emp.fullName)}
                          >
                            Reactivate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 2-Tier Maker-Checker Onboarding Wizard Modal */}
      {isNewModalOpen && (
        <Modal
          isOpen={isNewModalOpen}
          onClose={() => {
            setIsNewModalOpen(false);
            setModalStep(1);
            setValidationErrors([]);
          }}
          title="Onboard New Employee (2-Tier Maker-Checker Wizard)"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Step Indicators */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-gray-200)', paddingBottom: '12px' }}>
              {[
                { num: 1, label: '1. Personal & Contact' },
                { num: 2, label: '2. Organization & Job' },
                { num: 3, label: '3. Role & Access' },
                { num: 4, label: '4. Compensation' },
              ].map((step) => (
                <div
                  key={step.num}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '8px 4px',
                    borderRadius: '6px',
                    backgroundColor: modalStep === step.num ? 'var(--color-olive-drab)' : '#F3F4F6',
                    color: modalStep === step.num ? '#FFFFFF' : 'var(--color-gray-600)',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  {step.label}
                </div>
              ))}
            </div>

            {validationErrors.length > 0 && (
              <Alert variant="error">
                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </Alert>
            )}

            <form onSubmit={handleCreateEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {modalStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      Full Legal Name *
                    </label>
                    <Input
                      placeholder="e.g. Muhammad Bilal Khan"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                        CNIC (National ID) *
                      </label>
                      <Input
                        placeholder="42101-1234567-1"
                        value={formData.cnic}
                        onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                        Official Mobile Phone *
                      </label>
                      <Input
                        placeholder="+923001234567"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      Corporate Email (Optional)
                    </label>
                    <Input
                      placeholder="name@candi.pk"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      Residential Address
                    </label>
                    <Input
                      placeholder="Street, Area, City"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div style={{ borderTop: '1px solid var(--color-gray-200)', paddingTop: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-gray-700)' }}>
                      Emergency Contact Verification
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px', marginTop: '6px' }}>
                      <Input
                        placeholder="Contact Name"
                        value={formData.emergencyName}
                        onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="Relationship (e.g. Brother)"
                        value={formData.emergencyRel}
                        onChange={(e) => setFormData({ ...formData, emergencyRel: e.target.value })}
                        required
                      />
                      <Input
                        placeholder="Emergency Phone"
                        value={formData.emergencyPhone}
                        onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {modalStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                        Assigned Department *
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value as DepartmentType })}
                        style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid var(--color-gray-300)' }}
                      >
                        {DEPARTMENTS.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                        Job Title *
                      </label>
                      <Input
                        placeholder="e.g. Warehouse Supervisor"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                        Employment Status *
                      </label>
                      <select
                        value={formData.employmentStatus}
                        onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value as EmploymentType })}
                        style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid var(--color-gray-300)' }}
                      >
                        <option value="full_time">Full-Time Permanent</option>
                        <option value="probation">Probationary (3 Months)</option>
                        <option value="contract">Fixed-Term Contract</option>
                        <option value="part_time">Part-Time</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                        Joining Date *
                      </label>
                      <Input
                        type="date"
                        value={formData.joiningDate}
                        onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      Assigned Location / Warehouse *
                    </label>
                    <select
                      value={formData.assignedLocationId}
                      onChange={(e) => setFormData({ ...formData, assignedLocationId: e.target.value })}
                      style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid var(--color-gray-300)' }}
                    >
                      {WORKFORCE_LOCATIONS.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      Reporting Manager / Supervisor *
                    </label>
                    <select
                      value={formData.managerId}
                      onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                      style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid var(--color-gray-300)' }}
                    >
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.fullName} ({emp.jobTitle})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {modalStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ padding: '12px', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
                    <strong style={{ fontSize: '13px', color: '#1E40AF' }}>User Role & Permissions Binding</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#1E3A8A' }}>
                      Assigning a role determines which of the 10 platform modules this staff account will see and execute.
                    </p>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      Assigned Role *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRoleName })}
                      style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid var(--color-gray-300)' }}
                    >
                      <option value="warehouse_staff">Warehouse Staff (Intake & Packing)</option>
                      <option value="warehouse_manager">Warehouse Manager (GRN, Counts, Rosters)</option>
                      <option value="sales_agent">Sales Representative (Orders & Customer Khata)</option>
                      <option value="rider">Delivery Fleet Rider (Dispatch & COD)</option>
                      <option value="delivery_manager">Logistics & Fleet Manager</option>
                      <option value="accounts_staff">Accounts & Payroll Officer</option>
                      <option value="admin_manager">Operations & HR Manager</option>
                      <option value="super_admin">Super Administrator (Executive clearance)</option>
                    </select>
                  </div>

                  <div style={{ padding: '12px', backgroundColor: '#FEF3C7', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                    <div style={{ fontSize: '12px', color: '#92400E' }}>
                      <strong>Maker-Checker Policy:</strong> Upon creation, this profile will be submitted in <strong>Pending Approval</strong> state. A separate executive with admin clearance must approve this profile before system credentials become active.
                    </div>
                  </div>
                </div>
              )}

              {modalStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      Monthly Basic Salary (PKR) *
                    </label>
                    <Input
                      type="number"
                      value={formData.basicSalary}
                      onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                      required
                    />
                    <span style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>
                      Wholesale minimum wage: 32,000 PKR
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                        Disbursement Payment Method
                      </label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                        style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid var(--color-gray-300)' }}
                      >
                        <option value="bank_transfer">Direct Bank Transfer</option>
                        <option value="cheque">Bank Crossed Cheque</option>
                        <option value="cash">Depot Cash Voucher</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                        Bank Name
                      </label>
                      <Input
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                        Bank Account Title
                      </label>
                      <Input
                        placeholder="As shown on cheque"
                        value={formData.accountTitle}
                        onChange={(e) => setFormData({ ...formData, accountTitle: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                        IBAN / Account Number
                      </label>
                      <Input
                        placeholder="PK..."
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Nav Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', borderTop: '1px solid var(--color-gray-200)', paddingTop: '16px' }}>
                {modalStep > 1 ? (
                  <Button type="button" variant="secondary" onClick={() => setModalStep(modalStep - 1)}>
                    ← Back
                  </Button>
                ) : (
                  <div />
                )}

                {modalStep < 4 ? (
                  <Button type="button" variant="primary" onClick={() => setModalStep(modalStep + 1)}>
                    Next Step →
                  </Button>
                ) : (
                  <Button type="submit" variant="primary">
                    Submit for Approval
                  </Button>
                )}
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

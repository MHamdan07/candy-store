import type {
  Employee,
  WorkShift,
  AttendanceRecord,
  LeaveRequest,
  EmployeeLeaveBalance,
  EmployeeCompensation,
  PayrollPeriod,
  PayrollEntry,
  PerformanceReview,
  TrainingRecord,
  WorkforceAuditRecord,
  RoleDefinition,
  DepartmentType,
  StaffRoleName,
  AttendanceStatus,
} from '@candi/types';
import { STANDARD_ROLES } from '@candi/auth';

export const DEPARTMENTS: { id: DepartmentType; name: string; description: string; icon: string }[] = [
  { id: 'warehouse', name: 'Warehouse & Logistics', description: 'Inventory, receiving dock, picking & stacking', icon: '📦' },
  { id: 'sales', name: 'Wholesale Sales', description: 'B2B order booking, retail accounts, price tiering', icon: '💼' },
  { id: 'finance', name: 'Finance & Accounts', description: 'Double-entry ledgers, cash vault, payables & payroll', icon: '🏛️' },
  { id: 'delivery', name: 'Fleet Delivery', description: 'Rider dispatch, route optimization, COD collection', icon: '🚚' },
  { id: 'procurement', name: 'Procurement & Purchasing', description: 'Manufacturer POs, vendor khata, replenishment', icon: '🛒' },
  { id: 'administration', name: 'Operations & HR Admin', description: 'User security, workforce compliance, executive command', icon: '🛡️' },
];

export const WORKFORCE_LOCATIONS = [
  { id: 'loc-lhe-01', name: 'Candi Central Distribution Depot — Lahore', city: 'Lahore', address: 'Plot 44-B, Industrial Estate, Multan Road' },
  { id: 'loc-rwp-02', name: 'Candi Northern Hub — Rawalpindi', city: 'Rawalpindi', address: 'Sector I-9/3 Wholesale Corridor' },
  { id: 'loc-khi-03', name: 'Candi Port Terminal Warehouse — Karachi', city: 'Karachi', address: 'SITE Area, Confectionery Logistics Center' },
];

// Initial Seed Employees
export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-1001',
    employeeCode: 'CS-01001',
    fullName: 'Hamza Tariq',
    phone: '+923001234561',
    email: 'hamza.tariq@candi.pk',
    cnic: '35202-4412981-3',
    department: 'warehouse',
    jobTitle: 'Warehouse Supervisor',
    employmentStatus: 'full_time',
    workflowStatus: 'active',
    joiningDate: '2025-03-15',
    assignedLocationId: 'loc-lhe-01',
    assignedLocationName: 'Candi Central Distribution Depot — Lahore',
    managerId: 'EMP-1002',
    managerName: 'Farhan Zaidi',
    emergencyContact: { name: 'Tariq Mehmood', relationship: 'Father', phone: '+923009988112' },
    address: 'House 14, St 3, Allama Iqbal Town, Lahore',
    userAccountId: 'usr-wh-01',
    role: 'warehouse_manager',
    createdBy: 'Farhan Zaidi',
    createdAt: '2025-03-10T10:00:00Z',
    approvedBy: 'Farhan Zaidi',
    approvedAt: '2025-03-12T14:30:00Z',
    updatedAt: '2026-09-18T11:00:00Z',
  },
  {
    id: 'EMP-1002',
    employeeCode: 'CS-01002',
    fullName: 'Farhan Zaidi',
    phone: '+923009999999',
    email: 'farhan.zaidi@candi.pk',
    cnic: '42101-9876543-1',
    department: 'administration',
    jobTitle: 'Operations & HR Director',
    employmentStatus: 'full_time',
    workflowStatus: 'active',
    joiningDate: '2024-01-01',
    assignedLocationId: 'loc-lhe-01',
    assignedLocationName: 'Candi Central Distribution Depot — Lahore',
    emergencyContact: { name: 'Nasreen Zaidi', relationship: 'Spouse', phone: '+923001122334' },
    address: 'B-12, Phase 5, DHA, Lahore',
    userAccountId: 'usr-adm-01',
    role: 'super_admin',
    createdBy: 'System Root',
    createdAt: '2024-01-01T00:00:00Z',
    approvedBy: 'Board of Directors',
    approvedAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-09-19T08:00:00Z',
  },
  {
    id: 'EMP-1003',
    employeeCode: 'CS-01003',
    fullName: 'Ayesha Noor',
    phone: '+923003456789',
    email: 'ayesha.noor@candi.pk',
    cnic: '35201-1928374-2',
    department: 'finance',
    jobTitle: 'Senior Financial Accountant',
    employmentStatus: 'full_time',
    workflowStatus: 'active',
    joiningDate: '2025-06-01',
    assignedLocationId: 'loc-lhe-01',
    assignedLocationName: 'Candi Central Distribution Depot — Lahore',
    managerId: 'EMP-1002',
    managerName: 'Farhan Zaidi',
    emergencyContact: { name: 'Muhammad Noor', relationship: 'Father', phone: '+923007654321' },
    address: 'Apartment 4B, Gulberg Heights, Lahore',
    userAccountId: 'usr-fin-01',
    role: 'accounts_staff',
    createdBy: 'Farhan Zaidi',
    createdAt: '2025-05-20T09:00:00Z',
    approvedBy: 'Farhan Zaidi',
    approvedAt: '2025-05-25T16:00:00Z',
    updatedAt: '2026-09-15T12:00:00Z',
  },
  {
    id: 'EMP-1004',
    employeeCode: 'CS-01004',
    fullName: 'Bilal Qureshi',
    phone: '+923004567890',
    email: 'bilal.qureshi@candi.pk',
    cnic: '35202-7654321-9',
    department: 'sales',
    jobTitle: 'Wholesale Sales Executive',
    employmentStatus: 'full_time',
    workflowStatus: 'active',
    joiningDate: '2025-08-10',
    assignedLocationId: 'loc-lhe-01',
    assignedLocationName: 'Candi Central Distribution Depot — Lahore',
    managerId: 'EMP-1002',
    managerName: 'Farhan Zaidi',
    emergencyContact: { name: 'Sajid Qureshi', relationship: 'Brother', phone: '+923008899001' },
    address: 'Street 9, Model Town C-Block, Lahore',
    userAccountId: 'usr-sal-01',
    role: 'sales_agent',
    createdBy: 'Farhan Zaidi',
    createdAt: '2025-08-01T11:30:00Z',
    approvedBy: 'Farhan Zaidi',
    approvedAt: '2025-08-05T15:00:00Z',
    updatedAt: '2026-09-10T14:20:00Z',
  },
  {
    id: 'EMP-1005',
    employeeCode: 'CS-01005',
    fullName: 'Usman Ghani',
    phone: '+923005678901',
    email: 'usman.ghani@candi.pk',
    cnic: '35202-9988776-5',
    department: 'delivery',
    jobTitle: 'Senior Route Rider',
    employmentStatus: 'full_time',
    workflowStatus: 'active',
    joiningDate: '2025-09-01',
    assignedLocationId: 'loc-lhe-01',
    assignedLocationName: 'Candi Central Distribution Depot — Lahore',
    managerId: 'EMP-1001',
    managerName: 'Hamza Tariq',
    emergencyContact: { name: 'Ghani Muhammad', relationship: 'Father', phone: '+923004433221' },
    address: 'Near Chowk Yateem Khana, Band Road, Lahore',
    userAccountId: 'usr-del-01',
    role: 'rider',
    createdBy: 'Hamza Tariq',
    createdAt: '2025-08-25T14:00:00Z',
    approvedBy: 'Farhan Zaidi',
    approvedAt: '2025-08-28T10:00:00Z',
    updatedAt: '2026-09-17T09:00:00Z',
  },
  {
    id: 'EMP-1006',
    employeeCode: 'CS-01006',
    fullName: 'Zainab Bibi',
    phone: '+923006789012',
    email: 'zainab.bibi@candi.pk',
    cnic: '35201-5544332-6',
    department: 'warehouse',
    jobTitle: 'Inventory Quality Inspector',
    employmentStatus: 'probation',
    workflowStatus: 'pending_approval',
    joiningDate: '2026-09-15',
    assignedLocationId: 'loc-lhe-01',
    assignedLocationName: 'Candi Central Distribution Depot — Lahore',
    managerId: 'EMP-1001',
    managerName: 'Hamza Tariq',
    emergencyContact: { name: 'Bashir Ahmed', relationship: 'Father', phone: '+923001199887' },
    address: 'Canal View Society, Main Boulevard, Lahore',
    role: 'warehouse_staff',
    createdBy: 'Hamza Tariq',
    createdAt: '2026-09-16T10:30:00Z',
    updatedAt: '2026-09-16T10:30:00Z',
  },
  {
    id: 'EMP-1007',
    employeeCode: 'CS-01007',
    fullName: 'Tariq Rasheed',
    phone: '+923007890123',
    email: 'tariq.rasheed@candi.pk',
    cnic: '35202-6677889-1',
    department: 'warehouse',
    jobTitle: 'Forklift & Stacking Operator',
    employmentStatus: 'contract',
    workflowStatus: 'pending_approval',
    joiningDate: '2026-09-18',
    assignedLocationId: 'loc-lhe-01',
    assignedLocationName: 'Candi Central Distribution Depot — Lahore',
    managerId: 'EMP-1001',
    managerName: 'Hamza Tariq',
    emergencyContact: { name: 'Rasheed Khan', relationship: 'Father', phone: '+923008877665' },
    address: 'Kot Lakhpat Industrial Quarter, Lahore',
    role: 'warehouse_staff',
    createdBy: 'Hamza Tariq',
    createdAt: '2026-09-17T15:00:00Z',
    updatedAt: '2026-09-17T15:00:00Z',
  },
  {
    id: 'EMP-1008',
    employeeCode: 'CS-01008',
    fullName: 'Haris Javed',
    phone: '+923008901234',
    email: 'haris.javed@candi.pk',
    cnic: '35202-3322110-4',
    department: 'sales',
    jobTitle: 'Junior Field Representative',
    employmentStatus: 'full_time',
    workflowStatus: 'suspended',
    suspendedReason: 'Account suspended pending inquiry on route cash deposit variance PKR 15,000.',
    joiningDate: '2025-11-01',
    assignedLocationId: 'loc-lhe-01',
    assignedLocationName: 'Candi Central Distribution Depot — Lahore',
    managerId: 'EMP-1004',
    managerName: 'Bilal Qureshi',
    emergencyContact: { name: 'Javed Iqbal', relationship: 'Father', phone: '+923002233445' },
    address: 'Township Sector B-1, Lahore',
    role: 'sales_agent',
    createdBy: 'Bilal Qureshi',
    createdAt: '2025-10-25T11:00:00Z',
    approvedBy: 'Farhan Zaidi',
    approvedAt: '2025-10-28T16:00:00Z',
    updatedAt: '2026-09-14T17:30:00Z',
  },
  {
    id: 'EMP-1009',
    employeeCode: 'CS-01009',
    fullName: 'Rashid Minhas',
    phone: '+923009012345',
    email: 'rashid.minhas@candi.pk',
    cnic: '35201-9900112-8',
    department: 'delivery',
    jobTitle: 'Dispatch Assistant',
    employmentStatus: 'full_time',
    workflowStatus: 'inactive',
    inactiveReason: 'Resigned amicably on 2026-08-31 for higher studies. Clearance completed.',
    joiningDate: '2024-06-01',
    assignedLocationId: 'loc-lhe-01',
    assignedLocationName: 'Candi Central Distribution Depot — Lahore',
    managerId: 'EMP-1001',
    managerName: 'Hamza Tariq',
    emergencyContact: { name: 'Minhas Ud Din', relationship: 'Father', phone: '+923005544332' },
    address: 'Shadman Colony, Jail Road, Lahore',
    role: 'rider',
    createdBy: 'Farhan Zaidi',
    createdAt: '2024-05-20T10:00:00Z',
    approvedBy: 'Farhan Zaidi',
    approvedAt: '2024-05-22T14:00:00Z',
    updatedAt: '2026-08-31T18:00:00Z',
  },
];

// Initial Shifts
export const INITIAL_SHIFTS: WorkShift[] = [
  {
    id: 'SHIFT-01',
    shiftName: 'Morning Logistics & Dock Intake',
    startTime: '07:00',
    endTime: '16:00',
    breakDurationMinutes: 60,
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    location: 'Central Depot — Lahore (Docks 1-4)',
    assignedEmployeeIds: ['EMP-1001', 'EMP-1006', 'EMP-1007'],
    status: 'active',
    createdAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'SHIFT-02',
    shiftName: 'Standard Day Admin & Commercial',
    startTime: '09:00',
    endTime: '18:00',
    breakDurationMinutes: 60,
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    location: 'Central Depot — Lahore (Admin Wing)',
    assignedEmployeeIds: ['EMP-1002', 'EMP-1003', 'EMP-1004'],
    status: 'active',
    createdAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'SHIFT-03',
    shiftName: 'Fleet Dispatch & Delivery Route',
    startTime: '08:00',
    endTime: '17:00',
    breakDurationMinutes: 60,
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    location: 'Central Depot — Lahore (Dispatch Hub)',
    assignedEmployeeIds: ['EMP-1005'],
    status: 'active',
    createdAt: '2025-01-10T00:00:00Z',
  },
];

// Initial Attendance Records for Today (2026-09-19)
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'ATT-20260919-EMP1001',
    employeeId: 'EMP-1001',
    employeeName: 'Hamza Tariq',
    department: 'warehouse',
    date: '2026-09-19',
    shiftId: 'SHIFT-01',
    shiftName: 'Morning Logistics & Dock Intake',
    checkInTime: '06:55',
    checkOutTime: '16:10',
    workingHours: 8.25,
    lateArrivalMinutes: 0,
    earlyDepartureMinutes: 0,
    overtimeHours: 0.25,
    overtimeApproved: true,
    overtimeApprovedBy: 'Farhan Zaidi',
    status: 'present',
    isManualEdit: false,
    notes: 'Shift completed smoothly. 3 GRNs processed.',
  },
  {
    id: 'ATT-20260919-EMP1002',
    employeeId: 'EMP-1002',
    employeeName: 'Farhan Zaidi',
    department: 'administration',
    date: '2026-09-19',
    shiftId: 'SHIFT-02',
    shiftName: 'Standard Day Admin & Commercial',
    checkInTime: '08:50',
    checkOutTime: '18:05',
    workingHours: 8.25,
    lateArrivalMinutes: 0,
    earlyDepartureMinutes: 0,
    overtimeHours: 0,
    overtimeApproved: false,
    status: 'present',
    isManualEdit: false,
    notes: 'Executive management duty.',
  },
  {
    id: 'ATT-20260919-EMP1003',
    employeeId: 'EMP-1003',
    employeeName: 'Ayesha Noor',
    department: 'finance',
    date: '2026-09-19',
    shiftId: 'SHIFT-02',
    shiftName: 'Standard Day Admin & Commercial',
    checkInTime: '09:25',
    checkOutTime: '18:15',
    workingHours: 7.8,
    lateArrivalMinutes: 25,
    earlyDepartureMinutes: 0,
    overtimeHours: 0,
    overtimeApproved: false,
    status: 'late',
    isManualEdit: false,
    notes: 'Delayed due to Canal Road traffic congestion.',
  },
  {
    id: 'ATT-20260919-EMP1004',
    employeeId: 'EMP-1004',
    employeeName: 'Bilal Qureshi',
    department: 'sales',
    date: '2026-09-19',
    shiftId: 'SHIFT-02',
    shiftName: 'Standard Day Admin & Commercial',
    checkInTime: '09:02',
    checkOutTime: '19:30',
    workingHours: 9.5,
    lateArrivalMinutes: 2,
    earlyDepartureMinutes: 0,
    overtimeHours: 1.5,
    overtimeApproved: true,
    overtimeApprovedBy: 'Farhan Zaidi',
    status: 'present',
    isManualEdit: false,
    notes: 'Extended field sales client meetings in Shah Alam Market.',
  },
  {
    id: 'ATT-20260919-EMP1005',
    employeeId: 'EMP-1005',
    employeeName: 'Usman Ghani',
    department: 'delivery',
    date: '2026-09-19',
    shiftId: 'SHIFT-03',
    shiftName: 'Fleet Dispatch & Delivery Route',
    checkInTime: '08:12',
    checkOutTime: '17:45',
    workingHours: 8.5,
    lateArrivalMinutes: 12,
    earlyDepartureMinutes: 0,
    overtimeHours: 0.75,
    overtimeApproved: false, // Pending approval
    status: 'late',
    isManualEdit: false,
    notes: 'Heavy delivery load on Route 4 (Gulberg & Model Town).',
  },
];

// Initial Leave Requests
export const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'LV-2026-001',
    employeeId: 'EMP-1001',
    employeeName: 'Hamza Tariq',
    department: 'warehouse',
    leaveType: 'annual',
    startDate: '2026-09-24',
    endDate: '2026-09-26',
    numberOfDays: 3,
    reason: 'Attending family wedding in Faisalabad.',
    status: 'manager_review',
    attendanceUpdated: false,
    createdAt: '2026-09-18T14:00:00Z',
  },
  {
    id: 'LV-2026-002',
    employeeId: 'EMP-1004',
    employeeName: 'Bilal Qureshi',
    department: 'sales',
    leaveType: 'sick',
    startDate: '2026-09-12',
    endDate: '2026-09-13',
    numberOfDays: 2,
    reason: 'Seasonal viral fever and medical rest prescribed by doctor.',
    status: 'approved',
    approverId: 'EMP-1002',
    approverName: 'Farhan Zaidi',
    reviewedAt: '2026-09-12T09:30:00Z',
    attendanceUpdated: true,
    createdAt: '2026-09-11T20:00:00Z',
  },
  {
    id: 'LV-2026-003',
    employeeId: 'EMP-1005',
    employeeName: 'Usman Ghani',
    department: 'delivery',
    leaveType: 'casual',
    startDate: '2026-09-20',
    endDate: '2026-09-20',
    numberOfDays: 1,
    reason: 'Urgent domestic property document renewal.',
    status: 'manager_review',
    attendanceUpdated: false,
    createdAt: '2026-09-19T08:30:00Z',
  },
];

// Initial Leave Balances (Year 2026)
export const INITIAL_LEAVE_BALANCES: Record<string, EmployeeLeaveBalance> = {
  'EMP-1001': { employeeId: 'EMP-1001', year: 2026, annualTotal: 14, annualUsed: 4, casualTotal: 10, casualUsed: 2, sickTotal: 8, sickUsed: 1 },
  'EMP-1002': { employeeId: 'EMP-1002', year: 2026, annualTotal: 20, annualUsed: 5, casualTotal: 10, casualUsed: 1, sickTotal: 8, sickUsed: 0 },
  'EMP-1003': { employeeId: 'EMP-1003', year: 2026, annualTotal: 14, annualUsed: 2, casualTotal: 10, casualUsed: 3, sickTotal: 8, sickUsed: 2 },
  'EMP-1004': { employeeId: 'EMP-1004', year: 2026, annualTotal: 14, annualUsed: 3, casualTotal: 10, casualUsed: 2, sickTotal: 8, sickUsed: 2 },
  'EMP-1005': { employeeId: 'EMP-1005', year: 2026, annualTotal: 14, annualUsed: 1, casualTotal: 10, casualUsed: 4, sickTotal: 8, sickUsed: 0 },
};

// Initial Confidential Employee Compensation
export const INITIAL_COMPENSATION: Record<string, EmployeeCompensation> = {
  'EMP-1001': {
    id: 'COMP-EMP1001',
    employeeId: 'EMP-1001',
    salaryStructure: 'monthly_salaried',
    basicSalaryPKR: 65000,
    allowances: [
      { id: 'al-1', type: 'house_rent', title: 'House Rent Allowance', amountPKR: 20000, isTaxable: false },
      { id: 'al-2', type: 'conveyance', title: 'Fuel & Conveyance', amountPKR: 12000, isTaxable: false },
      { id: 'al-3', type: 'performance_bonus', title: 'Inventory Accuracy Bonus', amountPKR: 8000, isTaxable: true },
    ],
    standardDeductions: [
      { id: 'de-1', type: 'eobi', title: 'EOBI Contribution', amountPKR: 1800 },
      { id: 'de-2', type: 'income_tax', title: 'FBR Withholding Income Tax', amountPKR: 2500 },
      { id: 'de-3', type: 'provident_fund', title: 'Company PF Contribution', amountPKR: 3500 },
    ],
    overtimeHourlyRatePKR: 470, // ~ (65000 / 26 / 8) * 1.5
    paymentMethod: 'bank_transfer',
    bankName: 'Habib Bank Limited (HBL)',
    accountTitle: 'Hamza Tariq',
    accountNumber: 'PK36HABB00012345678901',
    effectiveDate: '2026-01-01',
    payrollStatus: 'active',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  'EMP-1002': {
    id: 'COMP-EMP1002',
    employeeId: 'EMP-1002',
    salaryStructure: 'monthly_salaried',
    basicSalaryPKR: 175000,
    allowances: [
      { id: 'al-4', type: 'house_rent', title: 'Executive Housing', amountPKR: 50000, isTaxable: false },
      { id: 'al-5', type: 'conveyance', title: 'Car Maintenance Allowance', amountPKR: 30000, isTaxable: false },
      { id: 'al-6', type: 'special_duty', title: 'Executive Director Allowance', amountPKR: 25000, isTaxable: true },
    ],
    standardDeductions: [
      { id: 'de-4', type: 'eobi', title: 'EOBI Contribution', amountPKR: 1800 },
      { id: 'de-5', type: 'income_tax', title: 'FBR Withholding Income Tax', amountPKR: 22500 },
      { id: 'de-6', type: 'provident_fund', title: 'Company PF Contribution', amountPKR: 10000 },
    ],
    overtimeHourlyRatePKR: 0, // Executive role exempt
    paymentMethod: 'bank_transfer',
    bankName: 'Meezan Bank Limited',
    accountTitle: 'Farhan Zaidi',
    accountNumber: 'PK42MEZN00998877665544',
    effectiveDate: '2026-01-01',
    payrollStatus: 'active',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  'EMP-1003': {
    id: 'COMP-EMP1003',
    employeeId: 'EMP-1003',
    salaryStructure: 'monthly_salaried',
    basicSalaryPKR: 80000,
    allowances: [
      { id: 'al-7', type: 'house_rent', title: 'House Rent Allowance', amountPKR: 25000, isTaxable: false },
      { id: 'al-8', type: 'conveyance', title: 'Conveyance Allowance', amountPKR: 15000, isTaxable: false },
    ],
    standardDeductions: [
      { id: 'de-7', type: 'eobi', title: 'EOBI Contribution', amountPKR: 1800 },
      { id: 'de-8', type: 'income_tax', title: 'Income Tax', amountPKR: 4500 },
      { id: 'de-9', type: 'provident_fund', title: 'Company PF', amountPKR: 4000 },
    ],
    overtimeHourlyRatePKR: 575,
    paymentMethod: 'bank_transfer',
    bankName: 'Standard Chartered Bank',
    accountTitle: 'Ayesha Noor',
    accountNumber: 'PK12SCBL00001122334455',
    effectiveDate: '2026-01-01',
    payrollStatus: 'active',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  'EMP-1004': {
    id: 'COMP-EMP1004',
    employeeId: 'EMP-1004',
    salaryStructure: 'monthly_salaried',
    basicSalaryPKR: 55000,
    allowances: [
      { id: 'al-9', type: 'house_rent', title: 'House Rent Allowance', amountPKR: 18000, isTaxable: false },
      { id: 'al-10', type: 'conveyance', title: 'Sales Bike Fuel Allowance', amountPKR: 18000, isTaxable: false },
      { id: 'al-11', type: 'performance_bonus', title: 'Wholesale Booking Commission', amountPKR: 14000, isTaxable: true },
    ],
    standardDeductions: [
      { id: 'de-10', type: 'eobi', title: 'EOBI Contribution', amountPKR: 1800 },
      { id: 'de-11', type: 'income_tax', title: 'Income Tax', amountPKR: 1500 },
    ],
    overtimeHourlyRatePKR: 400,
    paymentMethod: 'bank_transfer',
    bankName: 'United Bank Limited (UBL)',
    accountTitle: 'Bilal Qureshi',
    accountNumber: 'PK88UNIL00023456789012',
    effectiveDate: '2026-01-01',
    payrollStatus: 'active',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  'EMP-1005': {
    id: 'COMP-EMP1005',
    employeeId: 'EMP-1005',
    salaryStructure: 'monthly_salaried',
    basicSalaryPKR: 42000,
    allowances: [
      { id: 'al-12', type: 'house_rent', title: 'House Rent Allowance', amountPKR: 12000, isTaxable: false },
      { id: 'al-13', type: 'conveyance', title: 'Delivery Bike Maintenance', amountPKR: 10000, isTaxable: false },
      { id: 'al-14', type: 'special_duty', title: 'Route Hardship Allowance', amountPKR: 6000, isTaxable: false },
    ],
    standardDeductions: [
      { id: 'de-12', type: 'eobi', title: 'EOBI Contribution', amountPKR: 1800 },
    ],
    overtimeHourlyRatePKR: 300,
    paymentMethod: 'bank_transfer',
    bankName: 'Bank Alfalah Limited',
    accountTitle: 'Usman Ghani',
    accountNumber: 'PK24ALFH00034567890123',
    effectiveDate: '2026-01-01',
    payrollStatus: 'active',
    updatedAt: '2026-01-01T00:00:00Z',
  },
};

// Initial Payroll Periods
export const INITIAL_PAYROLL_PERIODS: PayrollPeriod[] = [
  {
    id: 'PAY-2026-09',
    periodCode: 'SEP-2026',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    status: 'under_review',
    totalGrossPKR: 574000,
    totalDeductionsPKR: 53200,
    totalNetPayPKR: 520800,
    employeeCount: 5,
    calculatedBy: 'Ayesha Noor (Senior Accountant)',
    calculatedAt: '2026-09-18T18:00:00Z',
    reviewedBy: 'Farhan Zaidi (Operations Director)',
  },
  {
    id: 'PAY-2026-08',
    periodCode: 'AUG-2026',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    status: 'disbursed',
    totalGrossPKR: 568000,
    totalDeductionsPKR: 52500,
    totalNetPayPKR: 515500,
    employeeCount: 5,
    calculatedBy: 'Ayesha Noor',
    calculatedAt: '2026-08-28T16:00:00Z',
    reviewedBy: 'Farhan Zaidi',
    approvedBy: 'Farhan Zaidi',
    approvedAt: '2026-08-29T10:00:00Z',
    postedBy: 'Ayesha Noor',
    postedAt: '2026-08-30T09:00:00Z',
  },
];

// Initial Payroll Entries for SEP-2026
export const INITIAL_PAYROLL_ENTRIES: Record<string, PayrollEntry[]> = {
  'PAY-2026-09': [
    {
      id: 'PAY-REC-09-1001',
      payrollPeriodId: 'PAY-2026-09',
      employeeId: 'EMP-1001',
      employeeName: 'Hamza Tariq',
      department: 'warehouse',
      jobTitle: 'Warehouse Supervisor',
      daysInPeriod: 30,
      daysPresent: 26,
      daysApprovedLeave: 0,
      daysUnpaidLeave: 0,
      lateDeductionsPKR: 0,
      approvedOvertimeHours: 6.5,
      overtimePayPKR: 3055,
      basicSalaryPKR: 65000,
      totalAllowancesPKR: 40000,
      grossPayPKR: 108055,
      taxDeductionPKR: 2500,
      eobiDeductionPKR: 1800,
      otherDeductionsPKR: 3500,
      totalDeductionsPKR: 7800,
      netPayPKR: 100255,
      approvalStatus: 'approved',
      paymentStatus: 'unpaid',
      isAdjusted: false,
    },
    {
      id: 'PAY-REC-09-1002',
      payrollPeriodId: 'PAY-2026-09',
      employeeId: 'EMP-1002',
      employeeName: 'Farhan Zaidi',
      department: 'administration',
      jobTitle: 'Operations & HR Director',
      daysInPeriod: 30,
      daysPresent: 26,
      daysApprovedLeave: 0,
      daysUnpaidLeave: 0,
      lateDeductionsPKR: 0,
      approvedOvertimeHours: 0,
      overtimePayPKR: 0,
      basicSalaryPKR: 175000,
      totalAllowancesPKR: 105000,
      grossPayPKR: 280000,
      taxDeductionPKR: 22500,
      eobiDeductionPKR: 1800,
      otherDeductionsPKR: 10000,
      totalDeductionsPKR: 34300,
      netPayPKR: 245700,
      approvalStatus: 'approved',
      paymentStatus: 'unpaid',
      isAdjusted: false,
    },
    {
      id: 'PAY-REC-09-1003',
      payrollPeriodId: 'PAY-2026-09',
      employeeId: 'EMP-1003',
      employeeName: 'Ayesha Noor',
      department: 'finance',
      jobTitle: 'Senior Financial Accountant',
      daysInPeriod: 30,
      daysPresent: 25,
      daysApprovedLeave: 0,
      daysUnpaidLeave: 0,
      lateDeductionsPKR: 750, // Late penalty for recurring canal traffic
      approvedOvertimeHours: 4.0,
      overtimePayPKR: 2300,
      basicSalaryPKR: 80000,
      totalAllowancesPKR: 40000,
      grossPayPKR: 122300,
      taxDeductionPKR: 4500,
      eobiDeductionPKR: 1800,
      otherDeductionsPKR: 4000,
      totalDeductionsPKR: 11050,
      netPayPKR: 111250,
      approvalStatus: 'approved',
      paymentStatus: 'unpaid',
      isAdjusted: false,
    },
    {
      id: 'PAY-REC-09-1004',
      payrollPeriodId: 'PAY-2026-09',
      employeeId: 'EMP-1004',
      employeeName: 'Bilal Qureshi',
      department: 'sales',
      jobTitle: 'Wholesale Sales Executive',
      daysInPeriod: 30,
      daysPresent: 24,
      daysApprovedLeave: 2,
      daysUnpaidLeave: 0,
      lateDeductionsPKR: 0,
      approvedOvertimeHours: 8.0,
      overtimePayPKR: 3200,
      basicSalaryPKR: 55000,
      totalAllowancesPKR: 50000,
      grossPayPKR: 108200,
      taxDeductionPKR: 1500,
      eobiDeductionPKR: 1800,
      otherDeductionsPKR: 0,
      totalDeductionsPKR: 3300,
      netPayPKR: 104900,
      approvalStatus: 'approved',
      paymentStatus: 'unpaid',
      isAdjusted: false,
    },
    {
      id: 'PAY-REC-09-1005',
      payrollPeriodId: 'PAY-2026-09',
      employeeId: 'EMP-1005',
      employeeName: 'Usman Ghani',
      department: 'delivery',
      jobTitle: 'Senior Route Rider',
      daysInPeriod: 30,
      daysPresent: 26,
      daysApprovedLeave: 0,
      daysUnpaidLeave: 0,
      lateDeductionsPKR: 300,
      approvedOvertimeHours: 5.0,
      overtimePayPKR: 1500,
      basicSalaryPKR: 42000,
      totalAllowancesPKR: 28000,
      grossPayPKR: 71500,
      taxDeductionPKR: 0,
      eobiDeductionPKR: 1800,
      otherDeductionsPKR: 0,
      totalDeductionsPKR: 2100,
      netPayPKR: 69400,
      approvalStatus: 'approved',
      paymentStatus: 'unpaid',
      isAdjusted: false,
    },
  ],
};

// Initial Performance Reviews
export const INITIAL_PERFORMANCE_REVIEWS: PerformanceReview[] = [
  {
    id: 'REV-2026-Q2-1001',
    reviewPeriod: 'Q2-2026 (Apr - Jun)',
    employeeId: 'EMP-1001',
    employeeName: 'Hamza Tariq',
    department: 'warehouse',
    managerId: 'EMP-1002',
    managerName: 'Farhan Zaidi',
    goals: [
      { id: 'g-1', description: 'Maintain physical inventory audit variance below 0.1%', metric: 'Variance %', target: '< 0.1%', achieved: '0.04%', rating: 5 },
      { id: 'g-2', description: 'Process inbound GRNs within 3 hours of supplier truck arrival', metric: 'GRN Turnaround', target: '< 3.0 hrs', achieved: '2.4 hrs', rating: 4 },
      { id: 'g-3', description: 'Zero forklift dock safety incidents', metric: 'Safety Incidents', target: '0', achieved: '0', rating: 5 },
    ],
    overallRating: 4.7,
    managerComments: 'Exceptional stewardship of the Lahore Central Warehouse. Diligent supervision of inbound supplier shipments and high team morale.',
    employeeComments: 'Thank you. Requesting replacement of two barcode scanners at dock 2 for further throughput improvement in Q3.',
    reviewStatus: 'finalized',
    followUpActions: ['Authorize requisition for 2 handheld rugged scanners', 'Nominate for advanced Supply Chain Safety certification'],
    finalizedAt: '2026-07-05T11:00:00Z',
    createdAt: '2026-06-25T10:00:00Z',
  },
  {
    id: 'REV-2026-Q2-1004',
    reviewPeriod: 'Q2-2026 (Apr - Jun)',
    employeeId: 'EMP-1004',
    employeeName: 'Bilal Qureshi',
    department: 'sales',
    managerId: 'EMP-1002',
    managerName: 'Farhan Zaidi',
    goals: [
      { id: 'g-4', description: 'Achieve monthly confectionery booking volume target', metric: 'Gross Sales (PKR)', target: '8,000,000', achieved: '8,450,000', rating: 5 },
      { id: 'g-5', description: 'Onboard 15 verified retail shop customers', metric: 'Retailer KYC Approvals', target: '15', achieved: '18', rating: 5 },
      { id: 'g-6', description: 'Keep customer overdue credit invoices below 5%', metric: 'Overdue %', target: '< 5%', achieved: '4.2%', rating: 4 },
    ],
    overallRating: 4.6,
    managerComments: 'Outstanding performance in opening new sub-wholesaler accounts in northern Lahore and driving bulk carton sales.',
    employeeComments: 'Looking forward to expanding coverage into Kasur wholesale markets in Q3.',
    reviewStatus: 'finalized',
    followUpActions: ['Expand route fuel allowance for Kasur highway exploration'],
    finalizedAt: '2026-07-08T15:00:00Z',
    createdAt: '2026-06-26T14:00:00Z',
  },
];

// Initial Training Records
export const INITIAL_TRAINING_RECORDS: TrainingRecord[] = [
  {
    id: 'TRN-2026-01',
    programTitle: 'Wholesale Food Safety, Temperature & Confectionery Storage',
    employeeId: 'EMP-1001',
    employeeName: 'Hamza Tariq',
    trainingDate: '2026-02-15',
    provider: 'Punjab Food Authority (PFA)',
    completionStatus: 'completed',
    certificateNumber: 'PFA-FS-2026-9921',
    skillsAcquired: ['Temperature Buffer Control', 'Chilled Carton Segregation', 'Pest Prevention Standards'],
    expiryDate: '2028-02-14',
    notes: 'Renew every 2 years in accordance with wholesale food safety regulations.',
  },
  {
    id: 'TRN-2026-02',
    programTitle: 'Advanced Reach-Truck & Forklift Maneuvering',
    employeeId: 'EMP-1001',
    employeeName: 'Hamza Tariq',
    trainingDate: '2025-05-10',
    provider: 'Pakistan Safety Training Institute',
    completionStatus: 'completed',
    certificateNumber: 'PSTI-FL-88124',
    skillsAcquired: ['High-Bay Stacking (Tier 4)', 'Pallet Weight Distribution', 'Battery Charging Protocol'],
    expiryDate: '2027-05-09',
  },
  {
    id: 'TRN-2026-03',
    programTitle: 'Defensive Motorbike Riding & Electronic Cash Security',
    employeeId: 'EMP-1005',
    employeeName: 'Usman Ghani',
    trainingDate: '2025-10-02',
    provider: 'Lahore Traffic Police Training Academy',
    completionStatus: 'completed',
    certificateNumber: 'LTP-DEF-5510',
    skillsAcquired: ['Rainy Route Maneuvering', 'Emergency Braking with 40kg Cargo', 'Safe Cash Custody'],
    expiryDate: '2026-10-01',
    notes: 'Renewal due next month.',
  },
];

// Initial Workforce Audit Records
export const INITIAL_WORKFORCE_AUDIT: WorkforceAuditRecord[] = [
  {
    id: 'AUD-WF-001',
    timestamp: '2026-09-19T08:15:00Z',
    actorId: 'EMP-1002',
    actorName: 'Farhan Zaidi (Operations Director)',
    action: 'overtime_approved',
    targetEntity: 'AttendanceRecord',
    targetId: 'ATT-20260919-EMP1001',
    details: 'Approved 0.25 hours overtime for Hamza Tariq for dock intake completion.',
    oldValues: { overtimeApproved: false },
    newValues: { overtimeApproved: true, overtimeApprovedBy: 'Farhan Zaidi' },
    reason: 'Heavy confectionery delivery truck intake from English Biscuit Manufacturers.',
  },
  {
    id: 'AUD-WF-002',
    timestamp: '2026-09-18T18:05:00Z',
    actorId: 'EMP-1003',
    actorName: 'Ayesha Noor (Senior Accountant)',
    action: 'payroll_calculated',
    targetEntity: 'PayrollPeriod',
    targetId: 'PAY-2026-09',
    details: 'Initiated September 2026 monthly payroll calculation across 5 active employees.',
    newValues: { totalGrossPKR: 574000, totalNetPayPKR: 520800 },
    reason: 'Monthly end-of-period payroll compilation.',
  },
  {
    id: 'AUD-WF-003',
    timestamp: '2026-09-16T10:35:00Z',
    actorId: 'EMP-1001',
    actorName: 'Hamza Tariq (Warehouse Supervisor)',
    action: 'employee_created',
    targetEntity: 'Employee',
    targetId: 'EMP-1006',
    details: 'Created draft onboarding profile for Zainab Bibi (Inventory Quality Inspector). Status: pending_approval.',
    newValues: { fullName: 'Zainab Bibi', department: 'warehouse', workflowStatus: 'pending_approval' },
    reason: 'New hire for dock incoming quality control.',
  },
  {
    id: 'AUD-WF-004',
    timestamp: '2026-09-14T17:30:00Z',
    actorId: 'EMP-1002',
    actorName: 'Farhan Zaidi (Operations Director)',
    action: 'status_changed',
    targetEntity: 'Employee',
    targetId: 'EMP-1008',
    details: 'Suspended employee Haris Javed (Sales) pending cash collection investigation.',
    oldValues: { workflowStatus: 'active' },
    newValues: { workflowStatus: 'suspended' },
    reason: 'Route cash collection shortfall of PKR 15,000 reported on invoice INV-2026-0889.',
  },
  {
    id: 'AUD-WF-005',
    timestamp: '2026-09-12T09:30:00Z',
    actorId: 'EMP-1002',
    actorName: 'Farhan Zaidi (Operations Director)',
    action: 'leave_approved',
    targetEntity: 'LeaveRequest',
    targetId: 'LV-2026-002',
    details: 'Approved 2-day Sick Leave for Bilal Qureshi (Sales).',
    oldValues: { status: 'manager_review' },
    newValues: { status: 'approved', approverName: 'Farhan Zaidi' },
    reason: 'Medical certificate verified.',
  },
];

// Persistent State Store Keys
const KEY_EMPLOYEES = 'candi_wf_employees_v1';
const KEY_SHIFTS = 'candi_wf_shifts_v1';
const KEY_ATTENDANCE = 'candi_wf_attendance_v1';
const KEY_LEAVES = 'candi_wf_leaves_v1';
const KEY_COMPENSATION = 'candi_wf_compensation_v1';
const KEY_PAYROLL_PERIODS = 'candi_wf_payroll_periods_v1';
const KEY_PAYROLL_ENTRIES = 'candi_wf_payroll_entries_v1';
const KEY_REVIEWS = 'candi_wf_reviews_v1';
const KEY_TRAINING = 'candi_wf_training_v1';
const KEY_AUDIT = 'candi_wf_audit_v1';

function loadOrSeed<T>(key: string, seed: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}

// Workforce Data Store Service
export class WorkforceDataStore {
  static getEmployees(): Employee[] {
    return loadOrSeed<Employee[]>(KEY_EMPLOYEES, INITIAL_EMPLOYEES);
  }

  static saveEmployees(employees: Employee[]) {
    localStorage.setItem(KEY_EMPLOYEES, JSON.stringify(employees));
  }

  static getEmployeeById(id: string): Employee | undefined {
    return this.getEmployees().find((e) => e.id === id);
  }

  static addEmployee(employee: Employee, actorName: string): Employee {
    const all = this.getEmployees();
    all.push(employee);
    this.saveEmployees(all);

    this.addAuditRecord({
      actorId: 'current-user',
      actorName,
      action: 'employee_created',
      targetEntity: 'Employee',
      targetId: employee.id,
      details: `Created new employee profile ${employee.fullName} (${employee.employeeCode}) in status ${employee.workflowStatus}`,
      newValues: { ...employee },
      reason: 'Maker-Checker onboarding submission',
    });

    return employee;
  }

  static updateEmployeeStatus(
    id: string,
    status: Employee['workflowStatus'],
    actorName: string,
    reason?: string
  ): Employee | undefined {
    const all = this.getEmployees();
    const index = all.findIndex((e) => e.id === id);
    if (index === -1) return undefined;

    const old = { ...all[index] };
    all[index].workflowStatus = status;
    all[index].updatedAt = new Date().toISOString();
    if (status === 'active') {
      all[index].approvedBy = actorName;
      all[index].approvedAt = new Date().toISOString();
    }
    if (status === 'suspended') {
      all[index].suspendedReason = reason;
    }
    if (status === 'inactive') {
      all[index].inactiveReason = reason;
    }

    this.saveEmployees(all);

    this.addAuditRecord({
      actorId: 'current-user',
      actorName,
      action: status === 'active' ? 'employee_approved' : 'status_changed',
      targetEntity: 'Employee',
      targetId: id,
      details: `Changed workflow status of ${all[index].fullName} from ${old.workflowStatus} to ${status}`,
      oldValues: { status: old.workflowStatus },
      newValues: { status },
      reason,
    });

    return all[index];
  }

  static getShifts(): WorkShift[] {
    return loadOrSeed<WorkShift[]>(KEY_SHIFTS, INITIAL_SHIFTS);
  }

  static saveShifts(shifts: WorkShift[]) {
    localStorage.setItem(KEY_SHIFTS, JSON.stringify(shifts));
  }

  static assignEmployeeToShift(shiftId: string, employeeId: string, actorName: string) {
    const shifts = this.getShifts();
    const targetShift = shifts.find((s) => s.id === shiftId);
    if (!targetShift) return;

    if (!targetShift.assignedEmployeeIds.includes(employeeId)) {
      targetShift.assignedEmployeeIds.push(employeeId);
      this.saveShifts(shifts);

      this.addAuditRecord({
        actorId: 'current-user',
        actorName,
        action: 'status_changed',
        targetEntity: 'WorkShift',
        targetId: shiftId,
        details: `Assigned employee ${employeeId} to shift ${targetShift.shiftName}`,
      });
    }
  }

  static getAttendance(): AttendanceRecord[] {
    return loadOrSeed<AttendanceRecord[]>(KEY_ATTENDANCE, INITIAL_ATTENDANCE);
  }

  static saveAttendance(records: AttendanceRecord[]) {
    localStorage.setItem(KEY_ATTENDANCE, JSON.stringify(records));
  }

  static overrideAttendance(
    id: string,
    newStatus: AttendanceStatus,
    reason: string,
    actorName: string,
    newCheckIn?: string,
    newCheckOut?: string
  ): AttendanceRecord | undefined {
    const records = this.getAttendance();
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) return undefined;

    const old = { ...records[index] };
    records[index].status = newStatus;
    records[index].isManualEdit = true;
    records[index].editReason = reason;
    records[index].editedBy = actorName;
    records[index].editedAt = new Date().toISOString();
    if (newCheckIn) records[index].checkInTime = newCheckIn;
    if (newCheckOut) records[index].checkOutTime = newCheckOut;

    this.saveAttendance(records);

    this.addAuditRecord({
      actorId: 'current-user',
      actorName,
      action: 'attendance_edited',
      targetEntity: 'AttendanceRecord',
      targetId: id,
      details: `Manual attendance override for ${records[index].employeeName}: status changed from ${old.status} to ${newStatus}`,
      oldValues: { status: old.status, checkIn: old.checkInTime, checkOut: old.checkOutTime },
      newValues: { status: newStatus, checkIn: records[index].checkInTime, checkOut: records[index].checkOutTime },
      reason,
    });

    return records[index];
  }

  static approveOvertime(id: string, actorName: string): AttendanceRecord | undefined {
    const records = this.getAttendance();
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) return undefined;

    records[index].overtimeApproved = true;
    records[index].overtimeApprovedBy = actorName;
    this.saveAttendance(records);

    this.addAuditRecord({
      actorId: 'current-user',
      actorName,
      action: 'overtime_approved',
      targetEntity: 'AttendanceRecord',
      targetId: id,
      details: `Approved ${records[index].overtimeHours} hrs overtime for ${records[index].employeeName}`,
      newValues: { overtimeApproved: true, approver: actorName },
    });

    return records[index];
  }

  static getLeaves(): LeaveRequest[] {
    return loadOrSeed<LeaveRequest[]>(KEY_LEAVES, INITIAL_LEAVES);
  }

  static saveLeaves(leaves: LeaveRequest[]) {
    localStorage.setItem(KEY_LEAVES, JSON.stringify(leaves));
  }

  static submitLeave(req: LeaveRequest, actorName: string): LeaveRequest {
    const leaves = this.getLeaves();
    leaves.unshift(req);
    this.saveLeaves(leaves);

    this.addAuditRecord({
      actorId: 'current-user',
      actorName,
      action: 'leave_approved',
      targetEntity: 'LeaveRequest',
      targetId: req.id,
      details: `Submitted ${req.numberOfDays}-day ${req.leaveType} leave request for ${req.employeeName}`,
      reason: req.reason,
    });

    return req;
  }

  static reviewLeave(
    id: string,
    status: 'approved' | 'rejected',
    actorName: string,
    rejectionReason?: string
  ): LeaveRequest | undefined {
    const leaves = this.getLeaves();
    const index = leaves.findIndex((l) => l.id === id);
    if (index === -1) return undefined;

    const old = { ...leaves[index] };
    leaves[index].status = status;
    leaves[index].approverName = actorName;
    leaves[index].reviewedAt = new Date().toISOString();
    if (rejectionReason) leaves[index].rejectionReason = rejectionReason;

    // If approved, sync to attendance register
    if (status === 'approved') {
      leaves[index].attendanceUpdated = true;
      const attendance = this.getAttendance();
      const existing = attendance.find(
        (a) => a.employeeId === leaves[index].employeeId && a.date === leaves[index].startDate
      );
      if (existing) {
        existing.status = 'leave';
        existing.notes = `Approved ${leaves[index].leaveType} leave (${leaves[index].reason})`;
      } else {
        attendance.push({
          id: `ATT-${leaves[index].startDate.replace(/-/g, '')}-${leaves[index].employeeId}`,
          employeeId: leaves[index].employeeId,
          employeeName: leaves[index].employeeName,
          department: leaves[index].department,
          date: leaves[index].startDate,
          shiftId: 'SHIFT-01',
          shiftName: 'General Roster',
          workingHours: 0,
          lateArrivalMinutes: 0,
          earlyDepartureMinutes: 0,
          overtimeHours: 0,
          overtimeApproved: false,
          status: 'leave',
          isManualEdit: true,
          editReason: `System sync from approved leave ${id}`,
          notes: `Approved leave: ${leaves[index].reason}`,
        });
      }
      this.saveAttendance(attendance);
    }

    this.saveLeaves(leaves);

    this.addAuditRecord({
      actorId: 'current-user',
      actorName,
      action: status === 'approved' ? 'leave_approved' : 'leave_rejected',
      targetEntity: 'LeaveRequest',
      targetId: id,
      details: `${status === 'approved' ? 'Approved' : 'Rejected'} leave request for ${leaves[index].employeeName}`,
      oldValues: { status: old.status },
      newValues: { status },
      reason: rejectionReason,
    });

    return leaves[index];
  }

  static getCompensation(): Record<string, EmployeeCompensation> {
    return loadOrSeed<Record<string, EmployeeCompensation>>(KEY_COMPENSATION, INITIAL_COMPENSATION);
  }

  static saveCompensation(comp: Record<string, EmployeeCompensation>) {
    localStorage.setItem(KEY_COMPENSATION, JSON.stringify(comp));
  }

  static getPayrollPeriods(): PayrollPeriod[] {
    return loadOrSeed<PayrollPeriod[]>(KEY_PAYROLL_PERIODS, INITIAL_PAYROLL_PERIODS);
  }

  static savePayrollPeriods(periods: PayrollPeriod[]) {
    localStorage.setItem(KEY_PAYROLL_PERIODS, JSON.stringify(periods));
  }

  static getPayrollEntries(periodId: string): PayrollEntry[] {
    const all = loadOrSeed<Record<string, PayrollEntry[]>>(KEY_PAYROLL_ENTRIES, INITIAL_PAYROLL_ENTRIES);
    return all[periodId] || [];
  }

  static savePayrollEntries(periodId: string, entries: PayrollEntry[]) {
    const all = loadOrSeed<Record<string, PayrollEntry[]>>(KEY_PAYROLL_ENTRIES, INITIAL_PAYROLL_ENTRIES);
    all[periodId] = entries;
    localStorage.setItem(KEY_PAYROLL_ENTRIES, JSON.stringify(all));
  }

  static updatePayrollStatus(
    periodId: string,
    status: PayrollPeriod['status'],
    actorName: string,
    disbursementRef?: string
  ): PayrollPeriod | undefined {
    const periods = this.getPayrollPeriods();
    const target = periods.find((p) => p.id === periodId);
    if (!target) return undefined;

    target.status = status;
    if (status === 'approved') {
      target.approvedBy = actorName;
      target.approvedAt = new Date().toISOString();
    }
    if (status === 'posted') {
      target.postedBy = actorName;
      target.postedAt = new Date().toISOString();
    }
    if (status === 'disbursed') {
      const entries = this.getPayrollEntries(periodId);
      entries.forEach((e) => {
        e.paymentStatus = 'paid';
        e.paidAt = new Date().toISOString();
        e.paymentReference = disbursementRef || `BANK-DISB-${Date.now()}`;
      });
      this.savePayrollEntries(periodId, entries);
    }

    this.savePayrollPeriods(periods);

    this.addAuditRecord({
      actorId: 'current-user',
      actorName,
      action: 'payroll_approved',
      targetEntity: 'PayrollPeriod',
      targetId: periodId,
      details: `Updated payroll period ${target.periodCode} status to ${status}`,
      reason: disbursementRef ? `Disbursement reference: ${disbursementRef}` : undefined,
    });

    return target;
  }

  static getPerformanceReviews(): PerformanceReview[] {
    return loadOrSeed<PerformanceReview[]>(KEY_REVIEWS, INITIAL_PERFORMANCE_REVIEWS);
  }

  static savePerformanceReviews(reviews: PerformanceReview[]) {
    localStorage.setItem(KEY_REVIEWS, JSON.stringify(reviews));
  }

  static getTrainingRecords(): TrainingRecord[] {
    return loadOrSeed<TrainingRecord[]>(KEY_TRAINING, INITIAL_TRAINING_RECORDS);
  }

  static saveTrainingRecords(records: TrainingRecord[]) {
    localStorage.setItem(KEY_TRAINING, JSON.stringify(records));
  }

  static getAuditRecords(): WorkforceAuditRecord[] {
    return loadOrSeed<WorkforceAuditRecord[]>(KEY_AUDIT, INITIAL_WORKFORCE_AUDIT);
  }

  static addAuditRecord(
    record: Omit<WorkforceAuditRecord, 'id' | 'timestamp'>
  ): WorkforceAuditRecord {
    const logs = this.getAuditRecords();
    const newRecord: WorkforceAuditRecord = {
      ...record,
      id: `AUD-WF-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newRecord);
    localStorage.setItem(KEY_AUDIT, JSON.stringify(logs));
    return newRecord;
  }
}

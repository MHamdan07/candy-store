import type {
  Employee,
  LeaveRequest,
  StaffRoleName,
  AttendanceStatus,
  AllowanceItem,
  DeductionItem,
} from '@candi/types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Validates Employee Onboarding data for Phase 5A
 */
export function validateEmployeeOnboarding(data: Partial<Employee>): ValidationResult {
  const errors: string[] = [];

  if (!data.fullName || data.fullName.trim().length < 3) {
    errors.push('Full name must be at least 3 characters long.');
  }

  // Pakistani CNIC validation (format: 42101-1234567-1 or 13 digits)
  const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
  if (!data.cnic || !cnicRegex.test(data.cnic.trim())) {
    errors.push('CNIC must follow the standard 13-digit format (e.g. 42101-1234567-1).');
  }

  // Pakistani phone validation (e.g. +923001234567 or 03001234567)
  const phoneRegex = /^(\+92|0)3\d{9}$/;
  if (!data.phone || !phoneRegex.test(data.phone.trim().replace(/\s+/g, ''))) {
    errors.push('Contact phone must be a valid Pakistani mobile number (e.g. +923001234567).');
  }

  if (!data.department) {
    errors.push('Assigned department is required.');
  }

  if (!data.jobTitle || data.jobTitle.trim().length === 0) {
    errors.push('Job title is required.');
  }

  if (!data.assignedLocationId) {
    errors.push('Assigned warehouse/depot location is required.');
  }

  if (!data.emergencyContact?.phone || !phoneRegex.test(data.emergencyContact.phone.trim().replace(/\s+/g, ''))) {
    errors.push('Emergency contact phone number is required and must be valid.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates Leave Request and enforces Segregation of Duties (no self-approval)
 */
export function validateLeaveRequest(
  request: Partial<LeaveRequest>,
  actorId?: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!request.employeeId) {
    errors.push('Employee identifier is required.');
  }

  if (!request.startDate || !request.endDate) {
    errors.push('Start date and end date are both required.');
  } else {
    const start = new Date(request.startDate).getTime();
    const end = new Date(request.endDate).getTime();
    if (start > end) {
      errors.push('Leave start date cannot be later than end date.');
    }
  }

  if (!request.numberOfDays || request.numberOfDays <= 0) {
    errors.push('Number of days must be at least 1.');
  }

  if (!request.reason || request.reason.trim().length < 5) {
    errors.push('A valid reason of at least 5 characters is required for leave requests.');
  }

  // Segregation of duties check: An employee cannot approve their own leave
  if (actorId && request.employeeId === actorId && request.status === 'approved') {
    errors.push('Governance violation: Employees cannot approve their own leave application.');
  }

  if (request.numberOfDays && request.numberOfDays > 14) {
    warnings.push('Extended leave (> 14 days) requires executive director counter-signoff.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates Manual Attendance Override with mandatory reason requirement
 */
export function validateAttendanceOverride(
  actorRole: StaffRoleName,
  newStatus: AttendanceStatus,
  editReason?: string
): ValidationResult {
  const errors: string[] = [];

  const authorizedRoles: StaffRoleName[] = ['super_admin', 'admin_manager', 'warehouse_manager'];
  if (!authorizedRoles.includes(actorRole)) {
    errors.push(`Role ${actorRole} does not have authorization to override attendance records.`);
  }

  if (!editReason || editReason.trim().length < 5) {
    errors.push('Manual attendance changes require an explicit reason (minimum 5 characters).');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates Overtime Sign-off
 */
export function validateOvertimeApproval(
  hours: number,
  actorRole: StaffRoleName
): ValidationResult {
  const errors: string[] = [];

  const approverRoles: StaffRoleName[] = ['super_admin', 'admin_manager', 'warehouse_manager', 'delivery_manager'];
  if (!approverRoles.includes(actorRole)) {
    errors.push('Only authorized managers or administrators can approve overtime.');
  }

  if (hours <= 0) {
    errors.push('Overtime hours must be greater than 0.');
  }

  if (hours > 6) {
    errors.push('Daily overtime cannot exceed 6 hours in compliance with wholesale labor policies.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates Payroll Calculation Engine
 */
export function calculateAndValidatePayroll(params: {
  basicSalaryPKR: number;
  allowances: AllowanceItem[];
  deductions: DeductionItem[];
  approvedOvertimeHours: number;
  overtimeHourlyRatePKR: number;
  lateArrivalMinutes: number;
  unpaidLeaveDays: number;
}): {
  grossPayPKR: number;
  totalAllowancesPKR: number;
  overtimePayPKR: number;
  lateDeductionPKR: number;
  unpaidLeaveDeductionPKR: number;
  totalDeductionsPKR: number;
  netPayPKR: number;
  validation: ValidationResult;
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  const totalAllowancesPKR = params.allowances.reduce((acc, a) => acc + (a.amountPKR || 0), 0);
  const overtimePayPKR = Math.round(params.approvedOvertimeHours * params.overtimeHourlyRatePKR);
  const grossPayPKR = params.basicSalaryPKR + totalAllowancesPKR + overtimePayPKR;

  // Standard late penalty: 1/4 day salary per 60 cumulative late minutes
  const dailyRate = Math.round(params.basicSalaryPKR / 26);
  const lateDeductionPKR = Math.min(
    dailyRate * 2,
    Math.round((params.lateArrivalMinutes / 60) * (dailyRate * 0.25))
  );

  const unpaidLeaveDeductionPKR = params.unpaidLeaveDays * dailyRate;

  const otherDeductionsPKR = params.deductions.reduce((acc, d) => acc + (d.amountPKR || 0), 0);
  const totalDeductionsPKR = otherDeductionsPKR + lateDeductionPKR + unpaidLeaveDeductionPKR;

  const netPayPKR = Math.max(0, grossPayPKR - totalDeductionsPKR);

  if (totalDeductionsPKR > grossPayPKR) {
    warnings.push('Total deductions exceed total gross pay. Net payout capped at 0 PKR with negative balance carryforward.');
  }

  if (params.basicSalaryPKR < 32000) {
    warnings.push('Basic salary is below national wholesale minimum wage threshold (32,000 PKR).');
  }

  return {
    grossPayPKR,
    totalAllowancesPKR,
    overtimePayPKR,
    lateDeductionPKR,
    unpaidLeaveDeductionPKR,
    totalDeductionsPKR,
    netPayPKR,
    validation: {
      isValid: errors.length === 0,
      errors,
      warnings,
    },
  };
}

export interface Leave {
  id: string;
  employeeId: string;
  employee?: Employee;
  leaveType: LeaveType;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: Date;
  approvedBy?: string;
  approverName?: string;
  approverComments?: string;
  approvedDate?: Date;
  rejectedDate?: Date;
  attachments?: string[];
  isEmergency?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  employee?: Employee;
  leaveType: LeaveType;
  leaveTypeId: string;
  totalAllotted: number;
  totalUsed: number;
  totalRemaining: number;
  carryForward: number;
  year: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LeaveType {
  id: string;
  name: string;
  description: string;
  maxDaysPerYear: number;
  carryForwardAllowed: boolean;
  maxCarryForward: number;
  requiresApproval: boolean;
  isActive: boolean;
  allowedForEmployees: boolean;
  minimumNoticeRays: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveApplication {
  employeeId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  isEmergency?: boolean;
  attachments?: File[];
}

export interface LeaveApproval {
  leaveId: string;
  action: 'approve' | 'reject';
  comments?: string;
  approvedBy: string;
}

export interface LeaveStats {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  totalCancelled: number;
  pendingApprovals: number;
  emergencyLeaves: number;
}

export interface EmployeeLeaveStats {
  employeeId: string;
  employeeName: string;
  totalLeavesTaken: number;
  remainingBalance: number;
  pendingRequests: number;
  lastLeaveDate?: Date;
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export enum DefaultLeaveTypes {
  ANNUAL = 'annual',
  SICK = 'sick',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
  EMERGENCY = 'emergency',
  CASUAL = 'casual',
  STUDY = 'study'
}

import { Employee } from '../../employee/models/employee.model';

export interface Leave {
  id: string;
  employeeId: string;
  employee?: Employee;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: Date;
  approvedBy?: string;
  approverComments?: string;
  approvedDate?: Date;
  rejectedDate?: Date;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  totalAllotted: number;
  totalUsed: number;
  totalRemaining: number;
  carryForward: number;
  year: number;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveApplication {
  employeeId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  attachments?: File[];
}

export interface LeaveApproval {
  leaveId: string;
  action: 'approve' | 'reject';
  comments?: string;
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

import { Employee } from './employee.model';

// src/app/features/payroll/models/deduction.model.ts
export interface Deduction {
  id?: string;
  employeeId: string;
  name: string;
  isPercentage: boolean;
  amountOrPercent: number;
  isRecurring: boolean;
  startUtc?: string;
  endUtc?: string;
  notes?: string;
  createdUtc?: string;
}

export interface CreateDeductionDto {
  employeeId: string;
  name: string;
  isPercentage: boolean;
  amountOrPercent: number;
  isRecurring: boolean;
  startUtc?: string;
  endUtc?: string;
  notes?: string;
}

export interface UpdateDeductionDto {
  name: string;
  isPercentage: boolean;
  amountOrPercent: number;
  isRecurring: boolean;
  startUtc?: string;
  endUtc?: string;
  notes?: string;
}

// src/app/features/payroll/models/bonus.model.ts
export interface Bonus {
  id?: string;
  employeeId: string;
  employeeName?: string;
  name: string;
  notes?: string;
  isPercentage: boolean;
  amountOrPercent: number;
  isRecurring: boolean;
  startUtc?: string;
  endUtc?: string;
  createdUtc?: string;
}

export interface CreateBonusDto {
  employeeId: string;
  name: string;
  notes?: string;
  isPercentage: boolean;
  amountOrPercent: number;
  isRecurring: boolean;
  startUtc?: string;
  endUtc?: string;
}

export interface UpdateBonusDto {
  name: string;
  notes?: string;
  isPercentage: boolean;
  amountOrPercent: number;
  isRecurring: boolean;
  startUtc?: string;
  endUtc?: string;
}

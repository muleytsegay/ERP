export interface BankAccount {
  id?: string;
  employeeId: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  branch: string;
  swiftBic: string;
  ifsc: string;
  isPrimary: boolean;
  createdUtc?: Date;
}

export interface CreateBankAccountRequest {
  dto: {
    employeeId: string;
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    branch: string;
    swiftBic: string;
    ifsc: string;
    isPrimary: boolean;
  };
}

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-bank-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    CheckboxModule
  ],
  template: `
    <p-card header="Bank Account Information">
      <form [formGroup]="bankForm" class="p-4">
        <div class="grid">
          <div class="col-12 md:col-6">
            <label for="bankName" class="block text-900 font-medium mb-2">Bank Name *</label>
            <input 
              pInputText 
              id="bankName" 
              formControlName="bankName"
              placeholder="Enter bank name"
              class="w-full"
              [class.ng-invalid]="bankForm.get('bankName')?.invalid && bankForm.get('bankName')?.touched" />
            <small 
              class="p-error" 
              *ngIf="bankForm.get('bankName')?.invalid && bankForm.get('bankName')?.touched">
              Bank name is required
            </small>
          </div>

          <div class="col-12 md:col-6">
            <label for="accountHolderName" class="block text-900 font-medium mb-2">Account Holder Name *</label>
            <input 
              pInputText 
              id="accountHolderName" 
              formControlName="accountHolderName"
              placeholder="Enter account holder name"
              class="w-full"
              [class.ng-invalid]="bankForm.get('accountHolderName')?.invalid && bankForm.get('accountHolderName')?.touched" />
            <small 
              class="p-error" 
              *ngIf="bankForm.get('accountHolderName')?.invalid && bankForm.get('accountHolderName')?.touched">
              Account holder name is required
            </small>
          </div>

          <div class="col-12 md:col-6">
            <label for="accountNumber" class="block text-900 font-medium mb-2">Account Number *</label>
            <input 
              pInputText 
              id="accountNumber" 
              formControlName="accountNumber"
              placeholder="Enter account number"
              class="w-full"
              [class.ng-invalid]="bankForm.get('accountNumber')?.invalid && bankForm.get('accountNumber')?.touched" />
            <small 
              class="p-error" 
              *ngIf="bankForm.get('accountNumber')?.invalid && bankForm.get('accountNumber')?.touched">
              Account number is required
            </small>
          </div>

          <div class="col-12 md:col-6">
            <label for="branch" class="block text-900 font-medium mb-2">Branch *</label>
            <input 
              pInputText 
              id="branch" 
              formControlName="branch"
              placeholder="Enter branch name"
              class="w-full"
              [class.ng-invalid]="bankForm.get('branch')?.invalid && bankForm.get('branch')?.touched" />
            <small 
              class="p-error" 
              *ngIf="bankForm.get('branch')?.invalid && bankForm.get('branch')?.touched">
              Branch is required
            </small>
          </div>

          <div class="col-12 md:col-6">
            <label for="swiftBic" class="block text-900 font-medium mb-2">SWIFT/BIC</label>
            <input 
              pInputText 
              id="swiftBic" 
              formControlName="swiftBic"
              placeholder="Enter SWIFT/BIC code"
              class="w-full" />
          </div>

          <div class="col-12 md:col-6">
            <label for="ifsc" class="block text-900 font-medium mb-2">IFSC Code</label>
            <input 
              pInputText 
              id="ifsc" 
              formControlName="ifsc"
              placeholder="Enter IFSC code"
              class="w-full" />
          </div>

          <div class="col-12">
            <div class="field-checkbox">
              <p-checkbox 
                id="isPrimary" 
                formControlName="isPrimary" 
                [binary]="true">
              </p-checkbox>
              <label for="isPrimary" class="ml-2">Set as primary bank account</label>
            </div>
          </div>
        </div>
      </form>
    </p-card>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class BankAccountComponent implements OnInit {
  @Input() initialData: any = null;
  @Output() dataChange = new EventEmitter<any>();
  @Output() validChange = new EventEmitter<boolean>();

  bankForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.bankForm = this.fb.group({
      bankName: ['', Validators.required],
      accountHolderName: ['', Validators.required],
      accountNumber: ['', Validators.required],
      branch: ['', Validators.required],
      swiftBic: [''],
      ifsc: [''],
      isPrimary: [true]
    });
  }

  ngOnInit() {
    if (this.initialData) {
      this.bankForm.patchValue(this.initialData);
    }

    this.bankForm.valueChanges.subscribe(value => {
      this.dataChange.emit(value);
      this.validChange.emit(this.bankForm.valid);
    });
  }

  getBankData() {
    return this.bankForm.value;
  }

  isValid() {
    return this.bankForm.valid;
  }
}

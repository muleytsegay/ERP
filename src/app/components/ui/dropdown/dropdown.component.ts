import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DropdownOption {
  value: any;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-dropdown',
  imports: [CommonModule],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css'
})
export class DropdownComponent {
  @Input() options: DropdownOption[] = [];
  @Input() placeholder = 'Select an option';
  @Input() value: any = null;
  @Input() disabled = false;
  @Input() multiple = false;
  @Output() valueChange = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<DropdownOption | DropdownOption[]>();

  isOpen = false;
  selectedOptions: DropdownOption[] = [];

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    if (this.value !== null) {
      if (this.multiple && Array.isArray(this.value)) {
        this.selectedOptions = this.options.filter(option => this.value.includes(option.value));
      } else {
        const selectedOption = this.options.find(option => option.value === this.value);
        if (selectedOption) {
          this.selectedOptions = [selectedOption];
        }
      }
    }
  }

  toggle() {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
    }
  }

  selectOption(option: DropdownOption) {
    if (option.disabled) return;

    if (this.multiple) {
      const index = this.selectedOptions.findIndex(selected => selected.value === option.value);
      if (index > -1) {
        this.selectedOptions.splice(index, 1);
      } else {
        this.selectedOptions.push(option);
      }
      const values = this.selectedOptions.map(opt => opt.value);
      this.valueChange.emit(values);
      this.selectionChange.emit([...this.selectedOptions]);
    } else {
      this.selectedOptions = [option];
      this.valueChange.emit(option.value);
      this.selectionChange.emit(option);
      this.isOpen = false;
    }
  }

  get displayText(): string {
    if (this.selectedOptions.length === 0) {
      return this.placeholder;
    }
    if (this.multiple) {
      if (this.selectedOptions.length === 1) {
        return this.selectedOptions[0].label;
      }
      return `${this.selectedOptions.length} items selected`;
    }
    return this.selectedOptions[0].label;
  }

  isSelected(option: DropdownOption): boolean {
    return this.selectedOptions.some(selected => selected.value === option.value);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  trackByValue(index: number, option: DropdownOption): any {
    return option.value;
  }
}

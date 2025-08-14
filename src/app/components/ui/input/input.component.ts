import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input',
  imports: [CommonModule],
  templateUrl: './input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  @Input() placeholder = '';
  @Input() type: string = 'text';
  @Input() label?: string;
  @Input() error?: string;
  @Input() disabled = false;
  @Input() required = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() icon?: string;
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() helperText?: string;

  @Output() valueChange = new EventEmitter<string>();
  @Output() blur = new EventEmitter<Event>();
  @Output() focus = new EventEmitter<Event>();

  value = '';
  private onChange = (value: string) => {};
  private onTouched = () => {};

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  onBlur(event: Event) {
    this.onTouched();
    this.blur.emit(event);
  }

  onFocus(event: Event) {
    this.focus.emit(event);
  }

  get inputClasses(): string {
    const baseClasses = 'block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200';
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base'
    };

    const iconClasses = {
      left: this.icon ? 'pl-10' : '',
      right: this.icon ? 'pr-10' : ''
    };

    const errorClass = this.error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : '';
    const disabledClass = this.disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : '';

    return `${baseClasses} ${sizeClasses[this.size]} ${iconClasses[this.iconPosition]} ${errorClass} ${disabledClass}`.trim();
  }

  get containerClasses(): string {
    return 'relative';
  }

  get iconClasses(): string {
    const baseClasses = 'absolute inset-y-0 flex items-center pointer-events-none text-gray-400';
    const positionClasses = {
      left: 'left-0 pl-3',
      right: 'right-0 pr-3'
    };
    return `${baseClasses} ${positionClasses[this.iconPosition]}`;
  }
}

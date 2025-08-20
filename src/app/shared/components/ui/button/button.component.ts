import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button.component.html'
})
export class ButtonComponent {
  @Input() label = '';
  @Input() type: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' = 'primary';
  @Input() variant: 'solid' | 'outline' | 'ghost' = 'solid';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Input() icon?: string;
  @Input() iconPosition: 'left' | 'right' = 'left';
  
  @Output() onClick = new EventEmitter<Event>();

  handleClick(event: Event) {
    if (!this.disabled && !this.loading) {
      this.onClick.emit(event);
    }
  }

  get classes() {
    const base = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';
    
    const sizes = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-4 py-2 text-base',
      xl: 'px-6 py-3 text-lg'
    };

    const variants = {
      solid: {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500',
        info: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
      },
      outline: {
        primary: 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500',
        secondary: 'border border-gray-600 text-gray-600 hover:bg-gray-50 focus:ring-gray-500',
        success: 'border border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500',
        danger: 'border border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500',
        warning: 'border border-yellow-500 text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500',
        info: 'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
      },
      ghost: {
        primary: 'text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500',
        secondary: 'text-gray-600 hover:bg-gray-50 focus:ring-gray-500',
        success: 'text-green-600 hover:bg-green-50 focus:ring-green-500',
        danger: 'text-red-600 hover:bg-red-50 focus:ring-red-500',
        warning: 'text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500',
        info: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
      }
    };

    const widthClass = this.fullWidth ? 'w-full' : '';
    const disabledClass = this.disabled || this.loading ? 'opacity-50 cursor-not-allowed' : '';

    return `${base} ${sizes[this.size]} ${variants[this.variant][this.type]} ${widthClass} ${disabledClass}`.trim();
  }
}

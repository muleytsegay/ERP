import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  @Input() shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() rounded: 'none' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() border = true;

  get cardClasses(): string {
    const baseClasses = 'bg-white';
    
    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6'
    };

    const shadowClasses = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl'
    };

    const roundedClasses = {
      none: '',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl'
    };

    const borderClass = this.border ? 'border border-gray-200' : '';

    return `${baseClasses} ${paddingClasses[this.padding]} ${shadowClasses[this.shadow]} ${roundedClasses[this.rounded]} ${borderClass}`.trim();
  }
}

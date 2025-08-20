import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.css',
})
export class BadgeComponent {
  @Input() variant: 'solid' | 'outline' | 'soft' = 'solid';
  @Input() color: 'gray' | 'red' | 'green' | 'blue' | 'yellow' | 'indigo' | 'purple' | 'pink' = 'gray';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() text = '';

  get badgeClasses(): string {
    const baseClasses = 'inline-flex items-center font-medium rounded-full';
    
    // Size classes
    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base'
    };

    // Color and variant classes
    const colorClasses = {
      solid: {
        gray: 'bg-gray-900 text-white',
        red: 'bg-red-600 text-white',
        green: 'bg-green-600 text-white',
        blue: 'bg-blue-600 text-white',
        yellow: 'bg-yellow-500 text-white',
        indigo: 'bg-indigo-600 text-white',
        purple: 'bg-purple-600 text-white',
        pink: 'bg-pink-600 text-white'
      },
      outline: {
        gray: 'border border-gray-300 text-gray-700',
        red: 'border border-red-300 text-red-700',
        green: 'border border-green-300 text-green-700',
        blue: 'border border-blue-300 text-blue-700',
        yellow: 'border border-yellow-300 text-yellow-700',
        indigo: 'border border-indigo-300 text-indigo-700',
        purple: 'border border-purple-300 text-purple-700',
        pink: 'border border-pink-300 text-pink-700'
      },
      soft: {
        gray: 'bg-gray-100 text-gray-800',
        red: 'bg-red-100 text-red-800',
        green: 'bg-green-100 text-green-800',
        blue: 'bg-blue-100 text-blue-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        indigo: 'bg-indigo-100 text-indigo-800',
        purple: 'bg-purple-100 text-purple-800',
        pink: 'bg-pink-100 text-pink-800'
      }
    };

    return `${baseClasses} ${sizeClasses[this.size]} ${colorClasses[this.variant][this.color]}`;
  }
}

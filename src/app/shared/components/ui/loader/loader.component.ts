import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css'
})
export class LoaderComponent {
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() color: 'primary' | 'secondary' | 'white' = 'primary';
  @Input() text?: string;
  @Input() overlay = false;
  @Input() type: 'spinner' | 'dots' | 'pulse' = 'spinner';

  get loaderClasses(): string {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12'
    };

    const colorClasses = {
      primary: 'text-indigo-600',
      secondary: 'text-gray-600',
      white: 'text-white'
    };

    return `${sizeClasses[this.size]} ${colorClasses[this.color]}`;
  }

  get containerClasses(): string {
    if (this.overlay) {
      return 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    }
    return 'flex items-center justify-center';
  }
}

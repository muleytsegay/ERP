import { Component, Input, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tooltip',
  imports: [CommonModule],
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.css'
})
export class TooltipComponent {
  @Input() text = '';
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input() theme: 'dark' | 'light' = 'dark';
  @Input() disabled = false;
  @Input() delay = 300;

  isVisible = false;
  private timeoutId?: number;

  constructor(private elementRef: ElementRef) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    if (this.disabled) return;
    
    this.timeoutId = window.setTimeout(() => {
      this.isVisible = true;
    }, this.delay);
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.isVisible = false;
  }

  get tooltipClasses(): string {
    const baseClasses = 'absolute z-50 px-2 py-1 text-sm rounded-md pointer-events-none transition-opacity duration-200';
    
    const themeClasses = {
      dark: 'bg-gray-900 text-white',
      light: 'bg-white text-gray-900 border border-gray-200 shadow-lg'
    };

    const positionClasses = {
      top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
    };

    const visibilityClass = this.isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none';

    return `${baseClasses} ${themeClasses[this.theme]} ${positionClasses[this.position]} ${visibilityClass}`;
  }

  get arrowClasses(): string {
    const baseClasses = 'absolute w-0 h-0';
    
    const arrowPositions = {
      top: 'top-full left-1/2 transform -translate-x-1/2',
      bottom: 'bottom-full left-1/2 transform -translate-x-1/2',
      left: 'left-full top-1/2 transform -translate-y-1/2',
      right: 'right-full top-1/2 transform -translate-y-1/2'
    };

    const arrowStyles = {
      dark: {
        top: 'border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900',
        bottom: 'border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900',
        left: 'border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900',
        right: 'border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900'
      },
      light: {
        top: 'border-l-4 border-r-4 border-t-4 border-transparent border-t-white',
        bottom: 'border-l-4 border-r-4 border-b-4 border-transparent border-b-white',
        left: 'border-t-4 border-b-4 border-l-4 border-transparent border-l-white',
        right: 'border-t-4 border-b-4 border-r-4 border-transparent border-r-white'
      }
    };

    return `${baseClasses} ${arrowPositions[this.position]} ${arrowStyles[this.theme][this.position]}`;
  }
}

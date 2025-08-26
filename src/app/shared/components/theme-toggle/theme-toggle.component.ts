import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ThemeService, Theme } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule],
  template: `
    <div [ngClass]="position" class="z-5">
      <p-button 
        [icon]="(themeService.theme$ | async) === 'light' ? 'pi pi-moon' : 'pi pi-sun'"
        [label]="showLabel ? ((themeService.theme$ | async) === 'light' ? 'Dark' : 'Light') : ''"
        (onClick)="themeService.toggleTheme()"
        [text]="variant === 'text'"
        [outlined]="variant === 'outlined'"
        [rounded]="rounded"
        [size]="size"
        [severity]="severity"
        [pTooltip]="(themeService.theme$ | async) === 'light' ? 'Switch to dark theme' : 'Switch to light theme'">
      </p-button>
    </div>
  `,
})
export class ThemeToggleComponent {
  @Input() position: 'fixed-top-right' | 'absolute-top-right' | 'relative-inline' = 'absolute-top-right';
  @Input() variant: 'filled' | 'outlined' | 'text' = 'text';
  @Input() size: 'small' | 'large' = 'small';
  @Input() rounded: boolean = true;
  @Input() showLabel: boolean = false;
  @Input() severity: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast' = 'secondary';

  constructor(public themeService: ThemeService) {}
}

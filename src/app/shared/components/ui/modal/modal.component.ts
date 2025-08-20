import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  imports: [CommonModule],
  templateUrl: './modal.component.html'
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() title?: string;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  @Input() closable = true;
  @Input() closeOnBackdrop = true;
  @Input() showHeader = true;
  @Input() showFooter = false;
  
  @Output() closeModal = new EventEmitter<void>();
  @Output() backdropClick = new EventEmitter<void>();

  ngOnInit() {
    if (this.isOpen) {
      this.addBodyClass();
    }
  }

  ngOnDestroy() {
    this.removeBodyClass();
  }

  ngOnChanges() {
    if (this.isOpen) {
      this.addBodyClass();
    } else {
      this.removeBodyClass();
    }
  }

  close() {
    if (this.closable) {
      this.closeModal.emit();
    }
  }

  onBackdropClick() {
    this.backdropClick.emit();
    if (this.closeOnBackdrop && this.closable) {
      this.close();
    }
  }

  onModalClick(event: Event) {
    event.stopPropagation();
  }

  get modalSizeClasses(): string {
    const sizeClasses = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-full mx-4'
    };
    return sizeClasses[this.size];
  }

  private addBodyClass() {
    document.body.classList.add('overflow-hidden');
  }

  private removeBodyClass() {
    document.body.classList.remove('overflow-hidden');
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    if (this.isOpen && this.closable) {
      this.close();
    }
  }
}

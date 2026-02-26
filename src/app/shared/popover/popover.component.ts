import {
  Component,
  Input,
  ElementRef,
  HostListener,
} from '@angular/core';

@Component({
  selector: 'app-popover',
  standalone: true,
  templateUrl: './popover.component.html',
  styleUrl: './popover.component.scss',
})
export class PopoverComponent {
  @Input() side: 'right' | 'bottom' | 'left' | 'top' = 'right';
  @Input() align: 'start' | 'center' | 'end' = 'start';
  @Input() contentClass = '';
  isOpen = false;

  constructor(private elementRef: ElementRef) {}

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  close(): void {
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}

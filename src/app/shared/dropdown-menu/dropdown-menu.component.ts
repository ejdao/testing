import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
} from '@angular/core';

@Component({
  selector: 'app-dropdown-menu',
  standalone: true,
  templateUrl: './dropdown-menu.component.html',
  styleUrl: './dropdown-menu.component.scss',
})
export class DropdownMenuComponent {
  @Input() align: 'start' | 'end' = 'end';
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

@Component({
  selector: 'app-dropdown-menu-item',
  standalone: true,
  template: `<button
    class="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
    [class]="class"
    (click)="itemClick.emit()"
  ><ng-content /></button>`,
})
export class DropdownMenuItemComponent {
  @Input() class = '';
  @Output() itemClick = new EventEmitter<void>();
}

@Component({
  selector: 'app-dropdown-menu-separator',
  standalone: true,
  template: `<div class="-mx-1 my-1 h-px bg-border"></div>`,
})
export class DropdownMenuSeparatorComponent {}

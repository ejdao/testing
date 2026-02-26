import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
})
export class BadgeComponent {
  @Input() variant: 'default' | 'secondary' | 'destructive' | 'outline' =
    'default';
  @Input() class = '';

  get variantClasses(): string {
    switch (this.variant) {
      case 'secondary':
        return 'bg-secondary text-secondary-foreground';
      case 'destructive':
        return 'bg-destructive text-destructive-foreground';
      case 'outline':
        return 'border border-border text-foreground';
      default:
        return 'bg-primary text-primary-foreground';
    }
  }
}

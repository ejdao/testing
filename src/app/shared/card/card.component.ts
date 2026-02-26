import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  @Input() class = '';
}

@Component({
  selector: 'app-card-header',
  standalone: true,
  template: `<div class="flex flex-col space-y-1.5 p-6" [class]="class"><ng-content /></div>`,
})
export class CardHeaderComponent {
  @Input() class = '';
}

@Component({
  selector: 'app-card-title',
  standalone: true,
  template: `<h3 class="text-lg font-semibold leading-none tracking-tight" [class]="class"><ng-content /></h3>`,
})
export class CardTitleComponent {
  @Input() class = '';
}

@Component({
  selector: 'app-card-description',
  standalone: true,
  template: `<p class="text-sm text-muted-foreground" [class]="class"><ng-content /></p>`,
})
export class CardDescriptionComponent {
  @Input() class = '';
}

@Component({
  selector: 'app-card-content',
  standalone: true,
  template: `<div class="p-6 pt-0" [class]="class"><ng-content /></div>`,
})
export class CardContentComponent {
  @Input() class = '';
}

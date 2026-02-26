import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
})
export class AvatarComponent {
  @Input() class = '';
}

@Component({
  selector: 'app-avatar-fallback',
  standalone: true,
  template: `<span
    class="flex h-full w-full items-center justify-center rounded-full"
    [class]="class"
  ><ng-content /></span>`,
})
export class AvatarFallbackComponent {
  @Input() class = '';
}

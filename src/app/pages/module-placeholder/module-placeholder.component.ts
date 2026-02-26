import { Component, Input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
} from '../../shared/card/card.component';

@Component({
  selector: 'app-module-placeholder',
  standalone: true,
  imports: [LucideAngularModule, CardComponent, CardContentComponent],
  templateUrl: './module-placeholder.component.html',
  styleUrl: './module-placeholder.component.scss',
})
export class ModulePlaceholderComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() icon = '';
  @Input() parentModule = '';
}

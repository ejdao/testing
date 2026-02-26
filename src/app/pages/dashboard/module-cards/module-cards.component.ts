import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  navigationItems,
  type NavModule,
  type NavLink,
} from '../../../services/navigation';
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardContentComponent,
} from '../../../shared/card/card.component';
import { BadgeComponent } from '../../../shared/badge/badge.component';

@Component({
  selector: 'app-module-cards',
  standalone: true,
  imports: [
    RouterLink,
    LucideAngularModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    BadgeComponent,
  ],
  templateUrl: './module-cards.component.html',
  styleUrl: './module-cards.component.scss',
})
export class ModuleCardsComponent {
  modules: NavModule[] = navigationItems.filter(
    (item) => item.type === 'module'
  ) as NavModule[];

  links: NavLink[] = navigationItems.filter(
    (item) => item.type === 'link' && item.href !== '/dashboard'
  ) as NavLink[];

  getFirstRoute(item: NavModule): string {
    return item.submodules[0]?.routes[0]?.href ?? '/dashboard';
  }

  getTotalRoutes(item: NavModule): number {
    return item.submodules.reduce((acc, sub) => acc + sub.routes.length, 0);
  }
}

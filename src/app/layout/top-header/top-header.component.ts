import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { SidebarService } from '../../services/sidebar.service';
import { ClinicService } from '../../services/clinic.service';
import { BadgeComponent } from '../../shared/badge/badge.component';
import {
  AvatarComponent,
  AvatarFallbackComponent,
} from '../../shared/avatar/avatar.component';
import {
  DropdownMenuComponent,
  DropdownMenuItemComponent,
  DropdownMenuSeparatorComponent,
} from '../../shared/dropdown-menu/dropdown-menu.component';

interface Breadcrumb {
  label: string;
  href: string;
}

@Component({
  selector: 'app-top-header',
  standalone: true,
  imports: [
    RouterLink,
    LucideAngularModule,
    BadgeComponent,
    AvatarComponent,
    AvatarFallbackComponent,
    DropdownMenuComponent,
    DropdownMenuItemComponent,
    DropdownMenuSeparatorComponent,
  ],
  templateUrl: './top-header.component.html',
  styleUrl: './top-header.component.scss',
})
export class TopHeaderComponent {
  sidebar = inject(SidebarService);
  clinic = inject(ClinicService);
  router = inject(Router);

  get breadcrumbs(): Breadcrumb[] {
    const segments = this.router.url.split('/').filter(Boolean);
    const crumbs: Breadcrumb[] = [];
    let path = '';
    for (const segment of segments) {
      path += `/${segment}`;
      crumbs.push({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        href: path,
      });
    }
    return crumbs;
  }

  onLogout(): void {
    window.location.href = '/';
  }
}

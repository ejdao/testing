import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { SidebarService } from '../../services/sidebar.service';
import { ClinicService } from '../../services/clinic.service';
import {
  navigationItems,
  type NavItem,
  type NavModule,
  type Clinic,
} from '../../services/navigation';
import { TooltipDirective } from '../../shared/tooltip/tooltip.directive';
import { PopoverComponent } from '../../shared/popover/popover.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, TooltipDirective, PopoverComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  sidebar = inject(SidebarService);
  clinic = inject(ClinicService);
  router = inject(Router);

  navigationItems = navigationItems;
  openModules: string[] = [];
  openSubmodules: string[] = [];
  clinicPopoverOpen = false;

  get isVisible(): boolean {
    return this.sidebar.isMobile() ? this.sidebar.mobileOpen() : true;
  }

  get showCollapsed(): boolean {
    return !this.sidebar.isMobile() && this.sidebar.collapsed();
  }

  toggleModule(label: string): void {
    if (this.openModules.includes(label)) {
      this.openModules = [];
    } else {
      this.openSubmodules = [];
      this.openModules = [label];
    }
  }

  toggleSubmodule(key: string): void {
    const parentModule = key.split('::')[0];
    if (this.openSubmodules.includes(key)) {
      this.openSubmodules = this.openSubmodules.filter((s) => s !== key);
    } else {
      const filtered = this.openSubmodules.filter(
        (s) => !s.startsWith(`${parentModule}::`)
      );
      this.openSubmodules = [...filtered, key];
    }
  }

  isActive(href: string): boolean {
    return this.router.url === href;
  }

  isModuleActive(item: NavModule): boolean {
    return item.submodules.some((sub) =>
      sub.routes.some((r) => this.router.url === r.href)
    );
  }

  isSubmoduleActive(moduleLabel: string, subLabel: string): boolean {
    const mod = this.navigationItems.find(
      (n) => n.type === 'module' && n.label === moduleLabel
    ) as NavModule | undefined;
    if (!mod) return false;
    const sub = mod.submodules.find((s) => s.label === subLabel);
    return sub ? sub.routes.some((r) => this.router.url === r.href) : false;
  }

  isModuleOpen(label: string): boolean {
    return this.openModules.includes(label);
  }

  isSubmoduleOpen(key: string): boolean {
    return this.openSubmodules.includes(key);
  }

  handleLinkClick(): void {
    if (this.sidebar.isMobile()) {
      this.sidebar.closeMobile();
    }
  }

  onCollapsedModuleClick(item: NavModule): void {
    this.sidebar.collapsed.set(false);
    if (!this.openModules.includes(item.label)) {
      this.toggleModule(item.label);
    }
  }

  selectClinic(c: Clinic): void {
    this.clinic.setClinic(c);
    this.clinicPopoverOpen = false;
  }

  toggleClinicPopover(): void {
    this.clinicPopoverOpen = !this.clinicPopoverOpen;
  }

  closeClinicPopover(): void {
    this.clinicPopoverOpen = false;
  }

  asModule(item: NavItem): NavModule {
    return item as NavModule;
  }
}

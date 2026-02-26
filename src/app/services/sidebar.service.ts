import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  collapsed = signal(false);
  mobileOpen = signal(false);
  isMobile = signal(false);

  constructor() {
    if (typeof window !== 'undefined') {
      this.handleResize();
      window.addEventListener('resize', () => this.handleResize());
    }
  }

  private handleResize(): void {
    const mobile = window.innerWidth < 1024;
    this.isMobile.set(mobile);
    if (mobile) {
      this.mobileOpen.set(false);
    }
  }

  toggleCollapsed(): void {
    this.collapsed.update((v) => !v);
  }

  openMobile(): void {
    this.mobileOpen.set(true);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }
}

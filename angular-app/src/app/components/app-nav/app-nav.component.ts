import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="border-b bg-card">
      <div class="flex items-center justify-between px-6 h-14">
        <div class="flex items-center gap-2">
          <!-- Activity icon (SVG inline) -->
          <svg
            class="size-5 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
          </svg>
          <span class="font-semibold text-foreground">
            Sistema de Gestion Clinica
          </span>
        </div>
        <nav class="flex items-center gap-1">
          @for (item of navItems; track item.href) {
            <a
              [routerLink]="item.href"
              routerLinkActive="bg-primary text-primary-foreground"
              [routerLinkActiveOptions]="{ exact: item.exact }"
              class="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <!-- BedDouble icon -->
              @if (item.icon === 'bed') {
                <svg
                  class="size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
                  <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
                  <path d="M12 4v6" />
                  <path d="M2 18h20" />
                </svg>
              }
              <!-- ClipboardList icon -->
              @if (item.icon === 'clipboard') {
                <svg
                  class="size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <path d="M12 11h4" />
                  <path d="M12 16h4" />
                  <path d="M8 11h.01" />
                  <path d="M8 16h.01" />
                </svg>
              }
              {{ item.label }}
            </a>
          }
        </nav>
      </div>
    </header>
  `,
})
export class AppNavComponent {
  navItems = [
    { href: '/', label: 'Pacientes', icon: 'bed', exact: true },
    { href: '/gestiones', label: 'Gestiones', icon: 'clipboard', exact: false },
  ];
}

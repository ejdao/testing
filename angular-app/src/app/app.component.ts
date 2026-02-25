import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppNavComponent } from './components/app-nav/app-nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppNavComponent],
  template: `
    <app-nav />
    <div class="min-h-[calc(100vh-3.5rem)]">
      <router-outlet />
    </div>
  `,
})
export class AppComponent {}

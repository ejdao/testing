import { Component } from '@angular/core';
import { GestionModuleComponent } from '../../components/gestion-module/gestion-module.component';

@Component({
  selector: 'app-gestiones',
  standalone: true,
  imports: [GestionModuleComponent],
  template: `
    <main class="p-6">
      <app-gestion-module />
    </main>
  `,
})
export class GestionesComponent {}

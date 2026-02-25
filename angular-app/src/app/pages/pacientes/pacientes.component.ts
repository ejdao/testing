import { Component } from '@angular/core';
import { PatientTableComponent } from '../../components/patient-table/patient-table.component';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [PatientTableComponent],
  template: `
    <main class="p-6">
      <app-patient-table />
    </main>
  `,
})
export class PacientesComponent {}

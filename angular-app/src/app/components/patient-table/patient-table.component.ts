import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GestionService } from '../../services/gestion.service';
import { GestionDialogComponent } from '../gestion-dialog/gestion-dialog.component';
import { Patient } from '../../models/types';
import { getDaysOfStay, getDaysColor } from '../../utils/badge-styles';

@Component({
  selector: 'app-patient-table',
  standalone: true,
  imports: [FormsModule, GestionDialogComponent],
  template: `
    <div class="flex flex-col gap-6">
      <!-- Header -->
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-foreground">
            Pacientes Hospitalizados
          </h1>
          <p class="text-sm text-muted-foreground mt-1">
            {{ gestionService.patients().length }} pacientes actualmente en la institucion
          </p>
        </div>
        <div class="relative w-80">
          <!-- Search icon -->
          <svg
            class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
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
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            class="input pl-9"
            placeholder="Buscar por nombre, documento o cama..."
            [ngModel]="searchTerm()"
            (ngModelChange)="searchTerm.set($event)"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="rounded-lg border bg-card">
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr class="bg-muted/50">
                <th class="font-semibold">Cama</th>
                <th class="font-semibold">Paciente</th>
                <th class="font-semibold">Documento</th>
                <th class="font-semibold text-center">Edad</th>
                <th class="font-semibold text-center">Dias Estancia</th>
                <th class="font-semibold">Contrato</th>
                <th class="font-semibold text-center">Gestiones</th>
                <th class="font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (patient of filteredPatients(); track patient.id) {
                <tr>
                  <td>
                    <span class="badge-outline font-mono text-xs">
                      {{ patient.bedCode }}
                    </span>
                  </td>
                  <td class="font-medium">{{ patient.name }}</td>
                  <td class="text-muted-foreground font-mono text-xs">
                    {{ patient.document }}
                  </td>
                  <td class="text-center">{{ patient.age }} a.</td>
                  <td class="text-center">
                    <span
                      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      [class]="getDaysColor(getDaysOfStay(patient.admissionDate))"
                    >
                      {{ getDaysOfStay(patient.admissionDate) }}
                      {{ getDaysOfStay(patient.admissionDate) === 1 ? 'dia' : 'dias' }}
                    </span>
                  </td>
                  <td>
                    <div class="flex flex-col">
                      <span class="text-xs font-medium">{{ patient.contractName }}</span>
                      <span class="text-xs text-muted-foreground">{{ patient.company }}</span>
                    </div>
                  </td>
                  <td class="text-center">
                    @if (getGestionCount(patient.id) > 0) {
                      <span class="badge-secondary text-xs">
                        {{ getGestionCount(patient.id) }}
                      </span>
                    } @else {
                      <span class="text-xs text-muted-foreground">0</span>
                    }
                  </td>
                  <td class="text-center">
                    <button
                      class="btn-outline btn-sm gap-1.5"
                      (click)="openGestion(patient)"
                    >
                      <!-- ClipboardList icon -->
                      <svg
                        class="size-3.5"
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
                      Gestion Clinica
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="h-24 text-center text-muted-foreground">
                    No se encontraron pacientes
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Dialog -->
      @if (selectedPatient()) {
        <app-gestion-dialog
          [patient]="selectedPatient()!"
          [open]="dialogOpen()"
          (openChange)="dialogOpen.set($event)"
        />
      }
    </div>
  `,
})
export class PatientTableComponent {
  gestionService = inject(GestionService);

  searchTerm = signal('');
  selectedPatient = signal<Patient | null>(null);
  dialogOpen = signal(false);

  filteredPatients = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.gestionService.patients().filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.document.includes(this.searchTerm()) ||
        p.bedCode.toLowerCase().includes(term)
    );
  });

  getDaysOfStay = getDaysOfStay;
  getDaysColor = getDaysColor;

  getGestionCount(patientId: string): number {
    return this.gestionService.getGestionesByPatient(patientId).length;
  }

  openGestion(patient: Patient): void {
    this.selectedPatient.set(patient);
    this.dialogOpen.set(true);
  }
}

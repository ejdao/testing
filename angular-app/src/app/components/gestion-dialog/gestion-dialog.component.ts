import {
  Component,
  input,
  output,
  signal,
  inject,
  computed,
} from '@angular/core';
import { GestionService } from '../../services/gestion.service';
import { NewGestionFormComponent } from '../new-gestion-form/new-gestion-form.component';
import { FormatStatusPipe } from '../../pipes/format-status.pipe';
import { Patient } from '../../models/types';
import { getPriorityBadge, getStatusBadge } from '../../utils/badge-styles';

@Component({
  selector: 'app-gestion-dialog',
  standalone: true,
  imports: [FormatStatusPipe, NewGestionFormComponent],
  template: `
    @if (open()) {
      <!-- Overlay -->
      <div class="dialog-overlay" (click)="close()"></div>
      <!-- Content -->
      <div class="dialog-content sm:max-w-4xl max-h-[85vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex flex-col gap-1.5">
          <h2 class="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
            @if (showForm()) {
              <button class="btn-ghost p-1 h-auto" (click)="showForm.set(false)">
                <!-- ArrowLeft icon -->
                <svg
                  class="size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24" height="24"
                  viewBox="0 0 24 24"
                  fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                >
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
              </button>
            }
            {{ showForm() ? 'Nueva Gestion Clinica' : 'Gestiones Clinicas' }}
          </h2>
          <p class="text-sm text-muted-foreground">
            Paciente: {{ patient().name }} | Cama: {{ patient().bedCode }} | Doc: {{ patient().document }}
          </p>
        </div>

        @if (!showForm()) {
          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <p class="text-sm text-muted-foreground">
                {{ gestiones().length }} gestion(es) registrada(s)
              </p>
              <button class="btn-default btn-sm gap-1.5" (click)="showForm.set(true)">
                <!-- Plus icon -->
                <svg
                  class="size-3.5"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24" height="24"
                  viewBox="0 0 24 24"
                  fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                Nueva Gestion
              </button>
            </div>

            @if (gestiones().length > 0) {
              <div class="rounded-lg border">
                <div class="table-wrapper">
                  <table class="table">
                    <thead>
                      <tr class="bg-muted/50">
                        <th class="font-semibold">Codigo</th>
                        <th class="font-semibold">Prioridad</th>
                        <th class="font-semibold">Area</th>
                        <th class="font-semibold">Titulo</th>
                        <th class="font-semibold">Tipo</th>
                        <th class="font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (g of gestiones(); track g.id) {
                        <tr>
                          <td class="font-mono text-xs">{{ g.code }}</td>
                          <td>
                            <span
                              class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                              [class]="getPriorityBadge(g.priority)"
                            >
                              {{ g.priority }}
                            </span>
                          </td>
                          <td class="text-sm">{{ g.area }}</td>
                          <td class="text-sm max-w-48 truncate">{{ g.title }}</td>
                          <td>
                            <span class="badge-outline text-xs">
                              {{ g.type === 'TRASLADO_AMBULANCIA' ? 'Ambulancia' : 'Normal' }}
                            </span>
                          </td>
                          <td>
                            <span
                              class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                              [class]="getStatusBadge(g.status)"
                            >
                              {{ g.status | formatStatus }}
                            </span>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            } @else {
              <div class="flex items-center justify-center py-12 text-muted-foreground text-sm border rounded-lg bg-muted/20">
                No hay gestiones registradas para este paciente
              </div>
            }
          </div>
        } @else {
          <app-new-gestion-form
            [patient]="patient()"
            (onSuccess)="showForm.set(false)"
            (onCancel)="showForm.set(false)"
          />
        }

        <!-- Close button -->
        <button
          class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          (click)="close()"
        >
          <svg
            class="size-4"
            xmlns="http://www.w3.org/2000/svg"
            width="24" height="24"
            viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
          <span class="sr-only">Cerrar</span>
        </button>
      </div>
    }
  `,
})
export class GestionDialogComponent {
  private gestionService = inject(GestionService);

  patient = input.required<Patient>();
  open = input.required<boolean>();
  openChange = output<boolean>();

  showForm = signal(false);

  gestiones = computed(() =>
    this.gestionService.getGestionesByPatient(this.patient().id)
  );

  getPriorityBadge = getPriorityBadge;
  getStatusBadge = getStatusBadge;

  close(): void {
    this.showForm.set(false);
    this.openChange.emit(false);
  }
}

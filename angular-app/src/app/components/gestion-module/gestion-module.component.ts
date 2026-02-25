import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GestionService } from '../../services/gestion.service';
import { GestionDetailDialogComponent } from '../gestion-detail-dialog/gestion-detail-dialog.component';
import { FormatStatusPipe } from '../../pipes/format-status.pipe';
import { FormatDatePipe } from '../../pipes/format-date.pipe';
import { Gestion } from '../../models/types';
import { getPriorityBadge, getStatusBadge } from '../../utils/badge-styles';

@Component({
  selector: 'app-gestion-module',
  standalone: true,
  imports: [
    FormsModule,
    FormatStatusPipe,
    FormatDatePipe,
    GestionDetailDialogComponent,
  ],
  template: `
    <div class="flex flex-col gap-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-semibold text-foreground">Modulo de Gestiones</h1>
        <p class="text-sm text-muted-foreground mt-1">
          {{ gestionService.gestionCount() }} gestiones registradas en total
        </p>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative flex-1 min-w-64">
          <!-- Search icon -->
          <svg
            class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            xmlns="http://www.w3.org/2000/svg"
            width="24" height="24"
            viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            class="input pl-9"
            placeholder="Buscar por codigo, titulo o paciente..."
            [ngModel]="searchTerm()"
            (ngModelChange)="searchTerm.set($event)"
          />
        </div>
        <div class="flex items-center gap-2">
          <!-- Filter icon -->
          <svg
            class="size-4 text-muted-foreground"
            xmlns="http://www.w3.org/2000/svg"
            width="24" height="24"
            viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <select
            class="select w-44"
            [ngModel]="filterType()"
            (ngModelChange)="filterType.set($event)"
          >
            <option value="TODOS">Todos los tipos</option>
            <option value="NORMAL">Normal</option>
            <option value="TRASLADO_AMBULANCIA">Traslado Ambulancia</option>
          </select>
          <select
            class="select w-44"
            [ngModel]="filterStatus()"
            (ngModelChange)="filterStatus.set($event)"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="ASIGNADO">Asignado</option>
            <option value="INICIADO">Iniciado</option>
            <option value="EN_PROCESO">En Proceso</option>
            <option value="FINALIZADO">Finalizado</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="rounded-lg border bg-card">
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr class="bg-muted/50">
                <th class="font-semibold">Codigo</th>
                <th class="font-semibold">Paciente</th>
                <th class="font-semibold">Titulo</th>
                <th class="font-semibold">Tipo</th>
                <th class="font-semibold">Prioridad</th>
                <th class="font-semibold">Estado</th>
                <th class="font-semibold">Fecha</th>
                <th class="font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (g of filtered(); track g.id) {
                <tr>
                  <td class="font-mono text-xs">{{ g.code }}</td>
                  <td class="text-sm max-w-40 truncate">{{ g.patientName }}</td>
                  <td class="text-sm max-w-48 truncate">{{ g.title }}</td>
                  <td>
                    <span class="badge-outline text-xs">
                      {{ g.type === 'TRASLADO_AMBULANCIA' ? 'Ambulancia' : 'Normal' }}
                    </span>
                  </td>
                  <td>
                    <span
                      class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                      [class]="getPriorityBadge(g.priority)"
                    >
                      {{ g.priority }}
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
                  <td class="text-xs text-muted-foreground">
                    {{ g.createdAt | formatDate }}
                  </td>
                  <td class="text-center">
                    <button
                      class="btn-outline btn-sm gap-1.5"
                      (click)="openDetail(g)"
                    >
                      <!-- Eye icon -->
                      <svg
                        class="size-3.5"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24" height="24"
                        viewBox="0 0 24 24"
                        fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Gestionar
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="h-24 text-center text-muted-foreground">
                    No se encontraron gestiones
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Detail dialog -->
      @if (selectedGestion()) {
        <app-gestion-detail-dialog
          [gestion]="selectedGestion()!"
          [open]="detailOpen()"
          (onOpenChange)="detailOpen.set($event)"
        />
      }
    </div>
  `,
})
export class GestionModuleComponent {
  gestionService = inject(GestionService);

  searchTerm = signal('');
  filterType = signal('TODOS');
  filterStatus = signal('TODOS');
  selectedGestion = signal<Gestion | null>(null);
  detailOpen = signal(false);

  filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const type = this.filterType();
    const status = this.filterStatus();

    return this.gestionService.gestiones().filter((g) => {
      const matchSearch =
        g.code.toLowerCase().includes(term) ||
        g.title.toLowerCase().includes(term) ||
        g.patientName.toLowerCase().includes(term);
      const matchType = type === 'TODOS' || g.type === type;
      const matchStatus = status === 'TODOS' || g.status === status;
      return matchSearch && matchType && matchStatus;
    });
  });

  getPriorityBadge = getPriorityBadge;
  getStatusBadge = getStatusBadge;

  openDetail(gestion: Gestion): void {
    this.selectedGestion.set(gestion);
    this.detailOpen.set(true);
  }
}

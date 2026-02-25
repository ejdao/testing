import { Component, input, output, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GestionService } from '../../services/gestion.service';
import { FormatStatusPipe } from '../../pipes/format-status.pipe';
import { FormatDatePipe } from '../../pipes/format-date.pipe';
import { Gestion, AmbulanceTrip } from '../../models/types';
import { getPriorityBadge, getStatusBadge } from '../../utils/badge-styles';

@Component({
  selector: 'app-gestion-detail-dialog',
  standalone: true,
  imports: [FormsModule, FormatStatusPipe, FormatDatePipe],
  template: `
    @if (open()) {
      <!-- Overlay -->
      <div class="dialog-overlay" (click)="onOpenChange.emit(false)"></div>
      <!-- Content -->
      <div class="dialog-content sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex flex-col gap-1.5">
          <h2 class="text-lg font-semibold leading-none tracking-tight flex items-center gap-3">
            <span class="font-mono text-sm bg-muted px-2 py-1 rounded">
              {{ currentGestion().code }}
            </span>
            {{ currentGestion().title }}
          </h2>
          <p class="text-sm text-muted-foreground">
            Paciente: {{ currentGestion().patientName }} | Area: {{ currentGestion().area }}
          </p>
        </div>

        <!-- Status bar -->
        <div class="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-muted/30 border">
          <div class="flex items-center gap-2">
            <span class="text-xs text-muted-foreground">Estado:</span>
            <span
              class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
              [class]="getStatusBadge(currentGestion().status)"
            >
              {{ currentGestion().status | formatStatus }}
            </span>
          </div>
          <div class="h-4 w-px bg-border"></div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-muted-foreground">Prioridad:</span>
            <span
              class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
              [class]="getPriorityBadge(currentGestion().priority)"
            >
              {{ currentGestion().priority }}
            </span>
          </div>
          <div class="h-4 w-px bg-border"></div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-muted-foreground">Tipo:</span>
            <span class="badge-outline text-xs">
              {{ isAmbulance() ? 'Traslado Ambulancia' : 'Normal' }}
            </span>
          </div>
          <div class="h-4 w-px bg-border"></div>
          <div class="flex items-center gap-2">
            <!-- Clock icon -->
            <svg class="size-3 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span class="text-xs text-muted-foreground">
              {{ currentGestion().createdAt | formatDate }}
            </span>
          </div>
        </div>

        <!-- Initial observation -->
        @if (currentGestion().observation) {
          <div class="p-3 rounded-lg border bg-muted/20">
            <p class="text-xs text-muted-foreground mb-1">Observacion inicial:</p>
            <p class="text-sm">{{ currentGestion().observation }}</p>
          </div>
        }

        <!-- Normal Gestion -->
        @if (isNormal()) {
          <div class="flex flex-col gap-4">
            @if (!isFinalized()) {
              <div class="flex items-center gap-3">
                @if (currentGestion().status === 'INICIADO') {
                  <button class="btn-default gap-1.5" (click)="handleStartProcess()">
                    <!-- Play icon -->
                    <svg class="size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                    Pasar a En Proceso
                  </button>
                }
                @if (currentGestion().status === 'EN_PROCESO') {
                  <button class="btn-default gap-1.5" (click)="handleFinalize()">
                    <!-- CheckCircle icon -->
                    <svg class="size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                    Finalizar Gestion
                  </button>
                }
              </div>
            }

            <div class="border-t"></div>

            <!-- Observations -->
            <div class="flex flex-col gap-3">
              <h3 class="text-sm font-semibold">Observaciones</h3>

              @if (currentGestion().observations.length > 0) {
                <div class="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  @for (obs of currentGestion().observations; track obs.id) {
                    <div class="p-3 rounded-lg border bg-card text-sm">
                      <div class="flex items-center justify-between mb-1">
                        <span class="font-medium text-xs">{{ obs.author }}</span>
                        <span class="text-xs text-muted-foreground">{{ obs.createdAt | formatDate }}</span>
                      </div>
                      <p class="text-muted-foreground">{{ obs.text }}</p>
                    </div>
                  }
                </div>
              } @else {
                <p class="text-sm text-muted-foreground py-3 text-center border rounded-lg bg-muted/20">
                  No hay observaciones registradas
                </p>
              }

              @if (!isFinalized()) {
                <div class="flex items-start gap-2">
                  <textarea
                    class="textarea flex-1"
                    rows="2"
                    placeholder="Agregar observacion..."
                    [(ngModel)]="newObservation"
                  ></textarea>
                  <button
                    class="btn-default btn-sm gap-1.5 mt-1"
                    [disabled]="!newObservation.trim()"
                    (click)="handleAddObservation()"
                  >
                    <!-- Plus icon -->
                    <svg class="size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    Agregar
                  </button>
                </div>
              }
            </div>
          </div>
        }

        <!-- Ambulance Transfer -->
        @if (isAmbulance() && currentGestion().ambulanceTransfer) {
          <div class="flex flex-col gap-4">
            <!-- Transfer details -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg border bg-muted/20">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <!-- Truck icon -->
                  <svg class="size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
                  Tipo de traslado
                </div>
                <p class="text-sm font-medium">
                  {{ currentGestion().ambulanceTransfer!.transferType === 'REDONDO' ? 'Redondo' : 'Simple' }}
                </p>
              </div>
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <svg class="size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Fecha programada
                </div>
                <p class="text-sm font-medium">
                  {{ currentGestion().ambulanceTransfer!.dateTime | formatDate }}
                </p>
              </div>
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <!-- MapPin -->
                  <svg class="size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  Origen
                </div>
                <p class="text-sm font-medium">{{ currentGestion().ambulanceTransfer!.origin.place }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ currentGestion().ambulanceTransfer!.origin.address }},
                  {{ currentGestion().ambulanceTransfer!.origin.municipality }},
                  {{ currentGestion().ambulanceTransfer!.origin.department }}
                </p>
              </div>
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <svg class="size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  Destino
                </div>
                <p class="text-sm font-medium">{{ currentGestion().ambulanceTransfer!.destination.place }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ currentGestion().ambulanceTransfer!.destination.address }},
                  {{ currentGestion().ambulanceTransfer!.destination.municipality }},
                  {{ currentGestion().ambulanceTransfer!.destination.department }}
                </p>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-xs text-muted-foreground">Servicio destino</span>
                <p class="text-sm font-medium">{{ currentGestion().ambulanceTransfer!.destinationService }}</p>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-xs text-muted-foreground">Motivo</span>
                <p class="text-sm font-medium">{{ currentGestion().ambulanceTransfer!.reason }}</p>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-xs text-muted-foreground">Soporte vital</span>
                <div class="flex flex-wrap gap-1.5">
                  @if (currentGestion().ambulanceTransfer!.vitalSupport.infusionPump) {
                    <span class="badge-secondary text-xs">Bomba Infusion</span>
                  }
                  @if (currentGestion().ambulanceTransfer!.vitalSupport.mechanicalVentilator) {
                    <span class="badge-secondary text-xs">Ventilador Mecanico</span>
                  }
                  @if (!currentGestion().ambulanceTransfer!.vitalSupport.infusionPump && !currentGestion().ambulanceTransfer!.vitalSupport.mechanicalVentilator) {
                    <span class="text-xs text-muted-foreground">Ninguno</span>
                  }
                </div>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-xs text-muted-foreground">EPP</span>
                <div class="flex items-center gap-1.5">
                  @if (currentGestion().ambulanceTransfer!.requiresEPP) {
                    <!-- AlertTriangle -->
                    <svg class="size-3 text-amber-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                    <span class="text-sm font-medium text-amber-700">Requerido</span>
                  } @else {
                    <!-- Shield -->
                    <svg class="size-3 text-emerald-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
                    <span class="text-sm font-medium text-emerald-700">No requerido</span>
                  }
                </div>
              </div>
            </div>

            @if (currentGestion().ambulanceTransfer!.observation) {
              <div class="p-3 rounded-lg border bg-muted/20">
                <p class="text-xs text-muted-foreground mb-1">Observacion del traslado:</p>
                <p class="text-sm">{{ currentGestion().ambulanceTransfer!.observation }}</p>
              </div>
            }

            <div class="border-t"></div>

            <!-- Trips -->
            <div class="flex flex-col gap-3">
              <h3 class="text-sm font-semibold flex items-center gap-2">
                <svg class="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
                Recorridos
                @if (currentGestion().ambulanceTransfer!.transferType === 'REDONDO') {
                  <span class="badge-outline text-xs">Traslado Redondo</span>
                }
              </h3>

              @for (trip of currentGestion().ambulanceTransfer!.trips; track trip.id) {
                <div class="p-4 rounded-lg border bg-card flex flex-col gap-3">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span class="text-sm font-semibold">Recorrido #{{ trip.tripNumber }}</span>
                      <span
                        class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                        [class]="getStatusBadge(trip.status)"
                      >
                        {{ trip.status | formatStatus }}
                      </span>
                    </div>
                  </div>

                  <div class="flex items-center gap-4 text-sm text-muted-foreground">
                    <span class="flex items-center gap-1">
                      <svg class="size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      {{ trip.origin }}
                    </span>
                    <span>&#8594;</span>
                    <span class="flex items-center gap-1">
                      <svg class="size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      {{ trip.destination }}
                    </span>
                  </div>

                  @if (trip.driver) {
                    <p class="text-sm">
                      <span class="text-muted-foreground">Conductor: </span>
                      <span class="font-medium">{{ trip.driver }}</span>
                    </p>
                  }

                  <!-- Trip actions -->
                  <div>
                    @switch (trip.status) {
                      @case ('PENDIENTE') {
                        @if (assigningTripId() === trip.id) {
                          <div class="flex items-center gap-2">
                            <input
                              type="text"
                              class="input h-8 text-sm"
                              placeholder="Nombre del conductor"
                              [(ngModel)]="driverName"
                            />
                            <button
                              class="btn-default btn-sm"
                              [disabled]="!driverName.trim()"
                              (click)="handleAssignDriver(trip.id)"
                            >
                              Asignar
                            </button>
                            <button
                              class="btn-ghost btn-sm"
                              (click)="assigningTripId.set(null); driverName = ''"
                            >
                              Cancelar
                            </button>
                          </div>
                        } @else {
                          <button
                            class="btn-outline btn-sm gap-1.5"
                            (click)="assigningTripId.set(trip.id)"
                          >
                            <!-- UserPlus icon -->
                            <svg class="size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                            Asignar Conductor
                          </button>
                        }
                      }
                      @case ('ASIGNADO') {
                        <button class="btn-default btn-sm gap-1.5" (click)="handleStartTrip(trip.id)">
                          <svg class="size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                          Iniciar Recorrido
                        </button>
                      }
                      @case ('INICIADO') {
                        <button class="btn-default btn-sm gap-1.5" (click)="handleFinalizeTrip(trip.id)">
                          <svg class="size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                          Finalizar Recorrido
                        </button>
                      }
                      @case ('FINALIZADO') {
                        <span class="inline-flex items-center text-xs text-emerald-700 font-medium gap-1">
                          <svg class="size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                          Completado
                        </span>
                      }
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Close button -->
        <button
          class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          (click)="onOpenChange.emit(false)"
        >
          <svg class="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          <span class="sr-only">Cerrar</span>
        </button>
      </div>
    }
  `,
})
export class GestionDetailDialogComponent {
  private gestionService = inject(GestionService);

  gestion = input.required<Gestion>();
  open = input.required<boolean>();
  onOpenChange = output<boolean>();

  newObservation = '';
  driverName = '';
  assigningTripId = signal<string | null>(null);

  currentGestion = computed(() => {
    const found = this.gestionService.getGestionById(this.gestion().id);
    return found ?? this.gestion();
  });

  isNormal = computed(() => this.currentGestion().type === 'NORMAL');
  isAmbulance = computed(() => this.currentGestion().type === 'TRASLADO_AMBULANCIA');
  isFinalized = computed(() => this.currentGestion().status === 'FINALIZADO');

  getPriorityBadge = getPriorityBadge;
  getStatusBadge = getStatusBadge;

  handleStartProcess(): void {
    this.gestionService.updateGestionStatus(this.currentGestion().id, 'EN_PROCESO');
  }

  handleFinalize(): void {
    this.gestionService.updateGestionStatus(this.currentGestion().id, 'FINALIZADO');
  }

  handleAddObservation(): void {
    if (!this.newObservation.trim()) return;
    this.gestionService.addObservation(this.currentGestion().id, {
      id: `obs-${Date.now()}`,
      text: this.newObservation,
      createdAt: new Date().toISOString(),
      author: 'Usuario',
    });
    this.newObservation = '';
  }

  handleAssignDriver(tripId: string): void {
    if (!this.driverName.trim()) return;
    this.gestionService.assignDriver(this.currentGestion().id, tripId, this.driverName);
    this.driverName = '';
    this.assigningTripId.set(null);
  }

  handleStartTrip(tripId: string): void {
    this.gestionService.updateTripStatus(this.currentGestion().id, tripId, 'INICIADO');
  }

  handleFinalizeTrip(tripId: string): void {
    this.gestionService.updateTripStatus(this.currentGestion().id, tripId, 'FINALIZADO');
  }
}

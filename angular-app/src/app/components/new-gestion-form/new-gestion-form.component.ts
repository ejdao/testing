import { Component, input, output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GestionService } from '../../services/gestion.service';
import { AmbulanceTransferFormComponent } from '../ambulance-transfer-form/ambulance-transfer-form.component';
import {
  Patient,
  Priority,
  GestionType,
  Gestion,
  AmbulanceTransfer,
} from '../../models/types';

@Component({
  selector: 'app-new-gestion-form',
  standalone: true,
  imports: [FormsModule, AmbulanceTransferFormComponent],
  template: `
    <form class="flex flex-col gap-5" (ngSubmit)="handleSubmit()">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Title -->
        <div class="flex flex-col gap-1.5 sm:col-span-2">
          <label class="label" for="title">Titulo *</label>
          <input
            id="title"
            type="text"
            class="input"
            placeholder="Ej: Solicitud de interconsulta"
            [(ngModel)]="title"
            name="title"
          />
          @if (errors()['title']) {
            <span class="text-xs text-destructive">{{ errors()['title'] }}</span>
          }
        </div>

        <!-- Priority -->
        <div class="flex flex-col gap-1.5">
          <label class="label" for="priority">Prioridad *</label>
          <select id="priority" class="select" [(ngModel)]="priority" name="priority">
            <option value="">Seleccionar prioridad</option>
            <option value="BAJA">Baja</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
            <option value="CRITICA">Critica</option>
          </select>
          @if (errors()['priority']) {
            <span class="text-xs text-destructive">{{ errors()['priority'] }}</span>
          }
        </div>

        <!-- Type -->
        <div class="flex flex-col gap-1.5">
          <label class="label" for="gestionType">Tipo de Gestion *</label>
          <select
            id="gestionType"
            class="select"
            [(ngModel)]="gestionType"
            name="gestionType"
            (ngModelChange)="onTypeChange($event)"
          >
            <option value="">Seleccionar tipo</option>
            <option value="NORMAL">Normal</option>
            <option value="TRASLADO_AMBULANCIA">Traslado Ambulancia</option>
          </select>
          @if (errors()['gestionType']) {
            <span class="text-xs text-destructive">{{ errors()['gestionType'] }}</span>
          }
        </div>

        <!-- Area (only for non-ambulance) -->
        @if (gestionType !== 'TRASLADO_AMBULANCIA') {
          <div class="flex flex-col gap-1.5 sm:col-span-2">
            <label class="label" for="area">Area *</label>
            <input
              id="area"
              type="text"
              class="input"
              placeholder="Ej: Cardiologia, Diagnostico"
              [(ngModel)]="area"
              name="area"
            />
            @if (errors()['area']) {
              <span class="text-xs text-destructive">{{ errors()['area'] }}</span>
            }
          </div>
        }

        <!-- Observation -->
        <div class="flex flex-col gap-1.5 sm:col-span-2">
          <label class="label" for="observation">Observacion (opcional)</label>
          <textarea
            id="observation"
            class="textarea"
            rows="3"
            placeholder="Observaciones adicionales..."
            [(ngModel)]="observation"
            name="observation"
          ></textarea>
        </div>
      </div>

      <!-- Ambulance form -->
      @if (gestionType === 'TRASLADO_AMBULANCIA') {
        <div class="border-t pt-5">
          <h3 class="text-sm font-semibold mb-4 text-foreground">
            Solicitud de Traslado en Ambulancia
          </h3>
          <app-ambulance-transfer-form
            (onDataChange)="ambulanceData = $event"
          />
          @if (errors()['ambulance']) {
            <span class="text-xs text-destructive mt-2 block">{{ errors()['ambulance'] }}</span>
          }
        </div>
      }

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3 pt-2 border-t">
        <button type="button" class="btn-outline" (click)="onCancel.emit()">
          Cancelar
        </button>
        <button type="submit" class="btn-default">
          Crear Gestion
        </button>
      </div>
    </form>
  `,
})
export class NewGestionFormComponent {
  private gestionService = inject(GestionService);

  patient = input.required<Patient>();
  onSuccess = output<void>();
  onCancel = output<void>();

  title = '';
  observation = '';
  priority: Priority | '' = '';
  gestionType: GestionType | '' = '';
  area = '';
  ambulanceData: AmbulanceTransfer | null = null;
  errors = signal<Record<string, string>>({});

  onTypeChange(newType: string): void {
    if (newType === 'NORMAL') {
      this.ambulanceData = null;
    }
  }

  validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!this.title.trim()) newErrors['title'] = 'El titulo es requerido';
    if (!this.priority) newErrors['priority'] = 'La prioridad es requerida';
    if (!this.gestionType)
      newErrors['gestionType'] = 'El tipo de gestion es requerido';
    if (!this.area.trim() && this.gestionType !== 'TRASLADO_AMBULANCIA')
      newErrors['area'] = 'El area es requerida';
    if (this.gestionType === 'TRASLADO_AMBULANCIA' && !this.ambulanceData)
      newErrors['ambulance'] = 'Complete el formulario de traslado';
    this.errors.set(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  handleSubmit(): void {
    if (!this.validate()) return;

    const gestiones = this.gestionService.gestiones();
    const code = `GC-2026-${String(gestiones.length + 1).padStart(3, '0')}`;
    const isAmbulance = this.gestionType === 'TRASLADO_AMBULANCIA';

    const newGestion: Gestion = {
      id: `g-${Date.now()}`,
      code,
      patientId: this.patient().id,
      patientName: this.patient().name,
      title: this.title,
      observation: this.observation,
      priority: this.priority as Priority,
      type: this.gestionType as GestionType,
      area: isAmbulance ? 'Traslados' : this.area,
      status: isAmbulance ? 'PENDIENTE' : 'INICIADO',
      createdAt: new Date().toISOString(),
      observations: [],
      ambulanceTransfer: this.ambulanceData,
    };

    this.gestionService.addGestion(newGestion);
    this.onSuccess.emit();
  }
}

import { Component, output, OnInit, OnDestroy } from '@angular/core';
import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { AmbulanceTransfer, TransferType } from '../../models/types';

@Component({
  selector: 'app-ambulance-transfer-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-5">
      <!-- Transfer Type & Reason -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="label" for="transferType">Tipo de Traslado *</label>
          <select id="transferType" class="select" [formControl]="form.controls.transferType">
            <option value="">Seleccionar tipo</option>
            <option value="SIMPLE">Simple</option>
            <option value="REDONDO">Redondo</option>
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="label" for="dateTime">Fecha y Hora del Traslado *</label>
          <input id="dateTime" type="datetime-local" class="input" [formControl]="form.controls.dateTime" />
        </div>

        <div class="flex flex-col gap-1.5 sm:col-span-2">
          <label class="label" for="reason">Motivo del Traslado *</label>
          <input id="reason" type="text" class="input" placeholder="Motivo del traslado" [formControl]="form.controls.reason" />
        </div>
      </div>

      <!-- Origin -->
      <fieldset class="border rounded-lg p-4">
        <legend class="text-sm font-semibold px-2 text-foreground">Lugar de Origen</legend>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="label" for="originPlace">Lugar *</label>
            <input id="originPlace" type="text" class="input" placeholder="Ej: Hospital Central" [formControl]="form.controls.originPlace" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="label" for="originAddress">Direccion *</label>
            <input id="originAddress" type="text" class="input" placeholder="Ej: Cra 10 #20-30" [formControl]="form.controls.originAddress" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="label" for="originDept">Departamento *</label>
            <input id="originDept" type="text" class="input" placeholder="Ej: Cundinamarca" [formControl]="form.controls.originDepartment" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="label" for="originMun">Municipio *</label>
            <input id="originMun" type="text" class="input" placeholder="Ej: Bogota" [formControl]="form.controls.originMunicipality" />
          </div>
        </div>
      </fieldset>

      <!-- Destination -->
      <fieldset class="border rounded-lg p-4">
        <legend class="text-sm font-semibold px-2 text-foreground">Lugar de Destino</legend>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="label" for="destPlace">Lugar *</label>
            <input id="destPlace" type="text" class="input" placeholder="Ej: Fundacion Cardioinfantil" [formControl]="form.controls.destPlace" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="label" for="destAddress">Direccion *</label>
            <input id="destAddress" type="text" class="input" placeholder="Ej: Calle 163A #13B-60" [formControl]="form.controls.destAddress" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="label" for="destDept">Departamento *</label>
            <input id="destDept" type="text" class="input" placeholder="Ej: Cundinamarca" [formControl]="form.controls.destDepartment" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="label" for="destMun">Municipio *</label>
            <input id="destMun" type="text" class="input" placeholder="Ej: Bogota" [formControl]="form.controls.destMunicipality" />
          </div>
        </div>
      </fieldset>

      <!-- Destination Service -->
      <div class="flex flex-col gap-1.5">
        <label class="label" for="destService">Servicio del Destino *</label>
        <select id="destService" class="select" [formControl]="form.controls.destService">
          <option value="">Seleccionar servicio</option>
          <option value="UCI">UCI</option>
          <option value="PSIQUIATRIA">Psiquiatria</option>
          <option value="URGENCIAS">Urgencias</option>
          <option value="CIRUGIA">Cirugia</option>
          <option value="MEDICINA_INTERNA">Medicina Interna</option>
          <option value="PEDIATRIA">Pediatria</option>
          <option value="GINECOLOGIA">Ginecologia</option>
          <option value="ONCOLOGIA">Oncologia</option>
        </select>
      </div>

      <!-- Vital Support -->
      <fieldset class="border rounded-lg p-4">
        <legend class="text-sm font-semibold px-2 text-foreground">Tipo de Soporte Vital</legend>
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2">
            <input id="infusionPump" type="checkbox" class="checkbox" [formControl]="form.controls.infusionPump" />
            <label for="infusionPump" class="font-normal cursor-pointer text-sm">
              Bomba de Infusion
            </label>
          </div>
          <div class="flex items-center gap-2">
            <input id="mechanicalVentilator" type="checkbox" class="checkbox" [formControl]="form.controls.mechanicalVentilator" />
            <label for="mechanicalVentilator" class="font-normal cursor-pointer text-sm">
              Ventilador Mecanico
            </label>
          </div>
        </div>
      </fieldset>

      <!-- Observation -->
      <div class="flex flex-col gap-1.5">
        <label class="label" for="ambObs">Observacion (opcional)</label>
        <textarea
          id="ambObs"
          class="textarea"
          rows="3"
          placeholder="Observaciones adicionales del traslado..."
          [formControl]="form.controls.observation"
        ></textarea>
      </div>

      <!-- EPP -->
      <div class="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
        <input id="requiresEPP" type="checkbox" class="checkbox" [formControl]="form.controls.requiresEPP" />
        <label for="requiresEPP" class="font-normal cursor-pointer text-sm">
          Requiere Elemento de Proteccion Personal (EPP)
        </label>
      </div>
    </div>
  `,
})
export class AmbulanceTransferFormComponent implements OnInit, OnDestroy {
  onDataChange = output<AmbulanceTransfer | null>();

  form = new FormGroup({
    transferType: new FormControl(''),
    reason: new FormControl(''),
    dateTime: new FormControl(''),
    originPlace: new FormControl(''),
    originAddress: new FormControl(''),
    originDepartment: new FormControl(''),
    originMunicipality: new FormControl(''),
    destPlace: new FormControl(''),
    destAddress: new FormControl(''),
    destDepartment: new FormControl(''),
    destMunicipality: new FormControl(''),
    destService: new FormControl(''),
    infusionPump: new FormControl(false),
    mechanicalVentilator: new FormControl(false),
    observation: new FormControl(''),
    requiresEPP: new FormControl(false),
  });

  private sub!: Subscription;

  ngOnInit(): void {
    this.sub = this.form.valueChanges.subscribe((val) => {
      const isValid =
        val.transferType !== '' &&
        (val.reason ?? '').trim() !== '' &&
        val.dateTime !== '' &&
        (val.originPlace ?? '').trim() !== '' &&
        (val.originAddress ?? '').trim() !== '' &&
        (val.originDepartment ?? '').trim() !== '' &&
        (val.originMunicipality ?? '').trim() !== '' &&
        (val.destPlace ?? '').trim() !== '' &&
        (val.destAddress ?? '').trim() !== '' &&
        (val.destDepartment ?? '').trim() !== '' &&
        (val.destMunicipality ?? '').trim() !== '' &&
        val.destService !== '';

      if (isValid) {
        const data: AmbulanceTransfer = {
          transferType: val.transferType as TransferType,
          reason: val.reason ?? '',
          dateTime: val.dateTime ?? '',
          origin: {
            place: val.originPlace ?? '',
            address: val.originAddress ?? '',
            department: val.originDepartment ?? '',
            municipality: val.originMunicipality ?? '',
          },
          destination: {
            place: val.destPlace ?? '',
            address: val.destAddress ?? '',
            department: val.destDepartment ?? '',
            municipality: val.destMunicipality ?? '',
          },
          destinationService: val.destService ?? '',
          vitalSupport: {
            infusionPump: val.infusionPump ?? false,
            mechanicalVentilator: val.mechanicalVentilator ?? false,
          },
          observation: val.observation ?? '',
          requiresEPP: val.requiresEPP ?? false,
          trips: [
            {
              id: `trip-${Date.now()}`,
              tripNumber: 1,
              status: 'PENDIENTE',
              driver: null,
              origin: val.originPlace ?? '',
              destination: val.destPlace ?? '',
            },
          ],
        };
        this.onDataChange.emit(data);
      } else {
        this.onDataChange.emit(null);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}

import { Injectable, signal } from '@angular/core';
import { clinics, type Clinic } from './navigation';

@Injectable({ providedIn: 'root' })
export class ClinicService {
  currentClinic = signal<Clinic>(clinics[0]);
  allClinics = clinics;

  setClinic(clinic: Clinic): void {
    this.currentClinic.set(clinic);
  }
}

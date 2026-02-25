import { Routes } from '@angular/router';
import { PacientesComponent } from './pages/pacientes/pacientes.component';
import { GestionesComponent } from './pages/gestiones/gestiones.component';

export const routes: Routes = [
  { path: '', component: PacientesComponent },
  { path: 'gestiones', component: GestionesComponent },
  { path: '**', redirectTo: '' },
];

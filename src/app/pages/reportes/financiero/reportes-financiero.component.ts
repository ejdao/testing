import { Component } from '@angular/core';
import { ModulePlaceholderComponent } from '../../module-placeholder/module-placeholder.component';

@Component({
  selector: 'app-reportes-financiero',
  standalone: true,
  imports: [ModulePlaceholderComponent],
  template: `<app-module-placeholder title="Reporte Financiero" description="Revisa el estado financiero con balances, ingresos y egresos." icon="dollar-sign" parentModule="Reportes / Financieros" />`,
})
export class ReportesFinancieroComponent {}

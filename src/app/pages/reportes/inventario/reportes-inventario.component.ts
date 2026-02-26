import { Component } from '@angular/core';
import { ModulePlaceholderComponent } from '../../module-placeholder/module-placeholder.component';

@Component({
  selector: 'app-reportes-inventario',
  standalone: true,
  imports: [ModulePlaceholderComponent],
  template: `<app-module-placeholder title="Reporte de Inventario" description="Visualiza el estado actual del inventario y movimientos de stock." icon="warehouse" parentModule="Reportes / Operativos" />`,
})
export class ReportesInventarioComponent {}

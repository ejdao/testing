import { Component } from '@angular/core';
import { ModulePlaceholderComponent } from '../../module-placeholder/module-placeholder.component';

@Component({
  selector: 'app-reportes-ventas',
  standalone: true,
  imports: [ModulePlaceholderComponent],
  template: `<app-module-placeholder title="Reporte de Ventas" description="Analiza las ventas con graficos detallados y metricas clave." icon="trending-up" parentModule="Reportes / Financieros" />`,
})
export class ReportesVentasComponent {}

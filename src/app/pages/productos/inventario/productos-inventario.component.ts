import { Component } from '@angular/core';
import { ModulePlaceholderComponent } from '../../module-placeholder/module-placeholder.component';

@Component({
  selector: 'app-productos-inventario',
  standalone: true,
  imports: [ModulePlaceholderComponent],
  template: `<app-module-placeholder title="Inventario" description="Controla el stock, entradas y salidas de productos." icon="clipboard-list" parentModule="Productos / Stock" />`,
})
export class ProductosInventarioComponent {}

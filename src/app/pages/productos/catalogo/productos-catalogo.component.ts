import { Component } from '@angular/core';
import { ModulePlaceholderComponent } from '../../module-placeholder/module-placeholder.component';

@Component({
  selector: 'app-productos-catalogo',
  standalone: true,
  imports: [ModulePlaceholderComponent],
  template: `<app-module-placeholder title="Catalogo de Productos" description="Explora y gestiona el catalogo completo de productos disponibles." icon="package" parentModule="Productos / Catalogo" />`,
})
export class ProductosCatalogoComponent {}

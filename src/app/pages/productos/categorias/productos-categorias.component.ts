import { Component } from '@angular/core';
import { ModulePlaceholderComponent } from '../../module-placeholder/module-placeholder.component';

@Component({
  selector: 'app-productos-categorias',
  standalone: true,
  imports: [ModulePlaceholderComponent],
  template: `<app-module-placeholder title="Categorias" description="Organiza los productos en categorias para una mejor gestion." icon="tags" parentModule="Productos / Catalogo" />`,
})
export class ProductosCategoriasComponent {}

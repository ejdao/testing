import { Component } from '@angular/core';
import { ModulePlaceholderComponent } from '../../module-placeholder/module-placeholder.component';

@Component({
  selector: 'app-documentos-facturas',
  standalone: true,
  imports: [ModulePlaceholderComponent],
  template: `<app-module-placeholder title="Facturas" description="Gestiona y visualiza todas las facturas generadas." icon="file-text" parentModule="Documentos / Generacion" />`,
})
export class DocumentosFacturasComponent {}

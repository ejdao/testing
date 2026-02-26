import { Component } from '@angular/core';
import { ModulePlaceholderComponent } from '../../module-placeholder/module-placeholder.component';

@Component({
  selector: 'app-documentos-contratos',
  standalone: true,
  imports: [ModulePlaceholderComponent],
  template: `<app-module-placeholder title="Contratos" description="Administra contratos activos, vencidos y en proceso." icon="file-check" parentModule="Documentos / Generacion" />`,
})
export class DocumentosContratosComponent {}

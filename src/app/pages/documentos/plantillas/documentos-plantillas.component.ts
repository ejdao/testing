import { Component } from '@angular/core';
import { ModulePlaceholderComponent } from '../../module-placeholder/module-placeholder.component';

@Component({
  selector: 'app-documentos-plantillas',
  standalone: true,
  imports: [ModulePlaceholderComponent],
  template: `<app-module-placeholder title="Plantillas" description="Crea y gestiona plantillas de documentos reutilizables." icon="layout" parentModule="Documentos / Recursos" />`,
})
export class DocumentosPlantillasComponent {}

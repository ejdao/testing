import { Component } from '@angular/core';
import { ModulePlaceholderComponent } from '../../module-placeholder/module-placeholder.component';

@Component({
  selector: 'app-config-integraciones',
  standalone: true,
  imports: [ModulePlaceholderComponent],
  template: `<app-module-placeholder title="Integraciones" description="Conecta servicios externos y APIs de terceros al sistema." icon="plug" parentModule="Configuracion / Conexiones" />`,
})
export class ConfigIntegracionesComponent {}

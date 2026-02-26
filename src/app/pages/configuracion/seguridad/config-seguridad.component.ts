import { Component } from '@angular/core';
import { ModulePlaceholderComponent } from '../../module-placeholder/module-placeholder.component';

@Component({
  selector: 'app-config-seguridad',
  standalone: true,
  imports: [ModulePlaceholderComponent],
  template: `<app-module-placeholder title="Seguridad" description="Configura politicas de seguridad, autenticacion y auditorias." icon="shield" parentModule="Configuracion / Sistema" />`,
})
export class ConfigSeguridadComponent {}

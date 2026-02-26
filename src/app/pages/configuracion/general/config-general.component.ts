import { Component } from '@angular/core';
import { ModulePlaceholderComponent } from '../../module-placeholder/module-placeholder.component';

@Component({
  selector: 'app-config-general',
  standalone: true,
  imports: [ModulePlaceholderComponent],
  template: `<app-module-placeholder title="Configuracion General" description="Ajusta la configuracion general del sistema y preferencias." icon="settings" parentModule="Configuracion / Sistema" />`,
})
export class ConfigGeneralComponent {}

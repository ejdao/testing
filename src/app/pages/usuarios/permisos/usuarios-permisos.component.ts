import { Component } from '@angular/core';
import { ModulePlaceholderComponent } from '../../module-placeholder/module-placeholder.component';

@Component({
  selector: 'app-usuarios-permisos',
  standalone: true,
  imports: [ModulePlaceholderComponent],
  template: `<app-module-placeholder title="Permisos" description="Configura permisos granulares para cada rol y usuario del sistema." icon="lock" parentModule="Usuarios / Seguridad" />`,
})
export class UsuariosPermisosComponent {}

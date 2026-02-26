import { Component } from '@angular/core';
import { ModulePlaceholderComponent } from '../../module-placeholder/module-placeholder.component';

@Component({
  selector: 'app-usuarios-roles',
  standalone: true,
  imports: [ModulePlaceholderComponent],
  template: `<app-module-placeholder title="Roles" description="Administra los roles de usuario y sus niveles de acceso en el sistema." icon="shield-check" parentModule="Usuarios / Seguridad" />`,
})
export class UsuariosRolesComponent {}

import { Component } from '@angular/core';
import { ModulePlaceholderComponent } from '../../module-placeholder/module-placeholder.component';

@Component({
  selector: 'app-usuarios-crear',
  standalone: true,
  imports: [ModulePlaceholderComponent],
  template: `<app-module-placeholder title="Crear Usuario" description="Formulario para registrar nuevos usuarios en el sistema." icon="users" parentModule="Usuarios / Gestion" />`,
})
export class UsuariosCrearComponent {}

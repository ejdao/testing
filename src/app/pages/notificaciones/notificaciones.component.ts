import { Component } from '@angular/core';
import { ModulePlaceholderComponent } from '../module-placeholder/module-placeholder.component';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [ModulePlaceholderComponent],
  template: `<app-module-placeholder title="Notificaciones" description="Revisa y administra todas las notificaciones del sistema." icon="bell" parentModule="" />`,
})
export class NotificacionesComponent {}

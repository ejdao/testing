import { Component } from '@angular/core';
import { ModulePlaceholderComponent } from '../module-placeholder/module-placeholder.component';

@Component({
  selector: 'app-soporte',
  standalone: true,
  imports: [ModulePlaceholderComponent],
  template: `<app-module-placeholder title="Soporte" description="Centro de ayuda, documentacion y contacto con soporte tecnico." icon="help-circle" parentModule="" />`,
})
export class SoporteComponent {}

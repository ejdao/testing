import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardDescriptionComponent,
  CardContentComponent,
} from '../../../shared/card/card.component';
import {
  AvatarComponent,
  AvatarFallbackComponent,
} from '../../../shared/avatar/avatar.component';
import {
  DropdownMenuComponent,
  DropdownMenuItemComponent,
} from '../../../shared/dropdown-menu/dropdown-menu.component';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

@Component({
  selector: 'app-usuarios-lista',
  standalone: true,
  imports: [
    FormsModule,
    LucideAngularModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    AvatarComponent,
    AvatarFallbackComponent,
    DropdownMenuComponent,
    DropdownMenuItemComponent,
  ],
  templateUrl: './usuarios-lista.component.html',
  styleUrl: './usuarios-lista.component.scss',
})
export class UsuariosListaComponent {
  searchQuery = '';

  usersData: User[] = [
    { id: 1, name: 'Carlos Rodriguez', email: 'carlos@empresa.com', role: 'Administrador', status: 'Activo', lastLogin: '2026-02-25' },
    { id: 2, name: 'Maria Garcia', email: 'maria@empresa.com', role: 'Editor', status: 'Activo', lastLogin: '2026-02-24' },
    { id: 3, name: 'Juan Martinez', email: 'juan@empresa.com', role: 'Viewer', status: 'Inactivo', lastLogin: '2026-02-20' },
    { id: 4, name: 'Ana Lopez', email: 'ana@empresa.com', role: 'Editor', status: 'Activo', lastLogin: '2026-02-25' },
    { id: 5, name: 'Pedro Sanchez', email: 'pedro@empresa.com', role: 'Viewer', status: 'Activo', lastLogin: '2026-02-23' },
    { id: 6, name: 'Laura Torres', email: 'laura@empresa.com', role: 'Administrador', status: 'Activo', lastLogin: '2026-02-25' },
    { id: 7, name: 'Diego Fernandez', email: 'diego@empresa.com', role: 'Editor', status: 'Suspendido', lastLogin: '2026-02-15' },
    { id: 8, name: 'Sofia Ramirez', email: 'sofia@empresa.com', role: 'Viewer', status: 'Activo', lastLogin: '2026-02-24' },
  ];

  get filtered(): User[] {
    if (!this.searchQuery) return this.usersData;
    const q = this.searchQuery.toLowerCase();
    return this.usersData.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }

  get activeCount(): number {
    return this.usersData.filter((u) => u.status === 'Activo').length;
  }

  get inactiveCount(): number {
    return this.usersData.filter((u) => u.status === 'Inactivo').length;
  }

  get adminCount(): number {
    return this.usersData.filter((u) => u.role === 'Administrador').length;
  }

  getInitials(name: string): string {
    return name.split(' ').map((n) => n[0]).join('');
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Activo':
        return 'bg-emerald-100 text-emerald-700';
      case 'Inactivo':
        return 'bg-secondary text-muted-foreground';
      case 'Suspendido':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-secondary text-muted-foreground';
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'Administrador':
        return 'bg-primary/10 text-primary';
      case 'Editor':
        return 'bg-amber-100 text-amber-700';
      case 'Viewer':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-secondary text-muted-foreground';
    }
  }
}

export type NavRoute = {
  label: string;
  href: string;
};

export type NavSubmodule = {
  label: string;
  routes: NavRoute[];
};

export type NavLink = {
  type: 'link';
  label: string;
  href: string;
  icon: string;
  description?: string;
};

export type NavModule = {
  type: 'module';
  label: string;
  icon: string;
  description?: string;
  submodules: NavSubmodule[];
};

export type NavItem = NavLink | NavModule;

export const navigationItems: NavItem[] = [
  {
    type: 'link',
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'layout-dashboard',
    description: 'Vista general del sistema',
  },
  {
    type: 'module',
    label: 'Usuarios',
    icon: 'users',
    description: 'Gestion de usuarios y permisos del sistema',
    submodules: [
      {
        label: 'Gestion',
        routes: [
          { label: 'Lista de Usuarios', href: '/dashboard/usuarios/lista' },
          { label: 'Crear Usuario', href: '/dashboard/usuarios/crear' },
        ],
      },
      {
        label: 'Seguridad',
        routes: [
          { label: 'Roles', href: '/dashboard/usuarios/roles' },
          { label: 'Permisos', href: '/dashboard/usuarios/permisos' },
        ],
      },
    ],
  },
  {
    type: 'module',
    label: 'Productos',
    icon: 'package',
    description: 'Administracion de productos e inventario',
    submodules: [
      {
        label: 'Catalogo',
        routes: [
          {
            label: 'Todos los Productos',
            href: '/dashboard/productos/catalogo',
          },
          { label: 'Categorias', href: '/dashboard/productos/categorias' },
        ],
      },
      {
        label: 'Stock',
        routes: [
          { label: 'Inventario', href: '/dashboard/productos/inventario' },
        ],
      },
    ],
  },
  {
    type: 'module',
    label: 'Reportes',
    icon: 'bar-chart-3',
    description: 'Reportes y estadisticas del sistema',
    submodules: [
      {
        label: 'Financieros',
        routes: [
          { label: 'Ventas', href: '/dashboard/reportes/ventas' },
          { label: 'Financiero', href: '/dashboard/reportes/financiero' },
        ],
      },
      {
        label: 'Operativos',
        routes: [
          { label: 'Inventario', href: '/dashboard/reportes/inventario' },
        ],
      },
    ],
  },
  {
    type: 'module',
    label: 'Documentos',
    icon: 'file-text',
    description: 'Gestion documental y archivos',
    submodules: [
      {
        label: 'Generacion',
        routes: [
          { label: 'Facturas', href: '/dashboard/documentos/facturas' },
          { label: 'Contratos', href: '/dashboard/documentos/contratos' },
        ],
      },
      {
        label: 'Recursos',
        routes: [
          { label: 'Plantillas', href: '/dashboard/documentos/plantillas' },
        ],
      },
    ],
  },
  {
    type: 'link',
    label: 'Notificaciones',
    href: '/dashboard/notificaciones',
    icon: 'bell',
    description: 'Centro de notificaciones',
  },
  {
    type: 'module',
    label: 'Configuracion',
    icon: 'settings',
    description: 'Configuracion general del sistema',
    submodules: [
      {
        label: 'Sistema',
        routes: [
          { label: 'General', href: '/dashboard/configuracion/general' },
          { label: 'Seguridad', href: '/dashboard/configuracion/seguridad' },
        ],
      },
      {
        label: 'Conexiones',
        routes: [
          {
            label: 'Integraciones',
            href: '/dashboard/configuracion/integraciones',
          },
        ],
      },
    ],
  },
  {
    type: 'link',
    label: 'Soporte',
    href: '/dashboard/soporte',
    icon: 'help-circle',
    description: 'Centro de ayuda y soporte',
  },
];

export type Clinic = {
  id: string;
  name: string;
  address: string;
};

export const clinics: Clinic[] = [
  { id: 'cli-001', name: 'Clinica Central', address: 'Av. Principal #123' },
  { id: 'cli-002', name: 'Clinica Norte', address: 'Calle Norte #456' },
  { id: 'cli-003', name: 'Clinica Sur', address: 'Blvd. Sur #789' },
];

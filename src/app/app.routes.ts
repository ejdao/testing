import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsuariosListaComponent } from './pages/usuarios/lista/usuarios-lista.component';
import { UsuariosCrearComponent } from './pages/usuarios/crear/usuarios-crear.component';
import { UsuariosRolesComponent } from './pages/usuarios/roles/usuarios-roles.component';
import { UsuariosPermisosComponent } from './pages/usuarios/permisos/usuarios-permisos.component';
import { ProductosCatalogoComponent } from './pages/productos/catalogo/productos-catalogo.component';
import { ProductosCategoriasComponent } from './pages/productos/categorias/productos-categorias.component';
import { ProductosInventarioComponent } from './pages/productos/inventario/productos-inventario.component';
import { ReportesVentasComponent } from './pages/reportes/ventas/reportes-ventas.component';
import { ReportesFinancieroComponent } from './pages/reportes/financiero/reportes-financiero.component';
import { ReportesInventarioComponent } from './pages/reportes/inventario/reportes-inventario.component';
import { DocumentosFacturasComponent } from './pages/documentos/facturas/documentos-facturas.component';
import { DocumentosContratosComponent } from './pages/documentos/contratos/documentos-contratos.component';
import { DocumentosPlantillasComponent } from './pages/documentos/plantillas/documentos-plantillas.component';
import { ConfigGeneralComponent } from './pages/configuracion/general/config-general.component';
import { ConfigSeguridadComponent } from './pages/configuracion/seguridad/config-seguridad.component';
import { ConfigIntegracionesComponent } from './pages/configuracion/integraciones/config-integraciones.component';
import { NotificacionesComponent } from './pages/notificaciones/notificaciones.component';
import { SoporteComponent } from './pages/soporte/soporte.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'usuarios/lista', component: UsuariosListaComponent },
      { path: 'usuarios/crear', component: UsuariosCrearComponent },
      { path: 'usuarios/roles', component: UsuariosRolesComponent },
      { path: 'usuarios/permisos', component: UsuariosPermisosComponent },
      { path: 'productos/catalogo', component: ProductosCatalogoComponent },
      { path: 'productos/categorias', component: ProductosCategoriasComponent },
      { path: 'productos/inventario', component: ProductosInventarioComponent },
      { path: 'reportes/ventas', component: ReportesVentasComponent },
      { path: 'reportes/financiero', component: ReportesFinancieroComponent },
      { path: 'reportes/inventario', component: ReportesInventarioComponent },
      { path: 'documentos/facturas', component: DocumentosFacturasComponent },
      { path: 'documentos/contratos', component: DocumentosContratosComponent },
      { path: 'documentos/plantillas', component: DocumentosPlantillasComponent },
      { path: 'configuracion/general', component: ConfigGeneralComponent },
      { path: 'configuracion/seguridad', component: ConfigSeguridadComponent },
      { path: 'configuracion/integraciones', component: ConfigIntegracionesComponent },
      { path: 'notificaciones', component: NotificacionesComponent },
      { path: 'soporte', component: SoporteComponent },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];

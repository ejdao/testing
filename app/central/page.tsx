'use client';

import Link from 'next/link';
import { useTraslados } from '@/context/TrasladosContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-custom';
import { Badge } from '@/components/ui-custom';
import { 
  Truck, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const estadoLabels: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger' }> = {
  pendiente: { label: 'Pendiente', variant: 'warning' },
  asignado: { label: 'Asignado', variant: 'info' },
  en_ruta: { label: 'En Ruta', variant: 'info' },
  en_escena: { label: 'En Escena', variant: 'warning' },
  en_traslado: { label: 'En Traslado', variant: 'warning' },
  finalizado: { label: 'Finalizado', variant: 'success' },
  cancelado: { label: 'Cancelado', variant: 'danger' },
};

export default function CentralDashboard() {
  const { trasladosPrimarios, trasladosSecundarios, ambulancias, obtenerIncidentesPendientes } = useTraslados();

  const secundariosPendientes = trasladosSecundarios.filter(t => t.estado === 'pendiente');
  const secundariosEnCurso = trasladosSecundarios.filter(t => 
    t.estado === 'asignado' || t.estado === 'en_ruta' || t.estado === 'en_traslado'
  );
  const ambulanciasDisponibles = ambulancias.filter(a => a.estado === 'disponible');
  const ambulanciasEnServicio = ambulancias.filter(a => a.estado === 'en_servicio');
  const incidentesPendientes = obtenerIncidentesPendientes();

  const trasladosRecientes = [...trasladosPrimarios, ...trasladosSecundarios]
    .sort((a, b) => {
      const fechaA = a.tipo === 'primario' ? a.fechaCreacion : a.fechaSolicitud;
      const fechaB = b.tipo === 'primario' ? b.fechaCreacion : b.fechaSolicitud;
      return new Date(fechaB).getTime() - new Date(fechaA).getTime();
    })
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{secundariosPendientes.length}</p>
              <p className="text-sm text-gray-500">Por Asignar</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{secundariosEnCurso.length}</p>
              <p className="text-sm text-gray-500">En Curso</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{ambulanciasDisponibles.length}</p>
              <p className="text-sm text-gray-500">Amb. Disponibles</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{trasladosPrimarios.length}</p>
              <p className="text-sm text-gray-500">Primarios</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{incidentesPendientes.length}</p>
              <p className="text-sm text-gray-500">Incidentes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/central/secundarios">
          <Card variant="bordered" className="hover:border-orange-300 hover:shadow-md transition-all cursor-pointer">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="p-4 bg-orange-600 rounded-lg">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">Asignar Ambulancias</h3>
                  {secundariosPendientes.length > 0 && (
                    <Badge variant="danger">{secundariosPendientes.length}</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">Traslados secundarios pendientes</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/central/primarios">
          <Card variant="bordered" className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="p-4 bg-blue-600 rounded-lg">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Ver Primarios</h3>
                <p className="text-sm text-gray-500">Traslados primarios registrados</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/central/reasignar">
          <Card variant="bordered" className="hover:border-purple-300 hover:shadow-md transition-all cursor-pointer">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="p-4 bg-purple-600 rounded-lg">
                <RefreshCw className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Reasignar Traslados</h3>
                <p className="text-sm text-gray-500">Por contratiempo de ambulancia</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Estado de Ambulancias */}
      <Card variant="bordered">
        <CardHeader className="bg-gray-50">
          <CardTitle>Estado de Ambulancias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {ambulancias.map((ambulancia) => (
              <div
                key={ambulancia.id}
                className={cn(
                  'p-4 rounded-lg border',
                  ambulancia.estado === 'disponible' && 'bg-green-50 border-green-200',
                  ambulancia.estado === 'en_servicio' && 'bg-blue-50 border-blue-200',
                  ambulancia.estado === 'fuera_servicio' && 'bg-red-50 border-red-200',
                  ambulancia.estado === 'mantenimiento' && 'bg-yellow-50 border-yellow-200'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900">{ambulancia.placa}</span>
                  <Badge 
                    variant={
                      ambulancia.estado === 'disponible' ? 'success' :
                      ambulancia.estado === 'en_servicio' ? 'info' :
                      ambulancia.estado === 'mantenimiento' ? 'warning' : 'danger'
                    }
                  >
                    {ambulancia.tipo}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 capitalize">{ambulancia.estado.replace('_', ' ')}</p>
                <p className="text-xs text-gray-400">{ambulancia.ubicacionActual}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Traslados Recientes */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Traslados Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {trasladosRecientes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay traslados registrados</p>
          ) : (
            <div className="space-y-3">
              {trasladosRecientes.map((traslado) => {
                const fecha = traslado.tipo === 'primario' ? traslado.fechaCreacion : traslado.fechaSolicitud;
                const estado = estadoLabels[traslado.estado] || estadoLabels.pendiente;
                
                return (
                  <div
                    key={traslado.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${
                        traslado.tipo === 'primario' ? 'bg-blue-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">
                          {traslado.paciente.nombres} {traslado.paciente.apellidos}
                        </p>
                        <p className="text-sm text-gray-500">
                          {traslado.tipo === 'primario' ? 'Primario' : 'Secundario'} - 
                          {' '}{format(new Date(fecha), "dd MMM yyyy HH:mm", { locale: es })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={estado.variant}>{estado.label}</Badge>
                      {traslado.tipo === 'secundario' && traslado.ambulanciaAsignada && (
                        <Badge variant="default">Asignado</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

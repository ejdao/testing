'use client';

import Link from 'next/link';
import { useTraslados } from '@/context/TrasladosContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-custom';
import { Badge } from '@/components/ui-custom';
import { PlusCircle, FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
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

export default function AuxiliarDashboard() {
  const { trasladosPrimarios, trasladosSecundarios } = useTraslados();

  const primariosPendientes = trasladosPrimarios.filter(t => t.estado !== 'finalizado' && t.estado !== 'cancelado');
  // Solo mostrar secundarios que YA tienen ambulancia asignada por la central
  const secundariosAsignados = trasladosSecundarios.filter(t => 
    t.ambulanciaAsignada && (t.estado === 'asignado' || t.estado === 'en_ruta' || t.estado === 'en_traslado')
  );

  const trasladosRecientes = [...trasladosPrimarios, ...trasladosSecundarios]
    .sort((a, b) => {
      const fechaA = a.tipo === 'primario' ? a.fechaCreacion : a.fechaSolicitud;
      const fechaB = b.tipo === 'primario' ? b.fechaCreacion : b.fechaSolicitud;
      return new Date(fechaB).getTime() - new Date(fechaA).getTime();
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{trasladosPrimarios.length}</p>
              <p className="text-sm text-gray-500">Traslados Primarios</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {trasladosPrimarios.filter(t => t.estado === 'finalizado').length}
              </p>
              <p className="text-sm text-gray-500">Finalizados Hoy</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{secundariosAsignados.length}</p>
              <p className="text-sm text-gray-500">Secundarios Asignados</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{primariosPendientes.length}</p>
              <p className="text-sm text-gray-500">En Proceso</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/auxiliar/primario/nuevo">
          <Card variant="bordered" className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="p-4 bg-blue-600 rounded-lg">
                <PlusCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Nuevo Traslado Primario</h3>
                <p className="text-sm text-gray-500">Registrar un nuevo traslado desde escena</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/auxiliar/secundarios">
          <Card variant="bordered" className="hover:border-green-300 hover:shadow-md transition-all cursor-pointer">
            <CardContent className="flex items-center gap-4 py-6">
              <div className="p-4 bg-green-600 rounded-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">Traslados Secundarios</h3>
                  {secundariosAsignados.length > 0 && (
                    <Badge variant="danger">{secundariosAsignados.length} pendientes</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">Ver traslados secundarios asignados</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Transfers */}
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
                    <Badge variant={estado.variant}>{estado.label}</Badge>
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

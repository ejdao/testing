'use client';

import Link from 'next/link';
import { useTraslados } from '@/context/TrasladosContext';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui-custom';
import { PlusCircle, Clock, CheckCircle, FileText, Truck } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const estadoConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger' }> = {
  pendiente: { label: 'Pendiente Asignacion', variant: 'warning' },
  asignado: { label: 'Ambulancia Asignada', variant: 'info' },
  en_ruta: { label: 'En Ruta', variant: 'info' },
  en_traslado: { label: 'En Traslado', variant: 'warning' },
  finalizado: { label: 'Finalizado', variant: 'success' },
  cancelado: { label: 'Cancelado', variant: 'danger' },
};

export default function MedicoDashboard() {
  const { trasladosSecundarios } = useTraslados();

  const misSolicitudes = trasladosSecundarios.filter(t => t.solicitadoPor === 'Medico');
  const pendientes = misSolicitudes.filter(t => t.estado === 'pendiente');
  const enProceso = misSolicitudes.filter(t => 
    t.estado === 'asignado' || t.estado === 'en_ruta' || t.estado === 'en_traslado'
  );
  const finalizados = misSolicitudes.filter(t => t.estado === 'finalizado');

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
              <p className="text-2xl font-bold text-gray-900">{misSolicitudes.length}</p>
              <p className="text-sm text-gray-500">Total Solicitudes</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendientes.length}</p>
              <p className="text-sm text-gray-500">Pendientes</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Truck className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{enProceso.length}</p>
              <p className="text-sm text-gray-500">En Proceso</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{finalizados.length}</p>
              <p className="text-sm text-gray-500">Finalizados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action */}
      <Link href="/medico/solicitar">
        <Card variant="bordered" className="hover:border-green-300 hover:shadow-md transition-all cursor-pointer">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="p-4 bg-green-600 rounded-lg">
              <PlusCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Solicitar Traslado Secundario</h3>
              <p className="text-sm text-gray-500">Crear una nueva solicitud de traslado entre IPS</p>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Solicitudes en Proceso */}
      {enProceso.length > 0 && (
        <Card variant="bordered">
          <CardHeader className="bg-orange-50">
            <CardTitle className="text-orange-800">Traslados en Proceso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enProceso.map((traslado) => {
                const estado = estadoConfig[traslado.estado] || estadoConfig.pendiente;
                
                return (
                  <div
                    key={traslado.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {traslado.paciente.nombres} {traslado.paciente.apellidos}
                      </p>
                      <p className="text-sm text-gray-500">
                        {traslado.datosTraslado.ipsOrigen.nombre} → {traslado.datosTraslado.ipsDestino.nombre}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(traslado.fechaSolicitud), "dd MMM yyyy HH:mm", { locale: es })}
                      </p>
                    </div>
                    <Badge variant={estado.variant}>{estado.label}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Solicitudes Pendientes */}
      {pendientes.length > 0 && (
        <Card variant="bordered">
          <CardHeader className="bg-yellow-50">
            <CardTitle className="text-yellow-800">Esperando Asignacion de Ambulancia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendientes.map((traslado) => (
                <div
                  key={traslado.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {traslado.paciente.nombres} {traslado.paciente.apellidos}
                    </p>
                    <p className="text-sm text-gray-500">
                      {traslado.datosTraslado.ipsOrigen.nombre} → {traslado.datosTraslado.ipsDestino.nombre}
                    </p>
                  </div>
                  <Badge variant="warning">Pendiente</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {misSolicitudes.length === 0 && (
        <Card variant="bordered">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No has realizado solicitudes de traslado</p>
            <Link href="/medico/solicitar" className="text-green-600 hover:underline text-sm mt-2 inline-block">
              Crear tu primera solicitud
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

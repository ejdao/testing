'use client';

import { useTraslados } from '@/context/TrasladosContext';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui-custom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FileText, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';

const estadoConfig: Record<string, { 
  label: string; 
  variant: 'default' | 'info' | 'warning' | 'success' | 'danger'; 
  icon: typeof Clock;
  description: string;
}> = {
  pendiente: { 
    label: 'Pendiente', 
    variant: 'warning', 
    icon: Clock,
    description: 'Esperando asignacion de ambulancia por la Central'
  },
  asignado: { 
    label: 'Asignado', 
    variant: 'info', 
    icon: Truck,
    description: 'Ambulancia asignada, pendiente de inicio'
  },
  en_ruta: { 
    label: 'En Ruta', 
    variant: 'info', 
    icon: Truck,
    description: 'La ambulancia esta en camino a recoger al paciente'
  },
  en_traslado: { 
    label: 'En Traslado', 
    variant: 'warning', 
    icon: Truck,
    description: 'Paciente en traslado hacia el destino'
  },
  finalizado: { 
    label: 'Finalizado', 
    variant: 'success', 
    icon: CheckCircle,
    description: 'Traslado completado exitosamente'
  },
  cancelado: { 
    label: 'Cancelado', 
    variant: 'danger', 
    icon: XCircle,
    description: 'El traslado fue cancelado'
  },
};

export default function HistorialMedico() {
  const { trasladosSecundarios, ambulancias } = useTraslados();

  const misSolicitudes = trasladosSecundarios
    .filter(t => t.solicitadoPor === 'Medico')
    .sort((a, b) => new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Historial de Solicitudes</h1>
        <p className="text-gray-500">Seguimiento de tus solicitudes de traslado secundario</p>
      </div>

      {misSolicitudes.length === 0 ? (
        <Card variant="bordered">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No has realizado solicitudes de traslado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {misSolicitudes.map((traslado) => {
            const estado = estadoConfig[traslado.estado] || estadoConfig.pendiente;
            const Icon = estado.icon;
            const ambulancia = traslado.ambulanciaAsignada 
              ? ambulancias.find(a => a.id === traslado.ambulanciaAsignada)
              : null;

            return (
              <Card key={traslado.id} variant="bordered">
                <CardHeader className="bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {traslado.paciente.nombres} {traslado.paciente.apellidos}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {traslado.paciente.tipoDocumento}: {traslado.paciente.numeroDocumento}
                      </p>
                    </div>
                    <Badge variant={estado.variant} className="flex items-center gap-1">
                      <Icon className="w-3 h-3" />
                      {estado.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Estado actual */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{estado.description}</p>
                  </div>

                  {/* Detalles del traslado */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Origen</p>
                      <p className="font-medium">{traslado.datosTraslado.ipsOrigen.nombre}</p>
                      <p className="text-sm text-gray-400">
                        {traslado.datosTraslado.ipsOrigen.municipio}, {traslado.datosTraslado.ipsOrigen.departamento}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Destino</p>
                      <p className="font-medium">{traslado.datosTraslado.ipsDestino.nombre}</p>
                      <p className="text-sm text-gray-400">
                        {traslado.datosTraslado.ipsDestino.municipio}, {traslado.datosTraslado.ipsDestino.departamento}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Diagnostico</p>
                      <p className="font-medium">{traslado.datosClinicosLlegada.diagnostico}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Grupo de Servicio</p>
                      <p className="font-medium">{traslado.grupoServicioDestino}</p>
                    </div>
                  </div>

                  {/* Ambulancia asignada */}
                  {ambulancia && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-blue-800">Ambulancia Asignada</p>
                      <p className="text-blue-700">
                        Placa: {ambulancia.placa} - Tipo: {ambulancia.tipo}
                      </p>
                    </div>
                  )}

                  {/* Tiempos */}
                  {traslado.tiemposRecorrido?.fechaHoraInicio && (
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Inicio: </span>
                        <span className="font-medium">
                          {format(new Date(traslado.tiemposRecorrido.fechaHoraInicio), "dd MMM HH:mm", { locale: es })}
                        </span>
                      </div>
                      {traslado.tiemposRecorrido?.fechaHoraFinalizacion && (
                        <div>
                          <span className="text-gray-500">Fin: </span>
                          <span className="font-medium">
                            {format(new Date(traslado.tiemposRecorrido.fechaHoraFinalizacion), "dd MMM HH:mm", { locale: es })}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fecha de solicitud */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      Solicitado el {format(new Date(traslado.fechaSolicitud), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

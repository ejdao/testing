'use client';

import { useTraslados } from '@/context/TrasladosContext';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui-custom';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Play, Eye, Truck, CheckCircle } from 'lucide-react';

const estadoConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger'; icon: typeof Play }> = {
  asignado: { label: 'Asignado', variant: 'info', icon: Play },
  en_ruta: { label: 'En Ruta', variant: 'warning', icon: Truck },
  en_traslado: { label: 'En Traslado', variant: 'warning', icon: Truck },
  finalizado: { label: 'Finalizado', variant: 'success', icon: CheckCircle },
};

export default function SecundariosAsignados() {
  const { trasladosSecundarios, actualizarTrasladoSecundario, actualizarAmbulancia, ambulancias } = useTraslados();

  const secundariosActivos = trasladosSecundarios.filter(t => 
    t.estado === 'asignado' || t.estado === 'en_ruta' || t.estado === 'en_traslado'
  );

  const secundariosFinalizados = trasladosSecundarios.filter(t => t.estado === 'finalizado');

  const handleIniciarTraslado = (trasladoId: string, ambulanciaId?: string) => {
    actualizarTrasladoSecundario(trasladoId, {
      estado: 'en_ruta',
      tiemposRecorrido: {
        ...trasladosSecundarios.find(t => t.id === trasladoId)?.tiemposRecorrido,
        fechaHoraInicio: new Date().toISOString(),
        tipoRecorrido: 'simple'
      }
    });

    if (ambulanciaId) {
      actualizarAmbulancia(ambulanciaId, {
        estado: 'en_servicio',
        trasladoActual: trasladoId
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Traslados Secundarios Asignados</h1>
        <p className="text-gray-500">Gestiona los traslados secundarios que te han sido asignados</p>
      </div>

      {/* Traslados Activos */}
      <Card variant="bordered">
        <CardHeader className="bg-orange-50">
          <CardTitle className="text-orange-800">
            Traslados Activos ({secundariosActivos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {secundariosActivos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tienes traslados secundarios asignados</p>
          ) : (
            <div className="space-y-4">
              {secundariosActivos.map((traslado) => {
                const estado = estadoConfig[traslado.estado] || estadoConfig.asignado;
                const ambulancia = ambulancias.find(a => a.id === traslado.ambulanciaAsignada);
                
                return (
                  <div
                    key={traslado.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={estado.variant}>{estado.label}</Badge>
                          {ambulancia && (
                            <Badge variant="default">
                              Ambulancia: {ambulancia.placa} ({ambulancia.tipo})
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900">
                          {traslado.paciente.nombres} {traslado.paciente.apellidos}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {traslado.paciente.tipoDocumento}: {traslado.paciente.numeroDocumento}
                        </p>
                        <div className="mt-2 text-sm">
                          <p className="text-gray-600">
                            <span className="font-medium">Origen:</span> {traslado.datosTraslado.ipsOrigen.nombre}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Destino:</span> {traslado.datosTraslado.ipsDestino.nombre}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            Solicitado: {format(new Date(traslado.fechaSolicitud), "dd MMM yyyy HH:mm", { locale: es })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {traslado.estado === 'asignado' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleIniciarTraslado(traslado.id, traslado.ambulanciaAsignada)}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Iniciar
                          </Button>
                        )}
                        <Link href={`/auxiliar/secundarios/${traslado.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            {traslado.estado === 'asignado' ? 'Ver' : 'Completar'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historial de Finalizados */}
      {secundariosFinalizados.length > 0 && (
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Historial de Traslados Finalizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {secundariosFinalizados.slice(0, 5).map((traslado) => (
                <div
                  key={traslado.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {traslado.paciente.nombres} {traslado.paciente.apellidos}
                    </p>
                    <p className="text-sm text-gray-500">
                      {traslado.datosTraslado.ipsOrigen.nombre} → {traslado.datosTraslado.ipsDestino.nombre}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success">Finalizado</Badge>
                    <Link href={`/auxiliar/secundarios/${traslado.id}`}>
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

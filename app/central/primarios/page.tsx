'use client';

import { useState } from 'react';
import { useTraslados } from '@/context/TrasladosContext';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui-custom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Eye, User, MapPin, Clock, Activity, FileText } from 'lucide-react';
import type { TrasladoPrimario } from '@/types/traslados';

const estadoConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger' }> = {
  pendiente: { label: 'Pendiente', variant: 'warning' },
  asignado: { label: 'Asignado', variant: 'info' },
  en_ruta: { label: 'En Ruta', variant: 'info' },
  en_escena: { label: 'En Escena', variant: 'warning' },
  en_traslado: { label: 'En Traslado', variant: 'warning' },
  finalizado: { label: 'Finalizado', variant: 'success' },
  cancelado: { label: 'Cancelado', variant: 'danger' },
};

const triageColors: Record<number, string> = {
  1: 'bg-red-500 text-white',
  2: 'bg-orange-500 text-white',
  3: 'bg-yellow-500 text-black',
  4: 'bg-green-500 text-white',
  5: 'bg-blue-500 text-white',
};

export default function VerPrimarios() {
  const { trasladosPrimarios } = useTraslados();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  const primariosFiltrados = filtroEstado === 'todos' 
    ? trasladosPrimarios 
    : trasladosPrimarios.filter(t => t.estado === filtroEstado);

  const primariosSorted = [...primariosFiltrados].sort((a, b) => 
    new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Traslados Primarios</h1>
        <p className="text-gray-500">Visualizacion de traslados primarios registrados por auxiliares (solo lectura)</p>
      </div>

      {/* Filtros y estadisticas */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{trasladosPrimarios.length}</p>
              <p className="text-sm text-gray-500">Total Primarios</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {trasladosPrimarios.filter(t => t.estado !== 'finalizado' && t.estado !== 'cancelado').length}
              </p>
              <p className="text-sm text-gray-500">En Proceso</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {trasladosPrimarios.filter(t => t.estado === 'finalizado').length}
              </p>
              <p className="text-sm text-gray-500">Finalizados</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered" className="flex items-center">
          <CardContent className="w-full py-4">
            <label className="text-sm text-gray-500 block mb-1">Filtrar por estado</label>
            <select
              className="w-full p-2 border rounded-lg text-sm"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_ruta">En Ruta</option>
              <option value="en_escena">En Escena</option>
              <option value="en_traslado">En Traslado</option>
              <option value="finalizado">Finalizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </CardContent>
        </Card>
      </div>

      {/* Lista de traslados primarios */}
      <Card variant="bordered">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-800">
            Traslados Primarios ({primariosSorted.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {primariosSorted.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay traslados primarios registrados</p>
          ) : (
            <div className="space-y-4">
              {primariosSorted.map((traslado) => (
                <TrasladoPrimarioCard
                  key={traslado.id}
                  traslado={traslado}
                  isExpanded={expandedId === traslado.id}
                  onToggleExpand={() => setExpandedId(
                    expandedId === traslado.id ? null : traslado.id
                  )}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface TrasladoPrimarioCardProps {
  traslado: TrasladoPrimario;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function TrasladoPrimarioCard({ traslado, isExpanded, onToggleExpand }: TrasladoPrimarioCardProps) {
  const estado = estadoConfig[traslado.estado] || estadoConfig.pendiente;
  const triageClass = triageColors[traslado.datosClinicosLlegada?.triageEscena || 5];

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant={estado.variant}>{estado.label}</Badge>
            {traslado.datosClinicosLlegada?.triageEscena && (
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${triageClass}`}>
                Triage {traslado.datosClinicosLlegada.triageEscena}
              </span>
            )}
            <span className="text-xs text-gray-500">
              {format(new Date(traslado.fechaCreacion), "dd MMM yyyy HH:mm", { locale: es })}
            </span>
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-1">
            <User className="w-4 h-4 inline mr-1" />
            {traslado.paciente.nombres} {traslado.paciente.apellidos}
          </h3>
          <p className="text-sm text-gray-600">
            {traslado.paciente.tipoDocumento}: {traslado.paciente.numeroDocumento} | 
            Edad: {traslado.paciente.edad} | EPS: {traslado.paciente.eps}
          </p>
          
          <div className="mt-2 flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-gray-600">
                <span className="font-medium">Origen:</span> {traslado.datosTraslado.lugarOrigen}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Destino:</span> {traslado.datosTraslado.institucionDestino.nombre}
              </p>
            </div>
          </div>

          {traslado.datosClinicosLlegada?.diagnosticoPrincipal && (
            <p className="mt-2 text-sm">
              <span className="font-medium text-gray-700">Diagnostico:</span>{' '}
              <span className="text-gray-600">{traslado.datosClinicosLlegada.diagnosticoPrincipal}</span>
            </p>
          )}
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={onToggleExpand}
        >
          <Eye className="w-4 h-4 mr-1" />
          {isExpanded ? 'Ocultar' : 'Ver detalles'}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-4 p-4 bg-white rounded border border-gray-200 space-y-4">
          {/* Tiempos */}
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Tiempos Operacionales</h4>
            <div className="grid md:grid-cols-5 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Solicitud</p>
                <p className="font-medium">
                  {traslado.tiempos.fechaSolicitud 
                    ? format(new Date(traslado.tiempos.fechaSolicitud), "HH:mm", { locale: es })
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Despacho</p>
                <p className="font-medium">{traslado.tiempos.horaDespacho || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Llegada Escena</p>
                <p className="font-medium">{traslado.tiempos.horaLlegadaEscena || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Salida Escena</p>
                <p className="font-medium">{traslado.tiempos.horaSalidaEscena || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Llegada Institucion</p>
                <p className="font-medium">{traslado.tiempos.horaLlegadaInstitucion || '-'}</p>
              </div>
            </div>
          </div>

          {/* Signos Vitales */}
          {traslado.datosClinicosLlegada?.signosVitales && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Signos Vitales</h4>
              <div className="grid md:grid-cols-6 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">TA</p>
                  <p className="font-medium">{traslado.datosClinicosLlegada.signosVitales.tensionArterial || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">FC</p>
                  <p className="font-medium">{traslado.datosClinicosLlegada.signosVitales.frecuenciaCardiaca || '-'} p/min</p>
                </div>
                <div>
                  <p className="text-gray-500">FR</p>
                  <p className="font-medium">{traslado.datosClinicosLlegada.signosVitales.frecuenciaRespiratoria || '-'} r/min</p>
                </div>
                <div>
                  <p className="text-gray-500">SatO2</p>
                  <p className="font-medium">{traslado.datosClinicosLlegada.signosVitales.saturacionOxigeno || '-'}%</p>
                </div>
                <div>
                  <p className="text-gray-500">Glasgow</p>
                  <p className="font-medium">{traslado.datosClinicosLlegada.signosVitales.glasgow || '-'}/15</p>
                </div>
                <div>
                  <p className="text-gray-500">Estado</p>
                  <Badge variant={traslado.datosClinicosLlegada.estadoIngreso === 'vivo' ? 'success' : 'danger'}>
                    {traslado.datosClinicosLlegada.estadoIngreso === 'vivo' ? 'Vivo' : 'Muerto'}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Tripulacion */}
          {traslado.tripulacion && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Tripulacion</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Conductor</p>
                  <p className="font-medium">{traslado.tripulacion.conductor?.nombre || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Auxiliar</p>
                  <p className="font-medium">{traslado.tripulacion.auxiliarEnfermeria?.nombre || '-'}</p>
                </div>
                {traslado.tripulacion.medico && (
                  <div>
                    <p className="text-gray-500">Medico</p>
                    <p className="font-medium">{traslado.tripulacion.medico.nombre}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Procedimientos */}
          {(traslado.procedimientos?.procedimientosRealizados || traslado.procedimientos?.medicamentos) && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Procedimientos y Medicamentos</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Procedimientos</p>
                  <p className="font-medium">{traslado.procedimientos.procedimientosRealizados || 'Ninguno'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Medicamentos</p>
                  <p className="font-medium">{traslado.procedimientos.medicamentos || 'Ninguno'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Observaciones */}
          {traslado.observaciones && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Observaciones</h4>
              <p className="text-sm text-gray-600">{traslado.observaciones}</p>
            </div>
          )}

          <div className="pt-2 border-t text-xs text-gray-400">
            Registrado por: {traslado.creadoPor} | Placa: {traslado.vehiculoPlaca || '-'}
          </div>
        </div>
      )}
    </div>
  );
}

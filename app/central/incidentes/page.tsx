'use client';

import { useState } from 'react';
import { useTraslados } from '@/context/TrasladosContext';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Textarea } from '@/components/ui-custom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, CheckCircle, Clock, MessageSquare, User } from 'lucide-react';
import type { Incidente } from '@/types/traslados';

const prioridadConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger' }> = {
  baja: { label: 'Baja', variant: 'info' },
  media: { label: 'Media', variant: 'warning' },
  alta: { label: 'Alta', variant: 'danger' },
  critica: { label: 'Critica', variant: 'danger' },
};

const tipoIncidenteLabels: Record<string, string> = {
  averia: 'Averia de vehiculo',
  accidente: 'Accidente',
  retraso: 'Retraso significativo',
  complicacion_paciente: 'Complicacion del paciente',
  otro: 'Otro',
};

export default function IncidentesCentral() {
  const { incidentes, atenderIncidente, trasladosSecundarios, trasladosPrimarios } = useTraslados();
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const incidentesPendientes = incidentes.filter(i => !i.atendido);
  const incidentesAtendidos = incidentes.filter(i => i.atendido);

  const handleAtender = (incidenteId: string) => {
    const respuesta = respuestas[incidenteId];
    if (!respuesta) return;

    atenderIncidente(incidenteId, respuesta, 'Central de Despacho');
    setRespuestas(prev => {
      const newState = { ...prev };
      delete newState[incidenteId];
      return newState;
    });
  };

  const getTrasladoInfo = (trasladoId: string) => {
    const secundario = trasladosSecundarios.find(t => t.id === trasladoId);
    if (secundario) {
      return {
        tipo: 'Secundario',
        paciente: `${secundario.paciente.nombres} ${secundario.paciente.apellidos}`,
        ruta: `${secundario.datosTraslado.ipsOrigen.nombre} → ${secundario.datosTraslado.ipsDestino.nombre}`,
      };
    }
    const primario = trasladosPrimarios.find(t => t.id === trasladoId);
    if (primario) {
      return {
        tipo: 'Primario',
        paciente: `${primario.paciente.nombres} ${primario.paciente.apellidos}`,
        ruta: `${primario.datosTraslado.lugarOrigen} → ${primario.datosTraslado.institucionDestino.nombre}`,
      };
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion de Incidentes</h1>
        <p className="text-gray-500">Revisa y atiende los incidentes reportados por los auxiliares</p>
      </div>

      {/* Estadisticas */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{incidentesPendientes.length}</p>
              <p className="text-sm text-gray-500">Pendientes</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{incidentesAtendidos.length}</p>
              <p className="text-sm text-gray-500">Atendidos</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {incidentesPendientes.filter(i => i.prioridad === 'alta' || i.prioridad === 'critica').length}
              </p>
              <p className="text-sm text-gray-500">Alta Prioridad</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incidentes Pendientes */}
      <Card variant="bordered">
        <CardHeader className="bg-red-50">
          <CardTitle className="text-red-800">
            Incidentes Pendientes ({incidentesPendientes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {incidentesPendientes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay incidentes pendientes</p>
          ) : (
            <div className="space-y-4">
              {incidentesPendientes
                .sort((a, b) => {
                  const prioridadOrden = { critica: 0, alta: 1, media: 2, baja: 3 };
                  return prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad];
                })
                .map((incidente) => (
                  <IncidenteCard
                    key={incidente.id}
                    incidente={incidente}
                    trasladoInfo={getTrasladoInfo(incidente.trasladoId)}
                    isExpanded={expandedId === incidente.id}
                    onToggleExpand={() => setExpandedId(expandedId === incidente.id ? null : incidente.id)}
                    respuesta={respuestas[incidente.id] || ''}
                    onRespuestaChange={(value) => setRespuestas(prev => ({ ...prev, [incidente.id]: value }))}
                    onAtender={() => handleAtender(incidente.id)}
                    isPendiente
                  />
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historial de Incidentes Atendidos */}
      {incidentesAtendidos.length > 0 && (
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Historial de Incidentes Atendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {incidentesAtendidos
                .sort((a, b) => new Date(b.fechaAtencion || '').getTime() - new Date(a.fechaAtencion || '').getTime())
                .slice(0, 10)
                .map((incidente) => (
                  <IncidenteCard
                    key={incidente.id}
                    incidente={incidente}
                    trasladoInfo={getTrasladoInfo(incidente.trasladoId)}
                    isExpanded={expandedId === incidente.id}
                    onToggleExpand={() => setExpandedId(expandedId === incidente.id ? null : incidente.id)}
                    isPendiente={false}
                  />
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface IncidenteCardProps {
  incidente: Incidente;
  trasladoInfo: { tipo: string; paciente: string; ruta: string } | null;
  isExpanded: boolean;
  onToggleExpand: () => void;
  respuesta?: string;
  onRespuestaChange?: (value: string) => void;
  onAtender?: () => void;
  isPendiente: boolean;
}

function IncidenteCard({
  incidente,
  trasladoInfo,
  isExpanded,
  onToggleExpand,
  respuesta,
  onRespuestaChange,
  onAtender,
  isPendiente,
}: IncidenteCardProps) {
  const prioridad = prioridadConfig[incidente.prioridad] || prioridadConfig.media;

  return (
    <div className={`p-4 rounded-lg border ${
      isPendiente ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant={prioridad.variant}>{prioridad.label}</Badge>
            <Badge variant="default">{tipoIncidenteLabels[incidente.tipo] || incidente.tipo}</Badge>
            <span className="text-xs text-gray-500">
              {format(new Date(incidente.fechaHora), "dd MMM yyyy HH:mm", { locale: es })}
            </span>
          </div>

          <p className="text-gray-900 font-medium mb-2">{incidente.descripcion}</p>

          {trasladoInfo && (
            <div className="text-sm text-gray-600 mb-2">
              <p>
                <span className="font-medium">Traslado:</span> {trasladoInfo.tipo} - {trasladoInfo.paciente}
              </p>
              <p className="text-xs text-gray-500">{trasladoInfo.ruta}</p>
            </div>
          )}

          <p className="text-sm text-gray-500">
            <User className="w-3 h-3 inline mr-1" />
            Reportado por: {incidente.reportadoPor}
          </p>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleExpand}
            className="mt-2"
          >
            {isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
          </Button>
        </div>

        {isPendiente && !incidente.atendido && (
          <div className="lg:w-72">
            <Badge variant="warning" className="mb-2">Requiere atencion</Badge>
          </div>
        )}

        {!isPendiente && incidente.atendido && (
          <Badge variant="success">Atendido</Badge>
        )}
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
          {isPendiente && !incidente.atendido && onRespuestaChange && onAtender && (
            <div className="space-y-3">
              <Textarea
                label="Respuesta / Accion Tomada"
                name="respuesta"
                value={respuesta || ''}
                onChange={(e) => onRespuestaChange(e.target.value)}
                placeholder="Describa la accion tomada para atender este incidente..."
                rows={3}
              />
              <Button
                variant="success"
                size="sm"
                onClick={onAtender}
                disabled={!respuesta}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Marcar como Atendido
              </Button>
            </div>
          )}

          {incidente.atendido && (
            <div className="bg-green-50 p-3 rounded">
              <p className="text-sm font-medium text-green-800 mb-1">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Respuesta:
              </p>
              <p className="text-sm text-green-700">{incidente.respuesta}</p>
              <p className="text-xs text-green-600 mt-2">
                Atendido por: {incidente.atendidoPor} - 
                {incidente.fechaAtencion && format(new Date(incidente.fechaAtencion), " dd MMM yyyy HH:mm", { locale: es })}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useTraslados } from '@/context/TrasladosContext';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Select } from '@/components/ui-custom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Truck, User, MapPin, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import type { TrasladoSecundario } from '@/types/traslados';

export default function AsignarSecundarios() {
  const { 
    trasladosSecundarios, 
    ambulancias, 
    actualizarTrasladoSecundario, 
    actualizarAmbulancia,
    obtenerAmbulanciasDisponibles
  } = useTraslados();

  const [selectedAmbulancia, setSelectedAmbulancia] = useState<Record<string, string>>({});
  const [expandedTraslado, setExpandedTraslado] = useState<string | null>(null);

  const secundariosPendientes = trasladosSecundarios.filter(t => t.estado === 'pendiente');
  const secundariosAsignados = trasladosSecundarios.filter(t => 
    t.estado === 'asignado' || t.estado === 'en_ruta' || t.estado === 'en_traslado'
  );
  const ambulanciasDisponibles = obtenerAmbulanciasDisponibles();

  const handleAsignarAmbulancia = (trasladoId: string) => {
    const ambulanciaId = selectedAmbulancia[trasladoId];
    if (!ambulanciaId) return;

    const ambulancia = ambulancias.find(a => a.id === ambulanciaId);
    if (!ambulancia) return;

    // Actualizar traslado
    actualizarTrasladoSecundario(trasladoId, {
      estado: 'asignado',
      ambulanciaAsignada: ambulanciaId,
      vehiculoPlaca: ambulancia.placa,
    });

    // Actualizar ambulancia
    actualizarAmbulancia(ambulanciaId, {
      estado: 'en_servicio',
      trasladoActual: trasladoId,
    });

    // Limpiar seleccion
    setSelectedAmbulancia(prev => {
      const newState = { ...prev };
      delete newState[trasladoId];
      return newState;
    });
  };

  const ambulanciaOptions = ambulanciasDisponibles.map(a => ({
    value: a.id,
    label: `${a.placa} (${a.tipo}) - ${a.ubicacionActual}`,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Asignar Ambulancias a Traslados Secundarios</h1>
        <p className="text-gray-500">Solo la central puede asignar ambulancias a traslados secundarios solicitados por medicos</p>
      </div>

      {/* Resumen de disponibilidad */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{secundariosPendientes.length}</p>
              <p className="text-sm text-gray-500">Pendientes de Asignacion</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Truck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{ambulanciasDisponibles.length}</p>
              <p className="text-sm text-gray-500">Ambulancias Disponibles</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{secundariosAsignados.length}</p>
              <p className="text-sm text-gray-500">En Proceso</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traslados Pendientes de Asignacion */}
      <Card variant="bordered">
        <CardHeader className="bg-orange-50">
          <CardTitle className="text-orange-800">
            Traslados Secundarios Pendientes de Asignacion ({secundariosPendientes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {secundariosPendientes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay traslados secundarios pendientes de asignacion</p>
          ) : (
            <div className="space-y-4">
              {secundariosPendientes.map((traslado) => (
                <TrasladoCard
                  key={traslado.id}
                  traslado={traslado}
                  isExpanded={expandedTraslado === traslado.id}
                  onToggleExpand={() => setExpandedTraslado(
                    expandedTraslado === traslado.id ? null : traslado.id
                  )}
                  ambulanciaOptions={ambulanciaOptions}
                  selectedAmbulancia={selectedAmbulancia[traslado.id] || ''}
                  onSelectAmbulancia={(value) => setSelectedAmbulancia(prev => ({
                    ...prev,
                    [traslado.id]: value
                  }))}
                  onAsignar={() => handleAsignarAmbulancia(traslado.id)}
                  canAssign={ambulanciasDisponibles.length > 0}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Traslados Asignados y En Curso */}
      <Card variant="bordered">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-800">
            Traslados en Proceso ({secundariosAsignados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {secundariosAsignados.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay traslados en proceso</p>
          ) : (
            <div className="space-y-3">
              {secundariosAsignados.map((traslado) => {
                const ambulancia = ambulancias.find(a => a.id === traslado.ambulanciaAsignada);
                return (
                  <div
                    key={traslado.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {traslado.paciente.nombres} {traslado.paciente.apellidos}
                        </p>
                        <p className="text-sm text-gray-500">
                          {traslado.datosTraslado.ipsOrigen.nombre} → {traslado.datosTraslado.ipsDestino.nombre}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {ambulancia && (
                        <Badge variant="info">
                          <Truck className="w-3 h-3 mr-1" />
                          {ambulancia.placa}
                        </Badge>
                      )}
                      <Badge 
                        variant={
                          traslado.estado === 'asignado' ? 'info' :
                          traslado.estado === 'en_ruta' ? 'warning' : 'warning'
                        }
                      >
                        {traslado.estado === 'asignado' ? 'Asignado' :
                         traslado.estado === 'en_ruta' ? 'En Ruta' : 'En Traslado'}
                      </Badge>
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

interface TrasladoCardProps {
  traslado: TrasladoSecundario;
  isExpanded: boolean;
  onToggleExpand: () => void;
  ambulanciaOptions: { value: string; label: string }[];
  selectedAmbulancia: string;
  onSelectAmbulancia: (value: string) => void;
  onAsignar: () => void;
  canAssign: boolean;
}

function TrasladoCard({
  traslado,
  isExpanded,
  onToggleExpand,
  ambulanciaOptions,
  selectedAmbulancia,
  onSelectAmbulancia,
  onAsignar,
  canAssign,
}: TrasladoCardProps) {
  return (
    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="warning">Pendiente</Badge>
            <span className="text-xs text-gray-500">
              Solicitado: {format(new Date(traslado.fechaSolicitud), "dd MMM yyyy HH:mm", { locale: es })}
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
                <span className="font-medium">Origen:</span> {traslado.datosTraslado.ipsOrigen.nombre}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Destino:</span> {traslado.datosTraslado.ipsDestino.nombre}
              </p>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleExpand}
            className="mt-2"
          >
            <Eye className="w-4 h-4 mr-1" />
            {isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
          </Button>

          {isExpanded && (
            <div className="mt-4 p-3 bg-white rounded border border-orange-100 text-sm">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-700">Diagnostico:</p>
                  <p className="text-gray-600">{traslado.datosClinicosLlegada?.diagnostico || 'No especificado'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Motivo:</p>
                  <p className="text-gray-600">
                    {traslado.datosTraslado.motivo === 'remision_eps' ? 'Remision EPS' :
                     traslado.datosTraslado.motivo === 'referencia_ips' ? 'Referencia IPS' :
                     traslado.datosTraslado.motivo === 'contrarreferencia' ? 'Contrarreferencia' :
                     traslado.datosTraslado.motivoOtro || 'Otro'}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Grupo Servicio Destino:</p>
                  <p className="text-gray-600">{traslado.grupoServicioDestino}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Solicitado por:</p>
                  <p className="text-gray-600">{traslado.solicitadoPor}</p>
                </div>
                {traslado.observaciones && (
                  <div className="md:col-span-2">
                    <p className="font-medium text-gray-700">Observaciones:</p>
                    <p className="text-gray-600">{traslado.observaciones}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Asignacion de ambulancia */}
        <div className="lg:w-80 space-y-3">
          <Select
            label="Seleccionar Ambulancia"
            name="ambulancia"
            value={selectedAmbulancia}
            onChange={(e) => onSelectAmbulancia(e.target.value)}
            options={[
              { value: '', label: '-- Seleccione ambulancia --' },
              ...ambulanciaOptions
            ]}
            disabled={!canAssign}
          />
          <Button
            variant="success"
            className="w-full"
            onClick={onAsignar}
            disabled={!selectedAmbulancia || !canAssign}
          >
            <Truck className="w-4 h-4 mr-2" />
            Asignar Ambulancia
          </Button>
          {!canAssign && (
            <p className="text-xs text-red-500 text-center">
              No hay ambulancias disponibles
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

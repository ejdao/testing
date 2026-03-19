'use client';

import { useState } from 'react';
import { useTraslados } from '@/context/TrasladosContext';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Select, Textarea } from '@/components/ui-custom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { RefreshCw, Truck, AlertTriangle, User, MapPin, CheckCircle } from 'lucide-react';
import type { TrasladoSecundario } from '@/types/traslados';

export default function ReasignarTraslados() {
  const { 
    trasladosSecundarios, 
    ambulancias, 
    actualizarTrasladoSecundario, 
    actualizarAmbulancia,
    obtenerAmbulanciasDisponibles,
    agregarIncidente,
    generarId
  } = useTraslados();

  const [selectedTraslado, setSelectedTraslado] = useState<string>('');
  const [selectedAmbulancia, setSelectedAmbulancia] = useState<string>('');
  const [motivoReasignacion, setMotivoReasignacion] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Traslados que pueden ser reasignados (tienen ambulancia asignada y no estan finalizados)
  const trasladosReasignables = trasladosSecundarios.filter(t => 
    t.ambulanciaAsignada && 
    (t.estado === 'asignado' || t.estado === 'en_ruta' || t.estado === 'en_traslado')
  );

  const ambulanciasDisponibles = obtenerAmbulanciasDisponibles();

  const trasladoSeleccionado = trasladosSecundarios.find(t => t.id === selectedTraslado);
  const ambulanciaActual = trasladoSeleccionado 
    ? ambulancias.find(a => a.id === trasladoSeleccionado.ambulanciaAsignada)
    : null;

  const handleReasignar = () => {
    if (!selectedTraslado || !selectedAmbulancia || !motivoReasignacion) return;

    setIsSubmitting(true);

    const traslado = trasladosSecundarios.find(t => t.id === selectedTraslado);
    const nuevaAmbulancia = ambulancias.find(a => a.id === selectedAmbulancia);
    
    if (!traslado || !nuevaAmbulancia) {
      setIsSubmitting(false);
      return;
    }

    const ambulanciaAnteriorId = traslado.ambulanciaAsignada;

    // 1. Registrar incidente
    agregarIncidente({
      id: generarId(),
      trasladoId: selectedTraslado,
      tipo: 'otro',
      prioridad: 'alta',
      descripcion: `Reasignacion de ambulancia: ${motivoReasignacion}`,
      reportadoPor: 'Central de Despacho',
      fechaHora: new Date().toISOString(),
      atendido: true,
      respuesta: `Ambulancia reasignada de ${ambulanciaActual?.placa || 'N/A'} a ${nuevaAmbulancia.placa}`,
      atendidoPor: 'Central de Despacho',
      fechaAtencion: new Date().toISOString(),
    });

    // 2. Liberar ambulancia anterior
    if (ambulanciaAnteriorId) {
      actualizarAmbulancia(ambulanciaAnteriorId, {
        estado: 'fuera_servicio', // Marcamos como fuera de servicio por contratiempo
        trasladoActual: undefined,
      });
    }

    // 3. Asignar nueva ambulancia
    actualizarAmbulancia(selectedAmbulancia, {
      estado: 'en_servicio',
      trasladoActual: selectedTraslado,
    });

    // 4. Actualizar traslado
    actualizarTrasladoSecundario(selectedTraslado, {
      ambulanciaAsignada: selectedAmbulancia,
      vehiculoPlaca: nuevaAmbulancia.placa,
      estado: 'asignado', // Volver a estado asignado para que el nuevo auxiliar inicie
    });

    setSuccessMessage(`Traslado reasignado exitosamente a ambulancia ${nuevaAmbulancia.placa}`);
    setSelectedTraslado('');
    setSelectedAmbulancia('');
    setMotivoReasignacion('');
    setIsSubmitting(false);

    // Limpiar mensaje despues de 5 segundos
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const trasladoOptions = trasladosReasignables.map(t => ({
    value: t.id,
    label: `${t.paciente.nombres} ${t.paciente.apellidos} - ${t.datosTraslado.ipsOrigen.nombre}`,
  }));

  const ambulanciaOptions = ambulanciasDisponibles.map(a => ({
    value: a.id,
    label: `${a.placa} (${a.tipo}) - ${a.ubicacionActual}`,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reasignar Traslados por Contratiempo</h1>
        <p className="text-gray-500">Reasignar ambulancia cuando hay una averia, accidente u otro contratiempo</p>
      </div>

      {successMessage && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Estadisticas */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <RefreshCw className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{trasladosReasignables.length}</p>
              <p className="text-sm text-gray-500">Pueden Reasignarse</p>
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
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {ambulancias.filter(a => a.estado === 'fuera_servicio').length}
              </p>
              <p className="text-sm text-gray-500">Fuera de Servicio</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulario de reasignacion */}
      <Card variant="bordered">
        <CardHeader className="bg-purple-50">
          <CardTitle className="text-purple-800">Reasignar Ambulancia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {trasladosReasignables.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay traslados en curso que puedan ser reasignados</p>
          ) : ambulanciasDisponibles.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <p className="text-gray-700 font-medium">No hay ambulancias disponibles</p>
              <p className="text-gray-500 text-sm">Todas las ambulancias estan en servicio o fuera de servicio</p>
            </div>
          ) : (
            <>
              <Select
                label="Seleccionar Traslado a Reasignar"
                name="traslado"
                value={selectedTraslado}
                onChange={(e) => {
                  setSelectedTraslado(e.target.value);
                  setSelectedAmbulancia('');
                }}
                options={[
                  { value: '', label: '-- Seleccione un traslado --' },
                  ...trasladoOptions
                ]}
              />

              {trasladoSeleccionado && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="warning">En curso</Badge>
                    {ambulanciaActual && (
                      <Badge variant="info">
                        <Truck className="w-3 h-3 mr-1" />
                        Actual: {ambulanciaActual.placa}
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-900">
                    <User className="w-4 h-4 inline mr-1" />
                    {trasladoSeleccionado.paciente.nombres} {trasladoSeleccionado.paciente.apellidos}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {trasladoSeleccionado.paciente.tipoDocumento}: {trasladoSeleccionado.paciente.numeroDocumento}
                  </p>
                  <div className="mt-2 flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-600">
                        <span className="font-medium">De:</span> {trasladoSeleccionado.datosTraslado.ipsOrigen.nombre}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">A:</span> {trasladoSeleccionado.datosTraslado.ipsDestino.nombre}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Select
                label="Seleccionar Nueva Ambulancia"
                name="ambulancia"
                value={selectedAmbulancia}
                onChange={(e) => setSelectedAmbulancia(e.target.value)}
                options={[
                  { value: '', label: '-- Seleccione nueva ambulancia --' },
                  ...ambulanciaOptions
                ]}
                disabled={!selectedTraslado}
              />

              <Textarea
                label="Motivo de la Reasignacion"
                name="motivo"
                value={motivoReasignacion}
                onChange={(e) => setMotivoReasignacion(e.target.value)}
                placeholder="Describa el contratiempo (averia, accidente, etc.)"
                rows={3}
                required
              />

              <div className="flex justify-end pt-4">
                <Button
                  variant="warning"
                  onClick={handleReasignar}
                  disabled={!selectedTraslado || !selectedAmbulancia || !motivoReasignacion || isSubmitting}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Reasignando...' : 'Reasignar Ambulancia'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Lista de traslados en curso */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Traslados en Curso</CardTitle>
        </CardHeader>
        <CardContent>
          {trasladosReasignables.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay traslados en curso</p>
          ) : (
            <div className="space-y-3">
              {trasladosReasignables.map((traslado) => {
                const ambulancia = ambulancias.find(a => a.id === traslado.ambulanciaAsignada);
                return (
                  <div
                    key={traslado.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${
                        traslado.estado === 'asignado' ? 'bg-blue-500' :
                        traslado.estado === 'en_ruta' ? 'bg-yellow-500' : 'bg-orange-500'
                      }`} />
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
                        <Badge variant="default">
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

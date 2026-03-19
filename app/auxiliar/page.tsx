'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTraslados } from '@/context/TrasladosContext';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input, Select, Textarea } from '@/components/ui-custom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Play, 
  CheckCircle, 
  Truck, 
  Clock, 
  FileText, 
  AlertTriangle,
  X,
  MapPin,
  User,
  PlusCircle
} from 'lucide-react';
import type { TrasladoSecundario, TipoIncidente, PrioridadIncidente } from '@/types/traslados';

const estadoConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger'; icon: typeof Play }> = {
  asignado: { label: 'Asignado', variant: 'info', icon: Play },
  en_ruta: { label: 'En Ruta', variant: 'warning', icon: Truck },
  en_traslado: { label: 'En Traslado', variant: 'warning', icon: Truck },
  finalizado: { label: 'Finalizado', variant: 'success', icon: CheckCircle },
};

const tiposIncidente = [
  { value: 'averia', label: 'Averia del Vehiculo' },
  { value: 'accidente', label: 'Accidente' },
  { value: 'retraso', label: 'Retraso Significativo' },
  { value: 'complicacion_paciente', label: 'Complicacion del Paciente' },
  { value: 'otro', label: 'Otro' },
];

const prioridades = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Critica' },
];

export default function AuxiliarDashboard() {
  const { 
    trasladosSecundarios, 
    actualizarTrasladoSecundario, 
    actualizarAmbulancia, 
    ambulancias,
    agregarIncidente,
    generarId 
  } = useTraslados();

  // Solo mostrar secundarios que YA tienen ambulancia asignada por la central
  const secundariosActivos = trasladosSecundarios.filter(t => 
    t.ambulanciaAsignada && (t.estado === 'asignado' || t.estado === 'en_ruta' || t.estado === 'en_traslado')
  );

  const [trasladoSeleccionado, setTrasladoSeleccionado] = useState<TrasladoSecundario | null>(null);
  const [mostrarIncidente, setMostrarIncidente] = useState<string | null>(null);
  const [incidenteForm, setIncidenteForm] = useState({
    tipo: 'retraso' as TipoIncidente,
    prioridad: 'media' as PrioridadIncidente,
    descripcion: '',
  });

  // Iniciar traslado - cambia estado a en_ruta
  const handleIniciarTraslado = (traslado: TrasladoSecundario) => {
    actualizarTrasladoSecundario(traslado.id, {
      estado: 'en_ruta',
      tiemposRecorrido: {
        ...traslado.tiemposRecorrido,
        fechaHoraInicio: new Date().toISOString(),
      }
    });
    
    if (traslado.ambulanciaAsignada) {
      actualizarAmbulancia(traslado.ambulanciaAsignada, {
        estado: 'en_servicio',
        trasladoActual: traslado.id,
      });
    }
  };

  // Marcar llegada al origen - cambia a en_traslado
  const handleLlegadaOrigen = (traslado: TrasladoSecundario) => {
    actualizarTrasladoSecundario(traslado.id, {
      estado: 'en_traslado',
    });
  };

  // Finalizar traslado
  const handleFinalizarTraslado = (traslado: TrasladoSecundario) => {
    actualizarTrasladoSecundario(traslado.id, {
      estado: 'finalizado',
      estadoFinalizacion: 'vivo',
      tiemposRecorrido: {
        ...traslado.tiemposRecorrido,
        fechaHoraFinalizacion: new Date().toISOString(),
      }
    });
    
    if (traslado.ambulanciaAsignada) {
      actualizarAmbulancia(traslado.ambulanciaAsignada, {
        estado: 'disponible',
        trasladoActual: undefined,
      });
    }
  };

  // Reportar incidente
  const handleReportarIncidente = (trasladoId: string) => {
    if (!incidenteForm.descripcion.trim()) return;

    agregarIncidente({
      id: generarId(),
      trasladoId,
      tipo: incidenteForm.tipo,
      prioridad: incidenteForm.prioridad,
      descripcion: incidenteForm.descripcion,
      reportadoPor: 'Auxiliar',
      fechaHora: new Date().toISOString(),
      atendido: false,
    });

    setIncidenteForm({ tipo: 'retraso', prioridad: 'media', descripcion: '' });
    setMostrarIncidente(null);
  };

  return (
    <div className="space-y-6">
      {/* Boton Nuevo Traslado Primario */}
      <Link href="/auxiliar/primario/nuevo">
        <Card variant="bordered" className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="p-4 bg-blue-600 rounded-lg">
              <PlusCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Nuevo Traslado Primario</h3>
              <p className="text-sm text-gray-500">Registrar un traslado desde escena (REF-FT-04A)</p>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{secundariosActivos.length}</p>
              <p className="text-sm text-gray-500">Asignados</p>
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
                {secundariosActivos.filter(t => t.estado === 'asignado').length}
              </p>
              <p className="text-sm text-gray-500">Por Iniciar</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Truck className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {secundariosActivos.filter(t => t.estado === 'en_ruta' || t.estado === 'en_traslado').length}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {trasladosSecundarios.filter(t => t.estado === 'finalizado').length}
              </p>
              <p className="text-sm text-gray-500">Finalizados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Traslados Asignados */}
      <Card variant="bordered">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-800">Traslados Asignados</CardTitle>
        </CardHeader>
        <CardContent>
          {secundariosActivos.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tienes traslados asignados</p>
              <p className="text-sm text-gray-400 mt-1">La Central te asignara traslados secundarios</p>
            </div>
          ) : (
            <div className="space-y-4">
              {secundariosActivos.map((traslado) => {
                const estado = estadoConfig[traslado.estado] || estadoConfig.asignado;
                const ambulancia = ambulancias.find(a => a.id === traslado.ambulanciaAsignada);
                const Icon = estado.icon;

                return (
                  <div key={traslado.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Header del traslado */}
                    <div className="flex items-center justify-between p-4 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          traslado.estado === 'asignado' ? 'bg-blue-100' :
                          traslado.estado === 'en_ruta' ? 'bg-yellow-100' : 'bg-orange-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            traslado.estado === 'asignado' ? 'text-blue-600' :
                            traslado.estado === 'en_ruta' ? 'text-yellow-600' : 'text-orange-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {traslado.paciente.nombres} {traslado.paciente.apellidos}
                          </p>
                          <p className="text-sm text-gray-500">
                            {traslado.paciente.tipoDocumento}: {traslado.paciente.numeroDocumento}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={estado.variant}>{estado.label}</Badge>
                        {ambulancia && (
                          <Badge variant="default">{ambulancia.placa}</Badge>
                        )}
                      </div>
                    </div>

                    {/* Detalles del traslado */}
                    <div className="p-4 space-y-3">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-green-600 mt-1" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Origen</p>
                            <p className="text-sm font-medium text-gray-900">{traslado.datosTraslado.ipsOrigen.nombre}</p>
                            <p className="text-xs text-gray-500">{traslado.datosTraslado.ipsOrigen.municipio}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-red-600 mt-1" />
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Destino</p>
                            <p className="text-sm font-medium text-gray-900">{traslado.datosTraslado.ipsDestino.nombre}</p>
                            <p className="text-xs text-gray-500">{traslado.datosTraslado.ipsDestino.municipio}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase mb-1">Diagnostico</p>
                        <p className="text-sm text-gray-900">{traslado.datosClinicosLlegada.diagnostico}</p>
                      </div>

                      {/* Información de la tripulación asignada */}
                      {traslado.tripulacion && (traslado.tripulacion.conductor.nombre || traslado.tripulacion.auxiliarEnfermeria.nombre) && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-xs text-blue-600 uppercase mb-2">Tripulacion Asignada</p>
                          <div className="grid md:grid-cols-2 gap-2 text-sm">
                            {traslado.tripulacion.conductor.nombre && (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-500" />
                                <span className="text-gray-700">Conductor: {traslado.tripulacion.conductor.nombre}</span>
                              </div>
                            )}
                            {traslado.tripulacion.auxiliarEnfermeria.nombre && (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-500" />
                                <span className="text-gray-700">Auxiliar: {traslado.tripulacion.auxiliarEnfermeria.nombre}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Acciones */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                        {traslado.estado === 'asignado' && (
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => handleIniciarTraslado(traslado)}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Iniciar Traslado
                          </Button>
                        )}

                        {traslado.estado === 'en_ruta' && (
                          <Button 
                            variant="warning" 
                            size="sm"
                            onClick={() => handleLlegadaOrigen(traslado)}
                          >
                            <MapPin className="w-4 h-4 mr-1" />
                            Llegue al Origen
                          </Button>
                        )}

                        {traslado.estado === 'en_traslado' && (
                          <Button 
                            variant="success" 
                            size="sm"
                            onClick={() => handleFinalizarTraslado(traslado)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Finalizar Traslado
                          </Button>
                        )}

                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setMostrarIncidente(mostrarIncidente === traslado.id ? null : traslado.id)}
                        >
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Reportar Incidente
                        </Button>
                      </div>

                      {/* Formulario de incidente */}
                      {mostrarIncidente === traslado.id && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-red-800">Reportar Incidente</h4>
                            <button 
                              onClick={() => setMostrarIncidente(null)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="space-y-3">
                            <div className="grid md:grid-cols-2 gap-3">
                              <Select
                                label="Tipo de Incidente"
                                value={incidenteForm.tipo}
                                onChange={(e) => setIncidenteForm(prev => ({ ...prev, tipo: e.target.value as TipoIncidente }))}
                                options={tiposIncidente}
                              />
                              <Select
                                label="Prioridad"
                                value={incidenteForm.prioridad}
                                onChange={(e) => setIncidenteForm(prev => ({ ...prev, prioridad: e.target.value as PrioridadIncidente }))}
                                options={prioridades}
                              />
                            </div>
                            <Textarea
                              label="Descripcion del Incidente"
                              value={incidenteForm.descripcion}
                              onChange={(e) => setIncidenteForm(prev => ({ ...prev, descripcion: e.target.value }))}
                              rows={3}
                              placeholder="Describa detalladamente el incidente..."
                            />
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleReportarIncidente(traslado.id)}
                            >
                              Enviar Reporte a Central
                            </Button>
                          </div>
                        </div>
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

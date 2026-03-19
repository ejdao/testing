'use client';

import { useState } from 'react';
import { useTraslados } from '@/context/TrasladosContext';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Select, Input } from '@/components/ui-custom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Truck, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  MapPin,
  User,
  RefreshCw,
  Eye,
  X,
  Filter
} from 'lucide-react';
import type { TrasladoSecundario, TrasladoPrimario, EstadoTraslado } from '@/types/traslados';

const estadoLabels: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger' }> = {
  pendiente: { label: 'Pendiente', variant: 'warning' },
  asignado: { label: 'Asignado', variant: 'info' },
  en_ruta: { label: 'En Ruta', variant: 'info' },
  en_escena: { label: 'En Escena', variant: 'warning' },
  en_traslado: { label: 'En Traslado', variant: 'warning' },
  finalizado: { label: 'Finalizado', variant: 'success' },
  cancelado: { label: 'Cancelado', variant: 'danger' },
};

const filtrosEstado = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'asignado', label: 'Asignados' },
  { value: 'en_ruta', label: 'En Ruta' },
  { value: 'en_traslado', label: 'En Traslado' },
  { value: 'finalizado', label: 'Finalizados' },
];

export default function CentralDashboard() {
  const { 
    trasladosPrimarios, 
    trasladosSecundarios, 
    ambulancias, 
    obtenerIncidentesPendientes,
    actualizarTrasladoSecundario,
    actualizarAmbulancia,
    incidentes,
    actualizarIncidente
  } = useTraslados();

  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'primario' | 'secundario'>('todos');
  const [trasladoAsignando, setTrasladoAsignando] = useState<string | null>(null);
  const [asignacion, setAsignacion] = useState({
    ambulanciaId: '',
    conductor: '',
    cedulaConductor: '',
    auxiliar: '',
    cedulaAuxiliar: '',
  });

  const secundariosPendientes = trasladosSecundarios.filter(t => t.estado === 'pendiente');
  const secundariosEnCurso = trasladosSecundarios.filter(t => 
    t.estado === 'asignado' || t.estado === 'en_ruta' || t.estado === 'en_traslado'
  );
  const ambulanciasDisponibles = ambulancias.filter(a => a.estado === 'disponible');
  const incidentesPendientes = obtenerIncidentesPendientes();

  // Combinar todos los traslados
  const todosTraslados: (TrasladoSecundario | TrasladoPrimario)[] = [
    ...trasladosPrimarios.map(t => ({ ...t, tipo: 'primario' as const })),
    ...trasladosSecundarios.map(t => ({ ...t, tipo: 'secundario' as const })),
  ].sort((a, b) => {
    const fechaA = a.tipo === 'primario' ? a.fechaCreacion : a.fechaSolicitud;
    const fechaB = b.tipo === 'primario' ? b.fechaCreacion : b.fechaSolicitud;
    return new Date(fechaB).getTime() - new Date(fechaA).getTime();
  });

  // Filtrar traslados
  const trasladosFiltrados = todosTraslados.filter(t => {
    const cumpleFiltroEstado = filtroEstado === 'todos' || t.estado === filtroEstado;
    const cumpleFiltroTipo = filtroTipo === 'todos' || t.tipo === filtroTipo;
    return cumpleFiltroEstado && cumpleFiltroTipo;
  });

  // Asignar ambulancia a traslado secundario
  const handleAsignar = (trasladoId: string) => {
    if (!asignacion.ambulanciaId || !asignacion.conductor || !asignacion.auxiliar) return;

    actualizarTrasladoSecundario(trasladoId, {
      estado: 'asignado',
      ambulanciaAsignada: asignacion.ambulanciaId,
      tripulacion: {
        conductor: { nombre: asignacion.conductor, cedula: asignacion.cedulaConductor },
        auxiliarEnfermeria: { nombre: asignacion.auxiliar, cedula: asignacion.cedulaAuxiliar },
      },
      vehiculoPlaca: ambulancias.find(a => a.id === asignacion.ambulanciaId)?.placa || '',
    });

    actualizarAmbulancia(asignacion.ambulanciaId, {
      estado: 'en_servicio',
      trasladoActual: trasladoId,
    });

    setTrasladoAsignando(null);
    setAsignacion({ ambulanciaId: '', conductor: '', cedulaConductor: '', auxiliar: '', cedulaAuxiliar: '' });
  };

  // Atender incidente
  const handleAtenderIncidente = (incidenteId: string, respuesta: string) => {
    actualizarIncidente(incidenteId, {
      atendido: true,
      respuesta,
      atendidoPor: 'Central',
      fechaAtencion: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
              <p className="text-sm text-gray-500">Ambulancias</p>
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

      {/* Incidentes Pendientes */}
      {incidentesPendientes.length > 0 && (
        <Card variant="bordered" className="border-red-300">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Incidentes Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {incidentesPendientes.map(incidente => {
                const traslado = trasladosSecundarios.find(t => t.id === incidente.trasladoId);
                return (
                  <div key={incidente.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="danger">{incidente.tipo}</Badge>
                          <Badge variant={incidente.prioridad === 'critica' ? 'danger' : incidente.prioridad === 'alta' ? 'warning' : 'default'}>
                            {incidente.prioridad}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700">{incidente.descripcion}</p>
                        {traslado && (
                          <p className="text-xs text-gray-500 mt-1">
                            Paciente: {traslado.paciente.nombres} {traslado.paciente.apellidos}
                          </p>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAtenderIncidente(incidente.id, 'Atendido por Central')}
                      >
                        Marcar Atendido
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
                className={`p-4 rounded-lg border ${
                  ambulancia.estado === 'disponible' ? 'bg-green-50 border-green-200' :
                  ambulancia.estado === 'en_servicio' ? 'bg-blue-50 border-blue-200' :
                  ambulancia.estado === 'fuera_servicio' ? 'bg-red-50 border-red-200' :
                  'bg-yellow-50 border-yellow-200'
                }`}
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtros y Lista de Traslados */}
      <Card variant="bordered">
        <CardHeader className="bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Traslados
            </CardTitle>
            <div className="flex gap-2">
              <Select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                options={filtrosEstado}
                className="w-40"
              />
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as 'todos' | 'primario' | 'secundario')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="todos">Todos</option>
                <option value="primario">Primarios</option>
                <option value="secundario">Secundarios</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {trasladosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay traslados con los filtros seleccionados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trasladosFiltrados.map((traslado) => {
                const estado = estadoLabels[traslado.estado] || estadoLabels.pendiente;
                const fecha = traslado.tipo === 'primario' 
                  ? (traslado as TrasladoPrimario).fechaCreacion 
                  : (traslado as TrasladoSecundario).fechaSolicitud;
                const esSecundario = traslado.tipo === 'secundario';
                const secundario = traslado as TrasladoSecundario;

                return (
                  <div key={traslado.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          traslado.tipo === 'primario' ? 'bg-blue-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <p className="font-semibold text-gray-900">
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
                        <Badge variant={traslado.tipo === 'primario' ? 'info' : 'success'}>
                          {traslado.tipo === 'primario' ? 'PRIM' : 'SEC'}
                        </Badge>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-4">
                      {esSecundario && (
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-green-600 mt-1" />
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Origen</p>
                              <p className="text-sm font-medium">{secundario.datosTraslado.ipsOrigen.nombre}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-red-600 mt-1" />
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Destino</p>
                              <p className="text-sm font-medium">{secundario.datosTraslado.ipsDestino.nombre}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Acciones para secundarios pendientes */}
                      {esSecundario && traslado.estado === 'pendiente' && (
                        <>
                          {trasladoAsignando === traslado.id ? (
                            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-orange-800">Asignar Ambulancia y Tripulacion</h4>
                                <button onClick={() => setTrasladoAsignando(null)} className="text-orange-600">
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                              <Select
                                label="Ambulancia"
                                value={asignacion.ambulanciaId}
                                onChange={(e) => setAsignacion(prev => ({ ...prev, ambulanciaId: e.target.value }))}
                                options={[
                                  { value: '', label: 'Seleccionar ambulancia...' },
                                  ...ambulanciasDisponibles.map(a => ({ value: a.id, label: `${a.placa} - ${a.tipo}` }))
                                ]}
                              />
                              <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                  label="Conductor"
                                  value={asignacion.conductor}
                                  onChange={(e) => setAsignacion(prev => ({ ...prev, conductor: e.target.value }))}
                                  placeholder="Nombre del conductor"
                                />
                                <Input
                                  label="Cedula Conductor"
                                  value={asignacion.cedulaConductor}
                                  onChange={(e) => setAsignacion(prev => ({ ...prev, cedulaConductor: e.target.value }))}
                                  placeholder="Cedula"
                                />
                                <Input
                                  label="Auxiliar"
                                  value={asignacion.auxiliar}
                                  onChange={(e) => setAsignacion(prev => ({ ...prev, auxiliar: e.target.value }))}
                                  placeholder="Nombre del auxiliar"
                                />
                                <Input
                                  label="Cedula Auxiliar"
                                  value={asignacion.cedulaAuxiliar}
                                  onChange={(e) => setAsignacion(prev => ({ ...prev, cedulaAuxiliar: e.target.value }))}
                                  placeholder="Cedula"
                                />
                              </div>
                              <Button variant="success" onClick={() => handleAsignar(traslado.id)}>
                                <Truck className="w-4 h-4 mr-2" />
                                Confirmar Asignacion
                              </Button>
                            </div>
                          ) : (
                            <Button variant="primary" size="sm" onClick={() => setTrasladoAsignando(traslado.id)}>
                              <Truck className="w-4 h-4 mr-1" />
                              Asignar Ambulancia
                            </Button>
                          )}
                        </>
                      )}

                      {/* Info de asignacion si ya esta asignado */}
                      {esSecundario && secundario.ambulanciaAsignada && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-xs text-blue-600 uppercase mb-2">Asignacion</p>
                          <div className="grid md:grid-cols-3 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Truck className="w-4 h-4 text-blue-500" />
                              <span>{ambulancias.find(a => a.id === secundario.ambulanciaAsignada)?.placa}</span>
                            </div>
                            {secundario.tripulacion?.conductor.nombre && (
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4 text-blue-500" />
                                <span>{secundario.tripulacion.conductor.nombre}</span>
                              </div>
                            )}
                            {secundario.tripulacion?.auxiliarEnfermeria.nombre && (
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4 text-blue-500" />
                                <span>{secundario.tripulacion.auxiliarEnfermeria.nombre}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Primarios solo lectura */}
                      {traslado.tipo === 'primario' && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Eye className="w-4 h-4" />
                          <span>Solo visualizacion - Registrado por auxiliar</span>
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

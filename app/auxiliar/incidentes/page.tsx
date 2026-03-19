'use client';

import { useState } from 'react';
import { useTraslados } from '@/context/TrasladosContext';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, Textarea, Badge } from '@/components/ui-custom';
import { AlertTriangle, Send, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { TipoIncidente, PrioridadIncidente, Incidente } from '@/types/traslados';

const tiposIncidente = [
  { value: 'averia', label: 'Averia del Vehiculo' },
  { value: 'accidente', label: 'Accidente de Transito' },
  { value: 'retraso', label: 'Retraso en el Traslado' },
  { value: 'complicacion_paciente', label: 'Complicacion del Paciente' },
  { value: 'otro', label: 'Otro' },
];

const prioridades = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Critica' },
];

const prioridadConfig: Record<string, { variant: 'default' | 'info' | 'warning' | 'danger' }> = {
  baja: { variant: 'default' },
  media: { variant: 'info' },
  alta: { variant: 'warning' },
  critica: { variant: 'danger' },
};

export default function ReportarIncidente() {
  const { 
    agregarIncidente, 
    incidentes, 
    generarId, 
    trasladosPrimarios, 
    trasladosSecundarios 
  } = useTraslados();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    trasladoId: '',
    tipo: 'retraso' as TipoIncidente,
    prioridad: 'media' as PrioridadIncidente,
    descripcion: '',
  });

  // Obtener traslados activos para el selector
  const trasladosActivos = [
    ...trasladosPrimarios.filter(t => t.estado !== 'finalizado' && t.estado !== 'cancelado'),
    ...trasladosSecundarios.filter(t => t.estado !== 'finalizado' && t.estado !== 'cancelado'),
  ].map(t => ({
    value: t.id,
    label: `${t.tipo === 'primario' ? 'P' : 'S'} - ${t.paciente.nombres} ${t.paciente.apellidos}`
  }));

  const misIncidentes = incidentes.filter(i => i.reportadoPor === 'Auxiliar');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const incidente: Incidente = {
      id: generarId(),
      trasladoId: formData.trasladoId,
      tipo: formData.tipo,
      prioridad: formData.prioridad,
      descripcion: formData.descripcion,
      reportadoPor: 'Auxiliar',
      fechaHora: new Date().toISOString(),
      atendido: false,
    };

    agregarIncidente(incidente);
    
    setFormData({
      trasladoId: '',
      tipo: 'retraso',
      prioridad: 'media',
      descripcion: '',
    });
    
    setIsSubmitting(false);
    setSuccess(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportar Incidente</h1>
        <p className="text-gray-500">Notifica a la Central sobre cualquier inconveniente durante el traslado</p>
      </div>

      {/* Formulario */}
      <Card variant="bordered">
        <CardHeader className="bg-yellow-50">
          <CardTitle className="text-yellow-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Nuevo Reporte de Incidente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                Incidente reportado exitosamente. La Central ha sido notificada.
              </div>
            )}

            <Select
              label="Traslado Relacionado"
              name="trasladoId"
              value={formData.trasladoId}
              onChange={handleChange}
              options={trasladosActivos}
              placeholder="Seleccione el traslado..."
              required
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Select
                label="Tipo de Incidente"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                options={tiposIncidente}
                required
              />
              <Select
                label="Prioridad"
                name="prioridad"
                value={formData.prioridad}
                onChange={handleChange}
                options={prioridades}
                required
              />
            </div>

            <Textarea
              label="Descripcion del Incidente"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={4}
              placeholder="Describa detalladamente el incidente, ubicacion actual, y cualquier informacion relevante..."
              required
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} variant="danger">
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Historial de Incidentes */}
      {misIncidentes.length > 0 && (
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Mis Reportes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {misIncidentes.map((incidente) => {
                const prioridadStyle = prioridadConfig[incidente.prioridad] || prioridadConfig.media;
                
                return (
                  <div
                    key={incidente.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={prioridadStyle.variant}>
                            {incidente.prioridad.toUpperCase()}
                          </Badge>
                          <Badge variant="default">
                            {tiposIncidente.find(t => t.value === incidente.tipo)?.label || incidente.tipo}
                          </Badge>
                          {incidente.atendido ? (
                            <Badge variant="success">Atendido</Badge>
                          ) : (
                            <Badge variant="warning">Pendiente</Badge>
                          )}
                        </div>
                        <p className="text-gray-900">{incidente.descripcion}</p>
                        <p className="text-sm text-gray-400 mt-2">
                          {format(new Date(incidente.fechaHora), "dd MMM yyyy HH:mm", { locale: es })}
                        </p>
                        {incidente.atendido && incidente.respuesta && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm font-medium text-green-800">Respuesta de Central:</p>
                            <p className="text-sm text-green-700">{incidente.respuesta}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

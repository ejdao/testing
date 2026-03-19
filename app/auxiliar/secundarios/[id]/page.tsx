'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTraslados } from '@/context/TrasladosContext';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, Textarea, Badge } from '@/components/ui-custom';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle, FileText } from 'lucide-react';
import type { TrasladoSecundario, EstadoPaciente, TipoRecorrido } from '@/types/traslados';

const tiposRecorrido = [
  { value: 'simple', label: 'Simple' },
  { value: 'redondo', label: 'Redondo' },
];

const estadosPaciente = [
  { value: 'vivo', label: 'Vivo' },
  { value: 'muerto', label: 'Muerto' },
];

export default function DetalleSecundario({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { obtenerTrasladoSecundario, actualizarTrasladoSecundario, actualizarAmbulancia } = useTraslados();
  
  const [traslado, setTraslado] = useState<TrasladoSecundario | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Tiempos y recorrido
    fechaHoraInicio: '',
    fechaHoraFinalizacion: '',
    kilometrosIniciales: '',
    kilometrosFinales: '',
    tipoRecorrido: 'simple' as TipoRecorrido,
    horasEspera: '',
    descripcionEspera: '',

    // Signos vitales
    tensionArterial: '',
    frecuenciaCardiaca: '',
    frecuenciaRespiratoria: '',
    saturacionOxigeno: '',
    glasgow: '15',
    diagnostico: '',

    // Procedimientos
    codigoCupsTraslado: '',
    procedimientosRealizados: '',
    medicamentos: '',

    // Estado final
    estadoFinalizacion: 'vivo' as EstadoPaciente,

    // Complicaciones
    huboComplicaciones: false,
    causaComplicacion: '',
    nombreIpsComplicacion: '',
    kmDesviacion: '',
    tiempoUtilizado: '',

    // Tripulacion
    conductorNombre: '',
    conductorCedula: '',
    auxiliarNombre: '',
    auxiliarCedula: '',
    medicoNombre: '',
    medicoCedula: '',
    medicoRegistro: '',

    // Receptor
    profesionalReceptorNombre: '',
    profesionalReceptorCedula: '',
    observaciones: '',
  });

  useEffect(() => {
    const trasladoEncontrado = obtenerTrasladoSecundario(id);
    if (trasladoEncontrado) {
      setTraslado(trasladoEncontrado);
      // Pre-fill form with existing data
      setFormData(prev => ({
        ...prev,
        fechaHoraInicio: trasladoEncontrado.tiemposRecorrido?.fechaHoraInicio?.slice(0, 16) || new Date().toISOString().slice(0, 16),
        tipoRecorrido: trasladoEncontrado.tiemposRecorrido?.tipoRecorrido || 'simple',
        diagnostico: trasladoEncontrado.datosClinicosLlegada?.diagnostico || '',
      }));
    }
  }, [id, obtenerTrasladoSecundario]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFinalizar = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const kmIniciales = parseFloat(formData.kilometrosIniciales) || 0;
    const kmFinales = parseFloat(formData.kilometrosFinales) || 0;

    const actualizacion: Partial<TrasladoSecundario> = {
      estado: 'finalizado',
      tiemposRecorrido: {
        fechaHoraInicio: formData.fechaHoraInicio,
        fechaHoraFinalizacion: formData.fechaHoraFinalizacion || new Date().toISOString(),
        kilometrosIniciales: kmIniciales,
        kilometrosFinales: kmFinales,
        totalKmRecorridos: kmFinales - kmIniciales,
        tipoRecorrido: formData.tipoRecorrido,
        horasEspera: formData.horasEspera ? parseFloat(formData.horasEspera) : undefined,
        descripcionEspera: formData.descripcionEspera || undefined,
      },
      datosClinicosLlegada: {
        signosVitales: {
          tensionArterial: formData.tensionArterial,
          frecuenciaCardiaca: parseInt(formData.frecuenciaCardiaca) || 0,
          frecuenciaRespiratoria: parseInt(formData.frecuenciaRespiratoria) || 0,
          saturacionOxigeno: parseInt(formData.saturacionOxigeno) || 0,
          glasgow: parseInt(formData.glasgow) || 15,
        },
        diagnostico: formData.diagnostico,
      },
      procedimientos: {
        codigoCupsTraslado: formData.codigoCupsTraslado,
        procedimientosRealizados: formData.procedimientosRealizados,
        medicamentos: formData.medicamentos,
      },
      estadoFinalizacion: formData.estadoFinalizacion,
      tripulacion: {
        conductor: {
          nombre: formData.conductorNombre,
          cedula: formData.conductorCedula,
        },
        auxiliarEnfermeria: {
          nombre: formData.auxiliarNombre,
          cedula: formData.auxiliarCedula,
        },
        medico: formData.medicoNombre ? {
          nombre: formData.medicoNombre,
          cedula: formData.medicoCedula,
          registroMedico: formData.medicoRegistro,
        } : undefined,
      },
      profesionalReceptor: formData.profesionalReceptorNombre ? {
        nombre: formData.profesionalReceptorNombre,
        cedula: formData.profesionalReceptorCedula,
        fechaHoraRecepcion: new Date().toISOString(),
      } : undefined,
      observaciones: formData.observaciones,
      creadoPor: 'Auxiliar',
      fechaCreacion: new Date().toISOString(),
    };

    if (formData.huboComplicaciones) {
      actualizacion.datosTraslado = {
        ...traslado?.datosTraslado!,
        ingresoComplicaciones: {
          huboIngreso: true,
          causa: formData.causaComplicacion,
          nombreIps: formData.nombreIpsComplicacion,
          kmDesviacion: parseFloat(formData.kmDesviacion) || 0,
          tiempoUtilizado: formData.tiempoUtilizado,
        }
      };
    }

    actualizarTrasladoSecundario(id, actualizacion);

    // Liberar ambulancia
    if (traslado?.ambulanciaAsignada) {
      actualizarAmbulancia(traslado.ambulanciaAsignada, {
        estado: 'disponible',
        trasladoActual: undefined
      });
    }

    router.push('/auxiliar/secundarios');
  };

  if (!traslado) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Traslado no encontrado</p>
      </div>
    );
  }

  const isReadOnly = traslado.estado === 'finalizado';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/auxiliar/secundarios" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isReadOnly ? 'Detalle' : 'Completar'} Traslado Secundario
            </h1>
            <p className="text-gray-500">REF-FT-04B - {traslado.paciente.nombres} {traslado.paciente.apellidos}</p>
          </div>
        </div>
        {isReadOnly && (
          <Link href={`/auxiliar/secundarios/${id}/pdf`}>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Generar PDF
            </Button>
          </Link>
        )}
      </div>

      {/* Info del Paciente (Solo lectura) */}
      <Card variant="bordered">
        <CardHeader className="bg-green-50">
          <CardTitle className="text-green-800">Datos del Paciente</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Nombre Completo</p>
            <p className="font-medium">{traslado.paciente.nombres} {traslado.paciente.apellidos}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Documento</p>
            <p className="font-medium">{traslado.paciente.tipoDocumento}: {traslado.paciente.numeroDocumento}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Edad / Sexo</p>
            <p className="font-medium">{traslado.paciente.edad} años / {traslado.paciente.sexoBiologico}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">EPS</p>
            <p className="font-medium">{traslado.paciente.eps}</p>
          </div>
        </CardContent>
      </Card>

      {/* Info del Traslado (Solo lectura) */}
      <Card variant="bordered">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-800">Datos del Traslado</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">IPS Origen</p>
            <p className="font-medium">{traslado.datosTraslado.ipsOrigen.nombre}</p>
            <p className="text-sm text-gray-400">{traslado.datosTraslado.ipsOrigen.municipio}, {traslado.datosTraslado.ipsOrigen.departamento}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">IPS Destino</p>
            <p className="font-medium">{traslado.datosTraslado.ipsDestino.nombre}</p>
            <p className="text-sm text-gray-400">{traslado.datosTraslado.ipsDestino.municipio}, {traslado.datosTraslado.ipsDestino.departamento}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Grupo de Servicio</p>
            <p className="font-medium">{traslado.grupoServicioDestino}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Motivo</p>
            <Badge variant="info">
              {traslado.datosTraslado.motivo === 'remision_eps' ? 'Remision EPS' :
               traslado.datosTraslado.motivo === 'referencia_ips' ? 'Referencia IPS' :
               traslado.datosTraslado.motivo === 'contrarreferencia' ? 'Contrarreferencia' :
               traslado.datosTraslado.motivoOtro || 'Otro'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {!isReadOnly && (
        <form onSubmit={handleFinalizar} className="space-y-6">
          {/* Tiempos y Distancia */}
          <Card variant="bordered">
            <CardHeader className="bg-orange-50">
              <CardTitle className="text-orange-800">Tiempos y Distancia del Recorrido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  label="Fecha/Hora Inicio"
                  type="datetime-local"
                  name="fechaHoraInicio"
                  value={formData.fechaHoraInicio}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Fecha/Hora Finalizacion"
                  type="datetime-local"
                  name="fechaHoraFinalizacion"
                  value={formData.fechaHoraFinalizacion}
                  onChange={handleChange}
                  required
                />
                <Select
                  label="Tipo de Recorrido"
                  name="tipoRecorrido"
                  value={formData.tipoRecorrido}
                  onChange={handleChange}
                  options={tiposRecorrido}
                  required
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  label="Km Iniciales (Odometro)"
                  type="number"
                  name="kilometrosIniciales"
                  value={formData.kilometrosIniciales}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Km Finales (Odometro)"
                  type="number"
                  name="kilometrosFinales"
                  value={formData.kilometrosFinales}
                  onChange={handleChange}
                  required
                />
                <div className="flex items-end">
                  <div className="w-full p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-500">Total Km</p>
                    <p className="font-bold text-lg">
                      {(parseFloat(formData.kilometrosFinales) || 0) - (parseFloat(formData.kilometrosIniciales) || 0)} km
                    </p>
                  </div>
                </div>
              </div>
              {formData.tipoRecorrido === 'redondo' && (
                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                  <Input
                    label="Horas de Espera"
                    type="number"
                    step="0.5"
                    name="horasEspera"
                    value={formData.horasEspera}
                    onChange={handleChange}
                  />
                  <Input
                    label="Descripcion de Espera"
                    name="descripcionEspera"
                    value={formData.descripcionEspera}
                    onChange={handleChange}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Signos Vitales y Diagnostico */}
          <Card variant="bordered">
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-purple-800">Datos Clinicos y Diagnosticos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-5 gap-4">
                <Input
                  label="TA (mmHg)"
                  name="tensionArterial"
                  value={formData.tensionArterial}
                  onChange={handleChange}
                  placeholder="120/80"
                />
                <Input
                  label="FC (p/min)"
                  type="number"
                  name="frecuenciaCardiaca"
                  value={formData.frecuenciaCardiaca}
                  onChange={handleChange}
                />
                <Input
                  label="FR (r/min)"
                  type="number"
                  name="frecuenciaRespiratoria"
                  value={formData.frecuenciaRespiratoria}
                  onChange={handleChange}
                />
                <Input
                  label="SatO2 (%)"
                  type="number"
                  name="saturacionOxigeno"
                  value={formData.saturacionOxigeno}
                  onChange={handleChange}
                />
                <Input
                  label="Glasgow"
                  type="number"
                  name="glasgow"
                  value={formData.glasgow}
                  onChange={handleChange}
                  min="3"
                  max="15"
                />
              </div>
              <Input
                label="Diagnostico (CIE-10)"
                name="diagnostico"
                value={formData.diagnostico}
                onChange={handleChange}
                required
              />
              <Select
                label="Estado al Finalizar Traslado"
                name="estadoFinalizacion"
                value={formData.estadoFinalizacion}
                onChange={handleChange}
                options={estadosPaciente}
                required
              />
            </CardContent>
          </Card>

          {/* Procedimientos */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Procedimientos y Medicamentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Codigo CUPS del Traslado"
                name="codigoCupsTraslado"
                value={formData.codigoCupsTraslado}
                onChange={handleChange}
                required
              />
              <Textarea
                label="Procedimientos Realizados (CUPS)"
                name="procedimientosRealizados"
                value={formData.procedimientosRealizados}
                onChange={handleChange}
                rows={2}
              />
              <Textarea
                label="Medicamentos y Dispositivos"
                name="medicamentos"
                value={formData.medicamentos}
                onChange={handleChange}
                rows={2}
              />
            </CardContent>
          </Card>

          {/* Complicaciones */}
          <Card variant="bordered">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-800">Ingreso por Complicaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="huboComplicaciones"
                  checked={formData.huboComplicaciones}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium">Hubo ingreso a IPS durante el recorrido por complicaciones</span>
              </label>
              {formData.huboComplicaciones && (
                <div className="grid md:grid-cols-2 gap-4 pt-4">
                  <Input
                    label="Causa"
                    name="causaComplicacion"
                    value={formData.causaComplicacion}
                    onChange={handleChange}
                  />
                  <Input
                    label="Nombre IPS"
                    name="nombreIpsComplicacion"
                    value={formData.nombreIpsComplicacion}
                    onChange={handleChange}
                  />
                  <Input
                    label="Km Desviacion"
                    type="number"
                    name="kmDesviacion"
                    value={formData.kmDesviacion}
                    onChange={handleChange}
                  />
                  <Input
                    label="Tiempo Utilizado"
                    name="tiempoUtilizado"
                    value={formData.tiempoUtilizado}
                    onChange={handleChange}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tripulacion */}
          <Card variant="bordered">
            <CardHeader className="bg-gray-100">
              <CardTitle className="text-gray-800">Tripulacion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Conductor - Nombre"
                  name="conductorNombre"
                  value={formData.conductorNombre}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Conductor - C.C."
                  name="conductorCedula"
                  value={formData.conductorCedula}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Auxiliar - Nombre"
                  name="auxiliarNombre"
                  value={formData.auxiliarNombre}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Auxiliar - C.C."
                  name="auxiliarCedula"
                  value={formData.auxiliarCedula}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  label="Medico - Nombre"
                  name="medicoNombre"
                  value={formData.medicoNombre}
                  onChange={handleChange}
                />
                <Input
                  label="Medico - C.C."
                  name="medicoCedula"
                  value={formData.medicoCedula}
                  onChange={handleChange}
                />
                <Input
                  label="Registro Medico"
                  name="medicoRegistro"
                  value={formData.medicoRegistro}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Receptor y Observaciones */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Profesional Receptor y Observaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Profesional Receptor - Nombre"
                  name="profesionalReceptorNombre"
                  value={formData.profesionalReceptorNombre}
                  onChange={handleChange}
                />
                <Input
                  label="Profesional Receptor - C.C."
                  name="profesionalReceptorCedula"
                  value={formData.profesionalReceptorCedula}
                  onChange={handleChange}
                />
              </div>
              <Textarea
                label="Observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link href="/auxiliar/secundarios">
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" variant="success" disabled={isSubmitting}>
              <CheckCircle className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Finalizando...' : 'Finalizar Traslado'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

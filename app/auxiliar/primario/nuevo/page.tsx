'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTraslados } from '@/context/TrasladosContext';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, Textarea } from '@/components/ui-custom';
import type { 
  TrasladoPrimario, 
  TipoDocumento, 
  SexoBiologico, 
  GrupoSanguineo, 
  TriageNivel, 
  MotivoTrasladoPrimario,
  EstadoPaciente
} from '@/types/traslados';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

const tiposDocumento = [
  { value: 'CC', label: 'Cedula de Ciudadania' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'CE', label: 'Cedula de Extranjeria' },
  { value: 'PA', label: 'Pasaporte' },
  { value: 'RC', label: 'Registro Civil' },
  { value: 'MS', label: 'Menor sin Identificacion' },
  { value: 'AS', label: 'Adulto sin Identificacion' },
];

const sexos = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
  { value: 'I', label: 'Indeterminado' },
];

const gruposSanguineos = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
  { value: 'Desconocido', label: 'Desconocido' },
];

const triageNiveles = [
  { value: '1', label: '1 - ROJO (Reanimacion)' },
  { value: '2', label: '2 - NARANJA (Emergencia)' },
  { value: '3', label: '3 - AMARILLO (Urgencia)' },
  { value: '4', label: '4 - VERDE (Menos urgente)' },
  { value: '5', label: '5 - AZUL (No urgente)' },
];

const motivosTraslado = [
  { value: 'enfermedad_general', label: 'Enfermedad General' },
  { value: 'accidente_laboral', label: 'Accidente Laboral' },
  { value: 'accidente_transito', label: 'Accidente de Transito' },
  { value: 'otro', label: 'Otro' },
];

const estadosPaciente = [
  { value: 'vivo', label: 'Vivo' },
  { value: 'muerto', label: 'Muerto' },
];

export default function NuevoTrasladoPrimario() {
  const router = useRouter();
  const { agregarTrasladoPrimario, generarId } = useTraslados();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Tiempos
    fechaSolicitud: new Date().toISOString().slice(0, 16),
    horaDespacho: '',
    horaLlegadaEscena: '',
    horaSalidaEscena: '',
    horaLlegadaInstitucion: '',
    horaRecepcionInstitucion: '',

    // Paciente
    nombres: '',
    apellidos: '',
    tipoDocumento: 'CC' as TipoDocumento,
    numeroDocumento: '',
    edad: '',
    sexoBiologico: 'M' as SexoBiologico,
    grupoSanguineo: 'Desconocido' as GrupoSanguineo,
    eps: '',
    arl: '',
    soat: '',

    // Datos clinicos
    triageEscena: '3' as unknown as TriageNivel,
    tensionArterial: '',
    frecuenciaCardiaca: '',
    frecuenciaRespiratoria: '',
    saturacionOxigeno: '',
    frecuenciaCardiacaFetal: '',
    glasgow: '15',
    peso: '',
    talla: '',
    temperatura: '',
    estadoIngreso: 'vivo' as EstadoPaciente,
    hallazgosClinicos: '',
    diagnosticoPrincipal: '',
    diagnosticoSecundario: '',

    // Procedimientos
    codigoCupsTraslado: '',
    procedimientosRealizados: '',
    medicamentos: '',

    // Traslado
    motivoTraslado: 'enfermedad_general' as MotivoTrasladoPrimario,
    motivoOtro: '',
    lugarOrigen: '',
    codigoRepsDestino: '',
    nombreIpsDestino: '',
    municipioDestino: '',

    // Tripulacion
    conductorNombre: '',
    conductorCedula: '',
    auxiliarNombre: '',
    auxiliarCedula: '',
    medicoNombre: '',
    medicoCedula: '',
    medicoRegistro: '',
    acompananteNombre: '',
    acompananteCedula: '',
    acompananteRelacion: '',
    vehiculoPlaca: '',

    // Receptor
    profesionalReceptorNombre: '',
    profesionalReceptorCedula: '',
    observaciones: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const traslado: TrasladoPrimario = {
      id: generarId(),
      tipo: 'primario',
      estado: 'pendiente',
      tiempos: {
        fechaSolicitud: formData.fechaSolicitud,
        horaDespacho: formData.horaDespacho || undefined,
        horaLlegadaEscena: formData.horaLlegadaEscena || undefined,
        horaSalidaEscena: formData.horaSalidaEscena || undefined,
        horaLlegadaInstitucion: formData.horaLlegadaInstitucion || undefined,
        horaRecepcionInstitucion: formData.horaRecepcionInstitucion || undefined,
      },
      paciente: {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento,
        edad: parseInt(formData.edad) || 0,
        sexoBiologico: formData.sexoBiologico,
        grupoSanguineo: formData.grupoSanguineo,
        eps: formData.eps,
        arl: formData.arl || undefined,
        soat: formData.soat || undefined,
      },
      datosClinicosLlegada: {
        triageEscena: parseInt(formData.triageEscena as unknown as string) as TriageNivel,
        signosVitales: {
          tensionArterial: formData.tensionArterial,
          frecuenciaCardiaca: parseInt(formData.frecuenciaCardiaca) || 0,
          frecuenciaRespiratoria: parseInt(formData.frecuenciaRespiratoria) || 0,
          saturacionOxigeno: parseInt(formData.saturacionOxigeno) || 0,
          frecuenciaCardiacaFetal: formData.frecuenciaCardiacaFetal ? parseInt(formData.frecuenciaCardiacaFetal) : undefined,
          glasgow: parseInt(formData.glasgow) || 15,
          peso: formData.peso ? parseFloat(formData.peso) : undefined,
          talla: formData.talla ? parseFloat(formData.talla) : undefined,
          temperatura: formData.temperatura ? parseFloat(formData.temperatura) : undefined,
        },
        estadoIngreso: formData.estadoIngreso,
        hallazgosClinicos: formData.hallazgosClinicos,
        diagnosticoPrincipal: formData.diagnosticoPrincipal,
        diagnosticoSecundario: formData.diagnosticoSecundario || undefined,
      },
      procedimientos: {
        codigoCupsTraslado: formData.codigoCupsTraslado,
        procedimientosRealizados: formData.procedimientosRealizados,
        medicamentos: formData.medicamentos,
      },
      datosTraslado: {
        motivo: formData.motivoTraslado,
        motivoOtro: formData.motivoOtro || undefined,
        lugarOrigen: formData.lugarOrigen,
        institucionDestino: {
          codigoReps: formData.codigoRepsDestino,
          nombre: formData.nombreIpsDestino,
          municipio: formData.municipioDestino,
        },
      },
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
        acompanantePaciente: formData.acompananteNombre ? {
          nombre: formData.acompananteNombre,
          cedula: formData.acompananteCedula,
          relacion: formData.acompananteRelacion,
        } : undefined,
      },
      vehiculoPlaca: formData.vehiculoPlaca,
      profesionalReceptor: formData.profesionalReceptorNombre ? {
        nombre: formData.profesionalReceptorNombre,
        cedula: formData.profesionalReceptorCedula,
        fechaHoraRecepcion: new Date().toISOString(),
      } : undefined,
      observaciones: formData.observaciones,
      creadoPor: 'Auxiliar',
      fechaCreacion: new Date().toISOString(),
    };

    agregarTrasladoPrimario(traslado);
    router.push('/auxiliar');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/auxiliar" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Traslado Primario</h1>
          <p className="text-gray-500">REF-FT-04A - Res. 2284/2023</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tiempos Operacionales */}
        <Card variant="bordered">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-800">Tiempos Operacionales del Traslado</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <Input
              label="Traslado Solicitado"
              type="datetime-local"
              name="fechaSolicitud"
              value={formData.fechaSolicitud}
              onChange={handleChange}
              required
            />
            <Input
              label="Hora Despacho"
              type="time"
              name="horaDespacho"
              value={formData.horaDespacho}
              onChange={handleChange}
            />
            <Input
              label="Hora Llegada a Escena"
              type="time"
              name="horaLlegadaEscena"
              value={formData.horaLlegadaEscena}
              onChange={handleChange}
            />
            <Input
              label="Hora Salida de Escena"
              type="time"
              name="horaSalidaEscena"
              value={formData.horaSalidaEscena}
              onChange={handleChange}
            />
            <Input
              label="Hora Llegada a Institucion"
              type="time"
              name="horaLlegadaInstitucion"
              value={formData.horaLlegadaInstitucion}
              onChange={handleChange}
            />
            <Input
              label="Hora Recepcion por Institucion"
              type="time"
              name="horaRecepcionInstitucion"
              value={formData.horaRecepcionInstitucion}
              onChange={handleChange}
            />
          </CardContent>
        </Card>

        {/* Datos del Paciente */}
        <Card variant="bordered">
          <CardHeader className="bg-green-50">
            <CardTitle className="text-green-800">Datos del Paciente</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <Input
              label="Nombres Completos"
              name="nombres"
              value={formData.nombres}
              onChange={handleChange}
              required
            />
            <Input
              label="Apellidos Completos"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              required
            />
            <Select
              label="Tipo de Documento"
              name="tipoDocumento"
              value={formData.tipoDocumento}
              onChange={handleChange}
              options={tiposDocumento}
              required
            />
            <Input
              label="Numero de Documento"
              name="numeroDocumento"
              value={formData.numeroDocumento}
              onChange={handleChange}
              required
            />
            <Input
              label="Edad"
              type="number"
              name="edad"
              value={formData.edad}
              onChange={handleChange}
              required
            />
            <Select
              label="Sexo Biologico"
              name="sexoBiologico"
              value={formData.sexoBiologico}
              onChange={handleChange}
              options={sexos}
              required
            />
            <Select
              label="Grupo Sanguineo"
              name="grupoSanguineo"
              value={formData.grupoSanguineo}
              onChange={handleChange}
              options={gruposSanguineos}
            />
            <Input
              label="EPS / Aseguradora"
              name="eps"
              value={formData.eps}
              onChange={handleChange}
              required
            />
            <Input
              label="ARL (si aplica)"
              name="arl"
              value={formData.arl}
              onChange={handleChange}
            />
            <Input
              label="SOAT (si aplica)"
              name="soat"
              value={formData.soat}
              onChange={handleChange}
            />
          </CardContent>
        </Card>

        {/* Datos Clinicos */}
        <Card variant="bordered">
          <CardHeader className="bg-orange-50">
            <CardTitle className="text-orange-800">Datos Clinicos y Signos Vitales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-5 gap-4">
              <Select
                label="Triage en Escena"
                name="triageEscena"
                value={formData.triageEscena as unknown as string}
                onChange={handleChange}
                options={triageNiveles}
                required
              />
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
            </div>
            <div className="grid md:grid-cols-5 gap-4">
              <Input
                label="FCF (p/min)"
                type="number"
                name="frecuenciaCardiacaFetal"
                value={formData.frecuenciaCardiacaFetal}
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
              <Input
                label="Peso (Kg)"
                type="number"
                step="0.1"
                name="peso"
                value={formData.peso}
                onChange={handleChange}
              />
              <Input
                label="Talla (cm)"
                type="number"
                name="talla"
                value={formData.talla}
                onChange={handleChange}
              />
              <Input
                label="Temp (C)"
                type="number"
                step="0.1"
                name="temperatura"
                value={formData.temperatura}
                onChange={handleChange}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Select
                label="Estado al Ingreso"
                name="estadoIngreso"
                value={formData.estadoIngreso}
                onChange={handleChange}
                options={estadosPaciente}
                required
              />
            </div>
            <Textarea
              label="Hallazgos Clinicos / Ayudas Diagnosticas"
              name="hallazgosClinicos"
              value={formData.hallazgosClinicos}
              onChange={handleChange}
              rows={3}
            />
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Diagnostico Principal (CIE-10)"
                name="diagnosticoPrincipal"
                value={formData.diagnosticoPrincipal}
                onChange={handleChange}
                required
              />
              <Input
                label="Diagnostico Secundario (CIE-10)"
                name="diagnosticoSecundario"
                value={formData.diagnosticoSecundario}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Procedimientos y Medicamentos */}
        <Card variant="bordered">
          <CardHeader className="bg-purple-50">
            <CardTitle className="text-purple-800">Procedimientos y Medicamentos Durante el Traslado</CardTitle>
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
              label="Medicamentos (CUMS/IUMS), Dosis, Via y Dispositivos"
              name="medicamentos"
              value={formData.medicamentos}
              onChange={handleChange}
              rows={2}
            />
          </CardContent>
        </Card>

        {/* Datos del Traslado */}
        <Card variant="bordered">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-800">Datos del Traslado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Select
                label="Motivo del Traslado"
                name="motivoTraslado"
                value={formData.motivoTraslado}
                onChange={handleChange}
                options={motivosTraslado}
                required
              />
              {formData.motivoTraslado === 'otro' && (
                <Input
                  label="Especifique el Motivo"
                  name="motivoOtro"
                  value={formData.motivoOtro}
                  onChange={handleChange}
                />
              )}
            </div>
            <Textarea
              label="Lugar de Origen (Codigo REPS o Direccion)"
              name="lugarOrigen"
              value={formData.lugarOrigen}
              onChange={handleChange}
              rows={2}
              required
            />
            <div className="grid md:grid-cols-3 gap-4">
              <Input
                label="Codigo REPS IPS Destino"
                name="codigoRepsDestino"
                value={formData.codigoRepsDestino}
                onChange={handleChange}
                required
              />
              <Input
                label="Nombre IPS Destino"
                name="nombreIpsDestino"
                value={formData.nombreIpsDestino}
                onChange={handleChange}
                required
              />
              <Input
                label="Municipio Destino"
                name="municipioDestino"
                value={formData.municipioDestino}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Tripulacion */}
        <Card variant="bordered">
          <CardHeader className="bg-gray-100">
            <CardTitle className="text-gray-800">Tripulacion y Profesional Receptor</CardTitle>
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
                label="Auxiliar de Enfermeria - Nombre"
                name="auxiliarNombre"
                value={formData.auxiliarNombre}
                onChange={handleChange}
                required
              />
              <Input
                label="Auxiliar de Enfermeria - C.C."
                name="auxiliarCedula"
                value={formData.auxiliarCedula}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <Input
                label="Medico - Nombre (si aplica)"
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
            <div className="grid md:grid-cols-3 gap-4">
              <Input
                label="Acompanante - Nombre"
                name="acompananteNombre"
                value={formData.acompananteNombre}
                onChange={handleChange}
              />
              <Input
                label="Acompanante - C.C."
                name="acompananteCedula"
                value={formData.acompananteCedula}
                onChange={handleChange}
              />
              <Input
                label="Relacion con Paciente"
                name="acompananteRelacion"
                value={formData.acompananteRelacion}
                onChange={handleChange}
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <Input
                label="Placa del Vehiculo"
                name="vehiculoPlaca"
                value={formData.vehiculoPlaca}
                onChange={handleChange}
                required
              />
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
          </CardContent>
        </Card>

        {/* Observaciones */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Observaciones del Traslado</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows={4}
              placeholder="Ingrese observaciones adicionales del traslado..."
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link href="/auxiliar">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Guardando...' : 'Guardar Traslado'}
          </Button>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTraslados } from '@/context/TrasladosContext';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, Textarea } from '@/components/ui-custom';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import type { 
  TrasladoSecundario, 
  TipoDocumento, 
  SexoBiologico, 
  MotivoTrasladoSecundario 
} from '@/types/traslados';

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

const motivosTraslado = [
  { value: 'remision_eps', label: 'Remision EPS' },
  { value: 'referencia_ips', label: 'Referencia entre IPS' },
  { value: 'contrarreferencia', label: 'Contrarreferencia' },
  { value: 'otro', label: 'Otro' },
];

export default function SolicitarTraslado() {
  const router = useRouter();
  const { agregarTrasladoSecundario, generarId } = useTraslados();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Paciente
    nombres: '',
    apellidos: '',
    tipoDocumento: 'CC' as TipoDocumento,
    numeroDocumento: '',
    edad: '',
    sexoBiologico: 'M' as SexoBiologico,
    eps: '',
    
    // Servicio destino
    grupoServicioDestino: '',
    
    // Diagnostico inicial
    diagnostico: '',
    
    // Motivo
    motivoTraslado: 'remision_eps' as MotivoTrasladoSecundario,
    motivoOtro: '',
    
    // IPS Origen
    codigoRepsOrigen: '',
    nombreIpsOrigen: '',
    municipioOrigen: '',
    departamentoOrigen: '',
    
    // IPS Destino
    codigoRepsDestino: '',
    nombreIpsDestino: '',
    municipioDestino: '',
    departamentoDestino: '',
    
    // Autorizacion
    numeroAutorizacionEps: '',
    
    // Observaciones
    observaciones: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const traslado: TrasladoSecundario = {
      id: generarId(),
      tipo: 'secundario',
      estado: 'pendiente',
      tiemposRecorrido: {
        tipoRecorrido: 'simple',
      },
      paciente: {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento,
        edad: parseInt(formData.edad) || 0,
        sexoBiologico: formData.sexoBiologico,
        eps: formData.eps,
      },
      grupoServicioDestino: formData.grupoServicioDestino,
      datosClinicosLlegada: {
        signosVitales: {
          tensionArterial: '',
          frecuenciaCardiaca: 0,
          frecuenciaRespiratoria: 0,
          saturacionOxigeno: 0,
          glasgow: 15,
        },
        diagnostico: formData.diagnostico,
      },
      procedimientos: {
        codigoCupsTraslado: '',
        procedimientosRealizados: '',
        medicamentos: '',
      },
      datosTraslado: {
        motivo: formData.motivoTraslado,
        motivoOtro: formData.motivoOtro || undefined,
        ipsOrigen: {
          codigoReps: formData.codigoRepsOrigen,
          nombre: formData.nombreIpsOrigen,
          municipio: formData.municipioOrigen,
          departamento: formData.departamentoOrigen,
        },
        ipsDestino: {
          codigoReps: formData.codigoRepsDestino,
          nombre: formData.nombreIpsDestino,
          municipio: formData.municipioDestino,
          departamento: formData.departamentoDestino,
        },
      },
      tripulacion: {
        conductor: { nombre: '', cedula: '' },
        auxiliarEnfermeria: { nombre: '', cedula: '' },
      },
      vehiculoPlaca: '',
      numeroAutorizacionEps: formData.numeroAutorizacionEps || undefined,
      observaciones: formData.observaciones,
      solicitadoPor: 'Medico',
      fechaSolicitud: new Date().toISOString(),
    };

    agregarTrasladoSecundario(traslado);
    router.push('/medico');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/medico" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitar Traslado Secundario</h1>
          <p className="text-gray-500">REF-FT-04B - Referencia entre instituciones</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
            <Input
              label="EPS / Aseguradora"
              name="eps"
              value={formData.eps}
              onChange={handleChange}
              required
            />
            <Input
              label="Grupo de Servicio Destino"
              name="grupoServicioDestino"
              value={formData.grupoServicioDestino}
              onChange={handleChange}
              placeholder="Segun Anexo Tecnico Res. 3100/2019"
              required
            />
          </CardContent>
        </Card>

        {/* Diagnostico */}
        <Card variant="bordered">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-800">Informacion Clinica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Diagnostico (CIE-10)"
              name="diagnostico"
              value={formData.diagnostico}
              onChange={handleChange}
              required
            />
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
          </CardContent>
        </Card>

        {/* IPS Origen */}
        <Card variant="bordered">
          <CardHeader className="bg-orange-50">
            <CardTitle className="text-orange-800">IPS / Institucion de Origen</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <Input
              label="Codigo REPS"
              name="codigoRepsOrigen"
              value={formData.codigoRepsOrigen}
              onChange={handleChange}
              required
            />
            <Input
              label="Nombre de la IPS"
              name="nombreIpsOrigen"
              value={formData.nombreIpsOrigen}
              onChange={handleChange}
              required
            />
            <Input
              label="Municipio"
              name="municipioOrigen"
              value={formData.municipioOrigen}
              onChange={handleChange}
              required
            />
            <Input
              label="Departamento"
              name="departamentoOrigen"
              value={formData.departamentoOrigen}
              onChange={handleChange}
              required
            />
          </CardContent>
        </Card>

        {/* IPS Destino */}
        <Card variant="bordered">
          <CardHeader className="bg-purple-50">
            <CardTitle className="text-purple-800">IPS / Institucion Destino</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <Input
              label="Codigo REPS"
              name="codigoRepsDestino"
              value={formData.codigoRepsDestino}
              onChange={handleChange}
              required
            />
            <Input
              label="Nombre de la IPS"
              name="nombreIpsDestino"
              value={formData.nombreIpsDestino}
              onChange={handleChange}
              required
            />
            <Input
              label="Municipio"
              name="municipioDestino"
              value={formData.municipioDestino}
              onChange={handleChange}
              required
            />
            <Input
              label="Departamento"
              name="departamentoDestino"
              value={formData.departamentoDestino}
              onChange={handleChange}
              required
            />
          </CardContent>
        </Card>

        {/* Autorizacion y Observaciones */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Autorizacion y Observaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Numero de Autorizacion EPS"
              name="numeroAutorizacionEps"
              value={formData.numeroAutorizacionEps}
              onChange={handleChange}
            />
            <Textarea
              label="Observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows={4}
              placeholder="Informacion adicional relevante para el traslado..."
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link href="/medico">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" variant="success" disabled={isSubmitting}>
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
          </Button>
        </div>
      </form>
    </div>
  );
}

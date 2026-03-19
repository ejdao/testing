'use client';

import { useState } from 'react';
import { useTraslados } from '@/context/TrasladosContext';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input, Select, Textarea } from '@/components/ui-custom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle, 
  FileText, 
  Truck,
  Send,
  X,
  MapPin,
  User,
  Building
} from 'lucide-react';
import type { 
  TrasladoSecundario, 
  TipoDocumento, 
  SexoBiologico, 
  MotivoTrasladoSecundario 
} from '@/types/traslados';

const estadoConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger' }> = {
  pendiente: { label: 'Pendiente Asignacion', variant: 'warning' },
  asignado: { label: 'Ambulancia Asignada', variant: 'info' },
  en_ruta: { label: 'En Ruta', variant: 'info' },
  en_traslado: { label: 'En Traslado', variant: 'warning' },
  finalizado: { label: 'Finalizado', variant: 'success' },
  cancelado: { label: 'Cancelado', variant: 'danger' },
};

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

export default function MedicoDashboard() {
  const { trasladosSecundarios, agregarTrasladoSecundario, generarId } = useTraslados();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const misSolicitudes = trasladosSecundarios.filter(t => t.solicitadoPor === 'Medico');
  const pendientes = misSolicitudes.filter(t => t.estado === 'pendiente');
  const enProceso = misSolicitudes.filter(t => 
    t.estado === 'asignado' || t.estado === 'en_ruta' || t.estado === 'en_traslado'
  );
  const finalizados = misSolicitudes.filter(t => t.estado === 'finalizado');

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    tipoDocumento: 'CC' as TipoDocumento,
    numeroDocumento: '',
    edad: '',
    sexoBiologico: 'M' as SexoBiologico,
    eps: '',
    grupoServicioDestino: '',
    diagnostico: '',
    motivoTraslado: 'remision_eps' as MotivoTrasladoSecundario,
    motivoOtro: '',
    codigoRepsOrigen: '',
    nombreIpsOrigen: '',
    municipioOrigen: '',
    departamentoOrigen: '',
    codigoRepsDestino: '',
    nombreIpsDestino: '',
    municipioDestino: '',
    departamentoDestino: '',
    numeroAutorizacionEps: '',
    observaciones: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      nombres: '',
      apellidos: '',
      tipoDocumento: 'CC',
      numeroDocumento: '',
      edad: '',
      sexoBiologico: 'M',
      eps: '',
      grupoServicioDestino: '',
      diagnostico: '',
      motivoTraslado: 'remision_eps',
      motivoOtro: '',
      codigoRepsOrigen: '',
      nombreIpsOrigen: '',
      municipioOrigen: '',
      departamentoOrigen: '',
      codigoRepsDestino: '',
      nombreIpsDestino: '',
      municipioDestino: '',
      departamentoDestino: '',
      numeroAutorizacionEps: '',
      observaciones: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const traslado: TrasladoSecundario = {
      id: generarId(),
      tipo: 'secundario',
      estado: 'pendiente',
      tiemposRecorrido: { tipoRecorrido: 'simple' },
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
    resetForm();
    setMostrarFormulario(false);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{misSolicitudes.length}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendientes.length}</p>
              <p className="text-sm text-gray-500">Pendientes</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Truck className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{enProceso.length}</p>
              <p className="text-sm text-gray-500">En Proceso</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{finalizados.length}</p>
              <p className="text-sm text-gray-500">Finalizados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Boton Nueva Solicitud */}
      <Card 
        variant="bordered" 
        className="hover:border-green-300 hover:shadow-md transition-all cursor-pointer"
        onClick={() => setMostrarFormulario(!mostrarFormulario)}
      >
        <CardContent className="flex items-center gap-4 py-6">
          <div className="p-4 bg-green-600 rounded-lg">
            {mostrarFormulario ? <X className="w-8 h-8 text-white" /> : <PlusCircle className="w-8 h-8 text-white" />}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {mostrarFormulario ? 'Cancelar Solicitud' : 'Nueva Solicitud de Traslado'}
            </h3>
            <p className="text-sm text-gray-500">
              {mostrarFormulario ? 'Cerrar formulario' : 'Crear una nueva solicitud de traslado secundario'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Formulario de Nueva Solicitud */}
      {mostrarFormulario && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card variant="bordered">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-800">Datos del Paciente</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <Input label="Nombres" name="nombres" value={formData.nombres} onChange={handleChange} required />
              <Input label="Apellidos" name="apellidos" value={formData.apellidos} onChange={handleChange} required />
              <Select label="Tipo Documento" name="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange} options={tiposDocumento} required />
              <Input label="Numero Documento" name="numeroDocumento" value={formData.numeroDocumento} onChange={handleChange} required />
              <Input label="Edad" type="number" name="edad" value={formData.edad} onChange={handleChange} required />
              <Select label="Sexo" name="sexoBiologico" value={formData.sexoBiologico} onChange={handleChange} options={sexos} required />
              <Input label="EPS" name="eps" value={formData.eps} onChange={handleChange} required />
              <Input label="Servicio Destino" name="grupoServicioDestino" value={formData.grupoServicioDestino} onChange={handleChange} required />
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-800">Informacion Clinica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Diagnostico (CIE-10)" name="diagnostico" value={formData.diagnostico} onChange={handleChange} required />
              <div className="grid md:grid-cols-2 gap-4">
                <Select label="Motivo del Traslado" name="motivoTraslado" value={formData.motivoTraslado} onChange={handleChange} options={motivosTraslado} required />
                {formData.motivoTraslado === 'otro' && (
                  <Input label="Especifique" name="motivoOtro" value={formData.motivoOtro} onChange={handleChange} />
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card variant="bordered">
              <CardHeader className="bg-orange-50">
                <CardTitle className="text-orange-800">IPS Origen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input label="Codigo REPS" name="codigoRepsOrigen" value={formData.codigoRepsOrigen} onChange={handleChange} required />
                <Input label="Nombre IPS" name="nombreIpsOrigen" value={formData.nombreIpsOrigen} onChange={handleChange} required />
                <Input label="Municipio" name="municipioOrigen" value={formData.municipioOrigen} onChange={handleChange} required />
                <Input label="Departamento" name="departamentoOrigen" value={formData.departamentoOrigen} onChange={handleChange} required />
              </CardContent>
            </Card>

            <Card variant="bordered">
              <CardHeader className="bg-red-50">
                <CardTitle className="text-red-800">IPS Destino</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input label="Codigo REPS" name="codigoRepsDestino" value={formData.codigoRepsDestino} onChange={handleChange} required />
                <Input label="Nombre IPS" name="nombreIpsDestino" value={formData.nombreIpsDestino} onChange={handleChange} required />
                <Input label="Municipio" name="municipioDestino" value={formData.municipioDestino} onChange={handleChange} required />
                <Input label="Departamento" name="departamentoDestino" value={formData.departamentoDestino} onChange={handleChange} required />
              </CardContent>
            </Card>
          </div>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Observaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="No. Autorizacion EPS" name="numeroAutorizacionEps" value={formData.numeroAutorizacionEps} onChange={handleChange} />
              <Textarea label="Observaciones" name="observaciones" value={formData.observaciones} onChange={handleChange} rows={3} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" variant="success" disabled={isSubmitting}>
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
          </div>
        </form>
      )}

      {/* Lista de Solicitudes */}
      <Card variant="bordered">
        <CardHeader className="bg-gray-50">
          <CardTitle>Mis Solicitudes</CardTitle>
        </CardHeader>
        <CardContent>
          {misSolicitudes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No has realizado solicitudes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {misSolicitudes
                .sort((a, b) => new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime())
                .map((traslado) => {
                  const estado = estadoConfig[traslado.estado] || estadoConfig.pendiente;
                  
                  return (
                    <div key={traslado.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold text-gray-900">
                              {traslado.paciente.nombres} {traslado.paciente.apellidos}
                            </p>
                            <Badge variant={estado.variant}>{estado.label}</Badge>
                          </div>
                          <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Building className="w-4 h-4 text-green-500" />
                              <span>{traslado.datosTraslado.ipsOrigen.nombre}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Building className="w-4 h-4 text-red-500" />
                              <span>{traslado.datosTraslado.ipsDestino.nombre}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            {format(new Date(traslado.fechaSolicitud), "dd MMM yyyy HH:mm", { locale: es })}
                          </p>
                        </div>
                        {traslado.ambulanciaAsignada && (
                          <div className="text-right">
                            <Badge variant="default">Ambulancia Asignada</Badge>
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

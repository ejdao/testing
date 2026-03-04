"use client"

import { useState } from "react"
import { useAuth, useTraslados, useEventos } from "@/lib/store"
import type { Traslado, TipoTraslado, PrioridadTraslado } from "@/lib/types"
import {
  SERVICIOS_HOSPITALARIOS,
  INSTITUCIONES,
  EQUIPO_DISPONIBLE,
  EPS_LISTA,
} from "@/lib/types"
import { toast } from "sonner"
import {
  X,
  User,
  Activity,
  FileText,
  MapPin,
  Package,
  Send,
  Heart,
  Thermometer,
  Wind,
  Brain,
  Droplets,
} from "lucide-react"

interface SolicitudFormProps {
  open: boolean
  onClose: () => void
}

const INITIAL_FORM = {
  // Paciente
  nombreCompleto: "",
  documento: "",
  tipoDocumento: "CC" as "CC" | "TI" | "CE" | "PA" | "RC",
  edad: "",
  sexo: "M" as "M" | "F",
  eps: "",
  tipoAfiliacion: "contributivo" as "contributivo" | "subsidiado" | "vinculado" | "particular",
  diagnostico: "",
  cama: "",
  // Traslado
  tipo: "secundario" as TipoTraslado,
  prioridad: "programado" as PrioridadTraslado,
  servicioOrigen: "",
  institucionOrigen: "Hospital Universitario San Jorge",
  servicioDestino: "",
  institucionDestino: "",
  motivoTraslado: "",
  requiereMedico: false,
  // Signos
  tensionSistolica: "",
  tensionDiastolica: "",
  frecuenciaCardiaca: "",
  frecuenciaRespiratoria: "",
  spo2: "",
  temperatura: "",
  glasgow: "15",
  // Notas
  notaEnfermeria: "",
  observaciones: "",
  equipoRequerido: [] as string[],
}

export function SolicitudForm({ open, onClose }: SolicitudFormProps) {
  const { usuario } = useAuth()
  const { agregarTraslado } = useTraslados()
  const { agregarEvento } = useEventos()
  const [form, setForm] = useState({
    ...INITIAL_FORM,
    servicioOrigen: usuario?.servicio || "",
  })
  const [step, setStep] = useState(0)

  if (!open) return null

  const updateField = (field: string, value: string | boolean | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const toggleEquipo = (item: string) => {
    setForm((prev) => ({
      ...prev,
      equipoRequerido: prev.equipoRequerido.includes(item)
        ? prev.equipoRequerido.filter((e) => e !== item)
        : [...prev.equipoRequerido, item],
    }))
  }

  const steps = [
    { label: "Paciente", icon: User },
    { label: "Ruta", icon: MapPin },
    { label: "Signos", icon: Activity },
    { label: "Notas", icon: FileText },
  ]

  const canSubmit =
    form.nombreCompleto &&
    form.documento &&
    form.diagnostico &&
    form.servicioDestino &&
    form.institucionDestino &&
    form.motivoTraslado &&
    form.tensionSistolica &&
    form.frecuenciaCardiaca &&
    form.spo2

  const handleSubmit = () => {
    if (!canSubmit) {
      toast.error("Complete todos los campos obligatorios")
      return
    }

    const ahora = new Date().toISOString()
    const id = `tr-${Date.now()}`

    const nuevoTraslado: Traslado = {
      id,
      tipo: form.tipo,
      prioridad: form.prioridad,
      estado: "pendiente",
      paciente: {
        nombreCompleto: form.nombreCompleto,
        documento: form.documento,
        tipoDocumento: form.tipoDocumento,
        edad: parseInt(form.edad) || 0,
        sexo: form.sexo,
        eps: form.eps,
        tipoAfiliacion: form.tipoAfiliacion,
        diagnostico: form.diagnostico,
        cama: form.cama,
      },
      signosVitales: {
        tensionSistolica: parseInt(form.tensionSistolica) || 0,
        tensionDiastolica: parseInt(form.tensionDiastolica) || 0,
        frecuenciaCardiaca: parseInt(form.frecuenciaCardiaca) || 0,
        frecuenciaRespiratoria: parseInt(form.frecuenciaRespiratoria) || 0,
        spo2: parseInt(form.spo2) || 0,
        temperatura: parseFloat(form.temperatura) || 0,
        glasgow: parseInt(form.glasgow) || 15,
      },
      servicioOrigen: form.servicioOrigen,
      institucionOrigen: form.institucionOrigen,
      servicioDestino: form.servicioDestino,
      institucionDestino: form.institucionDestino,
      motivoTraslado: form.motivoTraslado,
      requiereMedico: form.requiereMedico,
      notaEnfermeria: form.notaEnfermeria,
      observaciones: form.observaciones,
      fechaSolicitud: ahora,
      enfermeroSolicitante: usuario ? `${usuario.nombre} ${usuario.apellido}` : "Enfermera",
      enfermeroSolicitanteId: usuario?.id || "",
      equipoRequerido: form.equipoRequerido,
    }

    agregarTraslado(nuevoTraslado)
    agregarEvento({
      id: `e-${Date.now()}`,
      trasladoId: id,
      tipo: "pendiente",
      descripcion: "Solicitud de traslado creada",
      fecha: ahora,
      usuario: usuario ? `${usuario.nombre} ${usuario.apellido}` : "Enfermera",
    })

    toast.success("Solicitud de traslado creada exitosamente")
    setForm({ ...INITIAL_FORM, servicioOrigen: usuario?.servicio || "" })
    setStep(0)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/50" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 mx-4 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-card-foreground">
              Solicitar Traslado
            </h2>
            <p className="text-xs text-muted-foreground">
              Complete la informacion del traslado
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Cerrar formulario"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center border-b border-border px-6 py-3">
          {steps.map((s, i) => {
            const Icon = s.icon
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => setStep(i)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                  i === step
                    ? "bg-primary/10 text-primary"
                    : i < step
                    ? "text-success"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
            )
          })}
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <SectionTitle>Datos del Paciente</SectionTitle>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField label="Nombre completo *" span={2}>
                  <input
                    type="text"
                    value={form.nombreCompleto}
                    onChange={(e) => updateField("nombreCompleto", e.target.value)}
                    placeholder="Nombre completo del paciente"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Tipo documento">
                  <select
                    value={form.tipoDocumento}
                    onChange={(e) => updateField("tipoDocumento", e.target.value)}
                    className="form-input"
                  >
                    <option value="CC">CC</option>
                    <option value="TI">TI</option>
                    <option value="CE">CE</option>
                    <option value="PA">PA</option>
                    <option value="RC">RC</option>
                  </select>
                </FormField>

                <FormField label="Documento *">
                  <input
                    type="text"
                    value={form.documento}
                    onChange={(e) => updateField("documento", e.target.value)}
                    placeholder="Numero de documento"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Edad">
                  <input
                    type="number"
                    value={form.edad}
                    onChange={(e) => updateField("edad", e.target.value)}
                    placeholder="Edad"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Sexo">
                  <select
                    value={form.sexo}
                    onChange={(e) => updateField("sexo", e.target.value)}
                    className="form-input"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </FormField>

                <FormField label="EPS">
                  <select
                    value={form.eps}
                    onChange={(e) => updateField("eps", e.target.value)}
                    className="form-input"
                  >
                    <option value="">Seleccionar...</option>
                    {EPS_LISTA.map((eps) => (
                      <option key={eps} value={eps}>{eps}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Tipo afiliacion">
                  <select
                    value={form.tipoAfiliacion}
                    onChange={(e) => updateField("tipoAfiliacion", e.target.value)}
                    className="form-input"
                  >
                    <option value="contributivo">Contributivo</option>
                    <option value="subsidiado">Subsidiado</option>
                    <option value="vinculado">Vinculado</option>
                    <option value="particular">Particular</option>
                  </select>
                </FormField>

                <FormField label="Cama / Ubicacion">
                  <input
                    type="text"
                    value={form.cama}
                    onChange={(e) => updateField("cama", e.target.value)}
                    placeholder="Ej: UCI-A12"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Diagnostico *" span={2}>
                  <textarea
                    value={form.diagnostico}
                    onChange={(e) => updateField("diagnostico", e.target.value)}
                    placeholder="Diagnostico del paciente"
                    rows={2}
                    className="form-input"
                  />
                </FormField>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <SectionTitle>Ruta y Tipo de Traslado</SectionTitle>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField label="Tipo de traslado">
                  <div className="flex gap-2">
                    {(["primario", "secundario"] as TipoTraslado[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => updateField("tipo", t)}
                        className={`flex-1 rounded-lg border py-2 text-center text-sm font-medium transition-colors ${
                          form.tipo === t
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </FormField>

                <FormField label="Prioridad">
                  <div className="flex gap-2">
                    {(["urgente", "programado"] as PrioridadTraslado[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => updateField("prioridad", p)}
                        className={`flex-1 rounded-lg border py-2 text-center text-sm font-medium transition-colors ${
                          form.prioridad === p
                            ? p === "urgente"
                              ? "border-destructive bg-destructive/10 text-destructive"
                              : "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                </FormField>

                <FormField label="Servicio de origen">
                  <select
                    value={form.servicioOrigen}
                    onChange={(e) => updateField("servicioOrigen", e.target.value)}
                    className="form-input"
                  >
                    <option value="">Seleccionar...</option>
                    {SERVICIOS_HOSPITALARIOS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Institucion de origen">
                  <select
                    value={form.institucionOrigen}
                    onChange={(e) => updateField("institucionOrigen", e.target.value)}
                    className="form-input"
                  >
                    {INSTITUCIONES.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Servicio destino *">
                  <select
                    value={form.servicioDestino}
                    onChange={(e) => updateField("servicioDestino", e.target.value)}
                    className="form-input"
                  >
                    <option value="">Seleccionar...</option>
                    {SERVICIOS_HOSPITALARIOS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Institucion destino *">
                  <select
                    value={form.institucionDestino}
                    onChange={(e) => updateField("institucionDestino", e.target.value)}
                    className="form-input"
                  >
                    <option value="">Seleccionar...</option>
                    {INSTITUCIONES.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Motivo del traslado *" span={2}>
                  <textarea
                    value={form.motivoTraslado}
                    onChange={(e) => updateField("motivoTraslado", e.target.value)}
                    placeholder="Describa el motivo del traslado"
                    rows={2}
                    className="form-input"
                  />
                </FormField>

                <FormField label="Requiere medico" span={2}>
                  <button
                    type="button"
                    onClick={() => updateField("requiereMedico", !form.requiereMedico)}
                    className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      form.requiereMedico
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <div className={`flex h-5 w-5 items-center justify-center rounded border ${
                      form.requiereMedico ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
                    }`}>
                      {form.requiereMedico && <span className="text-xs font-bold">{"✓"}</span>}
                    </div>
                    Si, requiere acompanamiento medico (medicalizado)
                  </button>
                </FormField>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <SectionTitle>Signos Vitales Actuales</SectionTitle>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <VitalInput
                  icon={<Droplets className="h-4 w-4" />}
                  label="T/A Sistolica *"
                  value={form.tensionSistolica}
                  onChange={(v) => updateField("tensionSistolica", v)}
                  placeholder="120"
                  unit="mmHg"
                />
                <VitalInput
                  icon={<Droplets className="h-4 w-4" />}
                  label="T/A Diastolica"
                  value={form.tensionDiastolica}
                  onChange={(v) => updateField("tensionDiastolica", v)}
                  placeholder="80"
                  unit="mmHg"
                />
                <VitalInput
                  icon={<Heart className="h-4 w-4" />}
                  label="Frec. Cardiaca *"
                  value={form.frecuenciaCardiaca}
                  onChange={(v) => updateField("frecuenciaCardiaca", v)}
                  placeholder="80"
                  unit="lpm"
                />
                <VitalInput
                  icon={<Wind className="h-4 w-4" />}
                  label="Frec. Respiratoria"
                  value={form.frecuenciaRespiratoria}
                  onChange={(v) => updateField("frecuenciaRespiratoria", v)}
                  placeholder="18"
                  unit="rpm"
                />
                <VitalInput
                  icon={<Activity className="h-4 w-4" />}
                  label="SpO2 *"
                  value={form.spo2}
                  onChange={(v) => updateField("spo2", v)}
                  placeholder="98"
                  unit="%"
                />
                <VitalInput
                  icon={<Thermometer className="h-4 w-4" />}
                  label="Temperatura"
                  value={form.temperatura}
                  onChange={(v) => updateField("temperatura", v)}
                  placeholder="36.5"
                  unit="C"
                />
              </div>

              <div>
                <VitalInput
                  icon={<Brain className="h-4 w-4" />}
                  label="Glasgow"
                  value={form.glasgow}
                  onChange={(v) => updateField("glasgow", v)}
                  placeholder="15"
                  unit="/15"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <SectionTitle>Notas y Equipo</SectionTitle>

              <FormField label="Nota de enfermeria">
                <textarea
                  value={form.notaEnfermeria}
                  onChange={(e) => updateField("notaEnfermeria", e.target.value)}
                  placeholder="Describa el estado actual del paciente, medicamentos en curso, accesos venosos, alergias conocidas..."
                  rows={4}
                  className="form-input"
                />
              </FormField>

              <FormField label="Observaciones especiales">
                <textarea
                  value={form.observaciones}
                  onChange={(e) => updateField("observaciones", e.target.value)}
                  placeholder="Observaciones adicionales para el traslado..."
                  rows={2}
                  className="form-input"
                />
              </FormField>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Package className="mr-1 inline h-3.5 w-3.5" />
                  Equipo Requerido
                </p>
                <div className="flex flex-wrap gap-2">
                  {EQUIPO_DISPONIBLE.map((eq) => (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => toggleEquipo(eq)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        form.equipoRequerido.includes(eq)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={() => (step > 0 ? setStep(step - 1) : onClose())}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {step > 0 ? "Anterior" : "Cancelar"}
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Enviar Solicitud
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold text-card-foreground">{children}</h3>
  )
}

function FormField({
  label,
  children,
  span,
}: {
  label: string
  children: React.ReactNode
  span?: number
}) {
  return (
    <div className={span === 2 ? "sm:col-span-2" : ""}>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  )
}

function VitalInput({
  icon,
  label,
  value,
  onChange,
  placeholder,
  unit,
}: {
  icon: React.ReactNode
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  unit: string
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="mb-1.5 flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        <input
          type="number"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border-0 bg-transparent p-0 text-lg font-bold text-card-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-0"
        />
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  )
}

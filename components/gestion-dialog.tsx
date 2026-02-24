"use client"

import { useState } from "react"
import { useGestion } from "@/lib/gestion-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, ArrowLeft } from "lucide-react"
import { NewGestionForm } from "@/components/new-gestion-form"
import type { Patient } from "@/lib/types"

function getPriorityBadge(priority: string) {
  const styles: Record<string, string> = {
    BAJA: "bg-blue-100 text-blue-800",
    MEDIA: "bg-amber-100 text-amber-800",
    ALTA: "bg-orange-100 text-orange-800",
    CRITICA: "bg-red-100 text-red-100",
  }
  return styles[priority] || "bg-muted text-muted-foreground"
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    INICIADO: "bg-blue-100 text-blue-800",
    EN_PROCESO: "bg-amber-100 text-amber-800",
    FINALIZADO: "bg-emerald-100 text-emerald-800",
    PENDIENTE: "bg-slate-100 text-slate-800",
    ASIGNADO: "bg-indigo-100 text-indigo-800",
  }
  return styles[status] || "bg-muted text-muted-foreground"
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ")
}

interface GestionDialogProps {
  patient: Patient
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GestionDialog({ patient, open, onOpenChange }: GestionDialogProps) {
  const { getGestionesByPatient } = useGestion()
  const [showForm, setShowForm] = useState(false)
  const gestiones = getGestionesByPatient(patient.id)

  const handleClose = () => {
    setShowForm(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {showForm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
                className="p-1 h-auto"
              >
                <ArrowLeft className="size-4" />
              </Button>
            )}
            {showForm ? "Nueva Gestion Clinica" : "Gestiones Clinicas"}
          </DialogTitle>
          <DialogDescription>
            Paciente: {patient.name} | Cama: {patient.bedCode} | Doc: {patient.document}
          </DialogDescription>
        </DialogHeader>

        {!showForm ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {gestiones.length} gestion(es) registrada(s)
              </p>
              <Button onClick={() => setShowForm(true)} size="sm" className="gap-1.5">
                <Plus className="size-3.5" />
                Nueva Gestion
              </Button>
            </div>

            {gestiones.length > 0 ? (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Codigo</TableHead>
                      <TableHead className="font-semibold">Prioridad</TableHead>
                      <TableHead className="font-semibold">Area</TableHead>
                      <TableHead className="font-semibold">Titulo</TableHead>
                      <TableHead className="font-semibold">Tipo</TableHead>
                      <TableHead className="font-semibold">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gestiones.map((g) => (
                      <TableRow key={g.id}>
                        <TableCell className="font-mono text-xs">{g.code}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getPriorityBadge(g.priority)}`}
                          >
                            {g.priority}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">{g.area}</TableCell>
                        <TableCell className="text-sm max-w-48 truncate">{g.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {g.type === "TRASLADO_AMBULANCIA" ? "Ambulancia" : "Normal"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadge(g.status)}`}
                          >
                            {formatStatus(g.status)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground text-sm border rounded-lg bg-muted/20">
                No hay gestiones registradas para este paciente
              </div>
            )}
          </div>
        ) : (
          <NewGestionForm
            patient={patient}
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

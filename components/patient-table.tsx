"use client"

import { useState } from "react"
import { useGestion } from "@/lib/gestion-context"
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
import { ClipboardList, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { GestionDialog } from "@/components/gestion-dialog"
import type { Patient } from "@/lib/types"

function getDaysOfStay(admissionDate: string): number {
  const admission = new Date(admissionDate)
  const now = new Date()
  const diff = now.getTime() - admission.getTime()
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function getDaysColor(days: number): string {
  if (days <= 3) return "bg-emerald-100 text-emerald-800"
  if (days <= 7) return "bg-amber-100 text-amber-800"
  return "bg-red-100 text-red-800"
}

export function PatientTable() {
  const { patients, getGestionesByPatient } = useGestion()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.document.includes(searchTerm) ||
      p.bedCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenGestion = (patient: Patient) => {
    setSelectedPatient(patient)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Pacientes Hospitalizados
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {patients.length} pacientes actualmente en la institucion
          </p>
        </div>
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, documento o cama..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Cama</TableHead>
              <TableHead className="font-semibold">Paciente</TableHead>
              <TableHead className="font-semibold">Documento</TableHead>
              <TableHead className="font-semibold text-center">Edad</TableHead>
              <TableHead className="font-semibold text-center">Dias Estancia</TableHead>
              <TableHead className="font-semibold">Contrato</TableHead>
              <TableHead className="font-semibold text-center">Gestiones</TableHead>
              <TableHead className="font-semibold text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map((patient) => {
              const days = getDaysOfStay(patient.admissionDate)
              const gestionCount = getGestionesByPatient(patient.id).length
              return (
                <TableRow key={patient.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {patient.bedCode}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {patient.document}
                  </TableCell>
                  <TableCell className="text-center">{patient.age} a.</TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getDaysColor(days)}`}
                    >
                      {days} {days === 1 ? "dia" : "dias"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">{patient.contractName}</span>
                      <span className="text-xs text-muted-foreground">{patient.company}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {gestionCount > 0 ? (
                      <Badge variant="secondary" className="text-xs">
                        {gestionCount}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenGestion(patient)}
                      className="gap-1.5"
                    >
                      <ClipboardList className="size-3.5" />
                      Gestion Clinica
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            {filteredPatients.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No se encontraron pacientes
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedPatient && (
        <GestionDialog
          patient={selectedPatient}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </div>
  )
}

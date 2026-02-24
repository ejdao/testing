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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Eye, Search, Filter } from "lucide-react"
import { GestionDetailDialog } from "@/components/gestion-detail-dialog"
import type { Gestion } from "@/lib/types"

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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function GestionModule() {
  const { gestiones } = useGestion()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("TODOS")
  const [filterStatus, setFilterStatus] = useState<string>("TODOS")
  const [selectedGestion, setSelectedGestion] = useState<Gestion | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const filtered = gestiones.filter((g) => {
    const matchSearch =
      g.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.patientName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchType = filterType === "TODOS" || g.type === filterType
    const matchStatus = filterStatus === "TODOS" || g.status === filterStatus
    return matchSearch && matchType && matchStatus
  })

  const handleOpenDetail = (gestion: Gestion) => {
    setSelectedGestion(gestion)
    setDetailOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Modulo de Gestiones
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {gestiones.length} gestiones registradas en total
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por codigo, titulo o paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos los tipos</SelectItem>
              <SelectItem value="NORMAL">Normal</SelectItem>
              <SelectItem value="TRASLADO_AMBULANCIA">Traslado Ambulancia</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos los estados</SelectItem>
              <SelectItem value="PENDIENTE">Pendiente</SelectItem>
              <SelectItem value="ASIGNADO">Asignado</SelectItem>
              <SelectItem value="INICIADO">Iniciado</SelectItem>
              <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
              <SelectItem value="FINALIZADO">Finalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Codigo</TableHead>
              <TableHead className="font-semibold">Paciente</TableHead>
              <TableHead className="font-semibold">Titulo</TableHead>
              <TableHead className="font-semibold">Tipo</TableHead>
              <TableHead className="font-semibold">Prioridad</TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
              <TableHead className="font-semibold">Fecha</TableHead>
              <TableHead className="font-semibold text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((g) => (
              <TableRow key={g.id}>
                <TableCell className="font-mono text-xs">{g.code}</TableCell>
                <TableCell className="text-sm max-w-40 truncate">{g.patientName}</TableCell>
                <TableCell className="text-sm max-w-48 truncate">{g.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {g.type === "TRASLADO_AMBULANCIA" ? "Ambulancia" : "Normal"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getPriorityBadge(g.priority)}`}
                  >
                    {g.priority}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadge(g.status)}`}
                  >
                    {formatStatus(g.status)}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(g.createdAt)}
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDetail(g)}
                    className="gap-1.5"
                  >
                    <Eye className="size-3.5" />
                    Gestionar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No se encontraron gestiones
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedGestion && (
        <GestionDetailDialog
          gestion={selectedGestion}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      )}
    </div>
  )
}

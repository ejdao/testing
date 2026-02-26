"use client"

import { useState } from "react"
import {
  Search,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Download,
  Filter,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const usersData = [
  {
    id: 1,
    name: "Carlos Rodriguez",
    email: "carlos@empresa.com",
    role: "Administrador",
    status: "Activo",
    lastLogin: "2026-02-25",
  },
  {
    id: 2,
    name: "Maria Garcia",
    email: "maria@empresa.com",
    role: "Editor",
    status: "Activo",
    lastLogin: "2026-02-24",
  },
  {
    id: 3,
    name: "Juan Martinez",
    email: "juan@empresa.com",
    role: "Viewer",
    status: "Inactivo",
    lastLogin: "2026-02-20",
  },
  {
    id: 4,
    name: "Ana Lopez",
    email: "ana@empresa.com",
    role: "Editor",
    status: "Activo",
    lastLogin: "2026-02-25",
  },
  {
    id: 5,
    name: "Pedro Sanchez",
    email: "pedro@empresa.com",
    role: "Viewer",
    status: "Activo",
    lastLogin: "2026-02-23",
  },
  {
    id: 6,
    name: "Laura Torres",
    email: "laura@empresa.com",
    role: "Administrador",
    status: "Activo",
    lastLogin: "2026-02-25",
  },
  {
    id: 7,
    name: "Diego Fernandez",
    email: "diego@empresa.com",
    role: "Editor",
    status: "Suspendido",
    lastLogin: "2026-02-15",
  },
  {
    id: 8,
    name: "Sofia Ramirez",
    email: "sofia@empresa.com",
    role: "Viewer",
    status: "Activo",
    lastLogin: "2026-02-24",
  },
]

function getStatusColor(status: string) {
  switch (status) {
    case "Activo":
      return "bg-emerald-100 text-emerald-700"
    case "Inactivo":
      return "bg-secondary text-muted-foreground"
    case "Suspendido":
      return "bg-red-100 text-red-700"
    default:
      return "bg-secondary text-muted-foreground"
  }
}

function getRoleColor(role: string) {
  switch (role) {
    case "Administrador":
      return "bg-primary/10 text-primary"
    case "Editor":
      return "bg-amber-100 text-amber-700"
    case "Viewer":
      return "bg-blue-100 text-blue-700"
    default:
      return "bg-secondary text-muted-foreground"
  }
}

export default function UsersListPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filtered = usersData.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-primary">
            Usuarios / Gestion
          </span>
          <h1 className="text-2xl font-bold text-foreground">
            Lista de Usuarios
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Administra y gestiona los usuarios del sistema.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <UserPlus className="h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Stats Mini */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Usuarios</p>
            <p className="text-2xl font-bold text-foreground">{usersData.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Activos</p>
            <p className="text-2xl font-bold text-emerald-600">
              {usersData.filter((u) => u.status === "Activo").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Inactivos</p>
            <p className="text-2xl font-bold text-muted-foreground">
              {usersData.filter((u) => u.status === "Inactivo").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Administradores</p>
            <p className="text-2xl font-bold text-primary">
              {usersData.filter((u) => u.role === "Administrador").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Usuarios</CardTitle>
              <CardDescription className="text-xs">
                {filtered.length} de {usersData.length} usuarios
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-[240px] bg-secondary pl-9 text-sm"
                />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-3.5 w-3.5" />
                Filtrar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 text-xs">Usuario</TableHead>
                <TableHead className="text-xs">Rol</TableHead>
                <TableHead className="text-xs">Estado</TableHead>
                <TableHead className="text-xs">Ultimo Acceso</TableHead>
                <TableHead className="w-[50px] text-xs" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id} className="group">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getRoleColor(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(user.status)}`}
                    >
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {user.lastLogin}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-secondary group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Acciones</span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver Perfil</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-6 py-3">
            <p className="text-xs text-muted-foreground">
              Mostrando {filtered.length} de {usersData.length} resultados
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled className="h-8 w-8 p-0">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Anterior</span>
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 bg-primary p-0 text-primary-foreground hover:bg-primary/90">
                1
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                2
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Siguiente</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, FileText, AlertTriangle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTraslados } from '@/context/TrasladosContext';

const navItems = [
  { href: '/auxiliar', label: 'Dashboard', icon: Home },
  { href: '/auxiliar/primario/nuevo', label: 'Nuevo Primario', icon: PlusCircle },
  { href: '/auxiliar/secundarios', label: 'Secundarios Asignados', icon: FileText },
  { href: '/auxiliar/incidentes', label: 'Reportar Incidente', icon: AlertTriangle },
];

export default function AuxiliarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { obtenerIncidentesPendientes, trasladosSecundarios } = useTraslados();
  
  const incidentesPendientes = obtenerIncidentesPendientes().length;
  const secundariosAsignados = trasladosSecundarios.filter(t => 
    t.estado === 'asignado' || t.estado === 'en_ruta' || t.estado === 'en_traslado'
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
                title="Volver al inicio"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold">Auxiliar de Enfermeria</h1>
                <p className="text-blue-100 text-sm">Sistema de Traslados Asistenciales</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const showBadge = 
                (item.href === '/auxiliar/secundarios' && secundariosAsignados > 0) ||
                (item.href === '/auxiliar/incidentes' && incidentesPendientes > 0);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {showBadge && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {item.href === '/auxiliar/secundarios' ? secundariosAsignados : incidentesPendientes}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}

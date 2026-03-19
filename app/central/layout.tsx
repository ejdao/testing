'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Truck, Eye, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTraslados } from '@/context/TrasladosContext';

const navItems = [
  { href: '/central', label: 'Dashboard', icon: Home },
  { href: '/central/secundarios', label: 'Asignar Secundarios', icon: Truck },
  { href: '/central/primarios', label: 'Ver Primarios', icon: Eye },
  { href: '/central/incidentes', label: 'Incidentes', icon: AlertTriangle },
  { href: '/central/reasignar', label: 'Reasignar', icon: RefreshCw },
];

export default function CentralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { obtenerIncidentesPendientes, trasladosSecundarios } = useTraslados();
  
  const incidentesPendientes = obtenerIncidentesPendientes().length;
  const secundariosPendientes = trasladosSecundarios.filter(t => t.estado === 'pendiente').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-orange-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="p-2 hover:bg-orange-700 rounded-lg transition-colors"
                title="Volver al inicio"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold">Central de Despacho</h1>
                <p className="text-orange-100 text-sm">Sistema de Traslados Asistenciales</p>
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
                (item.href === '/central/secundarios' && secundariosPendientes > 0) ||
                (item.href === '/central/incidentes' && incidentesPendientes > 0);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                    isActive
                      ? 'border-orange-600 text-orange-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {showBadge && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {item.href === '/central/secundarios' ? secundariosPendientes : incidentesPendientes}
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

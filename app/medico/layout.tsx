'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, FileText, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTraslados } from '@/context/TrasladosContext';

const navItems = [
  { href: '/medico', label: 'Dashboard', icon: Home },
  { href: '/medico/solicitar', label: 'Solicitar Traslado', icon: PlusCircle },
  { href: '/medico/historial', label: 'Mis Solicitudes', icon: FileText },
];

export default function MedicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { trasladosSecundarios } = useTraslados();
  
  const misSolicitudes = trasladosSecundarios.filter(t => t.solicitadoPor === 'Medico').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="p-2 hover:bg-green-700 rounded-lg transition-colors"
                title="Volver al inicio"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold">Medico</h1>
                <p className="text-green-100 text-sm">Sistema de Traslados Asistenciales</p>
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
              const showBadge = item.href === '/medico/historial' && misSolicitudes > 0;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                    isActive
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {showBadge && (
                    <span className="bg-green-500 text-white text-xs rounded-full px-2 py-0.5">
                      {misSolicitudes}
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

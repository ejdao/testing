'use client';

import { useTraslados } from '@/context/TrasladosContext';
import { useRouter } from 'next/navigation';
import { Ambulance, Stethoscope, Radio } from 'lucide-react';
import type { RolUsuario } from '@/types/traslados';

const roles = [
  {
    id: 'auxiliar' as RolUsuario,
    nombre: 'Auxiliar de Enfermeria',
    descripcion: 'Registra traslados primarios, completa traslados secundarios asignados y reporta incidentes',
    icon: Ambulance,
    color: 'bg-blue-600 hover:bg-blue-700',
    href: '/auxiliar'
  },
  {
    id: 'medico' as RolUsuario,
    nombre: 'Medico',
    descripcion: 'Solicita traslados secundarios para pacientes que requieren referencia entre IPS',
    icon: Stethoscope,
    color: 'bg-green-600 hover:bg-green-700',
    href: '/medico'
  },
  {
    id: 'central' as RolUsuario,
    nombre: 'Central de Despacho',
    descripcion: 'Visualiza todos los traslados, asigna ambulancias y gestiona incidentes reportados',
    icon: Radio,
    color: 'bg-orange-600 hover:bg-orange-700',
    href: '/central'
  }
];

export default function HomePage() {
  const { setRolActual } = useTraslados();
  const router = useRouter();

  const handleSelectRole = (rol: RolUsuario, href: string) => {
    setRolActual(rol);
    router.push(href);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Ambulance className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Traslados Asistenciales
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Gestion de traslados primarios y secundarios en ambulancia terrestre
            conforme a la Resolucion 2284/2023 y Resolucion 3100/2019
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((rol) => {
            const Icon = rol.icon;
            return (
              <button
                key={rol.id}
                onClick={() => handleSelectRole(rol.id, rol.href)}
                className="flex flex-col items-center p-8 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all group"
              >
                <div className={`p-4 rounded-full ${rol.color} text-white mb-4 transition-transform group-hover:scale-110`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {rol.nombre}
                </h2>
                <p className="text-sm text-gray-500 text-center">
                  {rol.descripcion}
                </p>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-400">
            REF-FT-04A / REF-FT-04B - Formato de Traslado Asistencial
          </p>
        </div>
      </div>
    </main>
  );
}

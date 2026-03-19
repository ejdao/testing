'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { 
  TrasladoPrimario, 
  TrasladoSecundario, 
  Ambulancia, 
  Incidente, 
  RolUsuario 
} from '@/types/traslados';

interface TrasladosState {
  trasladosPrimarios: TrasladoPrimario[];
  trasladosSecundarios: TrasladoSecundario[];
  ambulancias: Ambulancia[];
  incidentes: Incidente[];
  rolActual: RolUsuario;
}

interface TrasladosContextType extends TrasladosState {
  // Rol
  setRolActual: (rol: RolUsuario) => void;

  // Traslados Primarios
  agregarTrasladoPrimario: (traslado: TrasladoPrimario) => void;
  actualizarTrasladoPrimario: (id: string, datos: Partial<TrasladoPrimario>) => void;
  obtenerTrasladoPrimario: (id: string) => TrasladoPrimario | undefined;

  // Traslados Secundarios
  agregarTrasladoSecundario: (traslado: TrasladoSecundario) => void;
  actualizarTrasladoSecundario: (id: string, datos: Partial<TrasladoSecundario>) => void;
  obtenerTrasladoSecundario: (id: string) => TrasladoSecundario | undefined;

  // Ambulancias
  agregarAmbulancia: (ambulancia: Ambulancia) => void;
  actualizarAmbulancia: (id: string, datos: Partial<Ambulancia>) => void;
  obtenerAmbulanciasDisponibles: () => Ambulancia[];

  // Incidentes
  agregarIncidente: (incidente: Incidente) => void;
  atenderIncidente: (id: string, respuesta: string, atendidoPor: string) => void;
  obtenerIncidentesPendientes: () => Incidente[];

  // Utilidades
  generarId: () => string;
  todosLosTraslados: () => (TrasladoPrimario | TrasladoSecundario)[];
}

const TrasladosContext = createContext<TrasladosContextType | undefined>(undefined);

const STORAGE_KEY = 'traslados_system_data';

const estadoInicial: TrasladosState = {
  trasladosPrimarios: [],
  trasladosSecundarios: [],
  ambulancias: [
    {
      id: 'amb-001',
      placa: 'ABC-123',
      tipo: 'TAB',
      estado: 'disponible',
      ubicacionActual: 'Base Central'
    },
    {
      id: 'amb-002',
      placa: 'DEF-456',
      tipo: 'TAM',
      estado: 'disponible',
      ubicacionActual: 'Base Central'
    },
    {
      id: 'amb-003',
      placa: 'GHI-789',
      tipo: 'TAB',
      estado: 'disponible',
      ubicacionActual: 'Base Norte'
    },
    {
      id: 'amb-004',
      placa: 'JKL-012',
      tipo: 'TAM',
      estado: 'mantenimiento',
      ubicacionActual: 'Taller'
    }
  ],
  incidentes: [],
  rolActual: 'auxiliar'
};

export function TrasladosProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TrasladosState>(estadoInicial);
  const [isHydrated, setIsHydrated] = useState(false);

  // Cargar desde localStorage al montar
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setState(prev => ({
          ...prev,
          ...parsed,
          // Mantener ambulancias por defecto si no hay guardadas
          ambulancias: parsed.ambulancias?.length ? parsed.ambulancias : estadoInicial.ambulancias
        }));
      } catch {
        console.error('Error parsing stored data');
      }
    }
    setIsHydrated(true);
  }, []);

  // Guardar en localStorage cuando cambie el estado
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isHydrated]);

  const generarId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const setRolActual = useCallback((rol: RolUsuario) => {
    setState(prev => ({ ...prev, rolActual: rol }));
  }, []);

  // Traslados Primarios
  const agregarTrasladoPrimario = useCallback((traslado: TrasladoPrimario) => {
    setState(prev => ({
      ...prev,
      trasladosPrimarios: [...prev.trasladosPrimarios, traslado]
    }));
  }, []);

  const actualizarTrasladoPrimario = useCallback((id: string, datos: Partial<TrasladoPrimario>) => {
    setState(prev => ({
      ...prev,
      trasladosPrimarios: prev.trasladosPrimarios.map(t =>
        t.id === id ? { ...t, ...datos } : t
      )
    }));
  }, []);

  const obtenerTrasladoPrimario = useCallback((id: string) => {
    return state.trasladosPrimarios.find(t => t.id === id);
  }, [state.trasladosPrimarios]);

  // Traslados Secundarios
  const agregarTrasladoSecundario = useCallback((traslado: TrasladoSecundario) => {
    setState(prev => ({
      ...prev,
      trasladosSecundarios: [...prev.trasladosSecundarios, traslado]
    }));
  }, []);

  const actualizarTrasladoSecundario = useCallback((id: string, datos: Partial<TrasladoSecundario>) => {
    setState(prev => ({
      ...prev,
      trasladosSecundarios: prev.trasladosSecundarios.map(t =>
        t.id === id ? { ...t, ...datos } : t
      )
    }));
  }, []);

  const obtenerTrasladoSecundario = useCallback((id: string) => {
    return state.trasladosSecundarios.find(t => t.id === id);
  }, [state.trasladosSecundarios]);

  // Ambulancias
  const agregarAmbulancia = useCallback((ambulancia: Ambulancia) => {
    setState(prev => ({
      ...prev,
      ambulancias: [...prev.ambulancias, ambulancia]
    }));
  }, []);

  const actualizarAmbulancia = useCallback((id: string, datos: Partial<Ambulancia>) => {
    setState(prev => ({
      ...prev,
      ambulancias: prev.ambulancias.map(a =>
        a.id === id ? { ...a, ...datos } : a
      )
    }));
  }, []);

  const obtenerAmbulanciasDisponibles = useCallback(() => {
    return state.ambulancias.filter(a => a.estado === 'disponible');
  }, [state.ambulancias]);

  // Incidentes
  const agregarIncidente = useCallback((incidente: Incidente) => {
    setState(prev => ({
      ...prev,
      incidentes: [...prev.incidentes, incidente]
    }));
  }, []);

  const atenderIncidente = useCallback((id: string, respuesta: string, atendidoPor: string) => {
    setState(prev => ({
      ...prev,
      incidentes: prev.incidentes.map(i =>
        i.id === id 
          ? { 
              ...i, 
              atendido: true, 
              respuesta, 
              atendidoPor,
              fechaAtencion: new Date().toISOString()
            } 
          : i
      )
    }));
  }, []);

  const obtenerIncidentesPendientes = useCallback(() => {
    return state.incidentes.filter(i => !i.atendido);
  }, [state.incidentes]);

  // Utilidad para obtener todos los traslados
  const todosLosTraslados = useCallback(() => {
    return [
      ...state.trasladosPrimarios,
      ...state.trasladosSecundarios
    ].sort((a, b) => {
      const fechaA = a.tipo === 'primario' ? a.fechaCreacion : a.fechaSolicitud;
      const fechaB = b.tipo === 'primario' ? b.fechaCreacion : b.fechaSolicitud;
      return new Date(fechaB).getTime() - new Date(fechaA).getTime();
    });
  }, [state.trasladosPrimarios, state.trasladosSecundarios]);

  if (!isHydrated) {
    return null; // o un spinner de carga
  }

  return (
    <TrasladosContext.Provider
      value={{
        ...state,
        setRolActual,
        agregarTrasladoPrimario,
        actualizarTrasladoPrimario,
        obtenerTrasladoPrimario,
        agregarTrasladoSecundario,
        actualizarTrasladoSecundario,
        obtenerTrasladoSecundario,
        agregarAmbulancia,
        actualizarAmbulancia,
        obtenerAmbulanciasDisponibles,
        agregarIncidente,
        atenderIncidente,
        obtenerIncidentesPendientes,
        generarId,
        todosLosTraslados
      }}
    >
      {children}
    </TrasladosContext.Provider>
  );
}

export function useTraslados() {
  const context = useContext(TrasladosContext);
  if (context === undefined) {
    throw new Error('useTraslados debe usarse dentro de TrasladosProvider');
  }
  return context;
}

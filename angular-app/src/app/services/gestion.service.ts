import { Injectable, signal, computed } from '@angular/core';
import {
  Gestion,
  Patient,
  Observation,
  AmbulanceTripStatus,
} from '../models/types';
import { mockPatients, mockGestiones } from '../data/mock-data';

@Injectable({ providedIn: 'root' })
export class GestionService {
  readonly patients = signal<Patient[]>(mockPatients);
  readonly gestiones = signal<Gestion[]>(mockGestiones);

  readonly gestionCount = computed(() => this.gestiones().length);

  getGestionesByPatient(patientId: string): Gestion[] {
    return this.gestiones().filter((g) => g.patientId === patientId);
  }

  getGestionById(gestionId: string): Gestion | undefined {
    return this.gestiones().find((g) => g.id === gestionId);
  }

  addGestion(gestion: Gestion): void {
    this.gestiones.update((prev) => [...prev, gestion]);
  }

  updateGestionStatus(gestionId: string, newStatus: string): void {
    this.gestiones.update((prev) =>
      prev.map((g) => (g.id === gestionId ? { ...g, status: newStatus } : g))
    );
  }

  addObservation(gestionId: string, observation: Observation): void {
    this.gestiones.update((prev) =>
      prev.map((g) =>
        g.id === gestionId
          ? { ...g, observations: [...g.observations, observation] }
          : g
      )
    );
  }

  assignDriver(gestionId: string, tripId: string, driver: string): void {
    this.gestiones.update((prev) =>
      prev.map((g) => {
        if (g.id !== gestionId || !g.ambulanceTransfer) return g;
        return {
          ...g,
          ambulanceTransfer: {
            ...g.ambulanceTransfer,
            trips: g.ambulanceTransfer.trips.map((t) =>
              t.id === tripId
                ? { ...t, driver, status: 'ASIGNADO' as const }
                : t
            ),
          },
          status: 'ASIGNADO',
        };
      })
    );
  }

  updateTripStatus(
    gestionId: string,
    tripId: string,
    newStatus: AmbulanceTripStatus
  ): void {
    this.gestiones.update((prev) =>
      prev.map((g) => {
        if (g.id !== gestionId || !g.ambulanceTransfer) return g;

        const updatedTrips = g.ambulanceTransfer.trips.map((t) =>
          t.id === tripId ? { ...t, status: newStatus } : t
        );

        // If trip is finalized and transfer is round trip, check if we need to create return trip
        if (
          newStatus === 'FINALIZADO' &&
          g.ambulanceTransfer.transferType === 'REDONDO'
        ) {
          const currentTrip = g.ambulanceTransfer.trips.find(
            (t) => t.id === tripId
          );
          const maxTripNumber = Math.max(
            ...updatedTrips.map((t) => t.tripNumber)
          );

          // Only create return trip if this is trip 1 and trip 2 doesn't exist
          if (
            currentTrip &&
            currentTrip.tripNumber === 1 &&
            maxTripNumber < 2
          ) {
            updatedTrips.push({
              id: `trip-${Date.now()}`,
              tripNumber: 2,
              status: 'PENDIENTE',
              driver: null,
              origin: g.ambulanceTransfer.destination.place,
              destination: g.ambulanceTransfer.origin.place,
            });
          }
        }

        // Determine overall gestion status based on trips
        const allFinalized = updatedTrips.every(
          (t) => t.status === 'FINALIZADO'
        );
        const anyStarted = updatedTrips.some(
          (t) => t.status === 'INICIADO'
        );
        const anyAssigned = updatedTrips.some(
          (t) => t.status === 'ASIGNADO'
        );
        const anyPending = updatedTrips.some(
          (t) => t.status === 'PENDIENTE'
        );

        let overallStatus = g.status;
        if (allFinalized) overallStatus = 'FINALIZADO';
        else if (anyStarted) overallStatus = 'INICIADO';
        else if (anyAssigned) overallStatus = 'ASIGNADO';
        else if (anyPending) overallStatus = 'PENDIENTE';

        return {
          ...g,
          ambulanceTransfer: {
            ...g.ambulanceTransfer,
            trips: updatedTrips,
          },
          status: overallStatus,
        };
      })
    );
  }
}

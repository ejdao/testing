export function getPriorityBadge(priority: string): string {
  const styles: Record<string, string> = {
    BAJA: 'bg-blue-100 text-blue-800',
    MEDIA: 'bg-amber-100 text-amber-800',
    ALTA: 'bg-orange-100 text-orange-800',
    CRITICA: 'bg-red-100 text-red-100',
  };
  return styles[priority] || 'bg-muted text-muted-foreground';
}

export function getStatusBadge(status: string): string {
  const styles: Record<string, string> = {
    INICIADO: 'bg-blue-100 text-blue-800',
    EN_PROCESO: 'bg-amber-100 text-amber-800',
    FINALIZADO: 'bg-emerald-100 text-emerald-800',
    PENDIENTE: 'bg-slate-100 text-slate-800',
    ASIGNADO: 'bg-indigo-100 text-indigo-800',
  };
  return styles[status] || 'bg-muted text-muted-foreground';
}

export function getDaysColor(days: number): string {
  if (days <= 3) return 'bg-emerald-100 text-emerald-800';
  if (days <= 7) return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
}

export function getDaysOfStay(admissionDate: string): number {
  const admission = new Date(admissionDate);
  const now = new Date();
  const diff = now.getTime() - admission.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

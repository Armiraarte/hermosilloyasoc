export type DossierStatus = 'RECIBIDO' | 'EN_REVISION' | 'EN_PROCESO' | 'RESUELTO' | 'CERRADO';
export type DossierCalendarEventType = 'AUDIENCIA' | 'VENCIMIENTO' | 'CITA' | 'RECORDATORIO';

export interface DossierEvent {
  id: string;
  date: string;
  title: string;
  description: string;
}

export interface DossierCalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: DossierCalendarEventType;
  location?: string;
  isClientVisible: boolean;
}

export interface DossierFile {
  id: string;
  name: string;
  date: string;
  size: number;
  phaseId?: string | null;
  isClientVisible?: boolean;
  url?: string;
}

export interface Dossier {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientAccessCode: string;
  courtNumber: string;
  judicialDistrict: string;
  plaintiff: string;
  defendant: string;
  createdAt: string;
  updatedAt: string;
  status: DossierStatus;
  title: string;
  description: string;
  category: string;
  calendar: DossierCalendarEvent[];
  history: DossierEvent[];
  files: DossierFile[];
}

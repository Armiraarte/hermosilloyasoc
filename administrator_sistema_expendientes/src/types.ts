export type LegalControlStatus =
  | 'AUD_DILIG_PROXIMA'
  | 'ESPERANDO_ACUERDO'
  | 'ESP_REG_PS_AG'
  | 'FINALIZADO'
  | 'ESP_TERMINO'
  | 'ESP_AL_CLIENTE'
  | 'PENDIENTE_SEGUIMIENTO'
  | 'PENDIENTE'
  | 'REALIZADO';
export type DossierStatus = LegalControlStatus;
export type DossierCalendarEventType = 'AUDIENCIA' | 'VENCIMIENTO' | 'CITA' | 'RECORDATORIO';

export interface DossierEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  kind?: 'GENERAL' | 'LEGAL_STATUS' | 'LEGAL_NOTES' | 'LEGAL_CONTROL';
  adminName?: string;
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
  isAvailable?: boolean;
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
  assignedAdminId?: number | null;
  assignedAdminName?: string;
  status: DossierStatus;
  legalStatus: LegalControlStatus;
  pendingNotes: string;
  title: string;
  description: string;
  category: string;
  calendar: DossierCalendarEvent[];
  history: DossierEvent[];
  files: DossierFile[];
}

export interface AdminMember {
  id: number;
  username: string;
  name: string;
  type: string;
  active: boolean;
  showInLegalTeam: boolean;
  legalTeamOrder: number;
  createdAt: string;
}

export interface LegalTeamStatus {
  id: number;
  key: string;
  name: string;
  colorHex: string;
  order: number;
  isCompleted: boolean;
}

export interface LegalTeamActivity {
  id: number;
  reference: string;
  title: string;
  memberId: number | null;
  memberName: string;
  statusId: number;
  statusName: string;
  statusColorHex: string;
  isCompleted: boolean;
  entryDate: string;
  dueDate: string;
  note: string;
  progressCount: number;
  lastProgressAt: string;
  linkedDossierCode?: string;
}

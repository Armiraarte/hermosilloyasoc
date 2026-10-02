/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  FileText,
  Lock,
  LogOut,
  Mail,
  Menu,
  Phone,
  Plus,
  Search,
  Settings2,
  Share2,
  Send,
  Trash2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { AdminMembersPanel } from './components/AdminMembersPanel';
import { LegalControlBoard } from './components/LegalControlBoard';
import { StatusBadge } from './components/StatusBadge';
import { mockDossiers } from './data';
import {
  addCalendarEventInApi,
  addHistoryEventInApi,
  createDossierInApi,
  deleteCalendarEventInApi,
  deleteDossierInApi,
  deleteHistoryEventInApi,
  fetchDossierFromApi,
  listDossiersFromApi,
  loginAdminInApi,
  logoutAdminInApi,
  shouldUsePhpApi,
  updateDossierInApi,
  updateDossierLegalControlInApi,
  uploadDossierFilesInApi,
} from './services/dossiersApi';
import {
  buildDossierShareMailtoLink,
  buildDossierShareMessage,
  buildDossierShareSubject,
  buildDossierShareWhatsAppLink,
  createDossierSharePdf,
  downloadDossierSharePdf,
} from './services/dossierShare';
import { defaultDossierStatus, dossierStatusOptions, legalStatusLabelMap, resolvedDossierStatuses } from './legalStatusConfig';
import { Dossier, DossierCalendarEvent, DossierCalendarEventType, DossierFile, DossierStatus } from './types';
import { formatDate, formatFileSize } from './utils';

const BRAND_WORDMARK_DARK = `${import.meta.env.BASE_URL}branding/HA-ABOGADOS-BLANCO-Y-NEGRO.png`;
const dossierStatusCountSeed = Object.fromEntries(
  dossierStatusOptions.map((option) => [option.value, 0])
) as Record<DossierStatus, number>;

const dossierCalendarTypeOptions: Array<{ value: DossierCalendarEventType; label: string }> = [
  { value: 'AUDIENCIA', label: 'Audiencia' },
  { value: 'VENCIMIENTO', label: 'Vencimiento' },
  { value: 'CITA', label: 'Cita' },
  { value: 'RECORDATORIO', label: 'Recordatorio' },
];

const calendarWeekdayLabels = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
const CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const DOSSIER_CODE_LENGTH = 10;
const ACCESS_CODE_LENGTH = 7;

type AdminSection = 'panel' | 'expedientes' | 'juridico' | 'calendario' | 'ajustes';
type DossierFormMode = 'create' | 'edit';
type DossierOpenOrigin = 'expedientes' | 'juridico';

type CalendarFormState = {
  title: string;
  description: string;
  date: string;
  type: DossierCalendarEventType;
  location: string;
  isClientVisible: boolean;
};

type HistoryFormState = {
  title: string;
  description: string;
  date: string;
  file: File | null;
  isClientVisible: boolean;
};

type UploadFormState = {
  file: File | null;
  isClientVisible: boolean;
};

type CodesFormState = {
  dossierCode: string;
  clientAccessCode: string;
};

type AgendaEntry = {
  dossierId: string;
  dossierTitle: string;
  clientName: string;
  entry: DossierCalendarEvent;
};

type HistoryTimelineEntry = {
  dossierId: string;
  dossierTitle: string;
  clientName: string;
  event: Dossier['history'][number];
};

type CalendarGridDay = {
  date: Date;
  key: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  entries: AgendaEntry[];
};

const sidebarItems: Array<{
  id: AdminSection;
  label: string;
  hint: string;
  icon: typeof Building2;
  adminOnly?: boolean;
}> = [
  { id: 'panel', label: 'Panel', hint: 'Vision general', icon: Building2 },
  { id: 'expedientes', label: 'Expedientes', hint: 'Registro y seguimiento', icon: Briefcase },
  { id: 'juridico', label: 'Juridico', hint: 'Control y seguimiento legal', icon: FileText },
  { id: 'calendario', label: 'Calendario', hint: 'Cuadricula mensual', icon: Calendar },
  { id: 'ajustes', label: 'Ajustes', hint: 'Configuracion base', icon: Settings2, adminOnly: true },
];

const kpiTone = [
  {
    accent: 'from-[#2563eb] via-[#38bdf8] to-[#60a5fa]',
    background: 'bg-[linear-gradient(135deg,rgba(239,246,255,0.96),rgba(224,242,254,0.9))]',
    border: 'border-[#bfdbfe]',
    text: 'text-[#1d4ed8]',
    glow: 'bg-[#60a5fa]/35',
    track: 'bg-[#dbeafe]',
    live: 'bg-[#2563eb]',
    shadow: 'shadow-[0_0_28px_rgba(37,99,235,0.26)]',
    icon: Briefcase,
  },
  {
    accent: 'from-[#059669] via-[#10b981] to-[#34d399]',
    background: 'bg-[linear-gradient(135deg,rgba(236,253,245,0.96),rgba(209,250,229,0.9))]',
    border: 'border-[#a7f3d0]',
    text: 'text-[#047857]',
    glow: 'bg-[#34d399]/35',
    track: 'bg-[#d1fae5]',
    live: 'bg-[#059669]',
    shadow: 'shadow-[0_0_28px_rgba(5,150,105,0.24)]',
    icon: Clock,
  },
  {
    accent: 'from-[#f59e0b] via-[#f97316] to-[#fb7185]',
    background: 'bg-[linear-gradient(135deg,rgba(255,251,235,0.98),rgba(255,237,213,0.92))]',
    border: 'border-[#fed7aa]',
    text: 'text-[#c2410c]',
    glow: 'bg-[#fb923c]/35',
    track: 'bg-[#ffedd5]',
    live: 'bg-[#ea580c]',
    shadow: 'shadow-[0_0_28px_rgba(249,115,22,0.24)]',
    icon: Calendar,
  },
  {
    accent: 'from-[#7c3aed] via-[#a855f7] to-[#ec4899]',
    background: 'bg-[linear-gradient(135deg,rgba(250,245,255,0.98),rgba(245,243,255,0.92))]',
    border: 'border-[#ddd6fe]',
    text: 'text-[#7c3aed]',
    glow: 'bg-[#c084fc]/35',
    track: 'bg-[#ede9fe]',
    live: 'bg-[#a855f7]',
    shadow: 'shadow-[0_0_28px_rgba(168,85,247,0.24)]',
    icon: FileText,
  },
];

const createEmptyCalendarFormState = (): CalendarFormState => ({
  title: '',
  description: '',
  date: '',
  type: 'AUDIENCIA',
  location: '',
  isClientVisible: true,
});

const createEmptyHistoryFormState = (): HistoryFormState => ({
  title: '',
  description: '',
  date: '',
  file: null,
  isClientVisible: true,
});

const createEmptyUploadFormState = (): UploadFormState => ({
  file: null,
  isClientVisible: true,
});

const createEmptyNewCaseState = (): Partial<Dossier> => ({
  clientName: '',
  clientPhone: '',
  clientEmail: '',
  courtNumber: '',
  judicialDistrict: '',
  plaintiff: '',
  defendant: '',
  title: '',
  description: '',
  category: '',
  status: defaultDossierStatus,
});

const createNewCaseStateFromDossier = (dossier: Dossier): Partial<Dossier> => ({
  clientName: dossier.clientName,
  clientPhone: dossier.clientPhone,
  clientEmail: dossier.clientEmail,
  courtNumber: dossier.courtNumber,
  judicialDistrict: dossier.judicialDistrict,
  plaintiff: dossier.plaintiff,
  defendant: dossier.defendant,
  title: dossier.title,
  description: dossier.description,
  category: dossier.category,
  status: dossier.status,
});

const createEmptyCodesFormState = (): CodesFormState => ({
  dossierCode: '',
  clientAccessCode: '',
});

const createCodesFormStateFromDossier = (dossier: Dossier): CodesFormState => ({
  dossierCode: dossier.id,
  clientAccessCode: dossier.clientAccessCode,
});

const toDateKey = (value: string | Date) => {
  const date = typeof value === 'string' ? new Date(value) : value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const normalizeAsciiToken = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

const alphaNumericToken = (value: string) => normalizeAsciiToken(value).replace(/[^A-Z0-9]+/g, '');

const capitalizeLabel = (value: string) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value);

const formatCalendarTime = (value: string) =>
  new Date(value).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });

const formatCalendarDayTitle = (value: Date) =>
  capitalizeLabel(
    value.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  );

const formatCalendarDayMeta = (value: Date) =>
  capitalizeLabel(
    value.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  );

const normalizeAdminType = (value: string) => alphaNumericToken(value);

const formatAdminType = (value: string) => {
  const normalized = normalizeAdminType(value);

  if (!normalized) {
    return 'Sin tipo';
  }

  if (normalized === 'ADMIN' || normalized === 'ADMINISTRADOR' || normalized === 'SUPERADMIN') {
    return 'Administrador';
  }

  return value
    .trim()
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const isAdminOnlySection = (section: AdminSection) => section === 'ajustes';

const canAccessSection = (section: AdminSection, isAdminUser: boolean) => !isAdminOnlySection(section) || isAdminUser;

const buildCodeToken = (value: string, length: number, fallback: string) => {
  const token = alphaNumericToken(value) || fallback;
  return token.padEnd(length, fallback).slice(0, length);
};

const buildInitialsToken = (value: string, length: number, fallback: string) => {
  const parts = normalizeAsciiToken(value).match(/[A-Z0-9]+/g) ?? [];
  let token = parts.map((part) => part[0] ?? '').join('').slice(0, length);

  if (!token && parts[0]) {
    token = parts[0].slice(0, length);
  }

  return (token || fallback).padEnd(length, fallback).slice(0, length);
};

const generateRandomCodeValue = (length: number) => {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.getRandomValues === 'function') {
    const buffer = new Uint32Array(length);
    globalThis.crypto.getRandomValues(buffer);
    return Array.from(buffer, (value) => CODE_ALPHABET[value % CODE_ALPHABET.length]).join('');
  }

  return Array.from({ length }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join('');
};

const generateUniqueLocalCode = (existingCodes: string[], length: number) => {
  const takenCodes = new Set(existingCodes.map((code) => code.trim().toUpperCase()).filter(Boolean));

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const candidate = generateRandomCodeValue(length);
    if (!takenCodes.has(candidate)) {
      return candidate;
    }
  }

  throw new Error('No se pudo generar un codigo unico para el expediente.');
};

const generateLocalDossierCode = (_draft: Partial<Dossier>, existingDossiers: Dossier[], excludeCode?: string) =>
  generateUniqueLocalCode(
    existingDossiers
      .filter((dossier) => dossier.id !== excludeCode)
      .map((dossier) => dossier.id),
    DOSSIER_CODE_LENGTH
  );

const generateLocalAccessCode = (_draft: Partial<Dossier>, existingDossiers: Dossier[], excludeCode?: string) =>
  generateUniqueLocalCode(
    existingDossiers
      .filter((dossier) => dossier.id !== excludeCode)
      .map((dossier) => dossier.clientAccessCode),
    ACCESS_CODE_LENGTH
  );

const sortCalendarEntries = (entries: DossierCalendarEvent[]) =>
  [...entries].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());

const sortHistoryEntriesAscending = (entries: Dossier['history']) =>
  [...entries].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());

const sortHistoryEntriesDescending = (entries: Dossier['history']) =>
  [...entries].sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Ocurrio un error inesperado.';

const isAbortError = (error: unknown) => error instanceof Error && error.name === 'AbortError';

const normalizeTrimmedString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const normalizeSearchText = (value: unknown) =>
  normalizeTrimmedString(String(value ?? ''))
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const revokeBrowserFileUrl = (url?: string) => {
  if (typeof url === 'string' && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

const copyTextToClipboard = async (text: string) => {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

const isOpenStatus = (status: DossierStatus) => !resolvedDossierStatuses.has(status);

const getCalendarTypeLabel = (type: DossierCalendarEventType) =>
  dossierCalendarTypeOptions.find((option) => option.value === type)?.label ?? type;

const getCalendarTone = (type: DossierCalendarEventType) => {
  const map: Record<DossierCalendarEventType, string> = {
    AUDIENCIA: 'border-[#d4d4d8] bg-[#f4f4f5] text-[#111111]',
    VENCIMIENTO: 'border-[#d4d4d8] bg-[#f5f5f5] text-[#52525b]',
    CITA: 'border-[#d4d4d8] bg-[#fafafa] text-[#3f3f46]',
    RECORDATORIO: 'border-[#d4d4d8] bg-[#fafafa] text-[#27272a]',
  };

  return map[type];
};

const getNextEvent = (dossier: Dossier) => {
  const now = Date.now();
  const sorted = sortCalendarEntries(dossier.calendar);
  return sorted.find((entry) => new Date(entry.date).getTime() >= now) ?? sorted[0] ?? null;
};

const buildAgendaEntries = (dossiers: Dossier[]) => {
  const entries: AgendaEntry[] = [];

  dossiers.forEach((dossier) => {
    dossier.calendar.forEach((entry) => {
      entries.push({
        dossierId: dossier.id,
        dossierTitle: dossier.title,
        clientName: dossier.clientName,
        entry,
      });
    });
  });

  return entries
    .sort((left, right) => new Date(left.entry.date).getTime() - new Date(right.entry.date).getTime())
    .slice(0, 8);
};

const buildHistoryTimeline = (dossiers: Dossier[]) => {
  const entries: HistoryTimelineEntry[] = [];

  dossiers.forEach((dossier) => {
    dossier.history.forEach((event) => {
      entries.push({
        dossierId: dossier.id,
        dossierTitle: dossier.title,
        clientName: dossier.clientName,
        event,
      });
    });
  });

  return entries
    .sort((left, right) => new Date(right.event.date).getTime() - new Date(left.event.date).getTime())
    .slice(0, 10);
};

const buildCalendarGridDays = (monthDate: Date, dossiers: Dossier[]): CalendarGridDay[] => {
  const firstDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const lastDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const gridStart = new Date(firstDayOfMonth);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());
  const gridEnd = new Date(lastDayOfMonth);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

  const entriesByDay = new Map<string, AgendaEntry[]>();

  dossiers.forEach((dossier) => {
    dossier.calendar.forEach((entry) => {
      const key = toDateKey(entry.date);
      const dayEntries = entriesByDay.get(key) ?? [];
      dayEntries.push({
        dossierId: dossier.id,
        dossierTitle: dossier.title,
        clientName: dossier.clientName,
        entry,
      });
      entriesByDay.set(key, dayEntries);
    });
  });

  const todayKey = toDateKey(new Date());
  const days: CalendarGridDay[] = [];

  const cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    const key = toDateKey(cursor);
    days.push({
      date: new Date(cursor),
      key,
      isCurrentMonth: cursor.getMonth() === monthDate.getMonth(),
      isToday: key === todayKey,
      entries: (entriesByDay.get(key) ?? []).sort(
        (left, right) => new Date(left.entry.date).getTime() - new Date(right.entry.date).getTime()
      ),
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
};

const inputClassName =
  'w-full rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#18181b] focus:ring-2 focus:ring-[#e4e4e7]';

const surfaceClassName =
  'rounded-[28px] border border-[#d4d4d8] bg-white/90 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur';

export default function App() {
  const phpApiEnabled = shouldUsePhpApi();
  const [dossiers, setDossiers] = useState<Dossier[]>(phpApiEnabled ? [] : mockDossiers);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoadingDossiers, setIsLoadingDossiers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<AdminSection>('panel');
  const [adminCalendarMonth, setAdminCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminDisplayName, setAdminDisplayName] = useState('Administrador');
  const [currentAdminId, setCurrentAdminId] = useState<number | null>(null);
  const [adminType, setAdminType] = useState('');
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  const [selectedDossier, setSelectedDossier] = useState<Dossier | null>(null);
  const [selectedDossierOrigin, setSelectedDossierOrigin] = useState<DossierOpenOrigin>('expedientes');
  const [showNewCaseForm, setShowNewCaseForm] = useState(false);
  const [dossierFormMode, setDossierFormMode] = useState<DossierFormMode>('create');
  const [newCase, setNewCase] = useState<Partial<Dossier>>(createEmptyNewCaseState());
  const [showCalendarForm, setShowCalendarForm] = useState(false);
  const [calendarForm, setCalendarForm] = useState<CalendarFormState>(createEmptyCalendarFormState());
  const [showHistoryForm, setShowHistoryForm] = useState(false);
  const [historyForm, setHistoryForm] = useState<HistoryFormState>(createEmptyHistoryFormState());
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadForm, setUploadForm] = useState<UploadFormState>(createEmptyUploadFormState());
  const [showCodesForm, setShowCodesForm] = useState(false);
  const [codesForm, setCodesForm] = useState<CodesFormState>(createEmptyCodesFormState());
  const [codesMessage, setCodesMessage] = useState('');
  const [shareDossier, setShareDossier] = useState<Dossier | null>(null);
  const [shareFeedbackMessage, setShareFeedbackMessage] = useState('');
  const [dossierSearch, setDossierSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | DossierStatus>('ALL');
  const [showDossierFiltersPanel, setShowDossierFiltersPanel] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [selectedCalendarDayKey, setSelectedCalendarDayKey] = useState<string | null>(null);
  const [sectionResetKey, setSectionResetKey] = useState(0);
  const normalizedAdminType = normalizeAdminType(adminType);
  const adminTypeLabel = formatAdminType(adminType);
  const isAdminUser =
    normalizedAdminType.includes('ADMIN') || normalizedAdminType === 'OWNER' || normalizedAdminType.includes('SOCIO');
  const visibleSidebarItems = sidebarItems.filter((item) => !item.adminOnly || isAdminUser);

  useEffect(() => {
    document.title = 'Gestor de Expedientes | H&A';
  }, []);

  useEffect(() => {
    if (!isAdminAuthenticated) {
      return;
    }

    let isMounted = true;

    const loadDossiers = async () => {
      setIsLoadingDossiers(true);

      try {
        const liveDossiers = phpApiEnabled ? await listDossiersFromApi() : mockDossiers;

        if (!isMounted) {
          return;
        }

        setDossiers(liveDossiers);
        setSelectedDossier((currentSelection) => {
          if (!currentSelection) {
            return null;
          }

          return liveDossiers.find((dossier) => dossier.id === currentSelection.id) ?? null;
        });
      } catch (error) {
        console.error('No se pudieron cargar los expedientes.', error);
      } finally {
        if (isMounted) {
          setIsLoadingDossiers(false);
        }
      }
    };

    void loadDossiers();

    return () => {
      isMounted = false;
    };
  }, [isAdminAuthenticated, phpApiEnabled]);

  useEffect(() => {
    if (!canAccessSection(activeSection, isAdminUser)) {
      setActiveSection('panel');
    }
  }, [activeSection, isAdminUser]);

  const syncDossierState = (updatedDossier: Dossier, previousDossierId = updatedDossier.id) => {
    setDossiers((current) => {
      const next = [updatedDossier, ...current.filter((item) => item.id !== previousDossierId)];
      return next.sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
    });
    setShareDossier((current) => (current?.id === previousDossierId ? updatedDossier : current));
    setSelectedDossier(updatedDossier);
  };

  const removeDossierState = (dossierId: string) => {
    setDossiers((current) => current.filter((dossier) => dossier.id !== dossierId));
    setSelectedDossier((current) => (current?.id === dossierId ? null : current));
    setShareDossier((current) => (current?.id === dossierId ? null : current));
    setShowCalendarForm(false);
    setShowHistoryForm(false);
    setShowUploadForm(false);
    setShowCodesForm(false);
  };

  const openCodesManager = (dossierToManage?: Dossier, message = '') => {
    const dossier = dossierToManage ?? selectedDossier;
    if (!dossier || !isAdminUser) {
      return;
    }

    setSelectedDossier(dossier);
    setCodesForm(createCodesFormStateFromDossier(dossier));
    setCodesMessage(message);
    setShowCodesForm(true);
    setShowNewCaseForm(false);
    setShowCalendarForm(false);
    setShowHistoryForm(false);
    setShowUploadForm(false);
  };

  const closeCodesManager = () => {
    setShowCodesForm(false);
    setCodesForm(createEmptyCodesFormState());
    setCodesMessage('');
  };

  const resolveShareDossierCandidate = (dossierToShare?: Dossier | null): Dossier | null => {
    const directCandidate = dossierToShare ?? selectedDossier;
    const directCode = normalizeTrimmedString(directCandidate?.id);

    if (directCandidate && directCode) {
      return directCandidate;
    }

    const selectedCode = normalizeTrimmedString(selectedDossier?.id);
    if (selectedDossier && selectedCode) {
      return selectedDossier;
    }

    const directAccessCode = normalizeTrimmedString(directCandidate?.clientAccessCode);
    if (directAccessCode) {
      const byAccessCode = dossiers.find(
        (dossier) => normalizeTrimmedString(dossier.clientAccessCode) === directAccessCode
      );
      if (byAccessCode) {
        return byAccessCode;
      }
    }

    const directTitle = normalizeTrimmedString(directCandidate?.title).toLowerCase();
    const directClientName = normalizeTrimmedString(directCandidate?.clientName).toLowerCase();
    if (directTitle || directClientName) {
      const byIdentity = dossiers.find((dossier) => {
        const sameTitle = normalizeTrimmedString(dossier.title).toLowerCase() === directTitle;
        const sameClient = normalizeTrimmedString(dossier.clientName).toLowerCase() === directClientName;
        return sameTitle && sameClient;
      });
      if (byIdentity) {
        return byIdentity;
      }
    }

    return directCandidate ?? null;
  };

  const openShareManager = (dossierToShare?: Dossier, message = '') => {
    const dossier = resolveShareDossierCandidate(dossierToShare);
    if (!dossier) {
      return;
    }

    setShareDossier(dossier);
    setShareFeedbackMessage(message);
  };

  const closeShareManager = () => {
    setShareDossier(null);
    setShareFeedbackMessage('');
  };

  const closeTransientOverlays = () => {
    setShowNewCaseForm(false);
    setShowCalendarForm(false);
    setShowHistoryForm(false);
    setShowUploadForm(false);
    setShowCodesForm(false);
    setCodesForm(createEmptyCodesFormState());
    setCodesMessage('');
    setShareDossier(null);
    setShareFeedbackMessage('');
    setSelectedCalendarDayKey(null);
    setIsSidebarOpen(false);
  };

  const handleAdminLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginErrorMessage('');
    setIsSubmitting(true);

    try {
      if (phpApiEnabled) {
        const admin = await loginAdminInApi(adminUsername.trim(), adminPassword);
        setAdminDisplayName(admin.name || admin.username || 'Administrador');
        setCurrentAdminId(admin.id);
        setAdminType(admin.type || 'ADMIN');
      } else {
        const normalizedUser = adminUsername.trim().toLowerCase();
        if (normalizedUser !== 'admin' || adminPassword !== 'admin') {
          throw new Error('Credenciales incorrectas.');
        }
        setAdminDisplayName('Administrador General');
        setCurrentAdminId(1);
        setAdminType('ADMIN');
      }

      setIsAdminAuthenticated(true);
      setAdminPassword('');
    } catch (error) {
      setLoginErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      if (phpApiEnabled) {
        await logoutAdminInApi();
      }
    } catch (error) {
      console.error('No se pudo cerrar la sesion.', error);
    } finally {
      setIsAdminAuthenticated(false);
      setAdminUsername('');
      setAdminPassword('');
      setAdminDisplayName('Administrador');
      setCurrentAdminId(null);
      setAdminType('');
      setSelectedDossier(null);
      setSelectedDossierOrigin('expedientes');
      setShowNewCaseForm(false);
      setShowCalendarForm(false);
      setShowHistoryForm(false);
      setShowUploadForm(false);
      closeCodesManager();
      closeShareManager();
      setActiveSection('panel');
      setIsSidebarOpen(false);
    }
  };

  const handleAdminSectionChange = (section: AdminSection) => {
    if (!canAccessSection(section, isAdminUser)) {
      setIsSidebarOpen(false);
      return;
    }

    closeTransientOverlays();
    setActiveSection(section);
  };

  const openDossierDetail = (dossier: Dossier, origin: DossierOpenOrigin = 'expedientes') => {
    setSelectedDossier(dossier);
    setSelectedDossierOrigin(origin);
    setShowNewCaseForm(false);
    setShowCalendarForm(false);
    setShowHistoryForm(false);
    setShowUploadForm(false);
    setShowCodesForm(false);
    setActiveSection('expedientes');
  };

  const toggleDossierDetail = (dossier: Dossier) => {
    const currentSelectedCode = normalizeTrimmedString(selectedDossier?.id);
    const nextSelectedCode = normalizeTrimmedString(dossier.id);

    if (currentSelectedCode && currentSelectedCode === nextSelectedCode) {
      hideSelectedDossier();
      return;
    }

    openDossierDetail(dossier);
  };

  const hideSelectedDossier = () => {
    setSelectedDossier(null);
    setSelectedDossierOrigin('expedientes');
    setShowCalendarForm(false);
    setShowHistoryForm(false);
    setShowUploadForm(false);
    setShowCodesForm(false);
  };

  const returnToJuridicoBoard = () => {
    hideSelectedDossier();
    setActiveSection('juridico');
  };

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) {
        return;
      }

      closeTransientOverlays();
      setSectionResetKey((current) => current + 1);
    };

    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  const resolveShareDossier = async (dossier: Dossier): Promise<Dossier> => {
    const baseDossier = resolveShareDossierCandidate(dossier) ?? dossier;
    const currentDossierCode = normalizeTrimmedString(baseDossier.id);
    const latestDossier =
      phpApiEnabled && currentDossierCode
        ? await fetchDossierFromApi(currentDossierCode).catch(() => null)
        : null;

    const resolvedDossier = {
      ...baseDossier,
      ...(latestDossier ?? {}),
      id: normalizeTrimmedString(latestDossier?.id) || currentDossierCode,
      clientAccessCode:
        normalizeTrimmedString(latestDossier?.clientAccessCode) || normalizeTrimmedString(baseDossier.clientAccessCode),
      clientName: normalizeTrimmedString(latestDossier?.clientName) || normalizeTrimmedString(baseDossier.clientName),
      clientEmail: normalizeTrimmedString(latestDossier?.clientEmail) || normalizeTrimmedString(baseDossier.clientEmail),
      clientPhone: normalizeTrimmedString(latestDossier?.clientPhone) || normalizeTrimmedString(baseDossier.clientPhone),
      title: normalizeTrimmedString(latestDossier?.title) || normalizeTrimmedString(baseDossier.title),
      courtNumber: normalizeTrimmedString(latestDossier?.courtNumber) || normalizeTrimmedString(baseDossier.courtNumber),
      judicialDistrict:
        normalizeTrimmedString(latestDossier?.judicialDistrict) || normalizeTrimmedString(baseDossier.judicialDistrict),
    };

    setShareDossier((current) => {
      if (!current) {
        return current;
      }

      const currentCode = normalizeTrimmedString(current.id);
      const resolvedCode = normalizeTrimmedString(resolvedDossier.id);
      const currentAccessCode = normalizeTrimmedString(current.clientAccessCode);
      const resolvedAccessCode = normalizeTrimmedString(resolvedDossier.clientAccessCode);

      if ((currentCode && currentCode === resolvedCode) || (currentAccessCode && currentAccessCode === resolvedAccessCode)) {
        return resolvedDossier;
      }

      return current;
    });

    return resolvedDossier;
  };

  const prepareSharePdf = async (dossier: Dossier) => {
    const resolvedDossier = await resolveShareDossier(dossier);
    return createDossierSharePdf(resolvedDossier);
  };

  const handleSharePdfDownload = async (dossierToShare?: Dossier) => {
    const dossier = dossierToShare ?? shareDossier;
    if (!dossier) {
      return;
    }

    setIsSubmitting(true);
    setShareFeedbackMessage('');

    try {
      const pdfFile = await prepareSharePdf(dossier);
      downloadDossierSharePdf(pdfFile);
      setShareFeedbackMessage('PDF generado correctamente.');
    } catch (error) {
      setShareFeedbackMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSharePdfNative = async () => {
    if (!shareDossier) {
      return;
    }

    setIsSubmitting(true);
    setShareFeedbackMessage('');

    try {
      const resolvedDossier = await resolveShareDossier(shareDossier);
      const pdfFile = await createDossierSharePdf(resolvedDossier);
      const shareText = buildDossierShareMessage(resolvedDossier);

      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        const canShareFile =
          typeof navigator.canShare !== 'function' || navigator.canShare({ files: [pdfFile] });

        if (canShareFile) {
          await navigator.share({
            files: [pdfFile],
            title: buildDossierShareSubject(resolvedDossier),
            text: shareText,
          });
          setShareFeedbackMessage('PDF compartido correctamente.');
          return;
        }

        await navigator.share({
          title: buildDossierShareSubject(resolvedDossier),
          text: shareText,
        });
        downloadDossierSharePdf(pdfFile);
        setShareFeedbackMessage('Tu navegador compartio el mensaje y descargo el PDF.');
        return;
      }

      downloadDossierSharePdf(pdfFile);
      await copyTextToClipboard(shareText);
      setShareFeedbackMessage('Tu navegador no admite compartir archivos. Se descargo el PDF y se copio el mensaje.');
    } catch (error) {
      if (isAbortError(error)) {
        setShareFeedbackMessage('');
      } else {
        setShareFeedbackMessage(getErrorMessage(error));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareViaEmail = async () => {
    if (!shareDossier) {
      return;
    }

    setIsSubmitting(true);
    setShareFeedbackMessage('');

    try {
      const resolvedDossier = await resolveShareDossier(shareDossier);
      const pdfFile = await createDossierSharePdf(resolvedDossier);
      window.location.href = buildDossierShareMailtoLink(resolvedDossier);
      downloadDossierSharePdf(pdfFile);
      setShareFeedbackMessage('Se preparo el correo y se descargo el PDF para adjuntarlo.');
    } catch (error) {
      setShareFeedbackMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareViaWhatsApp = async () => {
    if (!shareDossier) {
      return;
    }

    setIsSubmitting(true);
    setShareFeedbackMessage('');

    try {
      const resolvedDossier = await resolveShareDossier(shareDossier);
      const pdfFile = await createDossierSharePdf(resolvedDossier);
      window.open(buildDossierShareWhatsAppLink(resolvedDossier), '_blank', 'noopener,noreferrer');
      downloadDossierSharePdf(pdfFile);
      setShareFeedbackMessage('Se abrio WhatsApp y se descargo el PDF para adjuntarlo.');
    } catch (error) {
      setShareFeedbackMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyShareMessage = async () => {
    if (!shareDossier) {
      return;
    }

    try {
      const resolvedDossier = await resolveShareDossier(shareDossier);
      await copyTextToClipboard(buildDossierShareMessage(resolvedDossier));
      setShareFeedbackMessage('Mensaje copiado correctamente.');
    } catch (error) {
      setShareFeedbackMessage(getErrorMessage(error));
    }
  };

  const openCreateDossierForm = (options?: { keepActiveSection?: boolean }) => {
    setNewCase(createEmptyNewCaseState());
    setDossierFormMode('create');
    setShowNewCaseForm(true);
    setShowCalendarForm(false);
    setShowHistoryForm(false);
    setShowCodesForm(false);
    setSelectedDossier(null);

    if (!options?.keepActiveSection) {
      setActiveSection('expedientes');
    }
  };

  const openEditDossierForm = (dossierToEdit?: Dossier, options?: { keepActiveSection?: boolean }) => {
    const dossier = dossierToEdit ?? selectedDossier;
    if (!dossier) {
      return;
    }

    setSelectedDossier(dossier);
    setNewCase(createNewCaseStateFromDossier(dossier));
    setDossierFormMode('edit');
    setShowNewCaseForm(true);
    setShowCalendarForm(false);
    setShowHistoryForm(false);
    setShowCodesForm(false);

    if (!options?.keepActiveSection) {
      setActiveSection('expedientes');
    }
  };

  const closeDossierForm = () => {
    setShowNewCaseForm(false);
    setNewCase(createEmptyNewCaseState());
    setDossierFormMode('create');
  };

  const handleDossierSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const originalDossierId = selectedDossier?.id ?? '';
    const payload = {
      clientName: newCase.clientName || '',
      clientPhone: newCase.clientPhone || '',
      clientEmail: newCase.clientEmail || '',
      courtNumber: newCase.courtNumber || '',
      judicialDistrict: newCase.judicialDistrict || '',
      plaintiff: newCase.plaintiff || '',
      defendant: newCase.defendant || '',
      title: newCase.title || '',
      description: newCase.description || '',
      category: newCase.category || '',
      status: (newCase.status as DossierStatus) || defaultDossierStatus,
    };

    setIsSubmitting(true);

    try {
      if (phpApiEnabled) {
        const savedDossier =
          dossierFormMode === 'edit' && originalDossierId
            ? await updateDossierInApi({
                currentCode: originalDossierId,
                ...payload,
              })
            : await createDossierInApi(payload);

        syncDossierState(savedDossier, dossierFormMode === 'edit' ? originalDossierId : savedDossier.id);

        if (dossierFormMode === 'create') {
          openCodesManager(
            savedDossier,
            'Los codigos se generaron automaticamente de forma unica para este expediente.'
          );
        }
      } else {
        const now = new Date().toISOString();
        const generatedDossierCode =
          dossierFormMode === 'edit' && selectedDossier
            ? selectedDossier.id
            : generateLocalDossierCode(payload, dossiers);
        const generatedAccessCode =
          dossierFormMode === 'edit' && selectedDossier
            ? selectedDossier.clientAccessCode
            : generateLocalAccessCode(payload, dossiers);
        const historyEvent = {
          id: `ev-${Date.now()}`,
          date: now,
          title: dossierFormMode === 'edit' ? 'Expediente actualizado' : 'Expediente creado',
          description:
            dossierFormMode === 'edit'
              ? 'Se ajusto la ficha general del expediente.'
              : 'El expediente fue registrado manualmente.',
        };

        const localDossier: Dossier = {
          id: generatedDossierCode,
          clientName: payload.clientName,
          clientPhone: payload.clientPhone,
          clientEmail: payload.clientEmail || '',
          clientAccessCode: generatedAccessCode,
          courtNumber: payload.courtNumber,
          judicialDistrict: payload.judicialDistrict,
          plaintiff: payload.plaintiff,
          defendant: payload.defendant,
          createdAt: dossierFormMode === 'edit' && selectedDossier ? selectedDossier.createdAt : now,
          updatedAt: now,
          status: payload.status,
          legalStatus: payload.status,
          pendingNotes: dossierFormMode === 'edit' && selectedDossier ? selectedDossier.pendingNotes : '',
          title: payload.title,
          description: payload.description,
          category: payload.category,
          calendar: dossierFormMode === 'edit' && selectedDossier ? selectedDossier.calendar : [],
          history:
            dossierFormMode === 'edit' && selectedDossier
              ? sortHistoryEntriesAscending([...(selectedDossier.history || []), historyEvent])
              : [historyEvent],
          files: dossierFormMode === 'edit' && selectedDossier ? selectedDossier.files : [],
        };

        syncDossierState(localDossier, dossierFormMode === 'edit' ? originalDossierId : localDossier.id);

        if (dossierFormMode === 'create') {
          openCodesManager(
            localDossier,
            'Los codigos se generaron automaticamente de forma unica para este expediente.'
          );
        }
      }

      closeDossierForm();
    } catch (error) {
      window.alert(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLegalControlUpdate = async ({
    dossierCode,
    legalStatus,
    pendingNotes,
  }: {
    dossierCode: string;
    legalStatus?: Dossier['legalStatus'];
    pendingNotes?: string;
  }) => {
    const currentDossier = dossiers.find((dossier) => dossier.id === dossierCode);
    if (!currentDossier) {
      throw new Error('No se encontro el expediente que intentas actualizar.');
    }

    const optimisticDossier: Dossier = {
      ...currentDossier,
      status: legalStatus ?? currentDossier.status,
      legalStatus: legalStatus ?? currentDossier.legalStatus,
      pendingNotes: pendingNotes ?? currentDossier.pendingNotes,
    };

    setDossiers((current) => current.map((dossier) => (dossier.id === dossierCode ? optimisticDossier : dossier)));
    setSelectedDossier((current) => (current?.id === dossierCode ? optimisticDossier : current));
    setShareDossier((current) => (current?.id === dossierCode ? optimisticDossier : current));

    try {
      if (phpApiEnabled) {
        const updatedDossier = await updateDossierLegalControlInApi({
          dossierCode,
          legalStatus,
          pendingNotes,
        });
        syncDossierState(updatedDossier);
        return;
      }

      syncDossierState({
        ...optimisticDossier,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      setDossiers((current) => current.map((dossier) => (dossier.id === dossierCode ? currentDossier : dossier)));
      setSelectedDossier((current) => (current?.id === dossierCode ? currentDossier : current));
      setShareDossier((current) => (current?.id === dossierCode ? currentDossier : current));
      throw error;
    }
  };

  const handleCodesSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedDossier) {
      return;
    }

    setIsSubmitting(true);

    try {
      await copyTextToClipboard(
        `Codigo de expediente: ${codesForm.dossierCode}\nCodigo de acceso: ${codesForm.clientAccessCode}`
      );
      setCodesMessage('Los codigos se copiaron al portapapeles.');
    } catch (error) {
      window.alert(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDossier = async (dossierToDelete?: Dossier) => {
    const dossier = dossierToDelete ?? selectedDossier;
    if (!dossier) {
      return;
    }

    const confirmed = window.confirm(`Se eliminara el expediente ${dossier.id}. Deseas continuar?`);
    if (!confirmed) {
      return;
    }

    try {
      if (phpApiEnabled) {
        await deleteDossierInApi(dossier.id);
      }

      removeDossierState(dossier.id);
    } catch (error) {
      window.alert(getErrorMessage(error));
    }
  };

  const handleDeleteHistoryEvent = async (historyEvent: Dossier['history'][number]) => {
    if (!selectedDossier || !isAdminUser) {
      return;
    }

    const confirmed = window.confirm(
      `Se eliminara el movimiento "${historyEvent.title}" y sus archivos adjuntos. Deseas continuar?`
    );
    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (phpApiEnabled) {
        const updatedDossier = await deleteHistoryEventInApi(selectedDossier.id, historyEvent.id);
        syncDossierState(updatedDossier);
      } else {
        const remainingHistory = selectedDossier.history.filter((entry) => entry.id !== historyEvent.id);
        const removedFiles = selectedDossier.files.filter((file) => file.phaseId === historyEvent.id);
        const remainingFiles = selectedDossier.files.filter((file) => file.phaseId !== historyEvent.id);

        removedFiles.forEach((file) => revokeBrowserFileUrl(file.url));

        syncDossierState({
          ...selectedDossier,
          updatedAt: new Date().toISOString(),
          history: remainingHistory,
          files: remainingFiles,
        });
      }
    } catch (error) {
      window.alert(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCalendarEvent = async (calendarEvent: DossierCalendarEvent) => {
    if (!selectedDossier || !isAdminUser) {
      return;
    }

    const eventLabel = calendarEvent.type === 'AUDIENCIA' ? 'la audiencia' : 'el evento';
    const confirmed = window.confirm(`Se eliminara ${eventLabel} "${calendarEvent.title}". Deseas continuar?`);
    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (phpApiEnabled) {
        const updatedDossier = await deleteCalendarEventInApi(selectedDossier.id, calendarEvent.id);
        syncDossierState(updatedDossier);
      } else {
        syncDossierState({
          ...selectedDossier,
          updatedAt: new Date().toISOString(),
          calendar: selectedDossier.calendar.filter((entry) => entry.id !== calendarEvent.id),
        });
      }
    } catch (error) {
      window.alert(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCalendarSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedDossier || !calendarForm.date.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (phpApiEnabled) {
        const updatedDossier = await addCalendarEventInApi({
          dossierCode: selectedDossier.id,
          title: calendarForm.title.trim(),
          description: calendarForm.description.trim(),
          date: calendarForm.date,
          type: calendarForm.type,
          location: calendarForm.location.trim() || undefined,
          isClientVisible: calendarForm.isClientVisible,
        });

        syncDossierState(updatedDossier);
      } else {
        const calendarEntry: DossierCalendarEvent = {
          id: `cal-${Date.now()}`,
          title: calendarForm.title.trim(),
          description: calendarForm.description.trim(),
          date: new Date(calendarForm.date).toISOString(),
          type: calendarForm.type,
          location: calendarForm.location.trim() || undefined,
          isClientVisible: calendarForm.isClientVisible,
        };

        syncDossierState({
          ...selectedDossier,
          updatedAt: new Date().toISOString(),
          calendar: sortCalendarEntries([...(selectedDossier.calendar || []), calendarEntry]),
        });
      }

      setShowCalendarForm(false);
      setCalendarForm(createEmptyCalendarFormState());
    } catch (error) {
      window.alert(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHistorySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedDossier || !historyForm.title.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (phpApiEnabled) {
        const updatedDossier = await addHistoryEventInApi({
          dossierCode: selectedDossier.id,
          title: historyForm.title.trim(),
          description: historyForm.description.trim(),
          date: historyForm.date || undefined,
          file: historyForm.file,
          isClientVisible: historyForm.isClientVisible,
        });

        syncDossierState(updatedDossier);
      } else {
        const movementDate = historyForm.date ? new Date(historyForm.date).toISOString() : new Date().toISOString();
        const historyEntry = {
          id: `ev-${Date.now()}`,
          date: movementDate,
          title: historyForm.title.trim(),
          description: historyForm.description.trim(),
        };
        const movementFile =
          historyForm.file !== null
            ? {
                id: `file-${Date.now()}`,
                name: historyForm.file.name,
                date: movementDate,
                size: historyForm.file.size,
                phaseId: historyEntry.id,
                isClientVisible: historyForm.isClientVisible,
                url: URL.createObjectURL(historyForm.file),
              }
            : null;

        syncDossierState({
          ...selectedDossier,
          updatedAt: movementDate,
          history: sortHistoryEntriesAscending([...(selectedDossier.history || []), historyEntry]),
          files: movementFile !== null ? [...selectedDossier.files, movementFile] : selectedDossier.files,
        });
      }

      setShowHistoryForm(false);
      setHistoryForm(createEmptyHistoryFormState());
    } catch (error) {
      window.alert(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectFileUploadSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedDossier || !uploadForm.file) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (phpApiEnabled) {
        const updatedDossier = await uploadDossierFilesInApi(
          selectedDossier.id,
          [uploadForm.file],
          null,
          uploadForm.isClientVisible
        );

        syncDossierState(updatedDossier);
      } else {
        const uploadedAt = new Date().toISOString();
        const uploadedFile: DossierFile = {
          id: `file-${Date.now()}`,
          name: uploadForm.file.name,
          date: uploadedAt,
          size: uploadForm.file.size,
          phaseId: null,
          isClientVisible: uploadForm.isClientVisible,
          url: URL.createObjectURL(uploadForm.file),
        };

        syncDossierState({
          ...selectedDossier,
          updatedAt: uploadedAt,
          files: [...selectedDossier.files, uploadedFile],
        });
      }

      setShowUploadForm(false);
      setUploadForm(createEmptyUploadFormState());
    } catch (error) {
      window.alert(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const normalizedDossierSearch = normalizeSearchText(dossierSearch);
  const dossierStatusCounts = dossiers.reduce<Record<'ALL' | DossierStatus, number>>(
    (counts, dossier) => {
      counts.ALL += 1;
      counts[dossier.status] += 1;
      return counts;
    },
    {
      ALL: 0,
      ...dossierStatusCountSeed,
    }
  );
  const dossierFilterOptions: Array<{ value: 'ALL' | DossierStatus; label: string; count: number }> = [
    { value: 'ALL', label: 'Todos', count: dossierStatusCounts.ALL },
    ...dossierStatusOptions.map((option) => ({
      value: option.value,
      label: option.label,
      count: dossierStatusCounts[option.value],
    })),
  ];
  const hasDossierFilters = normalizedDossierSearch.length > 0 || statusFilter !== 'ALL';
  const activeDossierStatusLabel =
    statusFilter === 'ALL'
      ? 'Todos los expedientes'
      : dossierStatusOptions.find((option) => option.value === statusFilter)?.label ?? statusFilter;

  const filteredDossiers = dossiers
    .filter((dossier) => {
      if (statusFilter !== 'ALL' && dossier.status !== statusFilter) {
        return false;
      }

      if (!normalizedDossierSearch) {
        return true;
      }

      const haystack = normalizeSearchText([
        dossier.id,
        dossier.title,
        dossier.description,
        dossier.clientName,
        dossier.clientPhone,
        dossier.clientEmail,
        dossier.clientAccessCode,
        dossier.category,
        dossier.courtNumber,
        dossier.judicialDistrict,
        dossier.plaintiff,
        dossier.defendant,
        dossier.status,
        legalStatusLabelMap.get(dossier.status) ?? dossier.status,
        ...dossier.history.flatMap((entry) => [entry.title, entry.description, entry.date]),
        ...dossier.calendar.flatMap((entry) => [entry.title, entry.description, entry.location ?? '', entry.type, entry.date]),
        ...dossier.files.flatMap((file) => [file.name, file.phaseId ?? '', file.url ?? '']),
      ].join(' '));

      return haystack.includes(normalizedDossierSearch);
    })
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());

  const compactKpis = [
    { label: 'Total expedientes', value: String(dossiers.length), helper: 'Base general' },
    {
      label: 'Activos',
      value: String(dossiers.filter((dossier) => isOpenStatus(dossier.status)).length),
      helper: 'Seguimiento abierto',
    },
    { label: 'Proximas fechas', value: String(buildAgendaEntries(dossiers).length), helper: 'Agenda inmediata' },
    {
      label: 'Archivos',
      value: String(dossiers.reduce((total, dossier) => total + dossier.files.length, 0)),
      helper: 'Documentos cargados',
    },
  ];

  const agendaEntries = buildAgendaEntries(dossiers);
  const historyTimeline = buildHistoryTimeline(dossiers);
  const juridicoActiveCount = dossiers.filter((dossier) => !['FINALIZADO', 'REALIZADO'].includes(dossier.legalStatus)).length;
  const sidebarMeta: Record<
    AdminSection,
    {
      badge: string;
      liveLabel: string;
      accent: string;
      iconBg: string;
      iconText: string;
      dot: string;
      halo: string;
    }
  > = {
    panel: {
      badge: `${compactKpis.length} KPI`,
      liveLabel: 'Vision general',
      accent: 'from-sky-500/16 via-sky-400/10 to-transparent',
      iconBg: 'bg-sky-400/14',
      iconText: 'text-sky-200',
      dot: 'bg-sky-400',
      halo: 'shadow-[0_0_24px_rgba(56,189,248,0.28)]',
    },
    expedientes: {
      badge: String(dossiers.length),
      liveLabel: 'Expedientes cargados',
      accent: 'from-emerald-500/16 via-emerald-400/10 to-transparent',
      iconBg: 'bg-emerald-400/14',
      iconText: 'text-emerald-200',
      dot: 'bg-emerald-400',
      halo: 'shadow-[0_0_24px_rgba(52,211,153,0.24)]',
    },
    juridico: {
      badge: String(juridicoActiveCount),
      liveLabel: 'Seguimiento juridico',
      accent: 'from-fuchsia-500/16 via-pink-400/10 to-transparent',
      iconBg: 'bg-fuchsia-400/14',
      iconText: 'text-fuchsia-200',
      dot: 'bg-fuchsia-400',
      halo: 'shadow-[0_0_24px_rgba(232,121,249,0.24)]',
    },
    calendario: {
      badge: String(agendaEntries.length),
      liveLabel: 'Eventos programados',
      accent: 'from-amber-500/16 via-orange-400/10 to-transparent',
      iconBg: 'bg-amber-400/14',
      iconText: 'text-amber-200',
      dot: 'bg-amber-300',
      halo: 'shadow-[0_0_24px_rgba(251,191,36,0.24)]',
    },
    ajustes: {
      badge: isAdminUser ? 'Admin' : '',
      liveLabel: 'Control interno',
      accent: 'from-slate-400/14 via-slate-300/8 to-transparent',
      iconBg: 'bg-slate-300/12',
      iconText: 'text-slate-100',
      dot: 'bg-slate-300',
      halo: 'shadow-[0_0_20px_rgba(228,228,231,0.18)]',
    },
  };
  const calendarGridDays = buildCalendarGridDays(adminCalendarMonth, dossiers);
  const selectedCalendarDay = selectedCalendarDayKey
    ? calendarGridDays.find((day) => day.key === selectedCalendarDayKey) ?? null
    : null;
  const selectedDossierHistory = selectedDossier ? sortHistoryEntriesDescending(selectedDossier.history) : [];
  const selectedDossierCalendar = selectedDossier ? sortCalendarEntries(selectedDossier.calendar) : [];
  const selectedDossierHistoryById = new Map<string, Dossier['history'][number]>(
    (selectedDossier?.history ?? []).map((entry) => [entry.id, entry])
  );
  const selectedDossierFilesByPhaseId = new Map<string, DossierFile[]>();
  (selectedDossier?.files ?? []).forEach((file) => {
    if (!file.phaseId) {
      return;
    }

    const currentFiles = selectedDossierFilesByPhaseId.get(file.phaseId) ?? [];
    currentFiles.push(file);
    selectedDossierFilesByPhaseId.set(file.phaseId, currentFiles);
  });
  const selectedDossierNextEvent = selectedDossier ? getNextEvent(selectedDossier) : null;
  const showSelectedDossierPane = selectedDossier !== null;
  const adminCalendarMonthLabel = adminCalendarMonth.toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric',
  });

  const renderSectionHeader = (title: string, subtitle: string, action?: React.ReactNode) => (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#71717a]">Gestor administrativo</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">{subtitle}</p>
      </div>
      {action}
    </div>
  );

  const resetDossierFilters = () => {
    setDossierSearch('');
    setStatusFilter('ALL');
    setShowDossierFiltersPanel(false);
  };

  const getFileVisibilityLabel = (file: DossierFile) => (file.isClientVisible === false ? 'Solo admin' : 'Cliente + admin');

  const renderCompactKpiGrid = () => (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {compactKpis.map((item, index) => {
        const tone = kpiTone[index % kpiTone.length];
        const Icon = tone.icon;

        return (
          <div
            key={item.label}
            className={`${surfaceClassName} relative overflow-hidden border ${tone.border} px-4 py-4`}
          >
            <motion.div
              aria-hidden="true"
              className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl ${tone.glow}`}
              animate={{ opacity: [0.14, 0.3, 0.16], scale: [0.92, 1.08, 0.96] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.18 }}
            />

            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{item.value}</p>
                <p className="mt-1 text-xs text-slate-500">{item.helper}</p>

                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  <motion.span
                    className={`h-2 w-2 rounded-full ${tone.live} ${tone.shadow}`}
                    animate={{ opacity: [0.45, 1, 0.45], scale: [1, 1.22, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: index * 0.12 }}
                  />
                  En linea
                </div>
              </div>

              <div
                className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${tone.border} ${tone.background}`}
              >
                <motion.div
                  aria-hidden="true"
                  className={`absolute inset-2 rounded-xl blur-xl ${tone.glow}`}
                  animate={{ opacity: [0.15, 0.35, 0.18] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: index * 0.16 }}
                />
                <motion.div
                  animate={{ scale: [1, 1.06, 1], y: [0, -1.5, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.1 }}
                >
                  <Icon className={`h-5 w-5 ${tone.text}`} />
                </motion.div>
              </div>
            </div>

            <div className={`relative mt-4 h-1.5 overflow-hidden rounded-full ${tone.track}`}>
              <motion.div
                aria-hidden="true"
                className={`absolute inset-y-0 left-0 w-[38%] rounded-full bg-gradient-to-r ${tone.accent}`}
                animate={{ x: ['-20%', '170%'] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: index * 0.14 }}
              />
              <motion.div
                aria-hidden="true"
                className="absolute inset-y-0 left-[-40%] w-[40%] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.88),transparent)]"
                animate={{ x: ['0%', '360%'] }}
                transition={{ duration: 2.1, repeat: Infinity, ease: 'linear', delay: index * 0.12 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderFileCard = (file: DossierFile, relationLabel?: string) => (
    <div key={file.id} className="rounded-2xl border border-[#e4e4e7] bg-[#ffffff] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{file.name}</p>
          <p className="mt-1 text-xs text-slate-500">{formatFileSize(file.size)} · {formatDate(file.date)}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              {getFileVisibilityLabel(file)}
            </span>
            <span className="rounded-full bg-[#e4e4e7] px-2.5 py-1 text-[11px] font-semibold text-[#52525b]">
              {relationLabel ?? 'Documento general'}
            </span>
            {file.isAvailable === false ? (
              <span className="rounded-full bg-[#fff4f4] px-2.5 py-1 text-[11px] font-semibold text-[#a33a3a]">
                Archivo no disponible
              </span>
            ) : null}
          </div>
          {file.isAvailable === false ? (
            <p className="mt-2 text-xs text-[#a33a3a]">
              Este archivo ya no existe en el servidor. Conviene volver a cargarlo.
            </p>
          ) : null}
        </div>
        {file.url ? (
          <div className="flex flex-wrap gap-2">
            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-[#d4d4d8] bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#111111] hover:text-[#111111]"
              title="Abrir archivo"
            >
              Abrir
            </a>
            <a
              href={file.url}
              download={file.name}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d4d4d8] bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#18181b] hover:text-[#52525b]"
              title="Descargar archivo"
            >
              <Download className="h-4 w-4" />
              Descargar
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );

  const renderHistoryAttachment = (file: DossierFile) => (
    <div key={file.id} className="mt-4 rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Archivo adjunto</p>
          <p className="mt-2 truncate text-sm font-semibold text-slate-900">{file.name}</p>
          <p className="mt-1 text-xs text-slate-500">{formatFileSize(file.size)} · {formatDate(file.date)}</p>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#52525b]">
            {getFileVisibilityLabel(file)}
          </p>
          {file.isAvailable === false ? (
            <p className="mt-2 text-xs text-[#a33a3a]">
              El archivo adjunto ya no existe en el servidor. Necesita volver a cargarse.
            </p>
          ) : null}
        </div>
        {file.url ? (
          <div className="flex flex-wrap gap-2">
            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-[#d4d4d8] bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#111111] hover:text-[#111111]"
              title="Abrir archivo adjunto"
            >
              Abrir
            </a>
            <a
              href={file.url}
              download={file.name}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d4d4d8] bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#18181b] hover:text-[#52525b]"
              title="Descargar archivo adjunto"
            >
              <Download className="h-4 w-4" />
              Descargar
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );

  const renderDossierForm = () => {
    if (!showNewCaseForm) {
      return null;
    }

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto px-4 py-8">
        <button
          type="button"
          aria-label="Cerrar modal de expediente"
          onClick={closeDossierForm}
          className="fixed inset-0 bg-[#121a27]/45"
        />

        <div className="relative z-10 mx-auto w-full max-w-4xl">
          <div className={`${surfaceClassName} p-6 sm:p-8`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#71717a]">
                  {dossierFormMode === 'edit' ? 'Editar expediente' : 'Nuevo expediente'}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                  {dossierFormMode === 'edit' ? 'Actualizar informacion del expediente' : 'Registrar expediente'}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeDossierForm}
                className="ui-btn ui-btn-neutral rounded-2xl border border-[#d4d4d8] bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#18181b] hover:text-[#52525b]"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleDossierSubmit} className="mt-6 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Estatus</label>
                  <select
                    value={newCase.status || defaultDossierStatus}
                    onChange={(event) => setNewCase((current) => ({ ...current, status: event.target.value as DossierStatus }))}
                    className={inputClassName}
                  >
                    {dossierStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Titulo del expediente</label>
                  <input
                    type="text"
                    value={newCase.title || ''}
                    onChange={(event) => setNewCase((current) => ({ ...current, title: event.target.value }))}
                    className={inputClassName}
                    placeholder="Juicio mercantil..."
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Cliente</label>
                  <input
                    type="text"
                    value={newCase.clientName || ''}
                    onChange={(event) => setNewCase((current) => ({ ...current, clientName: event.target.value }))}
                    className={inputClassName}
                    placeholder="Nombre del cliente"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Telefono</label>
                  <input
                    type="text"
                    value={newCase.clientPhone || ''}
                    onChange={(event) => setNewCase((current) => ({ ...current, clientPhone: event.target.value }))}
                    className={inputClassName}
                    placeholder="662..."
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Correo</label>
                  <input
                    type="email"
                    value={newCase.clientEmail || ''}
                    onChange={(event) => setNewCase((current) => ({ ...current, clientEmail: event.target.value }))}
                    className={inputClassName}
                    placeholder="correo@cliente.com"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Numero de juzgado</label>
                  <input
                    type="text"
                    value={newCase.courtNumber || ''}
                    onChange={(event) => setNewCase((current) => ({ ...current, courtNumber: event.target.value }))}
                    className={inputClassName}
                    placeholder="Juzgado Primero"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Distrito judicial</label>
                  <input
                    type="text"
                    value={newCase.judicialDistrict || ''}
                    onChange={(event) => setNewCase((current) => ({ ...current, judicialDistrict: event.target.value }))}
                    className={inputClassName}
                    placeholder="Hermosillo"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Actor</label>
                  <input
                    type="text"
                    value={newCase.plaintiff || ''}
                    onChange={(event) => setNewCase((current) => ({ ...current, plaintiff: event.target.value }))}
                    className={inputClassName}
                    placeholder="Parte actora"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Demandado</label>
                  <input
                    type="text"
                    value={newCase.defendant || ''}
                    onChange={(event) => setNewCase((current) => ({ ...current, defendant: event.target.value }))}
                    className={inputClassName}
                    placeholder="Parte demandada"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Categoria</label>
                  <input
                    type="text"
                    value={newCase.category || ''}
                    onChange={(event) => setNewCase((current) => ({ ...current, category: event.target.value }))}
                    className={inputClassName}
                    placeholder="Civil, mercantil, laboral..."
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Descripcion</label>
                  <textarea
                    value={newCase.description || ''}
                    onChange={(event) => setNewCase((current) => ({ ...current, description: event.target.value }))}
                    className={`${inputClassName} min-h-[120px] resize-y`}
                    placeholder="Describe el contexto y el estado actual del expediente."
                    required
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-[#e4e4e7] bg-[#ffffff] px-5 py-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Codigos fuera del formulario principal</p>
                <p className="mt-1 leading-6">
                  El codigo de expediente y el codigo de acceso se generan automaticamente de forma unica y segura.
                  Al guardar, podras revisarlos y administrarlos desde un modal independiente.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeDossierForm}
                  className="ui-btn ui-btn-neutral rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-[#18181b] hover:text-[#52525b]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`ui-btn ${dossierFormMode === 'edit' ? 'ui-btn-primary' : 'ui-btn-add'} inline-flex items-center rounded-2xl bg-[#121a27] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#223047] disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {dossierFormMode === 'edit' ? 'Guardar cambios' : 'Crear expediente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const renderCodesManager = () => {
    if (!showCodesForm || !selectedDossier) {
      return null;
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
        <button
          type="button"
          aria-label="Cerrar modal de codigos"
          onClick={closeCodesManager}
          className="absolute inset-0 bg-[#121a27]/45"
        />

        <div className="relative z-10 w-full max-w-3xl rounded-[32px] border border-[#d4d4d8] bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#71717a]">Codigos y acceso</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">Gestion del expediente</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Este bloque queda separado del alta principal para que los codigos no se mezclen con la captura general.
                Si dejas un campo vacio, el sistema genera uno nuevo de forma automatica, unica y no derivada de los datos del caso.
              </p>
            </div>
            <button
              type="button"
              onClick={closeCodesManager}
              className="ui-btn ui-btn-neutral rounded-2xl border border-[#d4d4d8] bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#18181b] hover:text-[#52525b]"
            >
              Cerrar
            </button>
          </div>

          <div className="mt-5 grid gap-4 rounded-3xl border border-[#e4e4e7] bg-[#ffffff] p-4 md:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Expediente actual</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{selectedDossier.title}</p>
              <p className="mt-1 text-sm text-slate-600">{selectedDossier.clientName}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Codigo expediente</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedDossier.id}</p>
              </div>
              <div className="rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Codigo acceso</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedDossier.clientAccessCode}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleCodesSubmit} className="mt-6 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Codigo de expediente</label>
                <input
                  type="text"
                  value={codesForm.dossierCode}
                  className={inputClassName}
                  readOnly
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Codigo de acceso</label>
                <input
                  type="text"
                  value={codesForm.clientAccessCode}
                  className={inputClassName}
                  readOnly
                />
              </div>
            </div>

            {codesMessage ? (
              <div className="rounded-2xl border border-[#cfe3d7] bg-[#f1fbf5] px-4 py-3 text-sm text-[#1f6a45]">
                {codesMessage}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">Los codigos ya estan guardados en el expediente y este boton los copia al portapapeles.</p>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={closeCodesManager}
                  className="ui-btn ui-btn-neutral rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-[#18181b] hover:text-[#52525b]"
                >
                  Listo
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ui-btn ui-btn-primary inline-flex items-center rounded-2xl bg-[#121a27] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#223047] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Guardar y copiar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderShareManager = () => {
    if (!shareDossier) {
      return null;
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
        <button
          type="button"
          aria-label="Cerrar modal de compartir"
          onClick={closeShareManager}
          className="absolute inset-0 bg-[#121a27]/45"
        />

        <div className="relative z-10 w-full max-w-4xl rounded-[32px] border border-[#d4d4d8] bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#71717a]">Compartir expediente</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">Acceso y PDF del expediente</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Genera el PDF desde la plantilla de accesos del despacho, carga los codigos del expediente y comparte la informacion por correo, WhatsApp o el menu nativo del dispositivo.
              </p>
            </div>
            <button
              type="button"
              onClick={closeShareManager}
              className="ui-btn ui-btn-neutral rounded-2xl border border-[#d4d4d8] bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#18181b] hover:text-[#52525b]"
            >
              Cerrar
            </button>
          </div>

          <div className="mt-5 grid gap-4 rounded-3xl border border-[#e4e4e7] bg-[#ffffff] p-4 md:grid-cols-[minmax(0,1.2fr)_260px]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Expediente listo para compartir</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{shareDossier.title}</p>
              <p className="mt-1 text-sm text-slate-600">{shareDossier.clientName}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
              <div className="rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Codigo expediente</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{shareDossier.id}</p>
              </div>
              <div className="rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Codigo acceso</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{shareDossier.clientAccessCode}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <button
              type="button"
              onClick={handleSharePdfDownload}
              disabled={isSubmitting}
              className="ui-btn ui-btn-neutral flex items-center justify-center gap-2 rounded-2xl border border-[#d4d4d8] bg-white px-4 py-4 text-sm font-semibold text-slate-700 transition hover:border-[#111111] hover:text-[#111111] disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              Descargar PDF
            </button>
            <button
              type="button"
              onClick={handleSharePdfNative}
              disabled={isSubmitting}
              className="ui-btn ui-btn-primary flex items-center justify-center gap-2 rounded-2xl bg-[#121a27] px-4 py-4 text-sm font-semibold text-white transition hover:bg-[#223047] disabled:opacity-60"
            >
              <Share2 className="h-4 w-4" />
              Compartir
            </button>
            <button
              type="button"
              onClick={handleShareViaEmail}
              disabled={isSubmitting}
              className="ui-btn ui-btn-info flex items-center justify-center gap-2 rounded-2xl border border-[#d4d4d8] bg-white px-4 py-4 text-sm font-semibold text-slate-700 transition hover:border-[#111111] hover:text-[#111111] disabled:opacity-60"
            >
              <Mail className="h-4 w-4" />
              Correo
            </button>
            <button
              type="button"
              onClick={handleShareViaWhatsApp}
              disabled={isSubmitting}
              className="ui-btn ui-btn-add flex items-center justify-center gap-2 rounded-2xl border border-[#d4d4d8] bg-white px-4 py-4 text-sm font-semibold text-slate-700 transition hover:border-[#111111] hover:text-[#111111] disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              WhatsApp
            </button>
            <button
              type="button"
              onClick={handleCopyShareMessage}
              disabled={isSubmitting}
              className="ui-btn ui-btn-info flex items-center justify-center gap-2 rounded-2xl border border-[#d4d4d8] bg-white px-4 py-4 text-sm font-semibold text-slate-700 transition hover:border-[#111111] hover:text-[#111111] disabled:opacity-60"
            >
              <Copy className="h-4 w-4" />
              Copiar mensaje
            </button>
          </div>

          {shareFeedbackMessage ? (
            <div className="mt-5 rounded-2xl border border-[#cfe3d7] bg-[#f1fbf5] px-4 py-3 text-sm text-[#1f6a45]">
              {shareFeedbackMessage}
            </div>
          ) : null}

          <div className="mt-5 rounded-2xl border border-[#e4e4e7] bg-[#ffffff] px-4 py-4 text-sm text-slate-600">
            Si tu navegador no permite adjuntar el archivo directamente, primero descarga el PDF y luego adjuntalo en el medio que prefieras.
          </div>
        </div>
      </div>
    );
  };

  const renderSelectedDossier = () => {
    if (!selectedDossier) {
      return (
        <div className={`${surfaceClassName} flex min-h-[340px] max-h-[78vh] flex-col items-center justify-center p-8 text-center`}>
          <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-[#f4f4f5] text-[#52525b]">
            <Briefcase className="h-8 w-8" />
          </div>
          <h3 className="mt-5 text-2xl font-bold text-slate-900">Selecciona un expediente</h3>
          <p className="mt-2 max-w-sm text-sm text-slate-600">
            Desde el listado puedes abrir un expediente, revisar su avance, adjuntar archivos a movimientos y agendar fechas.
          </p>
        </div>
      );
    }

    return (
      <div className={`${surfaceClassName} min-h-[420px] max-h-[78vh] overflow-y-auto p-6`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#71717a]">{selectedDossier.id}</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">{selectedDossier.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{selectedDossier.description}</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            {selectedDossierOrigin === 'juridico' ? (
              <button
                type="button"
                onClick={returnToJuridicoBoard}
                className="ui-btn ui-btn-neutral inline-flex items-center gap-2 rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-[#111111] hover:text-[#111111]"
              >
                <ChevronLeft className="h-4 w-4" />
                Volver a Juridico
              </button>
            ) : null}
            <button
              type="button"
              onClick={hideSelectedDossier}
              className="ui-btn ui-btn-neutral rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-[#111111] hover:text-[#111111]"
            >
              Ocultar detalle
            </button>
            <StatusBadge status={selectedDossier.status} />
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#e4e4e7] bg-[#ffffff] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Cliente</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{selectedDossier.clientName}</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#52525b]" />
                <span>{selectedDossier.clientPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#52525b]" />
                <span>{selectedDossier.clientEmail || 'Sin correo registrado'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openCodesManager(selectedDossier)}
            className="rounded-2xl border border-[#e4e4e7] bg-[#ffffff] p-4 text-left transition hover:border-[#111111] hover:bg-white"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Control interno</p>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#111111]">Copiar codigos</span>
            </div>
            <div className="mt-3 space-y-3 text-sm text-slate-600">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Codigo expediente</p>
                <p className="mt-1 font-semibold text-slate-900">{selectedDossier.id}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Codigo acceso</p>
                <p className="mt-1 font-semibold text-slate-900">{selectedDossier.clientAccessCode}</p>
              </div>
              <div>
                <p className="font-medium text-slate-900">{selectedDossier.courtNumber}</p>
                <p className="mt-1 text-slate-500">{selectedDossier.judicialDistrict}</p>
              </div>
            </div>
          </button>

          <div className="rounded-2xl border border-[#e4e4e7] bg-[#ffffff] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Partes</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{selectedDossier.plaintiff}</p>
            <p className="mt-1 text-sm text-slate-600">vs {selectedDossier.defendant}</p>
          </div>

          <div className="rounded-2xl border border-[#e4e4e7] bg-[#ffffff] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Proxima fecha</p>
            {selectedDossierNextEvent ? (
              <>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedDossierNextEvent.title}</p>
                <p className="mt-1 text-sm text-slate-600">{formatDate(selectedDossierNextEvent.date)}</p>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Aun no hay eventos registrados.</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => openShareManager(selectedDossier)}
            className="ui-btn ui-btn-info rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:border-[#111111] hover:text-[#111111]"
          >
            Compartir
          </button>
          <button
            type="button"
            onClick={() => {
              if (!showUploadForm) {
                setUploadForm(createEmptyUploadFormState());
              }
              setShowUploadForm((current) => !current);
              setShowHistoryForm(false);
              setShowCalendarForm(false);
            }}
            className="ui-btn ui-btn-primary rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:border-[#18181b] hover:text-[#52525b]"
          >
            Subir archivo
          </button>
          <button
            type="button"
            onClick={() => {
              if (!showHistoryForm) {
                setHistoryForm(createEmptyHistoryFormState());
              }
              setShowHistoryForm((current) => !current);
              setShowCalendarForm(false);
              setShowUploadForm(false);
            }}
            className="ui-btn ui-btn-edit rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:border-[#18181b] hover:text-[#52525b]"
          >
            Registrar movimiento
          </button>
          <button
            type="button"
            onClick={() => {
              setShowCalendarForm((current) => !current);
              setShowHistoryForm(false);
              setShowUploadForm(false);
            }}
            className="ui-btn ui-btn-warning rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:border-[#18181b] hover:text-[#52525b]"
          >
            Agendar fecha
          </button>
        </div>

        {showUploadForm ? (
          <form onSubmit={handleDirectFileUploadSubmit} className="mt-6 rounded-3xl border border-[#e4e4e7] bg-[#ffffff] p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Archivo del expediente</label>
                <input
                  type="file"
                  onChange={(event) =>
                    setUploadForm((current) => ({
                      ...current,
                      file: event.target.files?.[0] ?? null,
                    }))
                  }
                  className="block w-full rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-[#e4e4e7] file:px-3 file:py-2 file:font-semibold file:text-[#52525b]"
                  required
                />
                <p className="mt-2 text-xs text-slate-500">
                  Este archivo se registra como documento general del expediente y queda disponible para descarga.
                </p>
              </div>
              <div className="flex items-center rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3">
                <input
                  id="upload-visible"
                  type="checkbox"
                  checked={uploadForm.isClientVisible}
                  onChange={(event) =>
                    setUploadForm((current) => ({ ...current, isClientVisible: event.target.checked }))
                  }
                  className="mr-3 h-4 w-4"
                />
                <label htmlFor="upload-visible" className="text-sm text-slate-700">
                  Visible para el cliente
                </label>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowUploadForm(false);
                  setUploadForm(createEmptyUploadFormState());
                }}
                className="ui-btn ui-btn-neutral rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm font-medium text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="ui-btn ui-btn-primary rounded-2xl bg-[#3f3f46] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#18181b] disabled:opacity-60"
              >
                Guardar archivo
              </button>
            </div>
          </form>
        ) : null}

        {showHistoryForm ? (
          <form onSubmit={handleHistorySubmit} className="mt-6 rounded-3xl border border-[#e4e4e7] bg-[#ffffff] p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">Titulo del movimiento</label>
                <input
                  type="text"
                  value={historyForm.title}
                  onChange={(event) => setHistoryForm((current) => ({ ...current, title: event.target.value }))}
                  className={inputClassName}
                  placeholder="Se presento escrito..."
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Fecha</label>
                <input
                  type="datetime-local"
                  value={historyForm.date}
                  onChange={(event) => setHistoryForm((current) => ({ ...current, date: event.target.value }))}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Archivo del movimiento</label>
                <input
                  type="file"
                  onChange={(event) =>
                    setHistoryForm((current) => ({
                      ...current,
                      file: event.target.files?.[0] ?? null,
                    }))
                  }
                  className="block w-full rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-[#e4e4e7] file:px-3 file:py-2 file:font-semibold file:text-[#52525b]"
                />
                <p className="mt-2 text-xs text-slate-500">Cada movimiento permite un solo archivo adjunto.</p>
              </div>
              <div className="flex items-center rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3">
                <input
                  id="history-visible"
                  type="checkbox"
                  checked={historyForm.isClientVisible}
                  onChange={(event) =>
                    setHistoryForm((current) => ({ ...current, isClientVisible: event.target.checked }))
                  }
                  className="mr-3 h-4 w-4"
                />
                <label htmlFor="history-visible" className="text-sm text-slate-700">
                  Visible para el cliente
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">Descripcion del movimiento</label>
                <textarea
                  value={historyForm.description}
                  onChange={(event) => setHistoryForm((current) => ({ ...current, description: event.target.value }))}
                  className={`${inputClassName} min-h-[110px] resize-y`}
                  placeholder="Describe el avance o lo que se realizo en este movimiento."
                  required
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowHistoryForm(false);
                  setHistoryForm(createEmptyHistoryFormState());
                }}
                className="ui-btn ui-btn-neutral rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm font-medium text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="ui-btn ui-btn-edit rounded-2xl bg-[#3f3f46] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#18181b] disabled:opacity-60"
              >
                Guardar movimiento
              </button>
            </div>
          </form>
        ) : null}

        {showCalendarForm ? (
          <form onSubmit={handleCalendarSubmit} className="mt-6 rounded-3xl border border-[#d7dfef] bg-[#f7faff] p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">Titulo del evento</label>
                <input
                  type="text"
                  value={calendarForm.title}
                  onChange={(event) => setCalendarForm((current) => ({ ...current, title: event.target.value }))}
                  className={inputClassName}
                  placeholder="Audiencia preliminar"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Tipo</label>
                <select
                  value={calendarForm.type}
                  onChange={(event) =>
                    setCalendarForm((current) => ({ ...current, type: event.target.value as DossierCalendarEventType }))
                  }
                  className={inputClassName}
                >
                  {dossierCalendarTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Fecha y hora</label>
                <input
                  type="datetime-local"
                  value={calendarForm.date}
                  onChange={(event) => setCalendarForm((current) => ({ ...current, date: event.target.value }))}
                  className={inputClassName}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Ubicacion</label>
                <input
                  type="text"
                  value={calendarForm.location}
                  onChange={(event) => setCalendarForm((current) => ({ ...current, location: event.target.value }))}
                  className={inputClassName}
                  placeholder="Juzgado, sala o despacho"
                />
              </div>
              <div className="flex items-center rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3">
                <input
                  id="calendar-visible"
                  type="checkbox"
                  checked={calendarForm.isClientVisible}
                  onChange={(event) =>
                    setCalendarForm((current) => ({ ...current, isClientVisible: event.target.checked }))
                  }
                  className="mr-3 h-4 w-4"
                />
                <label htmlFor="calendar-visible" className="text-sm text-slate-700">
                  Visible para el cliente
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">Descripcion de lo que se realizara</label>
                <textarea
                  value={calendarForm.description}
                  onChange={(event) => setCalendarForm((current) => ({ ...current, description: event.target.value }))}
                  className={`${inputClassName} min-h-[110px] resize-y`}
                  placeholder="Describe lo que se realizara en esta fecha."
                  required
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCalendarForm(false)}
                className="ui-btn ui-btn-neutral rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm font-medium text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="ui-btn ui-btn-warning rounded-2xl bg-[#111111] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#27272a] disabled:opacity-60"
              >
                Agendar fecha
              </button>
            </div>
          </form>
        ) : null}

        <div className="mt-8 grid gap-6">
          <div>
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-lg font-bold text-slate-900">Movimientos del expediente</h4>
              <span className="rounded-full bg-[#e4e4e7] px-3 py-1 text-xs font-semibold text-[#71717a]">
                {selectedDossier.history.length} movimientos
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {selectedDossierHistory.length > 0 ? (
                selectedDossierHistory.map((event) => {
                  const relatedFiles = selectedDossierFilesByPhaseId.get(event.id) ?? [];

                  return (
                    <div key={event.id} className="rounded-2xl border border-[#e4e4e7] bg-[#ffffff] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                          <p className="mt-1 text-sm text-slate-600">{event.description}</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-3">
                          <span className="text-xs font-medium text-slate-500">{formatDate(event.date)}</span>
                          {isAdminUser ? (
                            <button
                              type="button"
                              onClick={() => void handleDeleteHistoryEvent(event)}
                              disabled={isSubmitting}
                              className="ui-btn ui-btn-danger-soft inline-flex items-center gap-2 rounded-xl border border-[#f0c9c9] bg-white px-3 py-2 text-xs font-semibold text-[#a33a3a] transition hover:bg-[#fff4f4] disabled:opacity-60"
                            >
                              <Trash2 className="h-4 w-4" />
                              Eliminar
                            </button>
                          ) : null}
                        </div>
                      </div>
                      {relatedFiles.length > 0 ? relatedFiles.map((file) => renderHistoryAttachment(file)) : null}
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-[#d4d4d8] bg-white px-4 py-6 text-sm text-slate-500">
                  Aun no hay movimientos registrados para este expediente.
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-lg font-bold text-slate-900">Documentos del expediente</h4>
              <span className="rounded-full bg-[#fafafa] px-3 py-1 text-xs font-semibold text-[#27272a]">
                {selectedDossier.files.length} archivos
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {selectedDossier.files.length > 0 ? (
                selectedDossier.files.map((file) =>
                  renderFileCard(
                    file,
                    file.phaseId ? `Movimiento: ${selectedDossierHistoryById.get(file.phaseId)?.title ?? file.phaseId}` : 'Documento general'
                  )
                )
              ) : (
                <div className="rounded-2xl border border-dashed border-[#d4d4d8] bg-white px-4 py-6 text-sm text-slate-500">
                  Aun no hay documentos cargados para este expediente.
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-lg font-bold text-slate-900">Calendario del expediente</h4>
              <span className="rounded-full bg-[#f4f4f5] px-3 py-1 text-xs font-semibold text-[#111111]">
                {selectedDossier.calendar.length} eventos
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {selectedDossierCalendar.length > 0 ? (
                selectedDossierCalendar.map((entry) => (
                  <div key={entry.id} className={`rounded-2xl border p-4 ${getCalendarTone(entry.type)}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{entry.title}</p>
                        <p className="mt-1 text-sm opacity-90">{entry.description}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-3">
                        <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
                          {getCalendarTypeLabel(entry.type)}
                        </span>
                        {isAdminUser ? (
                          <button
                            type="button"
                            onClick={() => void handleDeleteCalendarEvent(entry)}
                            disabled={isSubmitting}
                            className="ui-btn ui-btn-danger-soft inline-flex items-center gap-2 rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-xs font-semibold text-[#111111] transition hover:bg-white disabled:opacity-60"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium opacity-90">
                      <span>{formatDate(entry.date)}</span>
                      {entry.location ? <span>{entry.location}</span> : null}
                      <span>{entry.isClientVisible ? 'Cliente + admin' : 'Solo admin'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[#d4d4d8] bg-white px-4 py-6 text-sm text-slate-500">
                  Aun no hay fechas registradas.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  };

const renderOverviewSection = () => (
  <div className="space-y-6">
      <section className={`${surfaceClassName} overflow-hidden`}>
        <div className="px-6 py-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center rounded-full border border-[#d4d4d8] bg-[#f5f5f5] px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#52525b]">
                Sesion activa del despacho
              </div>
              <div className="relative group">
                <button
                  type="button"
                  aria-label="Ver tipo de usuario"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d4d4d8] bg-white text-slate-500 transition hover:border-[#111111] hover:text-[#111111] focus:border-[#111111] focus:text-[#111111] focus:outline-none"
                >
                  <AlertCircle className="h-4 w-4" />
                </button>
                <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 w-48 -translate-x-1/2 rounded-2xl border border-[#d4d4d8] bg-[#121a27] p-4 text-left text-white opacity-0 shadow-[0_18px_45px_rgba(15,23,42,0.24)] transition duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                  <p className="text-sm font-semibold">{adminTypeLabel}</p>
                </div>
              </div>
            </div>
            <h3 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Bienvenido, {adminDisplayName}.
            </h3>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
              Consulta expedientes, agenda y movimientos del despacho.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setActiveSection('expedientes')}
                className="ui-btn ui-btn-primary rounded-2xl bg-[#3f3f46] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#18181b]"
              >
                Ir a expedientes
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('calendario')}
                className="ui-btn ui-btn-info rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-[#111111] hover:text-[#111111]"
              >
                Ver calendario
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('juridico')}
                className="ui-btn ui-btn-legal rounded-2xl border px-4 py-3 text-sm font-semibold text-white transition"
              >
                Ver juridico
              </button>
            </div>
          </div>
        </div>
      </section>

      {renderCompactKpiGrid()}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_400px]">
        <section className={`${surfaceClassName} p-6`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Expedientes recientes</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Control rapido de casos</h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('expedientes')}
              className="inline-flex items-center text-sm font-semibold text-[#111111]"
            >
              Ver todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {filteredDossiers.slice(0, 4).map((dossier) => {
              const nextEvent = getNextEvent(dossier);

              return (
                <button
                  key={dossier.id}
                  type="button"
                  onClick={() => openDossierDetail(dossier)}
                  className="w-full rounded-3xl border border-[#e4e4e7] bg-[#ffffff] p-4 text-left transition hover:border-[#a1a1aa] hover:bg-white"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{dossier.id}</p>
                      <h4 className="mt-2 text-lg font-semibold text-slate-900">{dossier.title}</h4>
                      <p className="mt-1 text-sm text-slate-600">{dossier.clientName}</p>
                    </div>
                    <StatusBadge status={dossier.status} />
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white px-3 py-2 text-xs text-slate-600">
                      <span className="block font-semibold text-slate-900">Juzgado</span>
                      {dossier.courtNumber}
                    </div>
                    <div className="rounded-2xl bg-white px-3 py-2 text-xs text-slate-600">
                      <span className="block font-semibold text-slate-900">Siguiente fecha</span>
                      {nextEvent ? formatDate(nextEvent.date) : 'Sin programar'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className={`${surfaceClassName} p-6`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Agenda inmediata</p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">Proximos eventos</h3>
          <div className="mt-5 space-y-3">
            {agendaEntries.length > 0 ? (
              agendaEntries.slice(0, 5).map(({ dossierId, clientName, entry }) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => {
                    const dossier = dossiers.find((item) => item.id === dossierId);
                    if (dossier) {
                      openDossierDetail(dossier);
                    }
                  }}
                  className={`w-full rounded-2xl border p-4 text-left transition hover:bg-white ${getCalendarTone(entry.type)}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{entry.title}</p>
                      <p className="mt-2 text-xs leading-5 opacity-90">{entry.description}</p>
                      <p className="mt-1 text-xs opacity-90">{dossierId} · {clientName}</p>
                    </div>
                    <span className="text-xs font-semibold opacity-90">{getCalendarTypeLabel(entry.type)}</span>
                  </div>
                  <p className="mt-3 text-xs font-medium opacity-90">{formatDate(entry.date)}</p>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[#d4d4d8] bg-white px-4 py-8 text-sm text-slate-500">
                No hay eventos registrados en la agenda.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );

  const renderDossiersSection = () => (
    <div className="flex h-full min-h-0 flex-col gap-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openCreateDossierForm}
          className="ui-btn ui-btn-add inline-flex items-center rounded-2xl bg-[#121a27] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#223047]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Registrar expediente
        </button>
      </div>

      <div className={`grid min-h-0 items-start gap-6 ${showSelectedDossierPane ? '2xl:grid-cols-2' : ''}`}>
        <section className={`${surfaceClassName} flex min-h-0 flex-1 flex-col p-4 sm:p-5 xl:p-6`}>
          <div className="shrink-0 rounded-[24px] border border-[#e4e4e7] bg-[#fafafa] p-4 sm:p-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={dossierSearch}
                    onChange={(event) => setDossierSearch(event.target.value)}
                    className={`${inputClassName} border-[#e4e4e7] bg-white pl-11 pr-24`}
                    placeholder="Buscar expediente, cliente, actor o demandado"
                  />
                  {dossierSearch ? (
                    <button
                      type="button"
                      onClick={() => setDossierSearch('')}
                      className="ui-btn ui-btn-neutral absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-[#e4e4e7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 transition hover:border-[#111111] hover:text-[#111111]"
                    >
                      Limpiar
                    </button>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDossierFiltersPanel((current) => !current)}
                    className={`ui-btn ${showDossierFiltersPanel ? 'ui-btn-primary' : 'ui-btn-neutral'} rounded-2xl border px-4 py-3 text-sm font-medium transition 2xl:hidden`}
                  >
                    {showDossierFiltersPanel ? 'Ocultar filtros' : 'Filtros'}
                  </button>
                  {hasDossierFilters ? (
                    <button
                      type="button"
                      onClick={resetDossierFilters}
                      className="ui-btn ui-btn-neutral rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-[#111111] hover:text-[#111111]"
                    >
                      Restablecer
                    </button>
                  ) : null}
                </div>
              </div>

              <div className={`${showDossierFiltersPanel ? 'block' : 'hidden'} 2xl:block`}>
                <div className="grid gap-4 rounded-[24px] border border-[#e4e4e7] bg-white p-4 2xl:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] 2xl:items-end">
                  <div className="relative min-w-0 flex-1 lg:max-w-xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Filtro por estatus</p>
                    <label className="mt-3 mb-2 block text-sm font-medium text-slate-700">Estatus del expediente</label>
                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value as 'ALL' | DossierStatus)}
                      className={inputClassName}
                    >
                      {dossierFilterOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {`${option.label} (${option.count})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-[22px] border border-[#e4e4e7] bg-[#fafafa] px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Filtro activo</p>
                    <div className="mt-2 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                      <p className="text-base font-semibold text-slate-900">{activeDossierStatusLabel}</p>
                      <p className="text-sm leading-6 text-slate-500">
                        {normalizedDossierSearch ? `Busqueda: "${dossierSearch.trim()}"` : 'Sin busqueda adicional.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
            {filteredDossiers.length > 0 ? (
              filteredDossiers.map((dossier) => {
                const nextEvent = getNextEvent(dossier);

                return (
                  <article
                    key={dossier.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleDossierDetail(dossier)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        toggleDossierDetail(dossier);
                      }
                    }}
                    className={`w-full rounded-[28px] border p-4 text-left transition sm:p-5 ${
                      selectedDossier?.id === dossier.id
                        ? 'border-[#111111] bg-white shadow-[0_20px_38px_rgba(15,23,42,0.12)]'
                        : 'border-[#e4e4e7] bg-[#ffffff] hover:border-[#a1a1aa] hover:bg-white'
                    }`}
                  >
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[#f5f5f5] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                              {dossier.id}
                            </span>
                            <span className="rounded-full border border-[#e4e4e7] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#71717a]">
                              {dossier.category}
                            </span>
                          </div>
                          <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{dossier.title}</h3>
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
                            <span className="font-medium text-slate-900">{dossier.clientName}</span>
                            <span className="text-slate-400">|</span>
                            <span>Actualizado {formatDate(dossier.updatedAt)}</span>
                          </div>
                      </div>
                      <StatusBadge status={dossier.status} />
                    </div>

                      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.35fr)_minmax(240px,0.85fr)]">
                        <div className="rounded-[24px] border border-[#e4e4e7] bg-white p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Resumen</p>
                          <p className="mt-3 text-sm leading-6 text-slate-600">{dossier.description}</p>

                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl bg-[#ffffff] px-4 py-3 text-sm text-slate-600">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Partes</p>
                              <p className="mt-2 font-medium text-slate-900">{dossier.plaintiff}</p>
                              <p className="mt-1 text-xs text-slate-500">vs {dossier.defendant}</p>
                            </div>
                            <div className="rounded-2xl bg-[#ffffff] px-4 py-3 text-sm text-slate-600">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Seguimiento</p>
                              <p className="mt-2 font-medium text-slate-900">
                                {nextEvent ? nextEvent.title : 'Sin fecha programada'}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {nextEvent ? formatDate(nextEvent.date) : formatDate(dossier.updatedAt)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-[24px] border border-[#e4e4e7] bg-[#fafafa] px-4 py-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Vista rapida</p>
                          <div className="mt-3 space-y-3 text-sm">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-slate-500">Juzgado</span>
                              <span className="text-right font-semibold text-slate-900">{dossier.courtNumber}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-slate-500">Distrito</span>
                              <span className="text-right font-semibold text-slate-900">{dossier.judicialDistrict}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-slate-500">Codigo de acceso</span>
                              <span className="text-right font-semibold text-slate-900">{dossier.clientAccessCode}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e4e4e7] pt-4">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-[#f4f4f5] px-3 py-1.5 text-xs font-semibold text-[#111111]">
                            {dossier.calendar.length} fechas
                          </span>
                          <span className="rounded-full bg-[#f5f5f5] px-3 py-1.5 text-xs font-semibold text-[#52525b]">
                            {dossier.history.length} movimientos
                          </span>
                          <span className="rounded-full bg-[#fafafa] px-3 py-1.5 text-xs font-semibold text-[#27272a]">
                            {dossier.files.length} archivos
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleDossierDetail(dossier);
                            }}
                            className="ui-btn ui-btn-primary rounded-2xl bg-[#121a27] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#223047]"
                          >
                            Abrir
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openShareManager(dossier);
                            }}
                            className="ui-btn ui-btn-info rounded-2xl border border-[#d4d4d8] bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:border-[#111111] hover:text-[#111111]"
                          >
                            Compartir
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openEditDossierForm(dossier);
                            }}
                            className="ui-btn ui-btn-edit rounded-2xl border border-[#d4d4d8] bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:border-[#111111] hover:text-[#111111]"
                          >
                            Editar
                          </button>
                          {isAdminUser ? (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleDeleteDossier(dossier);
                              }}
                              className="ui-btn ui-btn-danger-soft rounded-2xl border border-[#f0c9c9] bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#a33a3a] transition hover:bg-[#fff4f4]"
                            >
                              Eliminar
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-[28px] border border-dashed border-[#d4d4d8] bg-white px-6 py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-[#f4f4f5] text-[#52525b]">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900">No encontramos expedientes</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Ajusta los filtros o registra un expediente nuevo para comenzar el seguimiento.
                </p>
              </div>
            )}
          </div>
        </section>

        {showSelectedDossierPane ? <section className="min-w-0">{renderSelectedDossier()}</section> : null}
      </div>

    </div>
  );

  const renderJuridicoSection = () => (
    <div className="h-full min-h-0 overflow-hidden">
      <LegalControlBoard
        dossiers={dossiers}
        onCreateDossier={() => openCreateDossierForm({ keepActiveSection: true })}
        onEditDossier={(dossier) => openEditDossierForm(dossier, { keepActiveSection: true })}
        onUpdateLegalControl={handleLegalControlUpdate}
        phpApiEnabled={phpApiEnabled}
      />
    </div>
  );

  const renderCalendarSection = () => (
    <div className="space-y-6">
      {renderSectionHeader(
        'Calendario general del despacho',
        'Cuadricula mensual para revisar audiencias, vencimientos, citas y recordatorios desde un solo tablero.',
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedCalendarDayKey(null);
              setAdminCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
            }}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d4d4d8] bg-white text-slate-700 transition hover:border-[#111111] hover:text-[#111111]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedCalendarDayKey(null);
              const now = new Date();
              setAdminCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
            }}
            className="rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-[#111111] hover:text-[#111111]"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedCalendarDayKey(null);
              setAdminCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
            }}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d4d4d8] bg-white text-slate-700 transition hover:border-[#111111] hover:text-[#111111]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="mx-auto w-full xl:max-w-[90%]">
        <section className={`${surfaceClassName} mx-auto w-full max-w-[1180px] p-6`}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Mes visible</p>
              <h3 className="mt-2 text-2xl font-bold capitalize text-slate-900">{adminCalendarMonthLabel}</h3>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              {dossierCalendarTypeOptions.map((option) => (
                <span key={option.value} className={`rounded-full border px-3 py-1 ${getCalendarTone(option.value)}`}>
                  {option.label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[28px] border border-[#d4d4d8] bg-[#d4d4d8]">
            <div className="grid grid-cols-7 bg-[#f5f5f5]">
              {calendarWeekdayLabels.map((day) => (
                <div key={day} className="border-b border-[#d4d4d8] px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-px bg-[#d4d4d8]">
              {calendarGridDays.map((day) => (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => setSelectedCalendarDayKey(day.key)}
                  className={`min-h-[152px] p-3 text-left transition hover:brightness-[0.99] ${
                    day.isCurrentMonth ? 'bg-white' : 'bg-[#f4efe6]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-2xl text-sm font-bold ${
                        day.isToday
                          ? 'bg-[#121a27] text-white'
                          : day.isCurrentMonth
                            ? 'bg-[#f5f5f5] text-slate-900'
                            : 'bg-white text-slate-400'
                      }`}
                    >
                      {day.date.getDate()}
                    </span>
                    {day.entries.length > 0 ? (
                      <span className="rounded-full bg-[#e4e4e7] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#71717a]">
                        {day.entries.length}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 space-y-2">
                    {day.entries.slice(0, 2).map((item) => (
                      <div
                        key={item.entry.id}
                        className={`rounded-2xl border px-2.5 py-2 ${getCalendarTone(item.entry.type)}`}
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-80">
                          {formatCalendarTime(item.entry.date)}
                        </p>
                        <p className="mt-1 truncate text-xs font-semibold">{item.entry.title}</p>
                        <p className="mt-1 truncate text-[11px] opacity-90">{item.dossierId} · {item.clientName}</p>
                      </div>
                    ))}
                    {day.entries.length > 2 ? (
                      <div className="rounded-2xl bg-[#f5f5f5] px-3 py-2 text-xs font-medium text-slate-500">
                        +{day.entries.length - 2} eventos mas
                      </div>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="hidden space-y-6">
          <div className={`${surfaceClassName} p-6`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Agenda inmediata</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">Siguientes eventos</h3>
            <div className="mt-5 space-y-3">
              {agendaEntries.length > 0 ? (
                agendaEntries.slice(0, 6).map(({ dossierId, clientName, entry }) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => {
                      const dossier = dossiers.find((item) => item.id === dossierId);
                      if (dossier) {
                        openDossierDetail(dossier);
                      }
                    }}
                    className={`w-full rounded-2xl border p-4 text-left transition hover:bg-white ${getCalendarTone(entry.type)}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{entry.title}</p>
                        <p className="mt-2 text-xs leading-5 opacity-90">{entry.description}</p>
                        <p className="mt-1 text-xs opacity-90">{dossierId} · {clientName}</p>
                      </div>
                      <span className="text-xs font-semibold opacity-90">{getCalendarTypeLabel(entry.type)}</span>
                    </div>
                    <p className="mt-3 text-xs font-medium opacity-90">{formatDate(entry.date)}</p>
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[#d4d4d8] bg-white px-4 py-6 text-sm text-slate-500">
                  No hay agenda cargada todavia.
                </div>
              )}
            </div>
          </div>

          <div className={`${surfaceClassName} p-6`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Vista del mes</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">Resumen calendarizado</h3>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-[#e4e4e7] bg-[#ffffff] p-4">
                <p className="text-sm font-semibold text-slate-900">Eventos programados</p>
                <p className="mt-1 text-2xl font-bold text-[#111111]">
                  {calendarGridDays.reduce((total, day) => total + day.entries.length, 0)}
                </p>
              </div>
              <div className="rounded-2xl border border-[#e4e4e7] bg-[#ffffff] p-4">
                <p className="text-sm font-semibold text-slate-900">Dias con actividad</p>
                <p className="mt-1 text-2xl font-bold text-[#52525b]">
                  {calendarGridDays.filter((day) => day.entries.length > 0).length}
                </p>
              </div>
              <div className="rounded-2xl border border-[#e4e4e7] bg-[#ffffff] p-4">
                <p className="text-sm font-semibold text-slate-900">Eventos solo admin</p>
                <p className="mt-1 text-2xl font-bold text-[#27272a]">
                  {agendaEntries.filter(({ entry }) => !entry.isClientVisible).length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {selectedCalendarDay ? (
          <div
            className="fixed inset-0 z-50 bg-[#121a27]/55 p-4 sm:p-6"
            onClick={() => setSelectedCalendarDayKey(null)}
          >
            <div
              className="mx-auto flex h-full w-full max-w-5xl items-center justify-center"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex max-h-[84vh] w-full flex-col overflow-hidden rounded-[32px] border border-[#d4d4d8] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.2)]">
                <div className="border-b border-[#e4e4e7] px-6 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Detalle del dia</p>
                      <h3 className="mt-2 text-3xl font-bold capitalize text-slate-900">
                        {formatCalendarDayTitle(selectedCalendarDay.date)}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">{formatCalendarDayMeta(selectedCalendarDay.date)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-[#e4e4e7] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#52525b]">
                        {selectedCalendarDay.entries.length} eventos
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedCalendarDayKey(null)}
                        className="ui-btn ui-btn-neutral rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-[#111111] hover:text-[#111111]"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>

                <div className="max-h-[58vh] overflow-y-auto px-6 py-5">
                  {selectedCalendarDay.entries.length > 0 ? (
                    <div className="space-y-3">
                      {selectedCalendarDay.entries.map(({ dossierId, dossierTitle, clientName, entry }) => (
                        <div key={entry.id} className="grid gap-3 md:grid-cols-[96px_minmax(0,1fr)]">
                          <div className="rounded-2xl border border-[#e4e4e7] bg-[#f5f5f5] px-3 py-4 text-center">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Hora</p>
                            <p className="mt-2 text-lg font-bold text-slate-900">{formatCalendarTime(entry.date)}</p>
                          </div>

                          <div className={`rounded-[28px] border p-4 ${getCalendarTone(entry.type)}`}>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-80">
                                  {getCalendarTypeLabel(entry.type)}
                                </p>
                                <h4 className="mt-2 text-lg font-bold">{entry.title}</h4>
                                <p className="mt-1 text-sm opacity-90">{dossierId} · {clientName}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCalendarDayKey(null);
                                  const dossier = dossiers.find((item) => item.id === dossierId);
                                  if (dossier) {
                                    openDossierDetail(dossier);
                                  }
                                }}
                                className="ui-btn ui-btn-primary rounded-2xl border border-current/20 bg-white/70 px-3 py-2 text-xs font-semibold transition hover:bg-white"
                              >
                                Abrir expediente
                              </button>
                            </div>

                            <p className="mt-4 text-sm leading-6 opacity-90">{entry.description}</p>

                            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold opacity-90">
                              <span className="rounded-full bg-white/70 px-3 py-1">{dossierTitle}</span>
                              {entry.location ? <span className="rounded-full bg-white/70 px-3 py-1">{entry.location}</span> : null}
                              <span className="rounded-full bg-white/70 px-3 py-1">
                                {entry.isClientVisible ? 'Cliente + admin' : 'Solo admin'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[28px] border border-dashed border-[#d4d4d8] bg-[#ffffff] px-6 py-14 text-center">
                      <h4 className="text-xl font-bold text-slate-900">Sin eventos programados</h4>
                      <p className="mt-2 text-sm text-slate-500">
                        No hay audiencias, citas, vencimientos o recordatorios registrados para este dia.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  const renderActivitySection = () => (
    <div className="space-y-6">
      {renderSectionHeader(
        'Actividad y seguimiento',
        'Linea de tiempo con los ultimos movimientos registrados en todos los expedientes y atajos a la agenda inmediata.'
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <section className={`${surfaceClassName} p-6`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Timeline general</p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">Movimientos recientes</h3>
          <div className="mt-6 space-y-4">
            {historyTimeline.length > 0 ? (
              historyTimeline.map(({ dossierId, dossierTitle, clientName, event }) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => {
                    const dossier = dossiers.find((item) => item.id === dossierId);
                    if (dossier) {
                      openDossierDetail(dossier);
                    }
                  }}
                  className="w-full rounded-[28px] border border-[#e4e4e7] bg-[#ffffff] p-5 text-left transition hover:border-[#a1a1aa] hover:bg-white"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{dossierId}</p>
                      <h4 className="mt-2 text-lg font-semibold text-slate-900">{event.title}</h4>
                      <p className="mt-1 text-sm text-slate-500">{dossierTitle} · {clientName}</p>
                    </div>
                    <span className="rounded-full bg-[#f4f4f5] px-3 py-1 text-xs font-semibold text-[#111111]">
                      {formatDate(event.date)}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{event.description}</p>
                </button>
              ))
            ) : (
              <div className="rounded-[28px] border border-dashed border-[#d4d4d8] bg-white px-6 py-14 text-center text-sm text-slate-500">
                Aun no hay actividad registrada.
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className={`${surfaceClassName} p-6`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Pendientes clave</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">Agenda del despacho</h3>
            <div className="mt-5 space-y-3">
              {agendaEntries.length > 0 ? (
                agendaEntries.slice(0, 5).map(({ dossierId, clientName, entry }) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => {
                      const dossier = dossiers.find((item) => item.id === dossierId);
                      if (dossier) {
                        openDossierDetail(dossier);
                      }
                    }}
                    className={`w-full rounded-2xl border p-4 text-left transition hover:bg-white ${getCalendarTone(entry.type)}`}
                  >
                    <p className="text-sm font-semibold">{entry.title}</p>
                    <p className="mt-2 text-xs leading-5 opacity-90">{entry.description}</p>
                    <p className="mt-1 text-xs opacity-90">{dossierId} · {clientName}</p>
                    <p className="mt-3 text-xs font-medium opacity-90">{formatDate(entry.date)}</p>
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[#d4d4d8] bg-white px-4 py-6 text-sm text-slate-500">
                  La agenda no tiene eventos cercanos.
                </div>
              )}
            </div>
          </div>

          <div className={`${surfaceClassName} p-6`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Lectura rapida</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">Distribucion del estatus</h3>
            <div className="mt-5 space-y-3">
              {dossierStatusOptions.map((option) => {
                const total = dossiers.filter((dossier) => dossier.status === option.value).length;
                return (
                  <div key={option.value} className="rounded-2xl border border-[#e4e4e7] bg-[#ffffff] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-900">{option.label}</span>
                      <span className="text-lg font-bold text-slate-900">{total}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  const renderSettingsSection = () => (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-hidden">
      {renderSectionHeader(
        'Ajustes del panel',
        'Gestion central de cuentas internas, acceso administrativo y configuracion operativa del panel.'
      )}

      <div className="min-h-0 flex-1 overflow-hidden">
        <AdminMembersPanel
          canManagePasswords={isAdminUser}
          currentAdminId={currentAdminId}
          phpApiEnabled={phpApiEnabled}
        />
      </div>
    </div>
  );

  const renderActiveSection = () => {
    if (!canAccessSection(activeSection, isAdminUser)) {
      return renderOverviewSection();
    }

    if (activeSection === 'panel') {
      return renderOverviewSection();
    }

    if (activeSection === 'expedientes') {
      return renderDossiersSection();
    }

    if (activeSection === 'juridico') {
      return renderJuridicoSection();
    }

    if (activeSection === 'calendario') {
      return renderCalendarSection();
    }

    return renderSettingsSection();
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.16),transparent_30%),radial-gradient(circle_at_right,rgba(82,82,91,0.10),transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)]" />
        <div className="relative w-full max-w-md rounded-[36px] border border-[#d4d4d8] bg-white/90 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="text-center">
            <div className="mx-auto flex w-fit items-center justify-center rounded-[28px] bg-[#121a27] px-5 py-4 shadow-[0_16px_35px_rgba(18,26,39,0.16)]">
              <img src={BRAND_WORDMARK_DARK} alt="Hermosillo y Asociados" className="h-11 w-auto object-contain" />
            </div>
            <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-[22px] bg-[#f4f4f5] text-[#52525b]">
              <Lock className="h-6 w-6" />
            </div>
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#71717a]">Administrador del sistema</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Ingreso al gestor de expedientes</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Accede al panel interno para revisar expedientes, calendario y seguimiento documental del despacho.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Usuario</label>
              <input
                type="text"
                value={adminUsername}
                onChange={(event) => setAdminUsername(event.target.value)}
                className={inputClassName}
                placeholder="admin"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Contrasena</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                className={inputClassName}
                placeholder="********"
                required
              />
            </div>

            {loginErrorMessage ? (
              <div className="rounded-2xl border border-[#f0c9c9] bg-[#fff6f6] px-4 py-3 text-sm text-[#a33a3a]">
                {loginErrorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="ui-btn ui-btn-primary flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              Ingresar al panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.16),transparent_28%),radial-gradient(circle_at_right,rgba(82,82,91,0.10),transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] text-slate-900">
      <div className="flex h-full overflow-hidden">
        <div
          className={`fixed inset-0 z-30 bg-black/55 transition lg:hidden ${
            isSidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onClick={() => setIsSidebarOpen(false)}
        />

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-[290px] flex-col overflow-hidden border-r border-white/8 bg-black text-white shadow-[0_24px_80px_rgba(0,0,0,0.48)] transition-[transform,width] duration-300 lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${isSidebarCollapsed ? 'lg:w-[96px]' : 'lg:w-[290px]'}`}
        >
          <div className={`border-b border-white/8 py-6 ${isSidebarCollapsed ? 'lg:px-3' : 'px-5'}`}>
            <div className={`rounded-[28px] border border-white/8 bg-[#050505] ${isSidebarCollapsed ? 'p-3 lg:rounded-[24px]' : 'p-4'}`}>
              <div className={`${isSidebarCollapsed ? 'lg:flex lg:justify-center' : ''}`}>
                <img src={BRAND_WORDMARK_DARK} alt="Hermosillo y Asociados" className="h-10 w-auto object-contain" />
              </div>
              <div className={`mt-4 ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>
                <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-white/68">Menu</p>
              </div>
            </div>
          </div>

          <nav className={`min-h-0 flex-1 overflow-y-auto space-y-2 py-5 ${isSidebarCollapsed ? 'px-3' : 'px-4'}`}>
            {visibleSidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              const meta = sidebarMeta[item.id];

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleAdminSectionChange(item.id)}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-[24px] px-4 py-4 text-left transition ${
                    isSidebarCollapsed ? 'lg:justify-center lg:gap-0 lg:px-3' : ''
                  } ${
                    isActive
                      ? 'border border-white/14 bg-[#101010] text-white shadow-[0_18px_34px_rgba(0,0,0,0.28)]'
                      : 'border border-transparent text-white/74 hover:bg-white/5'
                  }`}
                >
                  {isActive ? (
                    <>
                      <motion.div
                        aria-hidden="true"
                        className={`pointer-events-none absolute inset-y-3 left-0 w-1 rounded-full ${meta.dot} ${meta.halo}`}
                        layoutId="sidebar-active-rail"
                        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                      />
                      <motion.div
                        aria-hidden="true"
                        className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${meta.accent}`}
                        initial={{ opacity: 0.45 }}
                        animate={{ opacity: [0.42, 0.68, 0.48] }}
                        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </>
                  ) : null}

                  <div
                    className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition ${
                      isActive ? `${meta.iconBg} ${meta.iconText}` : 'bg-white/8 text-white'
                    }`}
                  >
                    {isActive ? (
                      <motion.div
                        aria-hidden="true"
                        className={`absolute inset-2 rounded-xl ${meta.dot} opacity-25 blur-lg`}
                        animate={{ opacity: [0.12, 0.28, 0.16], scale: [0.94, 1.06, 0.98] }}
                        transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    ) : null}
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className={`relative min-w-0 flex-1 ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold">{item.label}</p>
                      {meta.badge ? (
                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
                            isActive ? 'bg-white/10 text-white' : 'bg-white/8 text-white/68'
                          }`}
                        >
                          {meta.badge}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      {isActive ? (
                        <motion.span
                          className={`h-2 w-2 shrink-0 rounded-full ${meta.dot} ${meta.halo}`}
                          animate={{ opacity: [0.45, 1, 0.45], scale: [1, 1.24, 1] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      ) : (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/28" />
                      )}
                      <p className={`truncate text-xs ${isActive ? 'text-white/75' : 'text-white/60'}`}>
                        {isActive ? meta.liveLabel : item.hint}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className={`border-t border-white/8 px-5 py-5 ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>
            <div className="rounded-[28px] border border-white/8 bg-[#050505] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">Resumen rapido</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/6 px-3 py-3">
                  <p className="text-white/60">Expedientes</p>
                  <p className="mt-1 text-lg font-bold">{dossiers.length}</p>
                </div>
                <div className="rounded-2xl bg-white/6 px-3 py-3">
                  <p className="text-white/60">Agenda</p>
                  <p className="mt-1 text-lg font-bold">{agendaEntries.length}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div
          className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${
            isSidebarCollapsed ? 'lg:ml-[96px]' : 'lg:ml-[290px]'
          }`}
        >
          <header className="sticky top-0 z-20 shrink-0 border-b border-white/70 bg-white/72 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 px-3 py-3 sm:px-5 lg:px-6 xl:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  className="ui-btn ui-btn-neutral inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d4d4d8] bg-white text-slate-700 transition hover:border-[#111111] hover:text-[#111111] lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed((current) => !current)}
                  aria-label={isSidebarCollapsed ? 'Expandir menu lateral' : 'Reducir menu lateral'}
                  title={isSidebarCollapsed ? 'Expandir menu lateral' : 'Reducir menu lateral'}
                  className="ui-btn ui-btn-neutral hidden h-11 w-11 items-center justify-center rounded-2xl border border-[#d4d4d8] bg-white text-slate-700 transition hover:border-[#111111] hover:text-[#111111] xl:inline-flex"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="max-w-[420px] sm:max-w-[560px] xl:max-w-[680px]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#71717a]">Hermosillo y Asociados</p>
                  <h1 className="mt-1 text-xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl xl:text-4xl">
                    Gestor Administrativo de Expedientes
                  </h1>
                </div>
              </div>

              <div className="flex items-center">
                <button
                  type="button"
                  onClick={handleAdminLogout}
                  aria-label="Cerrar sesion"
                  title="Cerrar sesion"
                  className="ui-btn ui-btn-danger-soft inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#f0c9c9] bg-white text-[#a33a3a] transition hover:bg-[#fff4f4]"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </header>

          <main
            className={
              activeSection === 'juridico'
                ? 'min-h-0 flex-1 overflow-hidden p-0'
                : 'min-h-0 flex-1 overflow-hidden px-3 py-4 sm:px-5 lg:px-6 xl:px-8'
            }
          >
            {isLoadingDossiers ? (
              <div className={`${surfaceClassName} flex h-full min-h-[320px] items-center justify-center`}>
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[22px] bg-[#f4f4f5] text-[#52525b]">
                    <Clock className="h-6 w-6 animate-pulse" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-slate-600">Cargando expedientes y agenda del panel...</p>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeSection}-${sectionResetKey}`}
                  className={
                    activeSection === 'juridico' || activeSection === 'ajustes'
                      ? 'h-full overflow-hidden'
                      : 'h-full overflow-auto'
                  }
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderActiveSection()}
                </motion.div>
              </AnimatePresence>
            )}
          </main>
        </div>
      </div>
      {renderDossierForm()}
      {renderCodesManager()}
      {renderShareManager()}
    </div>
  );
}

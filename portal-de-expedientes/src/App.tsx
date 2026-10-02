/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Lock,
  Mail,
  MapPin,
  Phone,
  Plus,
  Scale,
  Search,
  Settings2,
  Upload,
  User,
  Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StatusBadge } from './components/StatusBadge';
import {
  addCalendarEventInApi,
  createDossierInApi,
  listDossiersFromApi,
  loginAdminInApi,
  searchDossiersFromApi,
  shouldUsePhpApi,
  uploadDossierFilesInApi,
} from './services/dossiersApi';
import { Dossier, DossierCalendarEvent, DossierCalendarEventType, DossierFile, DossierStatus } from './types';
import { formatDate, formatFileSize } from './utils';

const BRAND_WORDMARK = `${import.meta.env.BASE_URL}branding/HA-ABOGADOS-NEGRO-Y-BLANCO.png`;
const BRAND_WORDMARK_DARK = `${import.meta.env.BASE_URL}branding/HA-ABOGADOS-BLANCO-Y-NEGRO.png`;

const portalHighlights = [
  { label: 'Clientes', value: 'Control privado' },
  { label: 'Expedientes', value: 'Seguimiento puntual' },
  { label: 'Acceso', value: 'Consulta inmediata' },
];

const dossierStatusOptions: Array<{ value: DossierStatus; label: string }> = [
  { value: 'RECIBIDO', label: 'Recibido' },
  { value: 'EN_REVISION', label: 'En revision' },
  { value: 'EN_PROCESO', label: 'En proceso' },
  { value: 'RESUELTO', label: 'Resuelto' },
  { value: 'CERRADO', label: 'Cerrado' },
];

const dossierCalendarTypeOptions: Array<{ value: DossierCalendarEventType; label: string }> = [
  { value: 'AUDIENCIA', label: 'Audiencia' },
  { value: 'VENCIMIENTO', label: 'Vencimiento' },
  { value: 'CITA', label: 'Cita' },
  { value: 'RECORDATORIO', label: 'Recordatorio' },
];

const calendarWeekdayLabels = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

type ResultSortMode = 'updated_desc' | 'updated_asc';
type AdminSection = 'clientes' | 'expedientes' | 'calendario' | 'ajustes';

type CalendarFormState = {
  title: string;
  description: string;
  date: string;
  type: DossierCalendarEventType;
  location: string;
  isClientVisible: boolean;
};

const createEmptyCalendarFormState = (): CalendarFormState => ({
  title: '',
  description: '',
  date: '',
  type: 'AUDIENCIA',
  location: '',
  isClientVisible: true,
});

const toDateKey = (value: string | Date) => {
  const date = typeof value === 'string' ? new Date(value) : value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const sortCalendarEntries = (entries: DossierCalendarEvent[]) =>
  [...entries].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());

const upsertDossierList = (items: Dossier[], dossier: Dossier) => [
  dossier,
  ...items.filter((currentItem) => currentItem.id !== dossier.id),
];

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Ocurrio un error inesperado.';

export default function App() {
  const phpApiEnabled = shouldUsePhpApi();
  const [viewMode, setViewMode] = useState<'client' | 'lawyer'>('client');
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminSection, setAdminSection] = useState<AdminSection>('expedientes');
  const [adminCalendarMonth, setAdminCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [showNewCaseForm, setShowNewCaseForm] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<Dossier[]>([]);
  const [resultFilterQuery, setResultFilterQuery] = useState('');
  const [resultStatusFilter, setResultStatusFilter] = useState<'ALL' | DossierStatus>('ALL');
  const [resultCategoryFilter, setResultCategoryFilter] = useState('ALL');
  const [resultSortMode, setResultSortMode] = useState<ResultSortMode>('updated_desc');
  const [selectedDossier, setSelectedDossier] = useState<Dossier | null>(null);
  const [uploadPhaseId, setUploadPhaseId] = useState<string | null>(null);
  const [showCalendarForm, setShowCalendarForm] = useState(false);
  const [calendarForm, setCalendarForm] = useState<CalendarFormState>(createEmptyCalendarFormState());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newCase, setNewCase] = useState<Partial<Dossier>>({
    id: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    clientAccessCode: '',
    courtNumber: '',
    judicialDistrict: '',
    plaintiff: '',
    defendant: '',
    title: '',
    description: '',
    category: '',
    status: 'RECIBIDO',
  });

  useEffect(() => {
    if (!phpApiEnabled || viewMode !== 'lawyer' || !isAdminAuthenticated) {
      return;
    }

    let isMounted = true;

    const loadDossiers = async () => {
      try {
        const liveDossiers = await listDossiersFromApi();
        if (!isMounted) {
          return;
        }
        setDossiers(liveDossiers);
      } catch (error) {
        console.error('No se pudieron cargar los expedientes desde PHP/MySQL.', error);
      }
    };

    void loadDossiers();

    return () => {
      isMounted = false;
    };
  }, [isAdminAuthenticated, phpApiEnabled, viewMode]);

  const resetNewCaseState = () => {
    setNewCase({
      id: '',
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      clientAccessCode: '',
      courtNumber: '',
      judicialDistrict: '',
      plaintiff: '',
      defendant: '',
      title: '',
      description: '',
      category: '',
      status: 'RECIBIDO',
    });
  };

  const syncDossierState = (updatedDossier: Dossier) => {
    setDossiers((current) =>
      current.map((dossier) => (dossier.id === updatedDossier.id ? updatedDossier : dossier))
    );
    setResults((current) =>
      current.map((dossier) => (dossier.id === updatedDossier.id ? updatedDossier : dossier))
    );
    setSelectedDossier(updatedDossier);
  };

  const openDossierDetail = (dossier: Dossier) => {
    setAdminSection('expedientes');
    setShowNewCaseForm(false);
    setSelectedDossier(dossier);
    setShowCalendarForm(false);
    setCalendarForm(createEmptyCalendarFormState());
  };

  const closeDossierDetail = () => {
    setSelectedDossier(null);
    setShowCalendarForm(false);
    setCalendarForm(createEmptyCalendarFormState());
  };

  const handleAdminSectionChange = (section: AdminSection) => {
    setAdminSection(section);
    setShowNewCaseForm(false);
    setShowCalendarForm(false);
    setCalendarForm(createEmptyCalendarFormState());
    if (section !== 'expedientes') {
      setSelectedDossier(null);
    }
  };

  const getFilesByPhase = (dossier: Dossier, phaseId?: string) =>
    dossier.files
      .filter((file) => (viewMode === 'lawyer' && isAdminAuthenticated ? true : file.isClientVisible !== false))
      .filter((file) => (phaseId ? file.phaseId === phaseId : !file.phaseId));

  const getVisibleCalendarEntries = (dossier: Dossier) =>
    sortCalendarEntries(
      dossier.calendar.filter((entry) => (viewMode === 'lawyer' && isAdminAuthenticated ? true : entry.isClientVisible))
    );

  const getCalendarTypeLabel = (type: DossierCalendarEventType) =>
    dossierCalendarTypeOptions.find((option) => option.value === type)?.label ?? type;

  const formatCalendarDayNumber = (value: string) => new Date(value).toLocaleDateString('es-MX', { day: '2-digit' });

  const formatCalendarMonthLabel = (value: string) =>
    new Date(value).toLocaleDateString('es-MX', { month: 'short' }).replace('.', '');

  const formatCalendarYearLabel = (value: string) => new Date(value).toLocaleDateString('es-MX', { year: 'numeric' });

  const formatCalendarTimeLabel = (value: string) =>
    new Date(value).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' });

  const openFilePickerForPhase = (phaseId: string | null) => {
    setUploadPhaseId(phaseId);
    fileInputRef.current?.click();
  };

  const renderFileCard = (file: DossierFile) => (
    <div
      key={file.id}
      className="group flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-4 transition-colors hover:bg-neutral-100"
    >
      <div className="flex min-w-0 items-center overflow-hidden">
        <div className="mr-3 flex-shrink-0 rounded-lg border border-neutral-200 bg-white p-2 shadow-sm">
          <FileText className="h-5 w-5 text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate pr-4 text-sm font-medium text-neutral-900">{file.name}</p>
          <p className="text-xs text-neutral-500">
            {formatFileSize(file.size)} · {formatDate(file.date).split(',')[0]}
          </p>
        </div>
      </div>
      {file.url ? (
        <a
          href={file.url}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg p-2 text-neutral-400 opacity-0 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:opacity-100"
        >
          <Download className="h-4 w-4" />
        </a>
      ) : (
        <button
          type="button"
          disabled
          className="rounded-lg p-2 text-neutral-300 opacity-0 transition-colors group-hover:opacity-100"
        >
          <Download className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  const handleNewCaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dossierPayload = {
      id: newCase.id || undefined,
      clientName: newCase.clientName || '',
      clientPhone: newCase.clientPhone || '',
      clientEmail: newCase.clientEmail || '',
      clientAccessCode: newCase.clientAccessCode || '',
      courtNumber: newCase.courtNumber || '',
      judicialDistrict: newCase.judicialDistrict || '',
      plaintiff: newCase.plaintiff || '',
      defendant: newCase.defendant || '',
      title: newCase.title || '',
      description: newCase.description || '',
      category: newCase.category || '',
      status: (newCase.status as DossierStatus) || 'RECIBIDO',
    };

    if (phpApiEnabled) {
      try {
        const savedDossier = await createDossierInApi(dossierPayload);
        setDossiers((current) => upsertDossierList(current, savedDossier));
        setShowNewCaseForm(false);
        setAdminSection('expedientes');
        resetNewCaseState();
        return;
      } catch (error) {
        window.alert(getErrorMessage(error));
        return;
      }
    }

    const now = new Date().toISOString();

    const dossierToAdd: Dossier = {
      id: dossierPayload.id || `EXP-${new Date().getFullYear()}-${String(dossiers.length + 1).padStart(3, '0')}`,
      clientName: dossierPayload.clientName,
      clientPhone: dossierPayload.clientPhone,
      clientEmail: dossierPayload.clientEmail || '',
      clientAccessCode: dossierPayload.clientAccessCode,
      courtNumber: dossierPayload.courtNumber,
      judicialDistrict: dossierPayload.judicialDistrict,
      plaintiff: dossierPayload.plaintiff,
      defendant: dossierPayload.defendant,
      createdAt: now,
      updatedAt: now,
      status: dossierPayload.status,
      title: dossierPayload.title,
      description: dossierPayload.description,
      category: dossierPayload.category,
      calendar: [],
      history: [
        {
          id: `ev-${Date.now()}`,
          date: now,
          title: 'Expediente creado',
          description: 'El expediente ha sido registrado en el sistema.',
        },
      ],
      files: [],
    };

    setDossiers((current) => [dossierToAdd, ...current]);
    setShowNewCaseForm(false);
    setAdminSection('expedientes');
    resetNewCaseState();
  };

  const handleCalendarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDossier || !calendarForm.date.trim()) return;

    if (phpApiEnabled) {
      try {
        const updatedDossier = await addCalendarEventInApi({
          dossierCode: selectedDossier.id,
          title: calendarForm.title.trim(),
          description: calendarForm.description.trim(),
          date: new Date(calendarForm.date).toISOString(),
          type: calendarForm.type,
          location: calendarForm.location.trim() || undefined,
          isClientVisible: calendarForm.isClientVisible,
        });

        syncDossierState(updatedDossier);
        setShowCalendarForm(false);
        setCalendarForm(createEmptyCalendarFormState());
        return;
      } catch (error) {
        window.alert(getErrorMessage(error));
        return;
      }
    }

    const now = new Date().toISOString();
    const calendarEntry: DossierCalendarEvent = {
      id: `cal-${Date.now()}`,
      title: calendarForm.title.trim(),
      description: calendarForm.description.trim(),
      date: new Date(calendarForm.date).toISOString(),
      type: calendarForm.type,
      location: calendarForm.location.trim() || undefined,
      isClientVisible: calendarForm.isClientVisible,
    };

    const updatedDossier: Dossier = {
      ...selectedDossier,
      updatedAt: now,
      calendar: sortCalendarEntries([...(selectedDossier.calendar || []), calendarEntry]),
    };

    syncDossierState(updatedDossier);
    setShowCalendarForm(false);
    setCalendarForm(createEmptyCalendarFormState());
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    let found: Dossier[] = [];

    if (phpApiEnabled) {
      try {
        found = await searchDossiersFromApi(query.trim());
      } catch (error) {
        console.error('No se pudo consultar la base de datos para buscar expedientes.', error);
        window.alert(getErrorMessage(error));
      }
    } else {
      const normalizedQuery = query.toLowerCase().trim();
      found = dossiers.filter(
        (dossier) =>
          dossier.id.toLowerCase() === normalizedQuery ||
          dossier.clientAccessCode.toLowerCase() === normalizedQuery
      );
    }

    setResults(found);
    setResultFilterQuery('');
    setResultStatusFilter('ALL');
    setResultCategoryFilter('ALL');
    setResultSortMode('updated_desc');
    setHasSearched(true);

    if (found.length === 1) {
      openDossierDetail(found[0]);
      return;
    }

    closeDossierDetail();
  };

  const resetSearch = () => {
    setQuery('');
    setHasSearched(false);
    setResults([]);
    setResultFilterQuery('');
    setResultStatusFilter('ALL');
    setResultCategoryFilter('ALL');
    setResultSortMode('updated_desc');
    closeDossierDetail();
  };

  const resetResultFilters = () => {
    setResultFilterQuery('');
    setResultStatusFilter('ALL');
    setResultCategoryFilter('ALL');
    setResultSortMode('updated_desc');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedDossier) return;

    const uploadedFiles = Array.from(files) as File[];

    if (phpApiEnabled) {
      try {
        const updatedDossier = await uploadDossierFilesInApi(selectedDossier.id, uploadedFiles, uploadPhaseId);
        syncDossierState(updatedDossier);
      } catch (error) {
        window.alert(getErrorMessage(error));
      } finally {
        setUploadPhaseId(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }

      return;
    }

    const now = new Date().toISOString();
    const newFiles: DossierFile[] = uploadedFiles.map((file, index) => ({
      id: `f-new-${Date.now()}-${index}-${file.name}`,
      name: file.name,
      date: now,
      size: file.size,
      phaseId: uploadPhaseId ?? undefined,
    }));

    syncDossierState({
      ...selectedDossier,
      updatedAt: now,
      files: [...selectedDossier.files, ...newFiles],
    });

    setUploadPhaseId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleViewMode = (mode: 'client' | 'lawyer') => {
    setViewMode(mode);
    closeDossierDetail();
    if (mode === 'lawyer') {
      setHasSearched(false);
      setAdminSection('expedientes');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    void (async () => {
      try {
        if (phpApiEnabled) {
          await loginAdminInApi(adminUsername, adminPassword);
        } else if (!(adminUsername === 'admin' && adminPassword === 'admin')) {
          throw new Error('Credenciales incorrectas (sin backend el acceso demo sigue siendo admin / admin).');
        }

        setIsAdminAuthenticated(true);
        setShowAdminLogin(false);
        toggleViewMode('lawyer');
        setLoginError(false);
        setLoginErrorMessage('');
        setAdminUsername('');
        setAdminPassword('');
      } catch (error) {
        setLoginError(true);
        setLoginErrorMessage(getErrorMessage(error));
      }
    })();
  };

  const dossierPhaseSections = selectedDossier
    ? selectedDossier.history.map((event) => ({
        event,
        files: getFilesByPhase(selectedDossier, event.id),
      }))
    : [];
  const selectedDossierCalendarEntries = selectedDossier ? getVisibleCalendarEntries(selectedDossier) : [];
  const selectedDossierUpcomingEntry =
    selectedDossierCalendarEntries.find((entry) => new Date(entry.date).getTime() >= Date.now()) ??
    selectedDossierCalendarEntries.at(-1) ??
    null;
  const adminAgendaEntries = dossiers
    .flatMap((dossier) =>
      dossier.calendar.map((entry) => ({
        dossierId: dossier.id,
        dossierTitle: dossier.title,
        clientName: dossier.clientName,
        entry,
      }))
    )
    .sort((left, right) => new Date(left.entry.date).getTime() - new Date(right.entry.date).getTime());
  const upcomingAdminAgendaEntries = adminAgendaEntries.filter((item) => new Date(item.entry.date).getTime() >= Date.now());
  const dashboardAgendaEntries =
    upcomingAdminAgendaEntries.length > 0
      ? upcomingAdminAgendaEntries.slice(0, 6)
      : [...adminAgendaEntries].slice(-6).reverse();
  const clientRecords = Array.from(
    dossiers.reduce((map, dossier) => {
      const current = map.get(dossier.clientAccessCode);
      if (!current) {
        map.set(dossier.clientAccessCode, {
          accessCode: dossier.clientAccessCode,
          name: dossier.clientName,
          phone: dossier.clientPhone,
          email: dossier.clientEmail,
          dossiers: [dossier],
          latestUpdate: dossier.updatedAt,
        });
        return map;
      }

      current.dossiers.push(dossier);
      if (new Date(dossier.updatedAt).getTime() > new Date(current.latestUpdate).getTime()) {
        current.latestUpdate = dossier.updatedAt;
      }
      return map;
    }, new Map<string, { accessCode: string; name: string; phone: string; email: string; dossiers: Dossier[]; latestUpdate: string }>())
  )
    .map(([, client]) => client)
    .sort((left, right) => left.name.localeCompare(right.name, 'es'));
  const adminCalendarMonthLabel = adminCalendarMonth.toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric',
  });
  const adminCalendarGridDays = (() => {
    const monthStart = new Date(adminCalendarMonth.getFullYear(), adminCalendarMonth.getMonth(), 1);
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - monthStart.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      const dateKey = toDateKey(date);
      const entries = adminAgendaEntries.filter((item) => toDateKey(item.entry.date) === dateKey);
      return {
        date,
        isCurrentMonth: date.getMonth() === adminCalendarMonth.getMonth(),
        isToday: dateKey === toDateKey(new Date()),
        entries,
      };
    });
  })();
  const resultCategoryOptions = Array.from<string>(new Set(results.map((dossier) => dossier.category))).sort((left, right) =>
    left.localeCompare(right, 'es')
  );
  const normalizedResultFilterQuery = resultFilterQuery.trim().toLowerCase();
  const filteredResults = results
    .filter((dossier) => {
      const matchesText =
        normalizedResultFilterQuery.length === 0 ||
        [
          dossier.id,
          dossier.clientAccessCode,
          dossier.clientName,
          dossier.title,
          dossier.plaintiff,
          dossier.defendant,
          dossier.courtNumber,
          dossier.judicialDistrict,
          dossier.category,
        ].some((value) => value.toLowerCase().includes(normalizedResultFilterQuery));

      const matchesStatus = resultStatusFilter === 'ALL' || dossier.status === resultStatusFilter;
      const matchesCategory = resultCategoryFilter === 'ALL' || dossier.category === resultCategoryFilter;
      return matchesText && matchesStatus && matchesCategory;
    })
    .sort((left, right) => {
      const leftTime = new Date(left.updatedAt).getTime();
      const rightTime = new Date(right.updatedAt).getTime();
      return resultSortMode === 'updated_asc' ? leftTime - rightTime : rightTime - leftTime;
    });
  const hasActiveResultFilters =
    resultFilterQuery.trim().length > 0 ||
    resultStatusFilter !== 'ALL' ||
    resultCategoryFilter !== 'ALL' ||
    resultSortMode !== 'updated_desc';

  const adminNavigationItems = [
    { id: 'clientes' as AdminSection, label: 'Clientes', icon: Users },
    { id: 'expedientes' as AdminSection, label: 'Expedientes', icon: Briefcase },
    { id: 'calendario' as AdminSection, label: 'Calendario', icon: Calendar },
    { id: 'ajustes' as AdminSection, label: 'Ajustes', icon: Settings2 },
  ];

  const renderAdminSidebar = () => (
    <aside className="rounded-[2rem] border border-neutral-200 bg-[#0b0b0b] p-4 text-white shadow-[0_30px_80px_rgba(0,0,0,0.35)] lg:sticky lg:top-28">
      <div className="rounded-[1.6rem] border border-white/10 bg-black px-5 py-5">
        <img src={BRAND_WORDMARK_DARK} alt="Hermosillo y Asociados" className="h-12 w-auto object-contain" />
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-white/45">Panel administrativo</p>
        <p className="mt-2 text-sm text-white/68">
          Control interno del despacho para clientes, expedientes, agenda y configuracion.
        </p>
      </div>

      <nav className="mt-4 space-y-2">
        {adminNavigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = adminSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleAdminSectionChange(item.id)}
              className={`flex w-full items-center justify-between rounded-[1.2rem] border px-4 py-3 text-left transition-colors ${
                isActive
                  ? 'border-white/18 bg-white text-black'
                  : 'border-white/10 bg-[#111111] text-white hover:border-white/20'
              }`}
            >
              <span className="flex items-center gap-3 text-sm font-semibold">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              <ChevronRight className={`h-4 w-4 ${isActive ? 'text-black/65' : 'text-white/35'}`} />
            </button>
          );
        })}
      </nav>

      <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-[#111111] px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">Resumen</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-white/8 bg-black px-3 py-3">
            <p className="text-white/45">Clientes</p>
            <p className="mt-1 text-lg font-semibold text-white">{clientRecords.length}</p>
          </div>
          <div className="rounded-xl border border-white/8 bg-black px-3 py-3">
            <p className="text-white/45">Expedientes</p>
            <p className="mt-1 text-lg font-semibold text-white">{dossiers.length}</p>
          </div>
        </div>
      </div>
    </aside>
  );

  const renderAdminShell = (content: React.ReactNode) => (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
      {renderAdminSidebar()}
      <div className="space-y-6">{content}</div>
    </div>
  );

  const renderAdminSectionHeader = (title: string, description: string, action?: React.ReactNode) => (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">Panel de control</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900">{title}</h2>
          <p className="mt-2 text-sm text-neutral-500">{description}</p>
        </div>
        {action}
      </div>
    </div>
  );

  const renderDossierDetail = (isAdminView: boolean) => (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          onClick={isAdminView ? closeDossierDetail : resetSearch}
          className="group inline-flex items-center text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          {isAdminView ? 'Volver a expedientes' : 'Volver a buscar'}
        </button>
      </div>

      {isAdminView
        ? renderAdminSectionHeader(
            `Expediente ${selectedDossier?.id ?? ''}`,
            `Cliente: ${selectedDossier?.clientName ?? ''} · Codigo de expediente: ${selectedDossier?.id ?? ''}`
          )
        : null}

      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-100 bg-neutral-50/50 p-6 sm:p-8">
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <div className="mb-3 flex items-center">
                <span className="rounded-md border border-neutral-200 bg-white px-3 py-1 text-sm font-bold tracking-wide text-neutral-700 shadow-sm">
                  {selectedDossier?.id}
                </span>
              </div>
              <h2 className="mt-4 mb-1 text-2xl font-extrabold text-neutral-900 sm:text-3xl">{selectedDossier?.title}</h2>
            </div>
            {selectedDossier ? <StatusBadge status={selectedDossier.status} size="lg" className="self-start sm:self-auto" /> : null}
          </div>

          <p className="max-w-3xl text-lg leading-relaxed text-neutral-600">{selectedDossier?.description}</p>

          <div className="mt-8 grid grid-cols-1 gap-6 border-t border-neutral-200/60 pt-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="mb-1 text-sm font-medium uppercase tracking-wider text-neutral-400">Cliente</p>
              <div className="flex items-center text-neutral-900">
                <Users className="mr-2 h-4 w-4 text-neutral-400" />
                {selectedDossier?.clientName}
              </div>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium uppercase tracking-wider text-neutral-400">Codigo de expediente</p>
              <div className="flex items-center text-neutral-900">
                <Lock className="mr-2 h-4 w-4 text-neutral-400" />
                {selectedDossier?.id}
              </div>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium uppercase tracking-wider text-neutral-400">Telefono</p>
              <div className="flex items-center text-neutral-900">
                <Phone className="mr-2 h-4 w-4 text-neutral-400" />
                {selectedDossier?.clientPhone}
              </div>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium uppercase tracking-wider text-neutral-400">Correo</p>
              <div className="flex items-center text-neutral-900">
                <Mail className="mr-2 h-4 w-4 text-neutral-400" />
                {selectedDossier?.clientEmail || 'Sin correo'}
              </div>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium uppercase tracking-wider text-neutral-400">Actor</p>
              <div className="flex items-center text-neutral-900">
                <User className="mr-2 h-4 w-4 text-neutral-400" />
                {selectedDossier?.plaintiff}
              </div>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium uppercase tracking-wider text-neutral-400">Demandado</p>
              <div className="flex items-center text-neutral-900">
                <User className="mr-2 h-4 w-4 text-neutral-400" />
                {selectedDossier?.defendant}
              </div>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium uppercase tracking-wider text-neutral-400">Juzgado</p>
              <div className="flex items-center text-neutral-900">
                <Building2 className="mr-2 h-4 w-4 text-neutral-400" />
                {selectedDossier?.courtNumber}
              </div>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium uppercase tracking-wider text-neutral-400">Partido judicial</p>
              <div className="flex items-center text-neutral-900">
                <MapPin className="mr-2 h-4 w-4 text-neutral-400" />
                {selectedDossier?.judicialDistrict}
              </div>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium uppercase tracking-wider text-neutral-400">Categoria</p>
              <div className="flex items-center text-neutral-900">
                <Briefcase className="mr-2 h-4 w-4 text-neutral-400" />
                {selectedDossier?.category}
              </div>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium uppercase tracking-wider text-neutral-400">Ultima actualizacion</p>
              <div className="flex items-center text-neutral-900">
                <Calendar className="mr-2 h-4 w-4 text-neutral-400" />
                {selectedDossier ? formatDate(selectedDossier.updatedAt).split(',')[0] : ''}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-10 rounded-[1.8rem] border border-neutral-200 bg-neutral-50/60 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="flex items-center text-lg font-bold text-neutral-900">
                  <Calendar className="mr-2 h-5 w-5 text-neutral-400" />
                  Calendario del expediente
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  {isAdminView
                    ? 'Agenda compartida para audiencias, vencimientos, citas y recordatorios.'
                    : 'Fechas compartidas contigo para dar seguimiento al expediente.'}
                </p>
              </div>
              {isAdminView ? (
                <button
                  type="button"
                  onClick={() => {
                    const nextVisibility = !showCalendarForm;
                    setShowCalendarForm(nextVisibility);
                    if (!nextVisibility) {
                      setCalendarForm(createEmptyCalendarFormState());
                    }
                  }}
                  className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {showCalendarForm ? 'Ocultar formulario' : 'Registrar fecha'}
                </button>
              ) : null}
            </div>

            {selectedDossierUpcomingEntry ? (
              <div className="mt-5 rounded-2xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">Proxima fecha relevante</p>
                <div className="mt-2 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
                        {getCalendarTypeLabel(selectedDossierUpcomingEntry.type)}
                      </span>
                      {isAdminView ? (
                        <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                          {selectedDossierUpcomingEntry.isClientVisible ? 'Visible al cliente' : 'Interno'}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-lg font-semibold text-neutral-900">{selectedDossierUpcomingEntry.title}</p>
                    {selectedDossierUpcomingEntry.location ? (
                      <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-neutral-50 px-4 py-2 text-sm text-neutral-600">
                        <MapPin className="h-4 w-4 text-neutral-400" />
                        {selectedDossierUpcomingEntry.location}
                      </div>
                    ) : null}
                  </div>
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4 sm:min-w-[168px]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">Fecha</p>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-5xl font-bold leading-none text-neutral-900">
                        {formatCalendarDayNumber(selectedDossierUpcomingEntry.date)}
                      </span>
                      <div className="pb-1">
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-700">
                          {formatCalendarMonthLabel(selectedDossierUpcomingEntry.date)}
                        </p>
                        <p className="text-xs font-medium text-neutral-500">{formatCalendarYearLabel(selectedDossierUpcomingEntry.date)}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-neutral-600">
                      {formatCalendarTimeLabel(selectedDossierUpcomingEntry.date)}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {isAdminView && showCalendarForm ? (
              <form onSubmit={handleCalendarSubmit} className="mt-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-700">Tipo de evento *</label>
                    <select
                      value={calendarForm.type}
                      onChange={(e) =>
                        setCalendarForm((current) => ({
                          ...current,
                          type: e.target.value as DossierCalendarEventType,
                        }))
                      }
                      className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      {dossierCalendarTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-700">Fecha y hora *</label>
                    <input
                      type="datetime-local"
                      value={calendarForm.date}
                      onChange={(e) => setCalendarForm((current) => ({ ...current, date: e.target.value }))}
                      className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Titulo *</label>
                  <input
                    type="text"
                    value={calendarForm.title}
                    onChange={(e) => setCalendarForm((current) => ({ ...current, title: e.target.value }))}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Ej. Audiencia de seguimiento"
                    required
                  />
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_auto]">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-700">Lugar o referencia</label>
                    <input
                      type="text"
                      value={calendarForm.location}
                      onChange={(e) => setCalendarForm((current) => ({ ...current, location: e.target.value }))}
                      className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Ej. Juzgado Primero Civil"
                    />
                  </div>
                  <label className="inline-flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={calendarForm.isClientVisible}
                      onChange={(e) => setCalendarForm((current) => ({ ...current, isClientVisible: e.target.checked }))}
                      className="h-4 w-4 rounded border-neutral-300"
                    />
                    Visible al cliente
                  </label>
                </div>

                <div className="mt-5">
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Descripcion</label>
                  <textarea
                    value={calendarForm.description}
                    onChange={(e) => setCalendarForm((current) => ({ ...current, description: e.target.value }))}
                    className="min-h-[96px] w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Notas breves para la fecha registrada"
                  />
                </div>

                <div className="mt-5 flex flex-col gap-3 border-t border-neutral-100 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCalendarForm(false);
                      setCalendarForm(createEmptyCalendarFormState());
                    }}
                    className="rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Guardar fecha
                  </button>
                </div>
              </form>
            ) : null}

            {selectedDossierCalendarEntries.length > 0 ? (
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {selectedDossierCalendarEntries.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div className="flex w-full max-w-[110px] flex-col rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-center">
                        <span className="text-5xl font-bold leading-none text-neutral-900">{formatCalendarDayNumber(entry.date)}</span>
                        <span className="mt-2 text-sm font-bold uppercase tracking-[0.18em] text-neutral-700">
                          {formatCalendarMonthLabel(entry.date)}
                        </span>
                        <span className="mt-1 text-xs font-medium text-neutral-500">{formatCalendarYearLabel(entry.date)}</span>
                        <span className="mt-3 text-base font-semibold text-neutral-600">{formatCalendarTimeLabel(entry.date)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
                            {getCalendarTypeLabel(entry.type)}
                          </span>
                          {isAdminView ? (
                            <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                              {entry.isClientVisible ? 'Visible al cliente' : 'Interno'}
                            </span>
                          ) : null}
                        </div>
                        <h4 className="mt-3 text-lg font-bold text-neutral-900">{entry.title}</h4>
                        <p className="mt-1 text-sm font-medium text-neutral-500">{formatDate(entry.date)}</p>
                        {entry.location ? (
                          <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                            <MapPin className="h-4 w-4 text-neutral-400" />
                            {entry.location}
                          </div>
                        ) : null}

                        {entry.description ? <p className="mt-4 text-sm leading-relaxed text-neutral-600">{entry.description}</p> : null}
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-50 text-neutral-500 sm:ml-auto">
                        <Calendar className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-neutral-200 bg-white px-5 py-6 text-sm text-neutral-500">
                {isAdminView
                  ? 'Todavia no hay fechas registradas en el calendario de este expediente.'
                  : 'Aun no se han compartido fechas de calendario para este expediente.'}
              </div>
            )}
          </div>

          <h3 className="mb-8 flex items-center text-lg font-bold text-neutral-900">
            <FileText className="mr-2 h-5 w-5 text-neutral-400" />
            Historial del tramite
          </h3>

          <div className="relative space-y-8 border-l-2 border-neutral-100 pl-4 sm:space-y-10 sm:pl-6">
            {dossierPhaseSections.map(({ event, files }, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="absolute top-1 -left-[21px] h-4 w-4 rounded-full border-4 border-white bg-blue-500 shadow-sm sm:-left-[29px]" />
                <div className="pl-6">
                  <div className="mb-1 text-sm font-medium text-blue-600">{formatDate(event.date)}</div>
                  <h4 className="mb-2 text-2xl font-bold tracking-tight text-neutral-900">{event.title}</h4>
                  <p className="text-lg leading-relaxed text-neutral-600">{event.description}</p>
                  <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">Archivos de esta fase</p>
                        <p className="mt-1 text-sm font-medium text-neutral-900">
                          {files.length === 0
                            ? 'Sin archivos adjuntos'
                            : `${files.length} ${files.length === 1 ? 'archivo cargado' : 'archivos cargados'}`}
                        </p>
                      </div>
                      {isAdminView ? (
                        <button
                          onClick={() => openFilePickerForPhase(event.id)}
                          className="inline-flex items-center justify-center rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Subir a esta fase
                        </button>
                      ) : null}
                    </div>

                    {files.length > 0 ? (
                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">{files.map(renderFileCard)}</div>
                    ) : (
                      <div className="mt-4 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-4 text-sm text-neutral-500">
                        No hay archivos registrados en esta fase.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" multiple />
        </div>
      </div>
    </div>
  );

  const renderNewCaseForm = () => (
    <div className="space-y-6">
      {renderAdminSectionHeader(
        'Registrar nuevo caso',
        'Da de alta el cliente, el expediente y deja listo el acceso para consulta.',
        <button
          type="button"
          onClick={() => setShowNewCaseForm(false)}
          className="inline-flex items-center rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </button>
      )}

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <form onSubmit={handleNewCaseSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Cliente *</label>
              <input
                type="text"
                value={newCase.clientName}
                onChange={(e) => setNewCase({ ...newCase, clientName: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Nombre del cliente"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Codigo de acceso *</label>
              <input
                type="text"
                value={newCase.clientAccessCode}
                onChange={(e) => setNewCase({ ...newCase, clientAccessCode: e.target.value.toUpperCase() })}
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Ej. DJM2619"
                required
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Telefono *</label>
              <input
                type="text"
                value={newCase.clientPhone}
                onChange={(e) => setNewCase({ ...newCase, clientPhone: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="+52 33..."
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Correo</label>
              <input
                type="email"
                value={newCase.clientEmail}
                onChange={(e) => setNewCase({ ...newCase, clientEmail: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="cliente@email.com"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Codigo de expediente</label>
              <input
                type="text"
                value={newCase.id}
                onChange={(e) => setNewCase({ ...newCase, id: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Ej. EXP-2026-004"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Materia / categoria *</label>
              <select
                value={newCase.category}
                onChange={(e) => setNewCase({ ...newCase, category: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">Selecciona materia...</option>
                <option value="Materia Civil">Materia Civil</option>
                <option value="Materia Familiar">Materia Familiar</option>
                <option value="Materia Mercantil">Materia Mercantil</option>
                <option value="Materia Penal">Materia Penal</option>
                <option value="Materia Laboral">Materia Laboral</option>
                <option value="Amparo">Amparo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Titulo del juicio *</label>
            <input
              type="text"
              value={newCase.title}
              onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Ej. Juicio Especial Hipotecario"
              required
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Actor *</label>
              <input
                type="text"
                value={newCase.plaintiff}
                onChange={(e) => setNewCase({ ...newCase, plaintiff: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Nombre del actor"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Demandado *</label>
              <input
                type="text"
                value={newCase.defendant}
                onChange={(e) => setNewCase({ ...newCase, defendant: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Nombre del demandado"
                required
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Juzgado *</label>
              <input
                type="text"
                value={newCase.courtNumber}
                onChange={(e) => setNewCase({ ...newCase, courtNumber: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Ej. Juzgado Primero Civil"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Partido judicial *</label>
              <input
                type="text"
                value={newCase.judicialDistrict}
                onChange={(e) => setNewCase({ ...newCase, judicialDistrict: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Ej. Primer Partido Judicial"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Descripcion inicial *</label>
            <textarea
              value={newCase.description}
              onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
              className="min-h-[100px] w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Breve descripcion del caso..."
              required
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-neutral-100 pt-4">
            <button
              type="button"
              onClick={() => setShowNewCaseForm(false)}
              className="rounded-xl px-5 py-2.5 font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Guardar expediente
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderClientsSection = () => (
    <div className="space-y-6">
      {renderAdminSectionHeader('Clientes', 'Base de clientes con acceso privado al portal.')}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {clientRecords.map((client) => (
          <div key={client.accessCode} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-neutral-900">{client.name}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">{client.accessCode}</p>
              </div>
              <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
                {client.dossiers.length} {client.dossiers.length === 1 ? 'expediente' : 'expedientes'}
              </span>
            </div>

            <div className="mt-4 space-y-3 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-neutral-400" />
                {client.phone}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-neutral-400" />
                {client.email || 'Sin correo registrado'}
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-neutral-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">Ultima actividad</p>
              <p className="mt-1 text-sm font-medium text-neutral-900">{formatDate(client.latestUpdate)}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {client.dossiers.map((dossier) => (
                <button
                  key={dossier.id}
                  type="button"
                  onClick={() => openDossierDetail(dossier)}
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  {dossier.id}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDossiersSection = () => (
    <div className="space-y-6">
      {showNewCaseForm
        ? renderNewCaseForm()
        : (
            <>
              {renderAdminSectionHeader(
                'Expedientes',
                'Seguimiento completo de juicios, movimientos, archivos y calendario por asunto.',
                <button
                  type="button"
                  onClick={() => setShowNewCaseForm(true)}
                  className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo caso
                </button>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Total expedientes</p>
                    <p className="text-2xl font-bold text-neutral-900">{dossiers.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="rounded-xl bg-neutral-100 p-3 text-neutral-700">
                    <Scale className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-500">En proceso / revision</p>
                    <p className="text-2xl font-bold text-neutral-900">
                      {dossiers.filter((dossier) => dossier.status === 'EN_PROCESO' || dossier.status === 'EN_REVISION').length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="rounded-xl bg-neutral-100 p-3 text-neutral-700">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Resueltos</p>
                    <p className="text-2xl font-bold text-neutral-900">{dossiers.filter((dossier) => dossier.status === 'RESUELTO').length}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="border-b border-neutral-100 bg-neutral-50 px-6 py-4">
                  <h3 className="text-lg font-bold text-neutral-900">Listado de juicios</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-neutral-100 bg-white text-sm text-neutral-500">
                        <th className="px-6 py-4 font-medium">Cliente</th>
                        <th className="px-6 py-4 font-medium">Expediente</th>
                        <th className="px-6 py-4 font-medium">Actor / Demandado</th>
                        <th className="px-6 py-4 font-medium">Juzgado</th>
                        <th className="px-6 py-4 font-medium">Estatus</th>
                        <th className="px-6 py-4 text-right font-medium">Accion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {dossiers.map((dossier) => (
                        <tr
                          key={dossier.id}
                          className="group cursor-pointer transition-colors hover:bg-neutral-50"
                          onClick={() => openDossierDetail(dossier)}
                        >
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-neutral-900">{dossier.clientName}</div>
                            <div className="mt-0.5 text-xs text-neutral-400">{dossier.clientAccessCode}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-neutral-900">{dossier.id}</span>
                            <div className="mt-0.5 text-xs text-neutral-400">{dossier.category}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-neutral-900">{dossier.plaintiff}</div>
                            <div className="mt-0.5 text-xs text-neutral-500">
                              <span className="mr-1 text-neutral-400">vs</span>
                              {dossier.defendant}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-neutral-700">{dossier.courtNumber}</div>
                            <div className="mt-0.5 text-xs text-neutral-400">{dossier.judicialDistrict}</div>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={dossier.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 opacity-0 transition-all group-hover:opacity-100">
                              <ChevronRight className="h-5 w-5" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
    </div>
  );

  const renderCalendarSection = () => (
    <div className="space-y-6">
      {renderAdminSectionHeader('Calendario', 'Vista mensual del calendario del despacho con audiencias, vencimientos, citas y recordatorios.')}

      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-neutral-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">Mes visible</p>
            <h3 className="mt-2 text-2xl font-bold capitalize text-neutral-900">{adminCalendarMonthLabel}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setAdminCalendarMonth(
                  (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1)
                )
              }
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setAdminCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
              }}
              className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() =>
                setAdminCalendarMonth(
                  (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1)
                )
              }
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-neutral-100 bg-neutral-50 text-center text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
          {calendarWeekdayLabels.map((day) => (
            <div key={day} className="px-3 py-4">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {adminCalendarGridDays.map((day) => (
            <div
              key={toDateKey(day.date)}
              className={`min-h-[150px] border-r border-b border-neutral-100 p-3 last:border-r-0 ${
                day.isCurrentMonth ? 'bg-white' : 'bg-neutral-50/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                    day.isToday
                      ? 'bg-black text-white'
                      : day.isCurrentMonth
                        ? 'text-neutral-900'
                        : 'text-neutral-400'
                  }`}
                >
                  {day.date.getDate()}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-300">
                  {day.entries.length > 0 ? `${day.entries.length} ev` : ''}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {day.entries.slice(0, 3).map((item) => (
                  <button
                    key={item.entry.id}
                    type="button"
                    onClick={() => openDossierDetail(dossiers.find((dossier) => dossier.id === item.dossierId) ?? dossiers[0])}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-left transition-colors hover:bg-neutral-100"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                      {getCalendarTypeLabel(item.entry.type)}
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-neutral-900">{item.entry.title}</p>
                    <p className="mt-1 truncate text-xs text-neutral-500">
                      {item.dossierId} · {item.clientName}
                    </p>
                  </button>
                ))}
                {day.entries.length > 3 ? (
                  <div className="rounded-xl bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-500">
                    +{day.entries.length - 3} eventos mas
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-100 bg-neutral-50 px-6 py-4">
          <h3 className="text-lg font-bold text-neutral-900">Proximos eventos</h3>
        </div>
        {dashboardAgendaEntries.length > 0 ? (
          <div className="grid gap-4 p-6 lg:grid-cols-2">
            {dashboardAgendaEntries.map(({ dossierId, dossierTitle, clientName, entry }) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => openDossierDetail(dossiers.find((dossier) => dossier.id === dossierId) ?? dossiers[0])}
                className="rounded-2xl border border-neutral-200 bg-white p-5 text-left transition-colors hover:bg-neutral-50"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
                    {getCalendarTypeLabel(entry.type)}
                  </span>
                  <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                    {entry.isClientVisible ? 'Cliente + admin' : 'Solo admin'}
                  </span>
                </div>
                <p className="mt-3 text-base font-bold text-neutral-900">{entry.title}</p>
                <p className="mt-1 text-sm text-neutral-500">{formatDate(entry.date)}</p>
                <p className="mt-3 text-sm text-neutral-700">
                  {dossierId} · {dossierTitle}
                </p>
                <p className="mt-1 text-sm text-neutral-500">{clientName}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-sm text-neutral-500">Todavia no hay eventos registrados en el calendario general.</div>
        )}
      </div>
    </div>
  );

  const renderSettingsSection = () => (
    <div className="space-y-6">
      {renderAdminSectionHeader('Ajustes', 'Configuraciones base del panel y del acceso del cliente.')}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">Acceso interno</p>
          <p className="mt-3 text-lg font-bold text-neutral-900">Credenciales del panel</p>
          <p className="mt-2 text-sm text-neutral-500">El portal cliente y el panel administrativo comparten el mismo backend PHP y la misma base de datos de expedientes.</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">Portal cliente</p>
          <p className="mt-3 text-lg font-bold text-neutral-900">Codigo de expediente o acceso</p>
          <p className="mt-2 text-sm text-neutral-500">La consulta del cliente acepta el codigo del expediente o el codigo de acceso ligado al cliente.</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">Calendario</p>
          <p className="mt-3 text-lg font-bold text-neutral-900">Cuadricula propia</p>
          <p className="mt-2 text-sm text-neutral-500">Se usa una cuadricula mensual nativa, sin depender de servicios externos o APIs de pago.</p>
        </div>
      </div>
    </div>
  );

  const renderAdminContent = () => {
    if (selectedDossier) {
      return renderAdminShell(renderDossierDetail(true));
    }

    switch (adminSection) {
      case 'clientes':
        return renderAdminShell(renderClientsSection());
      case 'calendario':
        return renderAdminShell(renderCalendarSection());
      case 'ajustes':
        return renderAdminShell(renderSettingsSection());
      case 'expedientes':
      default:
        return renderAdminShell(renderDossiersSection());
    }
  };

  if (showAdminLogin) {
    return (
      <div className="portal-vignette portal-grid relative flex min-h-screen items-center justify-center bg-neutral-50 px-4 font-sans selection:bg-blue-100 selection:text-blue-900">
        <a
          href="/"
          className="absolute top-4 left-4 z-20 inline-flex items-center rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50"
        >
          Volver al sitio
        </a>
        <div className="portal-sheen relative w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <button
            onClick={() => setShowAdminLogin(false)}
            className="absolute top-6 left-6 text-neutral-400 transition-colors hover:text-neutral-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="mt-6 mb-8 text-center">
            <div className="mx-auto mb-5 flex w-fit items-center justify-center rounded-[1.75rem] border border-black/10 bg-white px-5 py-4">
              <img src={BRAND_WORDMARK} alt="Hermosillo y Asociados" className="h-14 w-auto object-contain" />
            </div>
            <div className="mx-auto mb-4 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.06] p-4 text-neutral-900">
              <Lock className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">Acceso interno</h2>
            <p className="mt-2 text-neutral-500">Ingresa tus credenciales para acceder al panel del despacho.</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Usuario</label>
              <input
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                placeholder="admin"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Contrasena</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                placeholder="********"
                required
              />
            </div>
            {loginError ? <p className="text-sm font-medium text-red-500">{loginErrorMessage || 'Credenciales incorrectas.'}</p> : null}
            <button
              type="submit"
              className="mt-4 flex w-full items-center justify-center rounded-xl bg-blue-600 py-3.5 font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-vignette portal-grid min-h-screen bg-neutral-50 font-sans text-neutral-900 selection:bg-blue-100 selection:text-blue-900">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white">
        <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:px-10">
          <a href="/" className="group flex items-center gap-2">
            <div className="rounded-lg bg-blue-600 p-1.5 text-white transition-colors group-hover:bg-blue-700">
              <ArrowLeft className="h-5 w-5" />
            </div>
          </a>

          <div className="flex justify-center">
            <div className="w-[min(82vw,44rem)] px-2 text-center sm:px-4">
              <p className="text-[1rem] font-bold uppercase tracking-tight text-neutral-900 sm:text-[1.22rem] md:text-[1.42rem] lg:text-[1.65rem]">
                Sistema de Control de Expedientes
              </p>
              <p className="mt-2 font-serif text-[0.9rem] font-normal tracking-[0.08em] text-neutral-500 sm:text-[1.02rem] md:text-[1.12rem]">
                Hermosillo y Asociados
              </p>
            </div>
          </div>

          <div className="h-8 w-8 sm:h-8 sm:w-8" aria-hidden="true" />
        </div>
      </header>

      <main className="w-full px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
        <AnimatePresence mode="wait">
          {viewMode === 'lawyer' ? (
            <motion.div key={`admin-${adminSection}-${selectedDossier?.id ?? 'overview'}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {renderAdminContent()}
            </motion.div>
          ) : selectedDossier ? (
            <motion.div key={`client-detail-${selectedDossier.id}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {renderDossierDetail(false)}
            </motion.div>
          ) : !hasSearched ? (
            <motion.div key="search-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-10 sm:mt-14">
              <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.92fr]">
                <div className="space-y-8">
                  <div className="w-fit rounded-[2rem] border border-neutral-200 bg-white px-5 py-4 shadow-sm">
                    <img src={BRAND_WORDMARK} alt="Hermosillo y Asociados" className="h-14 w-auto object-contain" />
                  </div>

                  <div>
                    <span className="inline-flex rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-600">
                      Acceso cliente
                    </span>
                    <h2 className="mt-5 text-3xl font-bold tracking-tight text-neutral-900 sm:text-5xl">INTRODUCE TU CODIGO DE EXPEDIENTE O ACCESO.</h2>
                    <p className="mt-4 max-w-xl text-lg text-neutral-500">
                      Ingresa tu codigo de expediente o tu codigo de acceso para consultar la informacion real registrada en la base de datos.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {portalHighlights.map((item) => (
                      <div key={item.label} className="rounded-[1.35rem] border border-neutral-200 bg-white px-4 py-4 shadow-sm">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-neutral-400">{item.label}</p>
                        <p className="mt-2 text-sm font-semibold text-neutral-900">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSearch} className="group relative rounded-[1.8rem] border border-neutral-200 bg-white p-3 shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-7 text-neutral-400 transition-colors">
                      <Search className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ej. EXP-2026-117 o ABC1234"
                      className="block w-full rounded-[1.3rem] border-0 bg-transparent py-5 pl-14 pr-36 text-lg text-neutral-900 outline-none placeholder:text-neutral-400 focus:ring-0"
                      autoFocus
                    />
                    <div className="absolute inset-y-3 right-3 flex items-center">
                      <button
                        type="submit"
                        disabled={!query.trim()}
                        className="h-full rounded-[1.15rem] bg-blue-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
                      >
                        Buscar
                      </button>
                    </div>
                  </form>

                  <div className="text-sm text-neutral-500">
                    <p>Usa el codigo real de expediente o el codigo de acceso del cliente. Ejemplos: "EXP-2026-117" o "ABC1234"</p>
                  </div>
                </div>

                <div className="relative flex justify-center lg:justify-end">
                  <div className="relative w-[320px] rounded-[3.4rem] border border-white/12 bg-black p-3 shadow-[0_35px_120px_rgba(0,0,0,0.72)] sm:w-[360px]">
                    <div className="rounded-[3rem] border border-white/10 bg-[linear-gradient(180deg,#0f0f10,#020202)] p-3">
                      <div className="overflow-hidden rounded-[2.5rem] bg-white">
                        <div className="mx-auto mt-3 h-1.5 w-20 rounded-full bg-black/10" />
                        <div className="space-y-4 p-5">
                          <div className="rounded-[1.4rem] border border-white/8 bg-black px-4 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.1)]">
                            <img src={BRAND_WORDMARK_DARK} alt="Hermosillo y Asociados" className="h-14 w-full object-contain" />
                          </div>

                          <div className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(135deg,#0b0b0b,#171717)] px-5 py-5 text-white shadow-[0_20px_44px_rgba(15,23,42,0.1)]">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-[0.65rem] uppercase tracking-[0.22em] text-white/50">Expediente</p>
                                <p className="mt-1 text-lg font-semibold">Acceso seguro</p>
                              </div>
                              <span className="rounded-full border border-white/14 bg-white/6 px-3 py-1 text-[0.62rem] uppercase tracking-[0.2em] text-white/85">
                                En proceso
                              </span>
                            </div>
                            <div className="mt-4 h-2 rounded-full bg-white/10">
                              <div className="h-2 w-[74%] rounded-full bg-white/82" />
                            </div>
                            <p className="mt-3 text-sm text-white/80">Seguimiento del juicio, documentos y fechas registradas.</p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-[1.25rem] border border-white/8 bg-[#080808] px-4 py-4 shadow-[0_18px_36px_rgba(15,23,42,0.08)]">
                              <p className="text-[0.62rem] uppercase tracking-[0.22em] text-white/45">Cliente</p>
                              <p className="mt-2 text-sm font-semibold text-white">Consulta por codigo</p>
                            </div>
                            <div className="rounded-[1.25rem] border border-white/8 bg-[#080808] px-4 py-4 shadow-[0_18px_36px_rgba(15,23,42,0.08)]">
                              <p className="text-[0.62rem] uppercase tracking-[0.22em] text-white/45">Base de datos</p>
                              <p className="mt-2 text-sm font-semibold text-white">Informacion real</p>
                            </div>
                          </div>

                          <div className="rounded-[1.35rem] border border-white/8 bg-[#080808] px-4 py-4 shadow-[0_18px_36px_rgba(15,23,42,0.08)]">
                            <p className="text-sm font-bold uppercase tracking-[0.18em] text-white">Accion inmediata</p>
                            <p className="mt-2 text-sm text-white/60">Validar la proxima audiencia y revisar el archivo adjunto desde el panel.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="results-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="mb-6 flex items-center gap-4">
                <button onClick={resetSearch} className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Resultados de busqueda</h2>
                  <p className="mt-0.5 text-sm text-neutral-500">Mostrando resultados para "{query}"</p>
                </div>
              </div>

              {results.length > 0 ? (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                    <div className="grid gap-4 lg:grid-cols-[1.35fr_0.9fr_0.9fr_0.9fr]">
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">Filtrar dentro de resultados</label>
                        <input
                          type="text"
                          value={resultFilterQuery}
                          onChange={(e) => setResultFilterQuery(e.target.value)}
                          placeholder="Expediente, cliente, juicio o juzgado"
                          className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">Estatus</label>
                        <select
                          value={resultStatusFilter}
                          onChange={(e) => setResultStatusFilter(e.target.value as 'ALL' | DossierStatus)}
                          className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="ALL">Todos los estatus</option>
                          {dossierStatusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">Materia</label>
                        <select
                          value={resultCategoryFilter}
                          onChange={(e) => setResultCategoryFilter(e.target.value)}
                          className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="ALL">Todas las materias</option>
                          {resultCategoryOptions.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">Orden</label>
                        <select
                          value={resultSortMode}
                          onChange={(e) => setResultSortMode(e.target.value as ResultSortMode)}
                          className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="updated_desc">Mas recientes primero</option>
                          <option value="updated_asc">Mas antiguos primero</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 border-t border-neutral-100 pt-4 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
                      <p>
                        Se encontraron {results.length} expedientes. Mostrando {filteredResults.length}
                        {filteredResults.length === 1 ? ' resultado' : ' resultados'} tras aplicar filtros.
                      </p>
                      {hasActiveResultFilters ? (
                        <button
                          onClick={resetResultFilters}
                          className="inline-flex items-center justify-center rounded-lg border border-neutral-200 px-4 py-2 font-medium text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
                        >
                          Limpiar filtros
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {filteredResults.length > 0 ? (
                    <div className="grid gap-4">
                      {filteredResults.map((dossier) => (
                        <motion.div
                          key={dossier.id}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="group cursor-pointer rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                          onClick={() => openDossierDetail(dossier)}
                        >
                          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-neutral-900 transition-colors group-hover:text-blue-600">{dossier.id}</h3>
                                <StatusBadge status={dossier.status} />
                              </div>
                              <p className="font-medium text-neutral-600">{dossier.title}</p>
                              <div className="flex flex-wrap items-center gap-4 pt-1 text-sm text-neutral-500">
                                <span className="flex items-center gap-1.5" title="Cliente">
                                  <Users className="h-4 w-4" />
                                  {dossier.clientName}
                                </span>
                                <span className="flex items-center gap-1.5" title="Partido judicial">
                                  <Scale className="h-4 w-4" />
                                  {dossier.judicialDistrict}
                                </span>
                                <span className="flex items-center gap-1.5" title="Juzgado">
                                  <Building2 className="h-4 w-4" />
                                  {dossier.courtNumber}
                                </span>
                              </div>
                            </div>
                            <div className="hidden text-neutral-300 transition-colors group-hover:text-blue-500 sm:flex">
                              <ChevronRight className="h-6 w-6" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                        <Search className="h-8 w-8" />
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-neutral-900">Ningun expediente coincide con los filtros</h3>
                      <p className="mx-auto mb-6 max-w-md text-neutral-500">
                        Si este cliente tiene varios expedientes, ajusta los filtros para ubicar el correcto por estatus, materia o juzgado.
                      </p>
                      <button onClick={resetResultFilters} className="inline-flex items-center font-medium text-blue-600 transition-colors hover:text-blue-700">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quitar filtros
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                    <Search className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-neutral-900">No se encontraron expedientes</h3>
                  <p className="mx-auto mb-6 max-w-md text-neutral-500">
                    No pudimos encontrar ningun expediente que coincida con "{query}". Verifica que el codigo de expediente o de acceso este escrito correctamente.
                  </p>
                  <button onClick={resetSearch} className="inline-flex items-center font-medium text-blue-600 transition-colors hover:text-blue-700">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Intentar otra busqueda
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="px-4 pb-6 pt-2 text-center sm:px-6 lg:px-10">
        <a
          href="https://www.armiraarte.com"
          target="_blank"
          rel="noreferrer"
          className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-neutral-400 transition-colors hover:text-neutral-600"
        >
          Creado por ARMiRARTE
        </a>
      </footer>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  History,
  MessageSquare,
  Plus,
  Search,
  Settings2,
  X,
} from 'lucide-react';
import { LegalTeamBoard } from './LegalTeamBoard';
import type { Dossier, LegalControlStatus } from '../types';
import { formatDate } from '../utils';

type GroupMode = 'none' | 'legalStatus';
type PaneKey = 'tracking' | 'resolved' | 'team';
type SortKey = 'updatedAt' | 'clientName' | 'title' | 'legalStatus';
type SortDirection = 'asc' | 'desc';
type ColumnKey = 'client' | 'expediente' | 'court' | 'legalStatus' | 'pendingNotes';

type LegalControlUpdatePayload = {
  dossierCode: string;
  legalStatus?: LegalControlStatus;
  pendingNotes?: string;
};

interface LegalControlBoardProps {
  dossiers: Dossier[];
  onCreateDossier: () => void;
  onEditDossier: (dossier: Dossier) => void;
  onUpdateLegalControl: (payload: LegalControlUpdatePayload) => Promise<void>;
  phpApiEnabled: boolean;
}

const legalStatusOptions: Array<{
  value: LegalControlStatus;
  label: string;
  shortLabel: string;
  tone: string;
  chipTone: string;
}> = [
  {
    value: 'ESPERANDO_ACUERDO',
    label: 'Esperando Acuerdo',
    shortLabel: 'Esperando Acuerdo',
    tone: 'border-[#f6bf69] bg-[#f4b356] text-white',
    chipTone: 'bg-[#4b3413] text-[#ffd89b] border-[#9c6b2b]',
  },
  {
    value: 'ESP_REG_PS_AG',
    label: 'Esp. Reg. PS/AG',
    shortLabel: 'Esp. Reg. PS/AG',
    tone: 'border-[#a9afc1] bg-[#8d93a5] text-white',
    chipTone: 'bg-[#313645] text-[#d7dbea] border-[#666d7f]',
  },
  {
    value: 'FINALIZADO',
    label: 'Finalizado',
    shortLabel: 'Finalizado',
    tone: 'border-[#67bfe3] bg-[#43a7d4] text-white',
    chipTone: 'bg-[#16384a] text-[#bbe8fb] border-[#2f7290]',
  },
  {
    value: 'ESP_TERMINO',
    label: 'Esp. Término',
    shortLabel: 'Esp. Término',
    tone: 'border-[#ffab86] bg-[#ff845c] text-white',
    chipTone: 'bg-[#4a261b] text-[#ffd2c0] border-[#9b573f]',
  },
  {
    value: 'ESP_AL_CLIENTE',
    label: 'Esp. al cliente',
    shortLabel: 'Esp. al cliente',
    tone: 'border-[#c494ef] bg-[#a871dc] text-white',
    chipTone: 'bg-[#352146] text-[#e5ccff] border-[#74509c]',
  },
  {
    value: 'PENDIENTE_SEGUIMIENTO',
    label: 'Pendiente/Seguimiento',
    shortLabel: 'Pendiente/Seguimiento',
    tone: 'border-[#ef8aa1] bg-[#d66780] text-white',
    chipTone: 'bg-[#4a1f2d] text-[#ffc8d2] border-[#914558]',
  },
  {
    value: 'AUD_DILIG_PROXIMA',
    label: 'Aud/Dilig Próxima',
    shortLabel: 'Aud/Dilig Próxima',
    tone: 'border-[#ff82bf] bg-[#f84d99] text-white',
    chipTone: 'bg-[#4a1731] text-[#ffc3de] border-[#8f355f]',
  },
  {
    value: 'PENDIENTE',
    label: 'Pendiente',
    shortLabel: 'Pendiente',
    tone: 'border-[#ef7f95] bg-[#e3647b] text-white',
    chipTone: 'bg-[#4a1d28] text-[#ffc6cf] border-[#954557]',
  },
  {
    value: 'REALIZADO',
    label: 'Realizado',
    shortLabel: 'Realizado',
    tone: 'border-[#67dba4] bg-[#3eca85] text-white',
    chipTone: 'bg-[#173827] text-[#b8f2d3] border-[#2f6f4d]',
  },
];

const defaultColumnVisibility: Record<ColumnKey, boolean> = {
  client: true,
  expediente: true,
  court: true,
  legalStatus: true,
  pendingNotes: true,
};

const normalizeSearchText = (value: string) =>
  value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const compareStrings = (left: string, right: string) =>
  left.localeCompare(right, 'es-MX', {
    sensitivity: 'base',
    numeric: true,
  });

const getLegalStatusMeta = (status: LegalControlStatus) =>
  legalStatusOptions.find((option) => option.value === status) ?? legalStatusOptions[2];

const resolvedLegalStatusSet = new Set<LegalControlStatus>(['FINALIZADO', 'REALIZADO']);

const isNotesHistoryEvent = (event: Dossier['history'][number]) => {
  const haystack = `${event.title} ${event.description}`.toLowerCase();
  return (
    event.kind === 'LEGAL_NOTES' ||
    event.kind === 'LEGAL_CONTROL' ||
    haystack.includes('notas de pendientes') ||
    haystack.includes('antes:')
  );
};

const parseNotesChangeDescription = (description: string) => {
  const match = description.match(/^Antes:\s*(.*?)\s+Ahora:\s*(.*)$/is);
  if (!match) {
    return null;
  }

  return {
    before: match[1]?.trim() ?? '',
    after: match[2]?.trim() ?? '',
  };
};

const stopInteractivePropagation = (event: React.SyntheticEvent) => {
  event.stopPropagation();
};

export function LegalControlBoard({
  dossiers,
  onCreateDossier,
  onEditDossier,
  onUpdateLegalControl,
  phpApiEnabled,
}: LegalControlBoardProps) {
  const statusMenuRef = useRef<HTMLDivElement | null>(null);
  const [activePane, setActivePane] = useState<PaneKey>('tracking');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | LegalControlStatus>('ALL');
  const [courtFilter, setCourtFilter] = useState('ALL');
  const [clientFilter, setClientFilter] = useState('');
  const [dossierFilter, setDossierFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [groupMode, setGroupMode] = useState<GroupMode>('none');
  const [columnVisibility, setColumnVisibility] = useState(defaultColumnVisibility);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false);
  const [showGroupPanel, setShowGroupPanel] = useState(false);
  const [showColumnsPanel, setShowColumnsPanel] = useState(false);
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [savingStatusById, setSavingStatusById] = useState<Record<string, boolean>>({});
  const [notesHistoryDossierId, setNotesHistoryDossierId] = useState<string | null>(null);
  const [selectedDossierId, setSelectedDossierId] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<LegalControlStatus, boolean>>({
    ESPERANDO_ACUERDO: false,
    ESP_REG_PS_AG: false,
    FINALIZADO: false,
    ESP_TERMINO: false,
    ESP_AL_CLIENTE: false,
    PENDIENTE_SEGUIMIENTO: false,
    AUD_DILIG_PROXIMA: false,
    PENDIENTE: false,
    REALIZADO: false,
  });

  useEffect(() => {
    const currentIds = new Set(dossiers.map((dossier) => dossier.id));

    if (editingStatusId && !currentIds.has(editingStatusId)) {
      setEditingStatusId(null);
    }

    if (notesHistoryDossierId && !currentIds.has(notesHistoryDossierId)) {
      setNotesHistoryDossierId(null);
    }

    if (selectedDossierId && !currentIds.has(selectedDossierId)) {
      setSelectedDossierId(null);
    }
  }, [dossiers, editingStatusId, notesHistoryDossierId, selectedDossierId]);

  useEffect(() => {
    if (!editingStatusId) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setEditingStatusId(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [editingStatusId]);

  const trackingDossiers = dossiers.filter((dossier) => !resolvedLegalStatusSet.has(dossier.legalStatus));
  const resolvedDossiers = dossiers.filter((dossier) => resolvedLegalStatusSet.has(dossier.legalStatus));
  const paneSourceDossiers = activePane === 'resolved' ? resolvedDossiers : trackingDossiers;
  const canCreateDossier = activePane !== 'resolved';
  const availableCourts = Array.from(
    new Set(paneSourceDossiers.map((dossier) => dossier.courtNumber.trim()).filter(Boolean))
  ).sort(compareStrings);
  const normalizedSearchTerm = normalizeSearchText(searchTerm);
  const normalizedClientFilter = normalizeSearchText(clientFilter);
  const normalizedDossierFilter = normalizeSearchText(dossierFilter);
  const hasAdvancedFilters =
    statusFilter !== 'ALL' ||
    courtFilter !== 'ALL' ||
    normalizedClientFilter.length > 0 ||
    normalizedDossierFilter.length > 0;

  const filteredDossiers = paneSourceDossiers.filter((dossier) => {
    if (statusFilter !== 'ALL' && dossier.legalStatus !== statusFilter) {
      return false;
    }

    if (courtFilter !== 'ALL' && dossier.courtNumber !== courtFilter) {
      return false;
    }

    if (normalizedClientFilter && !normalizeSearchText(dossier.clientName).includes(normalizedClientFilter)) {
      return false;
    }

    if (
      normalizedDossierFilter &&
      !normalizeSearchText(`${dossier.title} ${dossier.id}`).includes(normalizedDossierFilter)
    ) {
      return false;
    }

    if (!normalizedSearchTerm) {
      return true;
    }

    const haystack = normalizeSearchText(
      [
        dossier.clientName,
        dossier.clientAccessCode,
        dossier.title,
        dossier.id,
        dossier.courtNumber,
        dossier.judicialDistrict,
        dossier.pendingNotes,
        dossier.assignedAdminName || '',
        getLegalStatusMeta(dossier.legalStatus).label,
      ].join(' ')
    );

    return haystack.includes(normalizedSearchTerm);
  });

  const sortedDossiers = [...filteredDossiers].sort((left, right) => {
    const directionMultiplier = sortDirection === 'asc' ? 1 : -1;

    if (sortKey === 'updatedAt') {
      return (new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime()) * directionMultiplier;
    }

    if (sortKey === 'legalStatus') {
      return (
        compareStrings(getLegalStatusMeta(left.legalStatus).label, getLegalStatusMeta(right.legalStatus).label) *
        directionMultiplier
      );
    }

    if (sortKey === 'clientName') {
      return compareStrings(left.clientName, right.clientName) * directionMultiplier;
    }

    return compareStrings(left.title, right.title) * directionMultiplier;
  });

  const groupedDossiers = legalStatusOptions
    .map((option) => ({
      ...option,
      dossiers: sortedDossiers.filter((dossier) => dossier.legalStatus === option.value),
    }))
    .filter((group) => group.dossiers.length > 0);

  const visibleColumnCount = Math.max(1, Object.values(columnVisibility).filter(Boolean).length);

  const notesHistoryDossier =
    notesHistoryDossierId !== null ? dossiers.find((dossier) => dossier.id === notesHistoryDossierId) ?? null : null;
  const selectedDossier =
    selectedDossierId !== null ? dossiers.find((dossier) => dossier.id === selectedDossierId) ?? null : null;
  const notesHistoryEntries =
    notesHistoryDossier !== null
      ? [...(notesHistoryDossier.history ?? [])]
          .filter(isNotesHistoryEvent)
          .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
      : [];

  const clearPanels = (except?: 'filters' | 'sort' | 'group' | 'columns') => {
    setShowFiltersPanel(except === 'filters');
    setShowSortPanel(except === 'sort');
    setShowGroupPanel(except === 'group');
    setShowColumnsPanel(except === 'columns');
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setCourtFilter('ALL');
    setClientFilter('');
    setDossierFilter('');
  };

  const handleStatusChange = async (dossier: Dossier, legalStatus: LegalControlStatus) => {
    setEditingStatusId(null);
    setSavingStatusById((current) => ({ ...current, [dossier.id]: true }));

    try {
      await onUpdateLegalControl({
        dossierCode: dossier.id,
        legalStatus,
      });
    } catch {
      // El estado se revierte de forma optimista en el contenedor padre.
    } finally {
      setSavingStatusById((current) => ({ ...current, [dossier.id]: false }));
    }
  };

  const renderStatusCell = (dossier: Dossier) => {
    const statusMeta = getLegalStatusMeta(dossier.legalStatus);
    const isSaving = savingStatusById[dossier.id] === true;
    const isMenuOpen = editingStatusId === dossier.id;

    return (
      <div
        ref={isMenuOpen ? statusMenuRef : null}
        onClick={stopInteractivePropagation}
        className="relative inline-flex"
      >
        <button
          type="button"
          disabled={isSaving}
          onClick={(event) => {
            stopInteractivePropagation(event);
            setEditingStatusId((current) => (current === dossier.id ? null : dossier.id));
          }}
          className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-bold tracking-[0.01em] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 ${statusMeta.tone}`}
        >
          {isSaving ? <Clock className="mr-2 h-3.5 w-3.5 animate-pulse" /> : null}
          <span>{statusMeta.shortLabel}</span>
          <ChevronDown className={`h-3.5 w-3.5 transition ${isMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {isMenuOpen ? (
          <div className="absolute left-0 top-full z-30 mt-2 w-[250px] rounded-2xl border border-[#e4e4e7] bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
            <div className="grid gap-2">
              {legalStatusOptions.map((option) => {
                const isSelected = option.value === dossier.legalStatus;

                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={isSaving}
                    onClick={(event) => {
                      stopInteractivePropagation(event);
                      void handleStatusChange(dossier, option.value);
                    }}
                    className={`inline-flex min-h-[42px] items-center justify-between rounded-xl border px-3 py-2 text-left text-xs font-bold tracking-[0.01em] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 ${option.tone} ${
                      isSelected ? 'ring-2 ring-[#111111]/20 ring-offset-1' : ''
                    }`}
                  >
                    <span>{option.shortLabel}</span>
                    {isSelected ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  const renderNotesCell = (dossier: Dossier) => {
    const notesHistory = [...(dossier.history ?? [])]
      .filter(isNotesHistoryEvent)
      .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());

    return (
      <div onClick={stopInteractivePropagation}>
        <div className="space-y-3 rounded-2xl border border-transparent bg-white px-3 py-3 transition hover:border-[#e4e4e7] hover:bg-[#fafafa]">
          <button
            type="button"
            onClick={(event) => {
              stopInteractivePropagation(event);
              setNotesHistoryDossierId(dossier.id);
            }}
            className="ui-btn ui-btn-info inline-flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-3 text-left transition"
            aria-label={`Ver historial de notas de ${dossier.title}`}
            title="Historial de notas"
          >
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-current" />
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-current">Historial</span>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
              {notesHistory.length} cambios
            </span>
          </button>

          <div className="rounded-2xl border border-dashed border-[#d4d4d8] bg-[#fafafa] px-3 py-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                Comentarios cliente
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Este bloque se integrara desde otra parte del proyecto.
            </p>
            <span className="mt-3 inline-flex rounded-full border border-[#e4e4e7] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Proximamente
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderTableRows = (rows: Dossier[]) =>
    rows.map((dossier) => (
      <tr key={dossier.id} className="ui-table-row border-b border-[#e4e4e7] bg-white transition hover:bg-[#fafafa]">
        {columnVisibility.client ? (
          <td className="px-4 py-4 align-top">
            <div className="min-w-[220px]">
              <p className="text-sm font-semibold text-slate-900">{dossier.clientName}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400">{dossier.clientAccessCode}</p>
            </div>
          </td>
        ) : null}

        {columnVisibility.expediente ? (
          <td className="px-4 py-4 align-top">
            <div className="min-w-[210px]">
              <p className="text-sm font-semibold text-slate-900">{dossier.title}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400">{dossier.id}</p>
              <button
                type="button"
                onClick={() => setSelectedDossierId(dossier.id)}
                className="ui-btn ui-btn-primary mt-3 inline-flex items-center rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition"
              >
                Ver expediente
              </button>
            </div>
          </td>
        ) : null}

        {columnVisibility.court ? (
          <td className="px-4 py-4 align-top">
            <div className="min-w-[190px]">
              <p className="text-sm font-semibold text-slate-900">{dossier.courtNumber || 'Sin juzgado'}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400">
                {dossier.judicialDistrict || 'Sin distrito'}
              </p>
            </div>
          </td>
        ) : null}

        {columnVisibility.legalStatus ? <td className="px-4 py-4 align-top">{renderStatusCell(dossier)}</td> : null}

        {columnVisibility.pendingNotes ? (
          <td className="px-4 py-4 align-top">
            <div className="min-w-[360px]">{renderNotesCell(dossier)}</div>
          </td>
        ) : null}
      </tr>
    ));

  const renderTeamBoard = () => <LegalTeamBoard phpApiEnabled={phpApiEnabled} />;

  return (
    <>
      <section className="flex h-full min-h-0 w-full flex-col border-y border-[#d4d4d8] bg-white text-slate-900">
        <div className="shrink-0 border-b border-[#e4e4e7] px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'tracking' as PaneKey, label: 'SEGUIMIENTO ACTIVO', count: trackingDossiers.length },
                  { key: 'resolved' as PaneKey, label: 'EXPEDIENTES RESUELTOS', count: resolvedDossiers.length },
                  { key: 'team' as PaneKey, label: 'EQUIPO JURIDICO' },
                ].map((pane) => {
                  const isActive = activePane === pane.key;

                  return (
                    <button
                      key={pane.key}
                      type="button"
                      onClick={() => {
                        setActivePane(pane.key);
                        clearPanels();
                      }}
                      className={`ui-btn ${isActive ? 'ui-btn-primary' : 'ui-btn-neutral'} inline-flex items-center rounded-xl border px-4 py-2.5 text-sm font-semibold transition`}
                    >
                      <span>{pane.label}</span>
                      {typeof pane.count === 'number' ? (
                        <span
                          className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            isActive ? 'bg-white/12 text-white' : 'bg-[#f4f4f5] text-slate-600'
                          }`}
                        >
                          {pane.count}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {activePane !== 'team' ? (
                <div className="flex flex-col gap-3 xl:min-w-0 xl:flex-1 xl:flex-row xl:items-center xl:justify-end">
                  <div className="relative min-w-0 xl:max-w-[420px] xl:flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      className="w-full rounded-xl border border-[#e4e4e7] bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#111111]"
                      placeholder="Buscar cliente, expediente, juzgado o notas"
                    />
                  </div>

                  <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 xl:mx-0 xl:px-0 xl:pb-0">
                    {canCreateDossier ? (
                      <button
                        type="button"
                        onClick={onCreateDossier}
                        className="ui-btn ui-btn-add inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-white transition"
                        aria-label="Agregar expediente"
                        title="Agregar expediente"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {activePane === 'team' ? (
          <div className="min-h-0 flex-1 overflow-hidden px-5 py-5 sm:px-6">
            {renderTeamBoard()}
          </div>
        ) : (
          <div className="ui-table-shell min-h-0 flex-1 overflow-hidden">
            <div className="ui-table-scroll h-full">
              {sortedDossiers.length > 0 ? (
                <table className="ui-table min-w-[1080px] w-full border-collapse">
                  <thead className="ui-table-head sticky top-0 z-20 bg-[#f5f5f5]/95 backdrop-blur">
                    <tr className="border-b border-[#e4e4e7] text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {columnVisibility.client ? <th className="px-4 py-4">Cliente</th> : null}
                      {columnVisibility.expediente ? <th className="px-4 py-4">Expediente</th> : null}
                      {columnVisibility.court ? <th className="px-4 py-4">Juzgado</th> : null}
                      {columnVisibility.legalStatus ? <th className="px-4 py-4">Estado</th> : null}
                      {columnVisibility.pendingNotes ? <th className="px-4 py-4">Notas de pendientes</th> : null}
                    </tr>
                  </thead>

                  {groupMode === 'legalStatus' ? (
                    groupedDossiers.map((group) => (
                      <tbody key={group.value}>
                        <tr className="ui-table-group-row border-b border-[#e4e4e7] bg-white">
                          <td colSpan={visibleColumnCount} className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() =>
                                setCollapsedGroups((current) => ({
                                  ...current,
                                  [group.value]: !current[group.value],
                                }))
                              }
                              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900"
                            >
                              {collapsedGroups[group.value] ? (
                                <ChevronRight className="h-4 w-4 text-slate-900" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-slate-900" />
                              )}
                              <span>{group.label}</span>
                              <span className={`rounded-full border px-2.5 py-1 text-[11px] ${group.chipTone}`}>
                                {group.dossiers.length}
                              </span>
                            </button>
                          </td>
                        </tr>
                        {collapsedGroups[group.value] ? null : renderTableRows(group.dossiers)}
                      </tbody>
                    ))
                  ) : (
                    <tbody>{renderTableRows(sortedDossiers)}</tbody>
                  )}
                </table>
              ) : (
                <div className="px-6 py-14 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#1e2b4d] text-slate-900">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <h4 className="mt-5 text-xl font-bold text-slate-900">No hay expedientes para mostrar</h4>
                  <p className="mt-2 text-sm text-slate-500">
                    {activePane === 'resolved'
                      ? 'Los expedientes con estatus Finalizado o Realizado apareceran aqui automaticamente.'
                      : 'Ajusta la busqueda, los filtros o registra un expediente nuevo para incorporarlo al control juridico.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {selectedDossier ? (
        <div className="fixed inset-0 z-50 bg-[#111111]/45 p-4 sm:p-6" onClick={() => setSelectedDossierId(null)}>
          <div className="mx-auto flex h-full w-full max-w-5xl items-center justify-center">
            <div
              className="flex max-h-[84vh] w-full flex-col overflow-hidden rounded-[28px] border border-[#d4d4d8] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
              onClick={stopInteractivePropagation}
            >
              <div className="border-b border-[#e4e4e7] px-5 py-4 sm:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Expediente juridico
                    </p>
                    <h3 className="mt-2 text-2xl font-bold text-slate-900">{selectedDossier.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedDossier.clientName} · {selectedDossier.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDossierId(null);
                        onEditDossier(selectedDossier);
                      }}
                      className="ui-btn ui-btn-primary rounded-xl border px-4 py-2.5 text-sm font-medium transition"
                    >
                      Abrir expediente
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDossierId(null)}
                      className="ui-btn ui-btn-neutral inline-flex h-11 w-11 items-center justify-center rounded-xl border transition"
                      aria-label="Cerrar expediente"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="max-h-[68vh] overflow-auto px-5 py-5 sm:px-6">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[24px] border border-[#e4e4e7] bg-white p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Cliente</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">{selectedDossier.clientName}</p>
                    <p className="mt-2 text-sm text-slate-600">{selectedDossier.clientAccessCode}</p>
                  </div>

                  <div className="rounded-[24px] border border-[#e4e4e7] bg-white p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Estado</p>
                    <div className="mt-3">
                      <span
                        className={`inline-flex min-h-[42px] items-center rounded-xl border px-3 py-2 text-xs font-bold tracking-[0.01em] ${getLegalStatusMeta(selectedDossier.legalStatus).tone}`}
                      >
                        {getLegalStatusMeta(selectedDossier.legalStatus).shortLabel}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-[#e4e4e7] bg-white p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Juzgado</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">
                      {selectedDossier.courtNumber || 'Sin juzgado'}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {selectedDossier.judicialDistrict || 'Sin distrito'}
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-[#e4e4e7] bg-white p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Responsable</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">
                      {selectedDossier.assignedAdminName || 'Sin asignar'}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">Actualizado: {formatDate(selectedDossier.updatedAt)}</p>
                  </div>

                  <div className="rounded-[24px] border border-[#e4e4e7] bg-white p-4 lg:col-span-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Partes</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{selectedDossier.plaintiff}</p>
                    <p className="mt-1 text-sm text-slate-600">vs {selectedDossier.defendant}</p>
                  </div>

                  <div className="rounded-[24px] border border-[#e4e4e7] bg-white p-4 lg:col-span-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Descripcion</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {selectedDossier.description || 'Sin descripcion registrada.'}
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-[#e4e4e7] bg-white p-4 lg:col-span-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Notas de pendientes
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {selectedDossier.pendingNotes || 'Sin notas registradas.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {notesHistoryDossier ? (
        <div
          className="fixed inset-0 z-50 bg-[#111111]/45 p-4 sm:p-6"
          onClick={() => setNotesHistoryDossierId(null)}
        >
          <div className="mx-auto flex h-full w-full max-w-4xl items-center justify-center">
            <div
              className="flex max-h-[82vh] w-full flex-col overflow-hidden rounded-[28px] border border-[#d4d4d8] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
              onClick={stopInteractivePropagation}
            >
              <div className="border-b border-[#e4e4e7] px-5 py-4 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Historial de notas
                  </p>
                  <button
                    type="button"
                    onClick={() => setNotesHistoryDossierId(null)}
                    className="ui-btn ui-btn-neutral inline-flex h-11 w-11 items-center justify-center rounded-xl border transition"
                    aria-label="Cerrar historial"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-auto px-5 py-5 sm:px-6">
                {notesHistoryEntries.map((event) => {
                  const parsedChange = parseNotesChangeDescription(event.description);

                  return (
                    <div key={event.id} className="mb-4 rounded-[22px] border border-[#e4e4e7] bg-white p-4 last:mb-0">
                      {parsedChange ? (
                        <div className="space-y-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Antes</p>
                            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{parsedChange.before}</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Ahora</p>
                            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-900">{parsedChange.after}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{event.description}</p>
                      )}
                    </div>
                  );
                })}

                {notesHistoryEntries.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-white/14 bg-white px-6 py-12 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#1e2b4d] text-slate-900">
                      <History className="h-5 w-5" />
                    </div>
                    <h4 className="mt-4 text-lg font-semibold text-slate-900">Sin historial de notas</h4>
                    <p className="mt-2 text-sm text-slate-500">
                      Cuando las notas de pendientes cambien, los movimientos apareceran aqui automaticamente.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

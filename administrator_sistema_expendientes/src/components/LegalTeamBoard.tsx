import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Plus, Users, X } from 'lucide-react';
import {
  createLegalTeamActivityInApi,
  fetchLegalTeamBoardFromApi,
  updateLegalTeamActivityInApi,
} from '../services/dossiersApi';
import type { AdminMember, LegalTeamActivity, LegalTeamStatus } from '../types';
import { formatDate } from '../utils';

type TeamViewMode = 'active' | 'completed';
type TeamActivityFormState = {
  activityId: number | null;
  title: string;
  memberId: string;
  statusId: string;
  entryDate: string;
  dueDate: string;
  note: string;
};

interface LegalTeamBoardProps {
  phpApiEnabled: boolean;
}

const emptyTeamActivityFormState = (): TeamActivityFormState => ({
  activityId: null,
  title: '',
  memberId: '',
  statusId: '',
  entryDate: new Date().toISOString().slice(0, 10),
  dueDate: '',
  note: '',
});

const toInputDate = (value: string) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
};

const statusCellStyle = (status: LegalTeamStatus) => ({
  backgroundColor: status.colorHex,
  borderColor: status.colorHex,
});

const compareAdminMembers = (left: AdminMember, right: AdminMember) =>
  left.legalTeamOrder - right.legalTeamOrder ||
  left.name.localeCompare(right.name, 'es-MX', { sensitivity: 'base' }) ||
  left.id - right.id;

const sortLegalTeamMembers = (items: AdminMember[]) => [...items].sort(compareAdminMembers);

const resolveActivitySortTimestamp = (activity: LegalTeamActivity) => {
  const preferredValue = activity.dueDate || activity.entryDate;
  const timestamp = preferredValue ? new Date(preferredValue).getTime() : Number.NaN;
  return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER;
};

const sortLegalTeamActivities = (items: LegalTeamActivity[], members: AdminMember[]) => {
  const memberOrderMap = new Map(members.map((member, index) => [member.id, member.legalTeamOrder || index + 1]));

  return [...items].sort((left, right) => {
    const leftMemberOrder =
      left.memberId !== null ? memberOrderMap.get(left.memberId) ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
    const rightMemberOrder =
      right.memberId !== null ? memberOrderMap.get(right.memberId) ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;

    if (leftMemberOrder !== rightMemberOrder) {
      return leftMemberOrder - rightMemberOrder;
    }

    if (left.isCompleted !== right.isCompleted) {
      return Number(left.isCompleted) - Number(right.isCompleted);
    }

    return resolveActivitySortTimestamp(left) - resolveActivitySortTimestamp(right) || left.id - right.id;
  });
};

export function LegalTeamBoard({ phpApiEnabled }: LegalTeamBoardProps) {
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [statuses, setStatuses] = useState<LegalTeamStatus[]>([]);
  const [activities, setActivities] = useState<LegalTeamActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<TeamViewMode>('active');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<TeamActivityFormState>(emptyTeamActivityFormState());

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setFeedback(null), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  const loadBoard = async () => {
    if (!phpApiEnabled) {
      return;
    }

    setIsLoading(true);

    try {
      const board = await fetchLegalTeamBoardFromApi();
      const sortedMembers = sortLegalTeamMembers(board.members);
      setMembers(sortedMembers);
      setStatuses([...board.statuses].sort((left, right) => left.order - right.order || left.id - right.id));
      setActivities(sortLegalTeamActivities(board.activities, sortedMembers));
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo cargar el equipo juridico.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadBoard();
  }, [phpApiEnabled]);

  const statusMap = useMemo(
    () => new Map(statuses.map((status) => [status.id, status])),
    [statuses]
  );

  const defaultOpenStatus = useMemo(
    () => statuses.find((status) => !status.isCompleted)?.id ?? statuses[0]?.id ?? 1,
    [statuses]
  );

  const sections = useMemo(
    () =>
      members.map((member) => ({
        member,
        activities: activities.filter(
          (activity) => activity.memberId === member.id && activity.isCompleted === (viewMode === 'completed')
        ),
      })),
    [activities, members, viewMode]
  );

  const openCreateForm = (memberId?: number) => {
    setForm({
      ...emptyTeamActivityFormState(),
      memberId: memberId ? String(memberId) : members[0] ? String(members[0].id) : '',
      statusId: String(defaultOpenStatus),
    });
    setIsFormOpen(true);
  };

  const openEditForm = (activity: LegalTeamActivity) => {
    setForm({
      activityId: activity.id,
      title: activity.title,
      memberId: activity.memberId ? String(activity.memberId) : '',
      statusId: String(activity.statusId),
      entryDate: toInputDate(activity.entryDate),
      dueDate: toInputDate(activity.dueDate),
      note: activity.note,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setForm(emptyTeamActivityFormState());
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!phpApiEnabled) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (form.activityId) {
        const updatedActivity = await updateLegalTeamActivityInApi({
          activityId: form.activityId,
          title: form.title,
          memberId: Number(form.memberId),
          statusId: Number(form.statusId),
          entryDate: form.entryDate,
          dueDate: form.dueDate,
          note: form.note,
        });
        setActivities((current) =>
          sortLegalTeamActivities(
            current.map((activity) => (activity.id === updatedActivity.id ? updatedActivity : activity)),
            members
          )
        );
        setFeedback({
          type: 'success',
          message: 'La tarea del equipo juridico se actualizo correctamente.',
        });
      } else {
        const createdActivity = await createLegalTeamActivityInApi({
          title: form.title,
          memberId: Number(form.memberId),
          statusId: Number(form.statusId),
          entryDate: form.entryDate,
          dueDate: form.dueDate,
          note: form.note,
        });
        setActivities((current) => sortLegalTeamActivities([createdActivity, ...current], members));
        setFeedback({
          type: 'success',
          message: 'La tarea del equipo juridico se creo correctamente.',
        });
      }

      closeForm();
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo guardar la tarea.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!phpApiEnabled) {
    return (
      <section className="overflow-hidden rounded-[28px] border border-[#e4e4e7] bg-white">
        <div className="px-6 py-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#f5f5f5] text-[#111111]">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-xl font-bold text-slate-900">Equipo Jurídico no disponible</h3>
          <p className="mt-2 text-sm text-slate-500">
            Este modulo necesita el backend PHP/MySQL activo para cargar miembros y persistir tareas.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="flex h-full min-h-0 flex-col gap-5 overflow-hidden">
        <div className="shrink-0 rounded-[28px] border border-[#e4e4e7] bg-white px-6 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#f5f5f5] text-[#111111]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Equipo juridico</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">Pendientes por miembro activo</h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('active')}
                className={`ui-btn ${viewMode === 'active' ? 'ui-btn-primary' : 'ui-btn-neutral'} rounded-xl border px-4 py-2.5 text-sm font-semibold transition`}
              >
                Pendientes
              </button>
              <button
                type="button"
                onClick={() => setViewMode('completed')}
                className={`ui-btn ${viewMode === 'completed' ? 'ui-btn-primary' : 'ui-btn-neutral'} rounded-xl border px-4 py-2.5 text-sm font-semibold transition`}
              >
                Realizados
              </button>
              <button
                type="button"
                onClick={() => openCreateForm()}
                className="ui-btn ui-btn-add inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nueva tarea
              </button>
            </div>
          </div>

          {feedback ? (
            <div
              className={`mt-4 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${
                feedback.type === 'success'
                  ? 'border-[#d4d4d8] bg-[#fafafa] text-slate-700'
                  : 'border-[#f0c9c9] bg-[#fff6f6] text-[#a33a3a]'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-auto pr-1">
          {isLoading ? (
            <div className="rounded-[28px] border border-[#e4e4e7] bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#f5f5f5] text-[#111111]">
                <Clock className="h-5 w-5 animate-pulse" />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-600">Cargando tareas del equipo juridico...</p>
            </div>
          ) : members.length > 0 ? (
            <div className="space-y-5">
              {sections.map(({ member, activities: memberActivities }) => (
                <section key={member.id} className="ui-table-shell overflow-hidden rounded-[28px] border border-[#e4e4e7] bg-white">
                  <div className="ui-table-panel">
                    <div className="border-b border-[#e4e4e7] px-6 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-slate-900">
                            {viewMode === 'completed' ? 'Realizados' : 'Pendientes'} {member.name}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{member.type}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-[#f5f5f5] px-3 py-1 text-xs font-semibold text-slate-600">
                            {memberActivities.length} registros
                          </span>
                          {viewMode === 'active' ? (
                            <button
                              type="button"
                              onClick={() => openCreateForm(member.id)}
                              className="ui-btn ui-btn-add inline-flex items-center rounded-xl border px-3 py-2 text-xs font-semibold transition"
                            >
                              <Plus className="mr-1.5 h-3.5 w-3.5" />
                              Asignar tarea
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="ui-table-scroll">
                      <table className="ui-table min-w-[980px] w-full border-collapse">
                        <thead className="ui-table-head bg-[#f5f5f5] text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          <tr>
                            <th className="px-5 py-3">Cliente</th>
                            <th className="px-5 py-3">Fecha Entrada</th>
                            <th className="px-5 py-3">Estado</th>
                            <th className="px-5 py-3">Fecha Compromiso</th>
                            <th className="px-5 py-3">Nota Adicional</th>
                          </tr>
                        </thead>
                        <tbody>
                          {memberActivities.length > 0 ? (
                            memberActivities.map((activity) => {
                              const status = statusMap.get(activity.statusId);

                              return (
                                <tr
                                  key={activity.id}
                                  onClick={() => openEditForm(activity)}
                                  className="ui-table-row cursor-pointer border-t border-[#e4e4e7] bg-white transition hover:bg-[#fafafa]"
                                >
                                  <td className="px-5 py-4">
                                    <div className="min-w-[320px]">
                                      <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                        {activity.progressCount > 0 ? <span>{activity.progressCount} avances</span> : null}
                                        {activity.linkedDossierCode ? <span>{activity.linkedDossierCode}</span> : null}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-5 py-4 text-sm text-slate-700">{formatDate(activity.entryDate)}</td>
                                  <td className="px-5 py-4">
                                    {status ? (
                                      <span
                                        className="inline-flex min-w-[160px] items-center justify-center rounded-xl border px-3 py-2 text-sm font-semibold text-white"
                                        style={statusCellStyle(status)}
                                      >
                                        {status.name}
                                      </span>
                                    ) : (
                                      <span className="text-sm text-slate-500">Sin estatus</span>
                                    )}
                                  </td>
                                  <td className="px-5 py-4 text-sm text-slate-700">
                                    {activity.dueDate ? formatDate(activity.dueDate) : 'Sin fecha'}
                                  </td>
                                  <td className="px-5 py-4">
                                    <p className={`text-sm leading-6 ${activity.note ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                                      {activity.note || 'Sin nota adicional'}
                                    </p>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                                {viewMode === 'completed'
                                  ? 'Este miembro aun no tiene actividades concluidas.'
                                  : 'Este miembro aun no tiene tareas asignadas.'}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-[#e4e4e7] bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#f5f5f5] text-[#111111]">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-slate-900">No hay miembros visibles en Equipo Juridico</h3>
            <p className="mt-2 text-sm text-slate-500">
              Registra, reactiva o muestra miembros en Ajustes para poder asignar tareas del equipo juridico.
            </p>
          </div>
        )}
        </div>
      </section>

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 bg-[#111111]/45 p-4 sm:p-6" onClick={closeForm}>
          <div className="mx-auto flex h-full w-full max-w-3xl items-center justify-center">
            <div
              className="flex max-h-[85vh] w-full flex-col overflow-hidden rounded-[30px] border border-[#d4d4d8] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.16)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="border-b border-[#e4e4e7] px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Equipo juridico
                    </p>
                    <h3 className="mt-2 text-2xl font-bold text-slate-900">
                      {form.activityId ? 'Editar tarea' : 'Asignar nueva tarea'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="ui-btn ui-btn-neutral inline-flex h-11 w-11 items-center justify-center rounded-xl border transition"
                    aria-label="Cerrar formulario"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-auto px-6 py-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Cliente / Actividad</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                      className="w-full rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#111111]"
                      placeholder="Describe la tarea o pendiente"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Responsable</label>
                    <select
                      value={form.memberId}
                      onChange={(event) => setForm((current) => ({ ...current, memberId: event.target.value }))}
                      className="w-full rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#111111]"
                      required
                    >
                      <option value="">Selecciona un miembro</option>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Estado</label>
                    <select
                      value={form.statusId}
                      onChange={(event) => setForm((current) => ({ ...current, statusId: event.target.value }))}
                      className="w-full rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#111111]"
                      required
                    >
                      <option value="">Selecciona un estatus</option>
                      {statuses.map((status) => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Fecha Entrada</label>
                    <input
                      type="date"
                      value={form.entryDate}
                      onChange={(event) => setForm((current) => ({ ...current, entryDate: event.target.value }))}
                      className="w-full rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#111111]"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Fecha Compromiso</label>
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
                      className="w-full rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#111111]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Nota Adicional</label>
                    <textarea
                      value={form.note}
                      onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                      rows={5}
                      className="w-full rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#111111]"
                      placeholder="Seguimiento, contexto o comentario adicional"
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="ui-btn ui-btn-neutral rounded-2xl border px-5 py-3 text-sm font-semibold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`ui-btn ${form.activityId ? 'ui-btn-primary' : 'ui-btn-add'} inline-flex items-center rounded-2xl px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {isSubmitting ? <Clock className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    {form.activityId ? 'Guardar cambios' : 'Crear tarea'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

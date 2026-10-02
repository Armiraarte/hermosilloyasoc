import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Clock, Eye, EyeOff, KeyRound, Shield, Trash2, UserPlus, X } from 'lucide-react';
import type { AdminMember } from '../types';
import {
  createAdminMemberInApi,
  deleteAdminMemberInApi,
  listAdminMembersFromApi,
  moveAdminMemberLegalTeamOrderInApi,
  updateAdminMemberPasswordInApi,
  updateAdminMemberLegalTeamVisibilityInApi,
  updateAdminMemberStatusInApi,
} from '../services/dossiersApi';
import { formatDate } from '../utils';

interface AdminMembersPanelProps {
  canManagePasswords: boolean;
  currentAdminId: number | null;
  phpApiEnabled: boolean;
}

type MemberFormState = {
  name: string;
  username: string;
  type: string;
  password: string;
};

const emptyMemberFormState = (): MemberFormState => ({
  name: '',
  username: '',
  type: 'PASANTE',
  password: '',
});

type PasswordFormState = {
  password: string;
  confirmPassword: string;
};

const emptyPasswordFormState = (): PasswordFormState => ({
  password: '',
  confirmPassword: '',
});

const adminTypeOptions = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'ABOGADO', label: 'Abogado' },
  { value: 'PASANTE', label: 'Pasante' },
  { value: 'AUXILIAR', label: 'Auxiliar' },
];

const surfaceClassName =
  'rounded-[28px] border border-[#d4d4d8] bg-white/90 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur';

const normalizeAdminType = (value: string) =>
  value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

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

const getTypeTone = (type: string) => {
  const normalized = normalizeAdminType(type);

  if (normalized.includes('ADMIN')) {
    return 'border-[#d4d4d8] bg-[#f4f4f5] text-[#111111]';
  }

  if (normalized.includes('PASANTE')) {
    return 'border-[#d4d4d8] bg-[#f5f5f5] text-[#52525b]';
  }

  return 'border-[#d4d4d8] bg-[#fafafa] text-[#27272a]';
};

const sortAdminMembers = (items: AdminMember[]) =>
  [...items].sort((left, right) => {
    if (left.active !== right.active) {
      return left.active ? -1 : 1;
    }

    return (
      left.legalTeamOrder - right.legalTeamOrder ||
      left.name.localeCompare(right.name, 'es-MX', { sensitivity: 'base' }) ||
      left.id - right.id
    );
  });

const getLegalTeamVisibilityMeta = (member: AdminMember) => {
  if (member.active && member.showInLegalTeam) {
    return {
      label: 'Aparece',
      tone: 'border-[#d4d4d8] bg-[#fafafa] text-[#111111]',
    };
  }

  if (member.active && !member.showInLegalTeam) {
    return {
      label: 'Oculto',
      tone: 'border-[#e4e4e7] bg-white text-slate-600',
    };
  }

  if (member.showInLegalTeam) {
    return {
      label: 'Al activar',
      tone: 'border-[#d4d4d8] bg-[#f5f5f5] text-[#52525b]',
    };
  }

  return {
    label: 'No visible',
    tone: 'border-[#e4e4e7] bg-[#fafafa] text-slate-500',
  };
};

export function AdminMembersPanel({ canManagePasswords, currentAdminId, phpApiEnabled }: AdminMembersPanelProps) {
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [form, setForm] = useState<MemberFormState>(emptyMemberFormState());
  const [showCreateMemberModal, setShowCreateMemberModal] = useState(false);
  const [passwordEditorMemberId, setPasswordEditorMemberId] = useState<number | null>(null);
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(emptyPasswordFormState());
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setFeedback(null), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  useEffect(() => {
    if (!phpApiEnabled) {
      return undefined;
    }

    void loadMembers();
    return undefined;
  }, [phpApiEnabled]);

  const loadMembers = async (showLoader = true) => {
    if (!phpApiEnabled) {
      return;
    }

    if (showLoader) {
      setIsLoadingMembers(true);
    }

    try {
      const nextMembers = await listAdminMembersFromApi();
      setMembers(sortAdminMembers(nextMembers));
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudieron cargar los miembros.',
      });
    } finally {
      if (showLoader) {
        setIsLoadingMembers(false);
      }
    }
  };

  const handleCreateMember = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!phpApiEnabled) {
      return;
    }

    setIsSubmitting(true);

    try {
      const createdMember = await createAdminMemberInApi({
        name: form.name,
        username: form.username,
        type: form.type,
        password: form.password,
        active: true,
      });
      setMembers((current) => sortAdminMembers([createdMember, ...current]));
      setForm(emptyMemberFormState());
      setShowCreateMemberModal(false);
      setFeedback({
        type: 'success',
        message: 'El miembro se dio de alta correctamente.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo crear el miembro.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleMember = async (member: AdminMember) => {
    if (!phpApiEnabled) {
      return;
    }

    const nextActive = !member.active;
    setPendingActionKey(`${member.id}:active`);

    try {
      const updatedMember = await updateAdminMemberStatusInApi({
        memberId: member.id,
        active: nextActive,
      });
      setMembers((current) =>
        sortAdminMembers(current.map((entry) => (entry.id === member.id ? updatedMember : entry)))
      );
      setFeedback({
        type: 'success',
        message: `La cuenta de ${member.name} se actualizo correctamente.`,
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo actualizar la cuenta.',
      });
    } finally {
      setPendingActionKey(null);
    }
  };

  const handleToggleLegalTeamVisibility = async (member: AdminMember) => {
    if (!phpApiEnabled) {
      return;
    }

    setPendingActionKey(`${member.id}:visibility`);

    try {
      const updatedMember = await updateAdminMemberLegalTeamVisibilityInApi({
        memberId: member.id,
        showInLegalTeam: !member.showInLegalTeam,
      });
      setMembers((current) =>
        sortAdminMembers(current.map((entry) => (entry.id === member.id ? updatedMember : entry)))
      );
      setFeedback({
        type: 'success',
        message: member.showInLegalTeam
          ? `${member.name} ya no aparecera en Equipo Juridico.`
          : `${member.name} aparecera en Equipo Juridico.`,
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo actualizar la visibilidad del miembro.',
      });
    } finally {
      setPendingActionKey(null);
    }
  };

  const handleMoveMember = async (member: AdminMember, direction: 'up' | 'down') => {
    if (!phpApiEnabled) {
      return;
    }

    setPendingActionKey(`${member.id}:move:${direction}`);

    try {
      await moveAdminMemberLegalTeamOrderInApi({
        memberId: member.id,
        direction,
      });
      setMembers((current) => {
        const selectedMember = current.find((entry) => entry.id === member.id);
        if (!selectedMember) {
          return current;
        }

        const sameGroupMembers = current
          .filter((entry) => entry.active === selectedMember.active)
          .sort((left, right) => left.legalTeamOrder - right.legalTeamOrder || left.id - right.id);
        const currentIndex = sameGroupMembers.findIndex((entry) => entry.id === selectedMember.id);
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (currentIndex < 0 || targetIndex < 0 || targetIndex >= sameGroupMembers.length) {
          return current;
        }

        const targetMember = sameGroupMembers[targetIndex];
        const nextSelectedOrder = targetMember.legalTeamOrder;
        const nextTargetOrder = selectedMember.legalTeamOrder;

        return sortAdminMembers(
          current.map((entry) => {
            if (entry.id === selectedMember.id) {
              return {
                ...entry,
                legalTeamOrder: nextSelectedOrder,
              };
            }

            if (entry.id === targetMember.id) {
              return {
                ...entry,
                legalTeamOrder: nextTargetOrder,
              };
            }

            return entry;
          })
        );
      });
      setFeedback({
        type: 'success',
        message: `El orden de ${member.name} se actualizo correctamente.`,
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo reordenar el miembro.',
      });
    } finally {
      setPendingActionKey(null);
    }
  };

  const handleDeleteMember = async (member: AdminMember) => {
    if (!phpApiEnabled) {
      return;
    }

    if (!window.confirm(`Se eliminara la cuenta ${member.username}. Esta accion no se puede deshacer.`)) {
      return;
    }

    setPendingActionKey(`${member.id}:delete`);

    try {
      await deleteAdminMemberInApi(member.id);
      setMembers((current) => current.filter((entry) => entry.id !== member.id));
      setPasswordEditorMemberId((current) => (current === member.id ? null : current));
      setPasswordForm(emptyPasswordFormState());
      setFeedback({
        type: 'success',
        message: `La cuenta de ${member.name} fue eliminada.`,
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo eliminar la cuenta.',
      });
    } finally {
      setPendingActionKey(null);
    }
  };

  const handleTogglePasswordEditor = (memberId: number) => {
    setPasswordEditorMemberId((current) => (current === memberId ? null : memberId));
    setPasswordForm(emptyPasswordFormState());
  };

  const openCreateMemberModal = () => {
    setForm(emptyMemberFormState());
    setShowCreateMemberModal(true);
  };

  const closeCreateMemberModal = () => {
    if (isSubmitting) {
      return;
    }

    setShowCreateMemberModal(false);
    setForm(emptyMemberFormState());
  };

  const closePasswordModal = () => {
    if (pendingActionKey?.endsWith(':password')) {
      return;
    }

    setPasswordEditorMemberId(null);
    setPasswordForm(emptyPasswordFormState());
  };

  const handleUpdatePassword = async (member: AdminMember) => {
    if (!phpApiEnabled || !canManagePasswords) {
      return;
    }

    if (passwordForm.password.trim().length < 6) {
      setFeedback({
        type: 'error',
        message: 'La contrasena debe tener al menos 6 caracteres.',
      });
      return;
    }

    if (passwordForm.password !== passwordForm.confirmPassword) {
      setFeedback({
        type: 'error',
        message: 'La confirmacion de contrasena no coincide.',
      });
      return;
    }

    setPendingActionKey(`${member.id}:password`);

    try {
      const updatedMember = await updateAdminMemberPasswordInApi({
        memberId: member.id,
        password: passwordForm.password,
      });
      setMembers((current) =>
        sortAdminMembers(current.map((entry) => (entry.id === member.id ? updatedMember : entry)))
      );
      setPasswordEditorMemberId(null);
      setPasswordForm(emptyPasswordFormState());
      setFeedback({
        type: 'success',
        message: `La contrasena de ${member.name} se actualizo correctamente.`,
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo actualizar la contrasena.',
      });
    } finally {
      setPendingActionKey(null);
    }
  };

  const activeMembersCount = members.filter((member) => member.active).length;
  const inactiveMembersCount = members.length - activeMembersCount;
  const visibleInLegalTeamCount = members.filter((member) => member.active && member.showInLegalTeam).length;
  const passwordEditorMember = passwordEditorMemberId !== null
    ? members.find((member) => member.id === passwordEditorMemberId) ?? null
    : null;

  if (!phpApiEnabled) {
    return (
      <section className={`${surfaceClassName} p-6`}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Miembros del sistema</p>
        <h3 className="mt-2 text-xl font-bold text-slate-900">Gestion no disponible en modo local</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Este panel necesita el backend PHP/MySQL activo para cargar usuarios reales, asignar contrasenas y administrar cuentas.
        </p>
      </section>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <section className={`${surfaceClassName} flex min-h-0 flex-1 flex-col overflow-hidden p-6`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Cuentas registradas</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">Miembros del sistema</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Aqui puedes revisar las cuentas ya registradas y desactivar o eliminar miembros segun corresponda.
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:items-end">
            <button
              type="button"
              onClick={openCreateMemberModal}
              className="ui-btn ui-btn-add inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white transition"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Registrar miembro
            </button>
            <div className="grid min-w-[260px] grid-cols-2 gap-3 text-sm md:grid-cols-4">
            <div className="rounded-2xl border border-[#e4e4e7] bg-[#ffffff] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Total</p>
              <p className="mt-2 text-xl font-bold text-slate-900">{members.length}</p>
            </div>
            <div className="rounded-2xl border border-[#d4d4d8] bg-[#fafafa] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3f3f46]">Activos</p>
              <p className="mt-2 text-xl font-bold text-[#3f3f46]">{activeMembersCount}</p>
            </div>
            <div className="rounded-2xl border border-[#e4e4e7] bg-[#fafafa] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Inactivos</p>
              <p className="mt-2 text-xl font-bold text-slate-700">{inactiveMembersCount}</p>
            </div>
            <div className="rounded-2xl border border-[#d4d4d8] bg-[#f5f5f5] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3f3f46]">Equipo juridico</p>
              <p className="mt-2 text-xl font-bold text-[#3f3f46]">{visibleInLegalTeamCount}</p>
            </div>
            </div>
          </div>
        </div>

        {feedback && !showCreateMemberModal && !passwordEditorMember ? (
          <div
            className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'border-[#d4d4d8] bg-[#fafafa] text-[#3f3f46]'
                : 'border-[#f0c9c9] bg-[#fff6f6] text-[#a33a3a]'
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        <div className="ui-table-shell mt-6 min-h-0 flex-1 overflow-hidden rounded-[24px] border border-[#e4e4e7]">
          <div className="ui-table-scroll h-full">
            <table className="ui-table w-full min-w-[1120px] border-collapse">
              <thead className="ui-table-head sticky top-0 z-10 bg-[#f5f5f5]">
                <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <th className="px-4 py-3">Miembro</th>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Equipo Juridico</th>
                  <th className="px-4 py-3">Orden</th>
                  <th className="px-4 py-3">Alta</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingMembers ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-500">
                      Cargando miembros...
                    </td>
                  </tr>
                ) : members.length > 0 ? (
                  members.map((member) => {
                    const isCurrentAdmin = currentAdminId === member.id;
                    const rowActionPending = pendingActionKey?.startsWith(`${member.id}:`) === true;
                    const visibilityMeta = getLegalTeamVisibilityMeta(member);
                    const orderedMembersByActiveGroup = members.filter((entry) => entry.active === member.active);
                    const memberIndex = orderedMembersByActiveGroup.findIndex((entry) => entry.id === member.id);
                    const canMoveUp = memberIndex > 0;
                    const canMoveDown = memberIndex >= 0 && memberIndex < orderedMembersByActiveGroup.length - 1;
                    const isEditingPassword = passwordEditorMemberId === member.id;

                    return (
                      <tr key={member.id} className="ui-table-row border-t border-[#e4e4e7] bg-white">
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                            {isCurrentAdmin ? (
                              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                Tu sesion actual
                              </p>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">{member.username}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getTypeTone(member.type)}`}>
                            {formatAdminType(member.type)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                              member.active
                                ? 'border-[#d4d4d8] bg-[#fafafa] text-[#3f3f46]'
                                : 'border-[#e4e4e7] bg-[#fafafa] text-slate-600'
                            }`}
                          >
                            {member.active ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${visibilityMeta.tone}`}>
                            {visibilityMeta.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex min-w-[44px] justify-center rounded-full border border-[#e4e4e7] bg-[#fafafa] px-3 py-1 text-xs font-semibold text-slate-700">
                              {member.legalTeamOrder}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => void handleMoveMember(member, 'up')}
                                disabled={!canMoveUp || rowActionPending}
                                className="ui-btn ui-btn-neutral inline-flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-40"
                                title="Subir miembro"
                                aria-label="Subir miembro"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleMoveMember(member, 'down')}
                                disabled={!canMoveDown || rowActionPending}
                                className="ui-btn ui-btn-neutral inline-flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-40"
                                title="Bajar miembro"
                                aria-label="Bajar miembro"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">{formatDate(member.createdAt)}</td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            {canManagePasswords ? (
                              <button
                                type="button"
                                onClick={() => handleTogglePasswordEditor(member.id)}
                                disabled={rowActionPending}
                                className={`ui-btn ${isEditingPassword ? 'ui-btn-warning' : 'ui-btn-info'} inline-flex items-center rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50`}
                              >
                                <KeyRound className="mr-1.5 h-3.5 w-3.5" />
                                {isEditingPassword ? 'Cerrar clave' : 'Contrasena'}
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => void handleToggleLegalTeamVisibility(member)}
                              disabled={rowActionPending}
                              className={`ui-btn ${member.showInLegalTeam ? 'ui-btn-warning' : 'ui-btn-info'} inline-flex items-center rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              {member.showInLegalTeam ? (
                                <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                              ) : (
                                <Eye className="mr-1.5 h-3.5 w-3.5" />
                              )}
                              {member.showInLegalTeam ? 'Ocultar' : 'Mostrar'}
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleToggleMember(member)}
                              disabled={isCurrentAdmin || rowActionPending}
                              className={`ui-btn ${member.active ? 'ui-btn-warning' : 'ui-btn-add'} rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              {member.active ? 'Desactivar' : 'Activar'}
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteMember(member)}
                              disabled={isCurrentAdmin || rowActionPending}
                              className="ui-btn ui-btn-danger-soft inline-flex items-center rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-500">
                      No hay miembros registrados todavia.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {showCreateMemberModal ? (
        <div
          className="fixed inset-0 z-50 bg-[#121a27]/55 p-4 sm:p-6"
          onClick={closeCreateMemberModal}
        >
          <div
            className="mx-auto flex h-full w-full max-w-2xl items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex max-h-[88vh] w-full flex-col overflow-hidden rounded-[32px] border border-[#d4d4d8] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.2)]">
              <div className="border-b border-[#e4e4e7] px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#121a27] text-white">
                      <UserPlus className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Alta de miembros</p>
                      <h3 className="mt-1 text-2xl font-bold text-slate-900">Registrar nueva cuenta</h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closeCreateMemberModal}
                    disabled={isSubmitting}
                    className="ui-btn ui-btn-neutral inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Cerrar modal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateMember} className="overflow-y-auto px-6 py-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Nombre</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                      className="w-full rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#18181b] focus:ring-2 focus:ring-[#e4e4e7]"
                      placeholder="Nombre completo"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Usuario</label>
                    <input
                      type="text"
                      value={form.username}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          username: event.target.value.toLowerCase(),
                        }))
                      }
                      className="w-full rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#18181b] focus:ring-2 focus:ring-[#e4e4e7]"
                      placeholder="usuario.interno"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Tipo de usuario</label>
                    <select
                      value={form.type}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          type: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#18181b] focus:ring-2 focus:ring-[#e4e4e7]"
                      required
                    >
                      {adminTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Contrasena</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                      className="w-full rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#18181b] focus:ring-2 focus:ring-[#e4e4e7]"
                      placeholder="Minimo 6 caracteres"
                      required
                    />
                  </div>
                </div>

                {feedback ? (
                  <div
                    className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
                      feedback.type === 'success'
                        ? 'border-[#d4d4d8] bg-[#fafafa] text-[#3f3f46]'
                        : 'border-[#f0c9c9] bg-[#fff6f6] text-[#a33a3a]'
                    }`}
                  >
                    {feedback.message}
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeCreateMemberModal}
                    disabled={isSubmitting}
                    className="ui-btn ui-btn-neutral rounded-2xl border px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="ui-btn ui-btn-add inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? <Clock className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                    Crear miembro
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {passwordEditorMember ? (
        <div
          className="fixed inset-0 z-50 bg-[#121a27]/55 p-4 sm:p-6"
          onClick={closePasswordModal}
        >
          <div
            className="mx-auto flex h-full w-full max-w-2xl items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex max-h-[88vh] w-full flex-col overflow-hidden rounded-[32px] border border-[#d4d4d8] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.2)]">
              <div className="border-b border-[#e4e4e7] px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#121a27] text-white">
                      <KeyRound className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Credenciales
                      </p>
                      <h3 className="mt-1 text-2xl font-bold text-slate-900">Actualizar contrasena</h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closePasswordModal}
                    disabled={pendingActionKey === `${passwordEditorMember.id}:password`}
                    className="ui-btn ui-btn-neutral inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Cerrar modal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto px-6 py-5">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{passwordEditorMember.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Solo los administradores pueden actualizar credenciales.
                  </p>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Nueva contrasena</label>
                    <input
                      type="password"
                      value={passwordForm.password}
                      onChange={(event) =>
                        setPasswordForm((current) => ({ ...current, password: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#18181b] focus:ring-2 focus:ring-[#e4e4e7]"
                      placeholder="Minimo 6 caracteres"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Confirmar contrasena</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(event) =>
                        setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#18181b] focus:ring-2 focus:ring-[#e4e4e7]"
                      placeholder="Repite la contrasena"
                    />
                  </div>
                </div>

                {feedback ? (
                  <div
                    className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
                      feedback.type === 'success'
                        ? 'border-[#d4d4d8] bg-[#fafafa] text-[#3f3f46]'
                        : 'border-[#f0c9c9] bg-[#fff6f6] text-[#a33a3a]'
                    }`}
                  >
                    {feedback.message}
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={closePasswordModal}
                    disabled={pendingActionKey === `${passwordEditorMember.id}:password`}
                    className="ui-btn ui-btn-neutral rounded-2xl border px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleUpdatePassword(passwordEditorMember)}
                    disabled={pendingActionKey === `${passwordEditorMember.id}:password`}
                    className="ui-btn ui-btn-primary inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pendingActionKey === `${passwordEditorMember.id}:password` ? (
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <KeyRound className="mr-2 h-4 w-4" />
                    )}
                    Guardar contrasena
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

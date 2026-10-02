import {
  AdminMember,
  Dossier,
  DossierCalendarEventType,
  DossierStatus,
  LegalControlStatus,
  LegalTeamActivity,
  LegalTeamStatus,
} from '../types';

export type CreateDossierInput = {
  id?: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientAccessCode?: string;
  courtNumber: string;
  judicialDistrict: string;
  plaintiff: string;
  defendant: string;
  title: string;
  description: string;
  category: string;
  status: DossierStatus;
  adminId?: number;
};

export type UpdateDossierInput = CreateDossierInput & {
  currentCode: string;
};

export type UpdateDossierCodesInput = {
  currentCode: string;
  id?: string;
  clientAccessCode?: string;
};

export type UpdateDossierLegalControlInput = {
  dossierCode: string;
  legalStatus?: LegalControlStatus;
  pendingNotes?: string;
};

export type CreateCalendarEventInput = {
  dossierCode: string;
  title: string;
  description: string;
  date: string;
  type: DossierCalendarEventType;
  location?: string;
  isClientVisible: boolean;
  adminId?: number;
};

export type CreateHistoryEventInput = {
  dossierCode: string;
  title: string;
  description: string;
  date?: string;
  file?: File | null;
  isClientVisible?: boolean;
  adminId?: number;
};

export type AdminLoginResult = {
  id: number;
  username: string;
  name: string;
  type: string;
};

export type CreateAdminMemberInput = {
  username: string;
  name: string;
  type: string;
  password: string;
  active?: boolean;
};

export type UpdateAdminMemberStatusInput = {
  memberId: number;
  active: boolean;
};

export type UpdateAdminMemberLegalTeamVisibilityInput = {
  memberId: number;
  showInLegalTeam: boolean;
};

export type MoveAdminMemberLegalTeamOrderInput = {
  memberId: number;
  direction: 'up' | 'down';
};

export type UpdateAdminMemberPasswordInput = {
  memberId: number;
  password: string;
};

export type CreateLegalTeamActivityInput = {
  title: string;
  memberId: number;
  statusId: number;
  entryDate?: string;
  dueDate?: string;
  note?: string;
  dossierCode?: string;
};

export type UpdateLegalTeamActivityInput = {
  activityId: number;
  title?: string;
  memberId?: number;
  statusId?: number;
  entryDate?: string;
  dueDate?: string;
  note?: string;
  dossierCode?: string;
};

type DossiersResponse = {
  ok: boolean;
  dossiers: Dossier[];
  message?: string;
};

type DossierResponse = {
  ok: boolean;
  dossier: Dossier;
  message?: string;
};

type BasicResponse = {
  ok: boolean;
  message?: string;
};

type AdminLoginResponse = {
  ok: boolean;
  admin: AdminLoginResult;
  message?: string;
};

type AdminMembersResponse = {
  ok: boolean;
  members: AdminMember[];
  message?: string;
};

type AdminMemberResponse = {
  ok: boolean;
  member: AdminMember;
  message?: string;
};

type LegalTeamBoardResponse = {
  ok: boolean;
  members: AdminMember[];
  statuses: LegalTeamStatus[];
  activities: LegalTeamActivity[];
  message?: string;
};

type LegalTeamActivityResponse = {
  ok: boolean;
  activity: LegalTeamActivity;
  message?: string;
};

const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');
const localPhpProxyPreference = (import.meta.env.VITE_USE_LOCAL_PHP_PROXY ?? '').trim().toLowerCase();
const useLocalPhpProxyInDev =
  import.meta.env.DEV &&
  configuredApiBaseUrl.length === 0 &&
  !['0', 'false', 'no', 'off'].includes(localPhpProxyPreference);

export const shouldUsePhpApi = () =>
  !import.meta.env.DEV || configuredApiBaseUrl.length > 0 || useLocalPhpProxyInDev;

function resolvePhpEndpoint(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (import.meta.env.DEV && useLocalPhpProxyInDev) {
    return normalizedPath;
  }

  // MODIFICA AQUI solo si prefieres fijar una URL absoluta y no usar .env.local.
  if (configuredApiBaseUrl.length > 0) {
    return `${configuredApiBaseUrl}${normalizedPath}`;
  }

  if (!import.meta.env.DEV) {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const pathWithoutFile = currentPath.endsWith('.html') ? currentPath.replace(/\/[^/]*$/, '') : currentPath;
    const normalizedBasePath = pathWithoutFile.endsWith('/')
      ? pathWithoutFile.slice(0, -1)
      : pathWithoutFile;

    return `${window.location.origin}${normalizedBasePath}${normalizedPath}`;
  }

  throw new Error(
    'No se encontro la URL del backend PHP. En desarrollo se intenta usar /bd automaticamente; si tu backend vive en otra URL define VITE_API_BASE_URL.'
  );
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(resolvePhpEndpoint(path), {
    ...init,
    credentials: 'include',
  });
  const rawText = await response.text();

  let parsedBody: Record<string, unknown> = {};
  if (rawText.trim() !== '') {
    try {
      parsedBody = JSON.parse(rawText) as Record<string, unknown>;
    } catch {
      throw new Error('La respuesta del backend no es JSON valido.');
    }
  }

  if (!response.ok || parsedBody.ok === false) {
    throw new Error((parsedBody.message as string | undefined) ?? `Error HTTP ${response.status}`);
  }

  return parsedBody as T;
}

export async function listDossiersFromApi(): Promise<Dossier[]> {
  const response = await requestJson<DossiersResponse>('/bd/expedientes.php?action=list');
  return response.dossiers;
}

export async function searchDossiersFromApi(query: string, accessCode?: string): Promise<Dossier[]> {
  const searchParams = new URLSearchParams({
    action: 'search',
    query,
  });
  if (accessCode) {
    searchParams.set('accessCode', accessCode);
  }
  const response = await requestJson<DossiersResponse>(`/bd/expedientes.php?${searchParams.toString()}`);
  return response.dossiers;
}

export async function fetchDossierFromApi(code: string, accessCode?: string): Promise<Dossier> {
  const searchParams = new URLSearchParams({
    action: 'fetch',
    code,
  });
  if (accessCode) {
    searchParams.set('accessCode', accessCode);
  }
  const response = await requestJson<DossierResponse>(`/bd/expedientes.php?${searchParams.toString()}`);
  return response.dossier;
}

export async function createDossierInApi(payload: CreateDossierInput): Promise<Dossier> {
  const response = await requestJson<DossierResponse>('/bd/expedientes.php?action=create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return response.dossier;
}

export async function updateDossierInApi(payload: UpdateDossierInput): Promise<Dossier> {
  const response = await requestJson<DossierResponse>('/bd/expedientes.php?action=update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return response.dossier;
}

export async function updateDossierCodesInApi(payload: UpdateDossierCodesInput): Promise<Dossier> {
  const response = await requestJson<DossierResponse>('/bd/expedientes.php?action=update_codes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return response.dossier;
}

export async function updateDossierLegalControlInApi(payload: UpdateDossierLegalControlInput): Promise<Dossier> {
  const response = await requestJson<DossierResponse>('/bd/expedientes.php?action=update_legal_control', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return response.dossier;
}

export async function deleteDossierInApi(dossierCode: string): Promise<void> {
  await requestJson<BasicResponse>('/bd/expedientes.php?action=delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dossierCode,
    }),
  });
}

export async function deleteHistoryEventInApi(dossierCode: string, historyEventId: string): Promise<Dossier> {
  const response = await requestJson<DossierResponse>('/bd/expedientes.php?action=delete_history_event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dossierCode,
      historyEventId,
    }),
  });

  return response.dossier;
}

export async function deleteCalendarEventInApi(dossierCode: string, calendarEventId: string): Promise<Dossier> {
  const response = await requestJson<DossierResponse>('/bd/expedientes.php?action=delete_calendar_event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dossierCode,
      calendarEventId,
    }),
  });

  return response.dossier;
}

export async function addHistoryEventInApi(payload: CreateHistoryEventInput): Promise<Dossier> {
  const response =
    payload.file instanceof File
      ? await requestJson<DossierResponse>('/bd/expedientes.php?action=add_history_event', {
          method: 'POST',
          body: (() => {
            const formData = new FormData();
            formData.append('dossierCode', payload.dossierCode);
            formData.append('title', payload.title);
            formData.append('description', payload.description);

            if (payload.date) {
              formData.append('date', payload.date);
            }

            formData.append('isClientVisible', payload.isClientVisible === false ? '0' : '1');
            formData.append('movementFile', payload.file);
            return formData;
          })(),
        })
      : await requestJson<DossierResponse>('/bd/expedientes.php?action=add_history_event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

  return response.dossier;
}

export async function addCalendarEventInApi(payload: CreateCalendarEventInput): Promise<Dossier> {
  const response = await requestJson<DossierResponse>('/bd/expedientes.php?action=add_calendar_event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return response.dossier;
}

export async function uploadDossierFilesInApi(
  dossierCode: string,
  files: File[],
  phaseId?: string | null,
  isClientVisible = true,
  adminId = 1
): Promise<Dossier> {
  const formData = new FormData();
  formData.append('dossierCode', dossierCode);
  formData.append('adminId', String(adminId));
  formData.append('isClientVisible', isClientVisible ? '1' : '0');

  if (phaseId) {
    formData.append('phaseId', phaseId);
  }

  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await requestJson<DossierResponse>('/bd/upload_expediente_archivo.php', {
    method: 'POST',
    body: formData,
  });

  return response.dossier;
}

export async function loginAdminInApi(username: string, password: string): Promise<AdminLoginResult> {
  const response = await requestJson<AdminLoginResponse>('/bd/admin_login.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  return response.admin;
}

export async function logoutAdminInApi(): Promise<void> {
  await requestJson<BasicResponse>('/bd/admin_logout.php', {
    method: 'POST',
  });
}

export async function listAdminMembersFromApi(): Promise<AdminMember[]> {
  const response = await requestJson<AdminMembersResponse>('/bd/admin_members.php?action=list');
  return response.members;
}

export async function listLegalTeamMembersFromApi(): Promise<AdminMember[]> {
  const response = await requestJson<AdminMembersResponse>('/bd/admin_members.php?action=list_for_legal_control');
  return response.members;
}

export async function createAdminMemberInApi(payload: CreateAdminMemberInput): Promise<AdminMember> {
  const response = await requestJson<AdminMemberResponse>('/bd/admin_members.php?action=create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return response.member;
}

export async function updateAdminMemberStatusInApi(payload: UpdateAdminMemberStatusInput): Promise<AdminMember> {
  const response = await requestJson<AdminMemberResponse>('/bd/admin_members.php?action=set_active', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return response.member;
}

export async function updateAdminMemberLegalTeamVisibilityInApi(
  payload: UpdateAdminMemberLegalTeamVisibilityInput
): Promise<AdminMember> {
  const response = await requestJson<AdminMemberResponse>('/bd/admin_members.php?action=set_legal_team_visibility', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return response.member;
}

export async function moveAdminMemberLegalTeamOrderInApi(payload: MoveAdminMemberLegalTeamOrderInput): Promise<void> {
  await requestJson<BasicResponse>('/bd/admin_members.php?action=move_legal_team_position', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export async function updateAdminMemberPasswordInApi(payload: UpdateAdminMemberPasswordInput): Promise<AdminMember> {
  const response = await requestJson<AdminMemberResponse>('/bd/admin_members.php?action=update_password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return response.member;
}

export async function deleteAdminMemberInApi(memberId: number): Promise<void> {
  await requestJson<BasicResponse>('/bd/admin_members.php?action=delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      memberId,
    }),
  });
}

export async function fetchLegalTeamBoardFromApi(): Promise<{
  members: AdminMember[];
  statuses: LegalTeamStatus[];
  activities: LegalTeamActivity[];
}> {
  const response = await requestJson<LegalTeamBoardResponse>('/bd/legal_team.php?action=list');
  return {
    members: response.members,
    statuses: response.statuses,
    activities: response.activities,
  };
}

export async function createLegalTeamActivityInApi(payload: CreateLegalTeamActivityInput): Promise<LegalTeamActivity> {
  const response = await requestJson<LegalTeamActivityResponse>('/bd/legal_team.php?action=create_activity', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return response.activity;
}

export async function updateLegalTeamActivityInApi(payload: UpdateLegalTeamActivityInput): Promise<LegalTeamActivity> {
  const response = await requestJson<LegalTeamActivityResponse>('/bd/legal_team.php?action=update_activity', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return response.activity;
}

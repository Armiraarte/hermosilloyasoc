import { Dossier, DossierCalendarEventType, DossierStatus } from '../types';

export type CreateDossierInput = {
  id?: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientAccessCode: string;
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

export type AdminLoginResult = {
  id: number;
  username: string;
  name: string;
  type: string;
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

type AdminLoginResponse = {
  ok: boolean;
  admin: AdminLoginResult;
  message?: string;
};

const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');
const useLocalPhpProxyInDev = (import.meta.env.VITE_USE_LOCAL_PHP_PROXY ?? '').trim() === 'true';

export const shouldUsePhpApi = () =>
  !import.meta.env.DEV || configuredApiBaseUrl.length > 0 || useLocalPhpProxyInDev;

function resolvePhpEndpoint(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (import.meta.env.DEV && useLocalPhpProxyInDev) {
    return normalizedPath;
  }

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
    'Falta VITE_API_BASE_URL. Configura el backend remoto del servidor en .env.local.'
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

export async function searchDossiersFromApi(query: string): Promise<Dossier[]> {
  const searchParams = new URLSearchParams({
    action: 'search',
    query,
  });
  const response = await requestJson<DossiersResponse>(`/bd/expedientes.php?${searchParams.toString()}`);
  return response.dossiers;
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
  adminId = 1
): Promise<Dossier> {
  const formData = new FormData();
  formData.append('dossierCode', dossierCode);
  formData.append('adminId', String(adminId));

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

import type { DossierStatus, LegalControlStatus } from './types';

export type LegalStatusOption = {
  value: LegalControlStatus;
  label: string;
  shortLabel: string;
  tone: string;
  chipTone: string;
};

export const defaultDossierStatus: DossierStatus = 'PENDIENTE_SEGUIMIENTO';

export const resolvedDossierStatuses = new Set<DossierStatus>(['FINALIZADO', 'REALIZADO']);

export const legalStatusOptions: LegalStatusOption[] = [
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
    label: 'Esp. Termino',
    shortLabel: 'Esp. Termino',
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
    label: 'Aud/Dilig Proxima',
    shortLabel: 'Aud/Dilig Proxima',
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

export const dossierStatusOptions: Array<{ value: DossierStatus; label: string }> = legalStatusOptions.map(({ value, label }) => ({
  value,
  label,
}));

export const legalStatusLabelMap = new Map(legalStatusOptions.map((option) => [option.value, option.label]));

export const getLegalStatusMeta = (status: LegalControlStatus | DossierStatus): LegalStatusOption =>
  legalStatusOptions.find((option) => option.value === status) ?? legalStatusOptions[0];

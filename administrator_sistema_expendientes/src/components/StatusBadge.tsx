import { AlertCircle, CheckCircle2, Clock, FileSearch } from 'lucide-react';
import { getLegalStatusMeta, resolvedDossierStatuses } from '../legalStatusConfig';
import { DossierStatus } from '../types';

interface Props {
  status: DossierStatus;
}

export function StatusBadge({ status }: Props) {
  const { tone, shortLabel } = getLegalStatusMeta(status);
  const Icon =
    status === 'ESP_REG_PS_AG'
      ? FileSearch
      : status === 'AUD_DILIG_PROXIMA'
        ? AlertCircle
        : resolvedDossierStatuses.has(status)
          ? CheckCircle2
          : Clock;

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>
      <Icon className="mr-1 h-3.5 w-3.5" />
      {shortLabel}
    </span>
  );
}

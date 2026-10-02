import type { ComponentType } from 'react';
import { CheckCircle2, Clock, FileSearch, Inbox, XCircle } from 'lucide-react';
import { DossierStatus } from '../types';

interface Props {
  status: DossierStatus;
  size?: 'sm' | 'lg';
  className?: string;
}

export function StatusBadge({ status, size = 'sm', className = '' }: Props) {
  const config = {
    RECIBIDO: { color: 'border-[#cbd5e1] bg-[#f8fafc] text-[#475569]', icon: Inbox, label: 'Recibido' },
    EN_REVISION: {
      color: 'border-[#f59e0b] bg-[#fff7e8] text-[#b45309]',
      icon: FileSearch,
      label: 'En Revision',
    },
    EN_PROCESO: {
      color: 'border-[#3b82f6] bg-[#eff6ff] text-[#1d4ed8]',
      icon: Clock,
      label: 'En Proceso',
    },
    RESUELTO: { color: 'border-[#10b981] bg-[#ecfdf5] text-[#047857]', icon: CheckCircle2, label: 'Resuelto' },
    CERRADO: { color: 'border-[#ef4444] bg-[#fef2f2] text-[#b91c1c]', icon: XCircle, label: 'Cerrado' },
  } satisfies Record<DossierStatus, { color: string; icon: ComponentType<{ className?: string }>; label: string }>;

  const { color, icon: Icon, label } = config[status];
  const sizeClass =
    size === 'lg'
      ? 'px-4 py-2 text-sm font-bold sm:px-5 sm:py-2.5 sm:text-base'
      : 'px-2.5 py-1 text-xs font-semibold';
  const iconClass = size === 'lg' ? 'h-4 w-4 sm:h-5 sm:w-5' : 'h-3.5 w-3.5';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClass} ${color} ${className}`}>
      <Icon className={iconClass} />
      {label}
    </span>
  );
}

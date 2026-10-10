import React from 'react';
import { clsx } from 'clsx';
import { CheckCircle2, Clock, AlertCircle, FileEdit } from 'lucide-react';

export const StatusBadge = ({ status, className }) => {
  const getStatusConfig = (st) => {
    switch (st) {
      case 'DRAFT':
        return {
          label: 'Draft',
          styles: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: FileEdit,
          iconStyles: 'text-slate-600',
        };
      case 'PENDING_HOD':
        return {
          label: 'Pending HOD',
          styles: 'bg-amber-50 text-amber-900 border-amber-300/80',
          icon: Clock,
          iconStyles: 'text-amber-700',
        };
      case 'REJECTED_BY_HOD':
        return {
          label: 'Rejected by HOD',
          styles: 'bg-rose-50 text-rose-900 border-rose-300/80',
          icon: AlertCircle,
          iconStyles: 'text-rose-700',
        };
      case 'PENDING_HEAD':
        return {
          label: 'Pending Head',
          styles: 'bg-amber-50 text-amber-900 border-amber-300/80',
          icon: Clock,
          iconStyles: 'text-amber-700',
        };
      case 'REJECTED_BY_HEAD':
        return {
          label: 'Rejected by Head',
          styles: 'bg-rose-50 text-rose-900 border-rose-300/80',
          icon: AlertCircle,
          iconStyles: 'text-rose-700',
        };
      case 'FINALIZED':
        return {
          label: 'Finalized',
          styles: 'bg-emerald-50 text-emerald-900 border-emerald-300/80',
          icon: CheckCircle2,
          iconStyles: 'text-emerald-700',
        };
      default:
        return {
          label: st || 'Unknown',
          styles: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: FileEdit,
          iconStyles: 'text-slate-600',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border tracking-wide whitespace-nowrap',
        config.styles,
        className
      )}
    >
      <Icon className={clsx('w-3 h-3 shrink-0', config.iconStyles)} />
      <span>{config.label}</span>
    </span>
  );
};

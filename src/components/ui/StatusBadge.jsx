import React from 'react';
import { clsx } from 'clsx';

export const StatusBadge = ({ status, className }) => {
  const getStatusConfig = (st) => {
    switch (st) {
      case 'DRAFT':
        return {
          label: 'Draft',
          styles: 'bg-neutral-100 text-neutral-700 border-neutral-200',
          dot: 'bg-neutral-400',
        };
      case 'PENDING_HOD':
        return {
          label: 'Pending HOD',
          styles: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'REJECTED_BY_HOD':
        return {
          label: 'Rejected by HOD',
          styles: 'bg-red-50 text-red-700 border-red-200',
          dot: 'bg-red-500',
        };
      case 'PENDING_HEAD':
        return {
          label: 'Pending Head',
          styles: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
        };
      case 'REJECTED_BY_HEAD':
        return {
          label: 'Rejected by Head',
          styles: 'bg-red-50 text-red-700 border-red-200',
          dot: 'bg-red-500',
        };
      case 'FINALIZED':
        return {
          label: 'Finalized',
          styles: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      default:
        return {
          label: st || 'Unknown',
          styles: 'bg-neutral-100 text-neutral-700 border-neutral-200',
          dot: 'bg-neutral-400',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        config.styles,
        className
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />
      <span>{config.label}</span>
    </span>
  );
};

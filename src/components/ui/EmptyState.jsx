import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  title = 'No Bills Yet',
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="py-16 text-center border border-dashed border-neutral-300 rounded-lg p-8">
      <h3 className="text-base font-semibold text-neutral-900 font-outfit">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-neutral-500 max-w-sm mx-auto">{description}</p>
      )}
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button onClick={onAction} size="sm">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

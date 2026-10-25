import React from 'react';
import { getRiskColor } from '../utils/formatters';

export default function SeverityBadge({ level, size = 'md' }) {
  const colors = getRiskColor(level);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${colors.badge} ${sizeClasses}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${colors.indicator}`} />
      {level || 'Normal'}
    </span>
  );
}

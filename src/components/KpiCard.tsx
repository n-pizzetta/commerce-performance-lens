import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
}) => {
  return (
    <div className="bg-white dark:bg-gray-950 p-4 rounded-lg border dark:border-gray-800 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && <div className="text-bagunca-navy dark:text-bagunca-yellow">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-bagunca-navy dark:text-white">{value}</p>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium flex items-center",
              trend.direction === 'up' ? "text-bagunca-green" : "text-red-500"
            )}
          >
            {trend.direction === 'up' ? (
              <ArrowUp size={12} className="mr-1" />
            ) : (
              <ArrowDown size={12} className="mr-1" />
            )}
            {trend.value}
          </span>
        )}
      </div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </div>
  );
};

export default KpiCard;

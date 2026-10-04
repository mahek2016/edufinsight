import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'emerald' | 'amber' | 'indigo' | 'rose' | 'slate';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
  onClick
}) => {
  const variantStyles = {
    blue: {
      bg: 'bg-blue-50/70',
      border: 'border-blue-200/80',
      iconBg: 'bg-blue-600',
      iconColor: 'text-white',
      valueColor: 'text-blue-950'
    },
    emerald: {
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-200/80',
      iconBg: 'bg-emerald-600',
      iconColor: 'text-white',
      valueColor: 'text-emerald-950'
    },
    amber: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-200/80',
      iconBg: 'bg-amber-500',
      iconColor: 'text-white',
      valueColor: 'text-amber-950'
    },
    indigo: {
      bg: 'bg-indigo-50/70',
      border: 'border-indigo-200/80',
      iconBg: 'bg-indigo-600',
      iconColor: 'text-white',
      valueColor: 'text-indigo-950'
    },
    rose: {
      bg: 'bg-rose-50/70',
      border: 'border-rose-200/80',
      iconBg: 'bg-rose-600',
      iconColor: 'text-white',
      valueColor: 'text-rose-950'
    },
    slate: {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      iconBg: 'bg-slate-700',
      iconColor: 'text-white',
      valueColor: 'text-slate-900'
    }
  };

  const style = variantStyles[variant];

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border ${style.border} ${style.bg} p-5 shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className={`text-2xl font-bold mt-1 tracking-tight ${style.valueColor}`}>{value}</h3>
          {subtitle && <p className="text-xs text-slate-600 mt-1 font-medium">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${style.iconBg} ${style.iconColor} shadow-md`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

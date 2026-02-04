interface StatsCardProps {
  count: number;
  label: string;
  color: 'indigo' | 'pink' | 'gradient';
}

export function StatsCard({ count, label, color }: StatsCardProps) {
  const colorClasses = {
    indigo: 'text-sky-500',
    pink: 'text-emerald-500',
    gradient: 'text-amber-500',
  };

  return (
    <div className="border border-[color:var(--color-border)] bg-[color:var(--color-card)] rounded-[20px] px-[17px] py-[21px] flex-1 min-w-0 shadow-sm">
      <div className="flex flex-col items-center">
        <span className={`font-bold text-[32px] leading-[32px] ${colorClasses[color]}`}>
          {count}
        </span>
        <span className="text-[color:var(--color-muted-foreground)] text-[12px] tracking-[1px] uppercase mt-1">
          {label}
        </span>
      </div>
    </div>
  );
}

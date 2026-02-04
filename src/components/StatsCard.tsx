interface StatsCardProps {
  count: number;
  label: string;
  color: 'indigo' | 'pink' | 'gradient';
}

export function StatsCard({ count, label, color }: StatsCardProps) {
  const colorClasses = {
    indigo: 'text-gray-900',
    pink: 'text-gray-900',
    gradient: 'text-gray-900',
  };

  return (
    <div className="border border-gray-200 rounded-[20px] px-[17px] py-[21px] flex-1 min-w-0">
      <div className="flex flex-col items-center">
        <span className={`font-bold text-[32px] leading-[32px] ${colorClasses[color]}`}>
          {count}
        </span>
        <span className="text-gray-400 text-[12px] tracking-[1px] uppercase mt-1">
          {label}
        </span>
      </div>
    </div>
  );
}

import { Check } from 'lucide-react';
import { t } from '../locales';
import { useTodoStore } from '../store/todoStore';

export function Header() {
  const { language } = useTodoStore();

  return (
    <header className="mb-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-center justify-center gap-3 mt-2 sm:mt-0">
        <div className="relative">
          <div className="absolute inset-0 bg-[color:var(--color-primary)]/20 blur-lg rounded-full" />
          <div className="relative w-12 h-12 rounded-[16px] bg-[linear-gradient(135deg,var(--color-primary),#22c55e)] flex items-center justify-center shadow-[0_10px_25px_-12px_rgba(14,165,233,0.7)]">
            <Check className="w-6 h-6 text-[color:var(--color-primary-foreground)]" />
          </div>
        </div>
          <h1 className="text-[40px] font-bold text-[color:var(--color-foreground)]">
          {t('title', language)}
        </h1>
        </div>
        <p className="text-[color:var(--color-muted-foreground)] tracking-[0.5px]">
          {t('subtitle', language)}
        </p>

      </div>
    </header>
  );
}

import { Search, X } from 'lucide-react';
import { useTodoStore } from '../store/todoStore';
import { t } from '../locales';

export function FilterBar() {
  const { filter, setFilter, language, search, setSearch } = useTodoStore();

  const filters: Array<'all' | 'active' | 'completed'> = ['all', 'active', 'completed'];

  const filterLabels = {
    all: t('all', language),
    active: t('active', language),
    completed: t('completed', language),
  };

  return (
    <div className="mb-4 space-y-3">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--color-muted-foreground)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder', language)}
          className="w-full rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-card)] px-10 py-2.5 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-primary)]"
        />
        {search.trim().length > 0 && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)]"
            aria-label={t('clearSearch', language)}
            title={t('clearSearch', language)}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              filter === f
                ? 'bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] shadow-sm'
                : 'text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)]'
            }`}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>
    </div>
  );
}

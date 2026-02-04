import { useTodoStore } from '../store/todoStore';
import { t } from '../locales';

export function FilterBar() {
  const { filter, setFilter, language } = useTodoStore();

  const filters: Array<'all' | 'active' | 'completed'> = ['all', 'active', 'completed'];

  const filterLabels = {
    all: t('all', language),
    active: t('active', language),
    completed: t('completed', language),
  };

  return (
    <div className="mb-4">
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

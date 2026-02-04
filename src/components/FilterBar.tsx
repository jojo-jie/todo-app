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
      <div className="flex gap-2 justify-center">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              filter === f
                ? 'bg-gray-900 text-white'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>
    </div>
  );
}

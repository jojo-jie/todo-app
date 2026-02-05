import { useEffect, useMemo, useRef, useState, type UIEvent } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTodos } from '../hooks/useTodos';
import { TodoItem } from './TodoItem';
import { useTodoStore } from '../store/todoStore';
import { StatsCard } from './StatsCard';
import { t } from '../locales';

export function TodoList() {
  const { todos, allTodos } = useTodos();
  const { language, filter, search } = useTodoStore();
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement | null>(null);
  const pageSize = 12;

  const allCount = allTodos.length;
  const activeCount = allTodos.filter((t) => !t.completed).length;
  const completedCount = allTodos.filter((t) => t.completed).length;

  const labels = {
    all: t('allTasks', language),
    active: t('inProgress', language),
    completed: t('done', language),
  };

  const totalPages = Math.max(1, Math.ceil(todos.length / pageSize));
  const visibleTodos = useMemo(
    () => todos.slice(0, page * pageSize),
    [todos, page]
  );
  const hasMore = visibleTodos.length < todos.length;

  useEffect(() => {
    setPage(1);
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [filter, search]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!hasMore) return;
    const el = event.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
    if (nearBottom) {
      setPage((prev) => Math.min(totalPages, prev + 1));
    }
  };

  const progressText =
    language === 'zh'
      ? `已显示 ${visibleTodos.length}/${todos.length}`
      : `Showing ${visibleTodos.length}/${todos.length}`;

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="flex flex-col sm:flex-row gap-4">
        <StatsCard count={allCount} label={labels.all} color="indigo" />
        <StatsCard count={activeCount} label={labels.active} color="pink" />
        <StatsCard count={completedCount} label={labels.completed} color="gradient" />
      </div>

      {/* Todo Items */}
      <div className="space-y-3">
        {todos.length === 0 ? (
          <p className="text-center text-[color:var(--color-muted-foreground)] py-8">
            {t('noTasks', language)}
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between text-[12px] text-[color:var(--color-muted-foreground)] px-1">
              <span>{progressText}</span>
              <span>
                {language === 'zh' ? `第 ${page}/${totalPages} 页` : `Page ${page}/${totalPages}`}
              </span>
            </div>
            <div
              ref={listRef}
              onScroll={handleScroll}
              className="max-h-[60vh] overflow-y-auto pretty-scroll pr-1"
            >
              <SortableContext
                items={visibleTodos.map((todo) => todo.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {visibleTodos.map((todo) => (
                    <TodoItem key={todo.id} todo={todo} />
                  ))}
                </div>
              </SortableContext>
              {hasMore && (
                <div className="py-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    className="px-4 py-2 rounded-full border border-[color:var(--color-border)] text-[12px] font-semibold text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)]"
                  >
                    {language === 'zh' ? '加载更多' : 'Load more'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

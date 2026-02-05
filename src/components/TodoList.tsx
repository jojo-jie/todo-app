import { useEffect, useMemo, useRef, useState, type UIEvent } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTodos } from '../hooks/useTodos';
import { TodoItem } from './TodoItem';
import { useTodoStore } from '../store/todoStore';
import { StatsCard } from './StatsCard';
import { t } from '../locales';

export function TodoList() {
  const { todos, allTodos, removeMany } = useTodos();
  const { language, filter, search } = useTodoStore();
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<'all' | 'batch'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
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
    setSelectedIds(new Set());
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

  const batchTargets = todos.filter((todo) => selectedIds.has(todo.id));
  const allTargets = allTodos;
  const batchCount = batchTargets.length;
  const allCountForDelete = allTargets.length;
  const confirmCount = confirmMode === 'all' ? allCountForDelete : batchCount;

  const openConfirm = (mode: 'all' | 'batch') => {
    setConfirmMode(mode);
    setConfirmOpen(true);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirmDelete = async () => {
    const ids =
      confirmMode === 'all'
        ? allTargets.map((todo) => todo.id)
        : batchTargets.map((todo) => todo.id);
    await removeMany(ids);
    setSelectedIds(new Set());
    setConfirmOpen(false);
  };

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
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => openConfirm('batch')}
                disabled={batchCount === 0}
                className="px-4 py-2 rounded-full border border-[color:var(--color-border)] text-[12px] font-semibold text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('deleteBatch', language)}
              </button>
              <button
                type="button"
                onClick={() => openConfirm('all')}
                disabled={allCountForDelete === 0}
                className="px-4 py-2 rounded-full bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] text-[12px] font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('deleteAll', language)}
              </button>
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
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      selected={selectedIds.has(todo.id)}
                      onToggleSelect={toggleSelect}
                    />
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

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-[20px] border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-6 shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h3 className="text-[16px] font-bold text-[color:var(--color-foreground)]">
                {t('confirmDeleteTitle', language)}
              </h3>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="text-[12px] text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)]"
              >
                {t('cancel', language)}
              </button>
            </div>
            <p className="text-[14px] text-[color:var(--color-foreground)] leading-6">
              {confirmMode === 'all'
                ? t('confirmDeleteAll', language).replace('{count}', String(confirmCount))
                : t('confirmDeleteBatch', language).replace('{count}', String(confirmCount))}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-full border border-[color:var(--color-border)] text-[12px] font-semibold text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)]"
              >
                {t('cancel', language)}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-full bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] text-[12px] font-semibold shadow-sm"
              >
                {t('confirmDelete', language)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

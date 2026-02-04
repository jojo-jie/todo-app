import { useTodos } from '../hooks/useTodos';
import { TodoItem } from './TodoItem';
import { useTodoStore } from '../store/todoStore';
import { StatsCard } from './StatsCard';
import { t } from '../locales';

export function TodoList() {
  const { todos, allTodos } = useTodos();
  const { language } = useTodoStore();

  const allCount = allTodos.length;
  const activeCount = allTodos.filter((t) => !t.completed).length;
  const completedCount = allTodos.filter((t) => t.completed).length;

  const labels = {
    all: t('allTasks', language),
    active: t('inProgress', language),
    completed: t('done', language),
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
          todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)
        )}
      </div>
    </div>
  );
}

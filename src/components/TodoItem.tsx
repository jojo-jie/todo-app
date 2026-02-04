import { useMemo, useState } from 'react';
import { Check, Trash2, Edit2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Todo } from '../types';
import { useTodos } from '../hooks/useTodos';
import { useTodoStore } from '../store/todoStore';
import { format } from 'date-fns';
import { t } from '../locales';

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const [editContent, setEditContent] = useState(todo.content);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const { toggleTodo, removeTodo, editTodo } = useTodos();
  const { language } = useTodoStore();

  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
    attributes,
    listeners,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    low: 'bg-[color:var(--color-secondary)] text-[color:var(--color-muted-foreground)]',
    medium: 'bg-[color:var(--color-accent)] text-[color:var(--color-accent-foreground)]',
    high: 'bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]',
  };

  const handleSave = () => {
    const next = editContent;
    if (next.trim()) {
      editTodo({ ...todo, content: next });
    }
    setShowEdit(false);
  };

  const formatDueDate = () => {
    if (!todo.dueDate) return '';
    const date = new Date(todo.dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return language === 'zh' ? '今天' : 'Today';
    }
    if (format(date, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
      return language === 'zh' ? '明天' : 'Tomorrow';
    }
    return format(date, language === 'zh' ? 'MMM d' : 'MMM d');
  };

  const getTimeString = () => {
    if (!todo.dueDate) return '';
    const time = format(new Date(todo.dueDate), 'h:mm a');
    return `${formatDueDate()} · ${time}`;
  };

  const formatDateTime = (value: string) =>
    format(new Date(value), 'yyyy.MM.dd HH:mm');

  const durationText = useMemo(() => {
    if (!todo.completedAt) return '';
    const created = new Date(todo.createdAt).getTime();
    const completed = new Date(todo.completedAt).getTime();
    const diffSeconds = Math.max(0, (completed - created) / 1000);
    if (diffSeconds >= 3600) {
      const hours = diffSeconds / 3600;
      return `${hours.toFixed(1)}${language === 'zh' ? '小时' : 'h'}`;
    }
    if (diffSeconds >= 60) {
      const minutes = diffSeconds / 60;
      return `${minutes.toFixed(1)}${language === 'zh' ? '分' : 'm'}`;
    }
    return `${diffSeconds.toFixed(1)}${language === 'zh' ? '秒' : 's'}`;
  }, [todo.completedAt, todo.createdAt, language]);

  const timeMeta = useMemo(() => {
    const createdLabel = t('createdLabel', language);
    const completedLabel = t('completedLabel', language);
    const durationLabel = t('durationLabel', language);
    const createdText = `${createdLabel} ${formatDateTime(todo.createdAt)}`;

    if (!todo.completedAt) {
      return createdText;
    }

    return `${createdText} · ${completedLabel} ${formatDateTime(
      todo.completedAt
    )} · ${durationLabel} ${durationText}`;
  }, [language, todo.createdAt, todo.completedAt, durationText]);

  const canEdit = !todo.completed;

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="border border-[color:var(--color-border)] rounded-[20px] p-5 opacity-50"
      />
    );
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`group border border-[color:var(--color-border)] bg-[color:var(--color-card)] rounded-[20px] p-5 flex flex-col sm:flex-row gap-4 items-start transition-all shadow-sm ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
      <div className="flex flex-row sm:flex-col items-center gap-3 sm:gap-2">
        <button
          onClick={() => toggleTodo(todo.id)}
          className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
            todo.completed
              ? 'bg-[color:var(--color-primary)] border-transparent'
              : 'border-[color:var(--color-border)]'
          }`}
        >
          {todo.completed && (
            <Check className="w-4 h-4 text-[color:var(--color-primary-foreground)]" />
          )}
        </button>
        <button
          type="button"
          className="w-7 h-7 rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-secondary)] text-[color:var(--color-muted-foreground)] flex items-center justify-center hover:text-[color:var(--color-foreground)] cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label={language === 'zh' ? '拖拽排序' : 'Drag to reorder'}
          title={language === 'zh' ? '拖拽排序' : 'Drag to reorder'}
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </div>

        <div className="flex-1 min-w-0">
          <p
            onClick={() => setShowDetail(true)}
            className={`font-bold text-[16px] cursor-pointer break-words line-clamp-2 ${
              todo.completed
                ? 'line-through text-[color:var(--color-muted-foreground)]'
                : 'text-[color:var(--color-foreground)]'
            }`}
            title={todo.content}
          >
            {todo.content}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span
              className={`px-3 py-1 rounded-full text-[11.2px] font-medium tracking-[0.5px] uppercase ${priorityColors[todo.priority]}`}
            >
              {t(todo.priority, language)}
            </span>

            {todo.dueDate && (
              <span className="text-[12px] text-[color:var(--color-muted-foreground)] whitespace-nowrap">
                {getTimeString()}
              </span>
            )}
          </div>

        <div className="mt-2 text-[12px] text-[color:var(--color-muted-foreground)] text-left sm:text-right">
          {timeMeta}
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-start">
        {canEdit && (
          <button
            onClick={() => {
              setEditContent(todo.content);
              setShowEdit(true);
            }}
            className="w-9 h-9 rounded-[10px] bg-[color:var(--color-secondary)] flex items-center justify-center"
          >
            <Edit2 className="w-4 h-4 text-[color:var(--color-muted-foreground)]" />
          </button>
        )}
        <button
          onClick={() => removeTodo(todo.id)}
          className="w-9 h-9 rounded-[10px] bg-[color:var(--color-secondary)] flex items-center justify-center"
        >
          <Trash2 className="w-4 h-4 text-[color:var(--color-muted-foreground)]" />
        </button>
      </div>
      </div>

      {showDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setShowDetail(false)}
        >
          <div
            className="w-full max-w-lg rounded-[20px] border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-6 shadow-xl max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h3 className="text-[16px] font-bold text-[color:var(--color-foreground)]">
                {language === 'zh' ? '任务详情' : 'Task Detail'}
              </h3>
              <button
                type="button"
                onClick={() => setShowDetail(false)}
                className="text-[12px] text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)]"
              >
                {language === 'zh' ? '关闭' : 'Close'}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pretty-scroll">
              <p className="text-[15px] text-[color:var(--color-foreground)] leading-6 whitespace-pre-wrap break-words">
                {todo.content}
              </p>
            </div>
            <div className="mt-4 text-[12px] text-[color:var(--color-muted-foreground)]">
              {timeMeta}
            </div>
          </div>
        </div>
      )}

      {showEdit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setShowEdit(false)}
        >
          <div
            className="w-full max-w-lg rounded-[20px] border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-6 shadow-xl max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h3 className="text-[16px] font-bold text-[color:var(--color-foreground)]">
                {language === 'zh' ? '修改任务' : 'Edit Task'}
              </h3>
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="text-[12px] text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)]"
              >
                {language === 'zh' ? '关闭' : 'Close'}
              </button>
            </div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="flex-1 min-h-[160px] max-h-[45vh] w-full resize-none rounded-[16px] border border-[color:var(--color-border)] bg-[color:var(--color-card)] px-4 py-3 text-[15px] text-[color:var(--color-foreground)] outline-none pretty-scroll whitespace-pre-wrap"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="px-4 py-2 rounded-full border border-[color:var(--color-border)] text-[12px] font-semibold text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)]"
              >
                {language === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-full bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] text-[12px] font-semibold shadow-sm"
              >
                {language === 'zh' ? '保存' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

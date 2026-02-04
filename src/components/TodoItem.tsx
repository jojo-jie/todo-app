import { useState } from 'react';
import { Check, Trash2, Edit2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Todo } from '../types';
import { useTodos } from '../hooks/useTodos';
import { useTodoStore } from '../store/todoStore';
import { format } from 'date-fns';

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(todo.content);
  const { toggleTodo, removeTodo, editTodo } = useTodos();
  const { language } = useTodoStore();

  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-gray-100 text-gray-600',
    high: 'bg-gray-100 text-gray-600',
  };

  const handleSave = () => {
    if (editContent.trim()) {
      editTodo({ ...todo, content: editContent.trim() });
    }
    setIsEditing(false);
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

  const canEdit = !todo.completed;

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="border border-gray-200 rounded-[20px] p-5 opacity-50"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group border border-gray-200 rounded-[20px] p-5 flex gap-4 items-center transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <button
        onClick={() => toggleTodo(todo.id)}
        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
          todo.completed
            ? 'bg-gray-900 border-transparent'
            : 'border-gray-300'
        }`}
      >
        {todo.completed && <Check className="w-4 h-4 text-white" />}
      </button>

      {canEdit && isEditing ? (
        <input
          type="text"
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="flex-1 px-2 py-1 rounded border bg-white outline-none"
          autoFocus
        />
      ) : (
        <p
          className={`flex-1 font-bold text-[16px] ${
            todo.completed ? 'line-through text-gray-300' : 'text-gray-900'
          }`}
        >
          {todo.content}
        </p>
      )}

      <div className="flex items-center gap-3">
        {todo.tags.length > 0 && (
          <span
            className={`px-3 py-1 rounded-full text-[11.2px] font-medium tracking-[0.5px] uppercase ${
              priorityColors[todo.priority] || 'bg-gray-100 text-gray-600'
            }`}
          >
            {todo.tags[0]}
          </span>
        )}

        {todo.dueDate && (
          <span className="text-[12px] text-gray-400 whitespace-nowrap">
            {getTimeString()}
          </span>
        )}
      </div>

      {canEdit && (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="w-9 h-9 rounded-[10px] bg-gray-50 flex items-center justify-center"
          >
            <Edit2 className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => removeTodo(todo.id)}
            className="w-9 h-9 rounded-[10px] bg-gray-50 flex items-center justify-center"
          >
            <Trash2 className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      )}
    </div>
  );
}

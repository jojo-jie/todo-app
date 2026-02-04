import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTodos } from '../hooks/useTodos';
import { useTodoStore } from '../store/todoStore';
import { t } from '../locales';

export function AddTodo() {
  const [content, setContent] = useState('');
  const { createTodo } = useTodos();
  const { language } = useTodoStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await createTodo({
      content: content.trim(),
      priority: 'medium',
      tags: [],
      dueDate: null,
    });

    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="border border-gray-200 rounded-[24px] flex gap-3 px-4 py-3 hover:border-gray-300 transition-colors">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('addTask', language)}
          className="flex-1 h-[48px] bg-transparent outline-none text-gray-900 placeholder-gray-400"
        />
        <button
          type="submit"
          disabled={!content.trim()}
          className="w-[48px] h-[48px] rounded-[16px] bg-gray-900 disabled:opacity-50 flex items-center justify-center shrink-0"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
      </div>
    </form>
  );
}

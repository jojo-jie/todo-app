import { useEffect, useRef, useState } from 'react';
import { Moon, Plus, Sun } from 'lucide-react';
import { useTodos } from '../hooks/useTodos';
import { useTodoStore } from '../store/todoStore';
import { t } from '../locales';

const MAX_TEXTAREA_HEIGHT = 96;

export function AddTodo() {
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const { createTodo } = useTodos();
  const { language, setLanguage, theme, setTheme } = useTodoStore();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const nextHeight = Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden';
  };

  useEffect(() => {
    resizeTextarea();
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await createTodo({
      content: content.trim(),
      priority,
      tags: [],
      dueDate: null,
    });

    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          {(['low', 'medium', 'high'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setPriority(level)}
              className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-all border ${
                priority === level
                  ? 'bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] border-transparent shadow-sm'
                  : 'bg-[color:var(--color-card)] text-[color:var(--color-muted-foreground)] border-[color:var(--color-border)] hover:text-[color:var(--color-foreground)]'
              }`}
            >
              {t(level, language)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
            className="w-11 h-11 rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-card)] text-[color:var(--color-foreground)] hover:border-[color:var(--color-primary)] transition-colors shadow-sm flex items-center justify-center text-[13px] font-semibold leading-none"
            aria-label={language === 'zh' ? t('switchToEnglish', language) : t('switchToChinese', language)}
            title={language === 'zh' ? t('switchToEnglish', language) : t('switchToChinese', language)}
          >
            {language === 'zh' ? '中' : 'EN'}
          </button>

          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-11 h-11 rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-card)] text-[color:var(--color-foreground)] hover:border-[color:var(--color-primary)] transition-colors shadow-sm flex items-center justify-center"
            aria-label={theme === 'dark' ? t('themeLight', language) : t('themeDark', language)}
            title={theme === 'dark' ? t('themeLight', language) : t('themeDark', language)}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <div className="border border-[color:var(--color-border)] bg-[color:var(--color-card)] rounded-[24px] flex flex-col sm:flex-row gap-3 px-4 py-3 hover:border-[color:var(--color-primary)]/60 transition-colors shadow-sm items-stretch sm:items-center">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('addTask', language)}
          rows={1}
          className="flex-1 min-h-[48px] max-h-[96px] resize-none bg-transparent outline-none text-[color:var(--color-foreground)] placeholder-[color:var(--color-muted-foreground)] leading-6 py-3 pretty-scroll"
        />
        <button
          type="submit"
          disabled={!content.trim()}
          className="w-full sm:w-[48px] h-[48px] rounded-[16px] bg-[color:var(--color-primary)] disabled:opacity-50 flex items-center justify-center shrink-0 shadow-[0_8px_16px_-10px_rgba(14,165,233,0.6)]"
        >
          <Plus className="w-6 h-6 text-[color:var(--color-primary-foreground)]" />
        </button>
      </div>
    </form>
  );
}

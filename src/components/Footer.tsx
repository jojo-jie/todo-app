import { t } from '../locales';
import { useTodoStore } from '../store/todoStore';

export function Footer() {
  const { language } = useTodoStore();

  return (
    <footer className="border-t border-[color:var(--color-border)] pt-6 mt-8">
      <div className="text-center">
        <p className="text-[color:var(--color-muted-foreground)] text-[13.6px]">
          {t('footer', language).split('♥')[0]}
          <span className="text-[color:var(--color-foreground)] font-bold">
            ♥
          </span>
          {t('footer', language).split('♥')[1]}
        </p>
      </div>
    </footer>
  );
}

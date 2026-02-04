import { t } from '../locales';
import { useTodoStore } from '../store/todoStore';

export function Footer() {
  const { language } = useTodoStore();

  return (
    <footer className="border-t border-gray-100 pt-6 mt-8">
      <div className="text-center">
        <p className="text-gray-400 text-[13.6px]">
          {t('footer', language).split('♥')[0]}
          <span className="text-gray-900 font-bold">
            ♥
          </span>
          {t('footer', language).split('♥')[1]}
        </p>
      </div>
    </footer>
  );
}

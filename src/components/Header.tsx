import { Check } from 'lucide-react';
import { t } from '../locales';

export function Header() {
  return (
    <header className="text-center mb-6">
      <div className="flex items-center justify-center gap-3 mb-2">
        <div className="relative">
          <div className="absolute inset-0 bg-gray-900/8 blur-lg rounded-full" />
          <div className="relative w-12 h-12 rounded-[16px] bg-gray-900 flex items-center justify-center">
            <Check className="w-6 h-6 text-white" />
          </div>
        </div>
        <h1 className="text-[40px] font-bold text-gray-900">
          {t('title', 'zh')}
        </h1>
      </div>
      <p className="text-gray-400 tracking-[0.5px]">
        {t('subtitle', 'zh')}
      </p>
    </header>
  );
}

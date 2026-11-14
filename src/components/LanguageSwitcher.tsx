// src/components/LanguageSwitcher.tsx
// Sleek language switcher button & animated dropdown positioned directly next to the Streak button.

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import type { Language } from '../i18n/types';

const LANGUAGE_OPTIONS: Array<{
  code: Language;
  flag: string;
  label: string;
  short: string;
}> = [
  { code: 'en', flag: '🇺🇸', label: 'English', short: 'EN' },
  { code: 'ar', flag: '🇪🇬', label: 'العربية', short: 'AR' },
];

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleSelect = (code: Language) => {
    setLang(code);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="lang-switcher interactive" dir="ltr">
      <motion.button
        type="button"
        className={`lang-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        aria-label={t.languageSwitcher.ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        title={t.languageSwitcher.title}
      >
        <span className="lang-trigger-icon">
          <Globe size={15} />
        </span>
        <span className="lang-trigger-code">{t.langLabelShort}</span>
        <ChevronDown
          size={13}
          className={`lang-trigger-chevron ${open ? 'rotated' : ''}`}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="lang-dropdown glass-panel"
            role="listbox"
            aria-label={t.languageSwitcher.title}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {LANGUAGE_OPTIONS.map((opt) => {
              const isActive = lang === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`lang-option ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelect(opt.code)}
                >
                  <span className="lang-option-flag" aria-hidden="true">
                    {opt.flag}
                  </span>
                  <span
                    className={`lang-option-label ${opt.code === 'ar' ? 'font-ar' : ''}`}
                  >
                    {opt.label}
                  </span>
                  {isActive && (
                    <span className="lang-option-check" aria-hidden="true">
                      <Check size={14} />
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


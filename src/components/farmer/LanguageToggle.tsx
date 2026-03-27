import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useLanguage, Language, LANGUAGE_LABELS } from '@/contexts/LanguageContext';

const LANGUAGES = Object.entries(LANGUAGE_LABELS) as [Language, string][];

/**
 * LanguageToggle Component
 * Dropdown selector to switch between supported languages
 */
export function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full
                   text-sm font-semibold text-white/80 hover:bg-white/20 hover:text-white transition-all duration-300"
      >
        <Globe className="w-4 h-4" />
        <span>{LANGUAGE_LABELS[lang]}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-44 py-1.5 bg-[#1a2a1a]/95 backdrop-blur-2xl
                        border border-white/15 rounded-2xl shadow-2xl shadow-black/40 z-50
                        animate-slide-up overflow-hidden">
          {LANGUAGES.map(([code, label]) => (
            <button
              key={code}
              onClick={() => { setLang(code); setIsOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-all duration-200
                ${lang === code
                  ? 'bg-emerald-500/25 text-emerald-200'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

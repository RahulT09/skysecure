import { AppMode } from '@/types/weather';
import { Sprout, MapPin, User } from 'lucide-react';

interface ModeToggleProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

/**
 * Mode toggle buttons for switching between different advice modes
 */
export function ModeToggle({ currentMode, onModeChange }: ModeToggleProps) {
  const modes: { id: AppMode; label: string; icon: React.ReactNode; emoji: string }[] = [
    {
      id: 'general',
      label: 'General',
      icon: <User className="w-4 h-4" />,
      emoji: '👤',
    },
    {
      id: 'farmer',
      label: 'Farmer Mode',
      icon: <Sprout className="w-4 h-4" />,
      emoji: '🌾',
    },
    {
      id: 'activity',
      label: 'Activities',
      icon: <MapPin className="w-4 h-4" />,
      emoji: '🌍',
    },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem]">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={`
            flex items-center gap-2 px-5 py-3 rounded-[2rem] font-semibold text-[15px]
            transition-all duration-300 ease-out
            ${
              currentMode === mode.id
                ? 'bg-white text-black shadow-lg scale-105'
                : 'bg-transparent text-white/50 hover:bg-white/10 hover:text-white/90 cursor-pointer'
            }
          `}
        >
          <span className="text-lg">{mode.emoji}</span>
          <span className="hidden sm:inline lowercase tracking-wide" style={{ fontVariant: 'small-caps' }}>{mode.label}</span>
        </button>
      ))}
    </div>
  );
}

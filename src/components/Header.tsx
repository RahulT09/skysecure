import { CloudSun, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
}

/**
 * App header with title and refresh button
 */
export function Header({ onRefresh, isLoading }: HeaderProps) {
  return (
    <header className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
          <CloudSun className="w-8 h-8 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-[22px] tracking-tight text-white leading-tight">
            SkySecure
          </span>
          <span className="text-sm font-medium text-white/80 leading-tight">
            Smart Weather Assistant
          </span>
        </div>
      </div>

      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20
                   flex items-center justify-center transition-all duration-300 hover:bg-white/20 disabled:opacity-50"
        title="Refresh weather data"
      >
        <RefreshCw 
          className={`w-5 h-5 opacity-80 group-hover:opacity-100
                      ${isLoading ? 'animate-spin' : ''}`} 
        />
      </button>
    </header>
  );
}

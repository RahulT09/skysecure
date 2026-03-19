import { useState } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';

interface LocationSearchProps {
  currentLocation: string;
  onLocationChange: (location: string) => void;
  isLoading?: boolean;
}

/**
 * Location search component - searches any city worldwide
 */
export function LocationSearch({ currentLocation, onLocationChange, isLoading }: LocationSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onLocationChange(searchTerm.trim());
      setSearchTerm('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md mx-auto">
      <div className="relative flex items-center bg-white rounded-full shadow-lg p-1">
        {isLoading ? (
          <Loader2 className="absolute left-4 w-5 h-5 text-gray-400 animate-spin" />
        ) : (
          <Search className="absolute left-4 w-5 h-5 text-gray-400" />
        )}
        <input
          type="text"
          placeholder="Search any city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isLoading}
          className="w-full pl-12 pr-28 py-3.5 bg-transparent border-none focus:outline-none focus:ring-0
                     text-gray-800 placeholder:text-gray-400 text-[16px] font-medium"
        />
        <button
          type="submit"
          disabled={!searchTerm.trim() || isLoading}
          className="absolute right-1.5 px-6 py-2.5 
                     bg-[#98CBA4] text-white rounded-full text-[15px] font-bold tracking-wide
                     hover:bg-[#85B791] disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors duration-200"
        >
          Search
        </button>
      </div>
      
      {/* Current location indicator */}
      <div className="flex items-center justify-center gap-1.5 mt-5 text-[15px] font-medium text-white/90">
        <MapPin className="w-[18px] h-[18px]" />
        <span>Currently showing: {currentLocation}</span>
      </div>
    </form>
  );
}

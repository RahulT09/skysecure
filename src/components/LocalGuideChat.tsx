import { useState, useEffect } from 'react';
import { X, Send, MapPin, ThumbsUp, User, MessageCircle, Compass, Shield, Clock, Utensils, Search } from 'lucide-react';
import { WeatherData, LocalTip, TravelAdvice } from '@/types/weather';
import { generateTravelAdvice, getWelcomeMessage, getCommunityPrompt } from '@/utils/travelAdvice';
import {
  StoredTip,
  fetchTipsForPlace,
  addTip,
  likeTip,
  extractPlaceName,
} from '@/utils/localTipsApi';

interface LocalGuideChatProps {
  weather: WeatherData;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'chat' | 'weather' | 'travel' | 'safety' | 'tips';

/**
 * Local Guide Chat - Interactive travel assistant with place-based experience sharing
 */
export function LocalGuideChat({ weather, isOpen, onClose }: LocalGuideChatProps) {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [communityTips, setCommunityTips] = useState<StoredTip[]>([]);
  const [newTip, setNewTip] = useState('');
  const [userName, setUserName] = useState('');
  const [placeName, setPlaceName] = useState('');
  const [searchPlace, setSearchPlace] = useState('');
  const [isLoadingTips, setIsLoadingTips] = useState(false);
  const [activeSearchLabel, setActiveSearchLabel] = useState('');

  // Initialize place name from weather location
  useEffect(() => {
    if (weather?.location) {
      const defaultPlace = extractPlaceName(weather.location);
      setPlaceName(defaultPlace);
      setSearchPlace(defaultPlace);
      loadTipsForPlace(defaultPlace);
    }
  }, [weather?.location]);

  if (!isOpen) return null;

  const advice = generateTravelAdvice(weather);
  const welcomeMessage = getWelcomeMessage(weather.location);

  async function loadTipsForPlace(place: string) {
    if (!place.trim()) return;
    setIsLoadingTips(true);
    setActiveSearchLabel(place.trim());
    try {
      const tips = await fetchTipsForPlace(place.trim());
      setCommunityTips(tips);
    } catch (err) {
      console.error('Failed to load tips:', err);
    } finally {
      setIsLoadingTips(false);
    }
  }

  const handleAddTip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTip.trim() || !userName.trim() || !placeName.trim()) return;

    const savedTip = await addTip(placeName, newTip, userName);
    if (savedTip) {
      setCommunityTips(prev => [savedTip, ...prev]);
    }
    setNewTip('');
  };

  const handleLikeTip = async (tipId: string) => {
    setCommunityTips(prev =>
      prev.map(tip =>
        tip.id === tipId ? { ...tip, likes: tip.likes + 1 } : tip
      )
    );
    await likeTip(tipId);
  };

  const handleSearchPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchPlace.trim()) {
      loadTipsForPlace(searchPlace);
    }
  };

  const tabs = [
    { id: 'chat' as TabType, label: 'Chat', icon: MessageCircle },
    { id: 'weather' as TabType, label: 'Weather', icon: Clock },
    { id: 'travel' as TabType, label: 'Travel', icon: Compass },
    { id: 'safety' as TabType, label: 'Safety', icon: Shield },
    { id: 'tips' as TabType, label: 'Food & Tips', icon: Utensils },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#1A1A1A]/95 backdrop-blur-2xl text-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col border border-white/10">
        {/* Header */}
        <div className="bg-black/20 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Local Guide</h3>
              <p className="text-sm opacity-90 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                {weather.location}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors
                ${activeTab === tab.id 
                  ? 'text-white border-b-2 border-white bg-white/5' 
                  : 'text-white/50 hover:text-white/80'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'chat' && (
            <ChatTab 
              welcomeMessage={welcomeMessage}
              communityTips={communityTips}
              userName={userName}
              setUserName={setUserName}
              newTip={newTip}
              setNewTip={setNewTip}
              placeName={placeName}
              searchPlace={searchPlace}
              setSearchPlace={setSearchPlace}
              activeSearchLabel={activeSearchLabel}
              isLoadingTips={isLoadingTips}
              onAddTip={handleAddTip}
              onLikeTip={handleLikeTip}
              onSearchPlace={handleSearchPlace}
            />
          )}
          {activeTab === 'weather' && <AdviceList items={advice.weather} title="Weather & Climate" icon="🌤️" />}
          {activeTab === 'travel' && <AdviceList items={advice.travel} title="Getting Around" icon="🚗" />}
          {activeTab === 'safety' && <AdviceList items={advice.safety} title="Safety Tips" icon="🛡️" />}
          {activeTab === 'tips' && (
            <div className="space-y-4">
              <AdviceList items={advice.localTips} title="Local Experiences" icon="🍜" />
              <AdviceList items={advice.bestTimes} title="Best Times" icon="⏰" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ChatTabProps {
  welcomeMessage: string;
  communityTips: StoredTip[];
  userName: string;
  setUserName: (name: string) => void;
  newTip: string;
  setNewTip: (tip: string) => void;
  placeName: string;
  searchPlace: string;
  setSearchPlace: (place: string) => void;
  activeSearchLabel: string;
  isLoadingTips: boolean;
  onAddTip: (e: React.FormEvent) => void;
  onLikeTip: (id: string) => void;
  onSearchPlace: (e: React.FormEvent) => void;
}

function ChatTab({ 
  welcomeMessage, 
  communityTips, 
  userName, 
  setUserName, 
  newTip, 
  setNewTip, 
  placeName,
  searchPlace,
  setSearchPlace,
  activeSearchLabel,
  isLoadingTips,
  onAddTip,
  onLikeTip,
  onSearchPlace,
}: ChatTabProps) {
  return (
    <div className="space-y-4">
      {/* Welcome message */}
      <div className="bg-[#98CBA4]/20 rounded-2xl rounded-tl-sm p-4">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-[#98CBA4]/30 flex items-center justify-center flex-shrink-0">
            <Compass className="w-4 h-4 text-[#98CBA4]" />
          </div>
          <p className="text-sm leading-relaxed text-white/90">{welcomeMessage}</p>
        </div>
      </div>

      {/* Community prompt */}
      <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
        <p className="text-sm text-center text-white/80">{getCommunityPrompt()}</p>
      </div>

      {/* Search experiences by place */}
      <form onSubmit={onSearchPlace} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search experiences by place..."
            value={searchPlace}
            onChange={(e) => setSearchPlace(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white
                       placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={!searchPlace.trim()}
          className="px-4 py-3 bg-cyan-500/20 text-cyan-300 rounded-xl font-medium border border-cyan-400/30
                     hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors text-sm"
        >
          <Search className="w-4 h-4" />
        </button>
      </form>

      {/* Add tip form */}
      <form onSubmit={onAddTip} className="space-y-3">
        {/* Current location badge (read-only) */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-400/20">
          <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-xs text-white/50">Sharing about:</span>
          <span className="text-sm font-semibold text-emerald-300">{placeName || 'Your Location'}</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white
                       placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#98CBA4]/50 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Share your tip or experience..."
            value={newTip}
            onChange={(e) => setNewTip(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white
                       placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#98CBA4]/50 text-sm"
          />
          <button
            type="submit"
            disabled={!newTip.trim() || !userName.trim() || !placeName.trim()}
            className="px-5 py-3 bg-[#98CBA4] text-white rounded-xl font-medium
                       hover:bg-[#85B791] disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors shadow-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Community tips */}
      {isLoadingTips && (
        <div className="flex items-center justify-center py-6">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
          <span className="ml-3 text-sm text-white/50">Loading experiences...</span>
        </div>
      )}

      {!isLoadingTips && communityTips.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white/60 px-1">
            Experiences about "{activeSearchLabel}" ({communityTips.length})
          </h4>
          {communityTips.map(tip => (
            <div key={tip.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-[#98CBA4]/20 flex items-center justify-center">
                  <User className="w-3 h-3 text-[#98CBA4]" />
                </div>
                <span className="text-sm font-medium text-white/90">{tip.author}</span>
                {/* Place name badge */}
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30
                                 text-[10px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" />
                  {tip.place_name}
                </span>
                <span className="text-xs text-white/40 ml-auto">
                  {new Date(tip.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-[15px] text-white/80 leading-relaxed">{tip.content}</p>
              <button
                onClick={() => onLikeTip(tip.id)}
                className="flex items-center gap-1.5 text-xs text-white/50 hover:text-[#98CBA4] transition-colors pt-2 border-t border-white/5 w-full mt-2"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                {tip.likes > 0 && <span className="font-medium">{tip.likes}</span>}
                <span className="font-medium">Helpful</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {!isLoadingTips && communityTips.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">
          No experiences shared for this place yet. Be the first! 🌟
        </p>
      )}
    </div>
  );
}

interface AdviceListProps {
  items: string[];
  title: string;
  icon: string;
}

function AdviceList({ items, title, icon }: AdviceListProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      <h4 className="flex items-center gap-2.5 font-semibold text-white/90 px-1 text-[17px]">
        <span className="text-xl">{icon}</span>
        {title}
      </h4>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 text-[15px] leading-relaxed text-white/80 animate-fade-in shadow-sm"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

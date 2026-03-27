/**
 * Chatbot Component — Keyword-based Travel Explorer Chatbot
 * Positioned on bottom-left as a floating overlay (separate from existing AI chat on right).
 * Uses simple keyword matching to suggest tourist places from curated dataset.
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, X, Send, Loader2 } from 'lucide-react';
import { findCity, getAvailableCities, CuratedPlace } from '@/utils/curatedPlaces';

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  places?: CuratedPlace[];
  cityKey?: string;
  cityLat?: number;
  cityLon?: number;
}

export function Chatbot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'bot',
      content: `👋 Hi! I'm your Travel Explorer assistant.\n\nTry asking things like:\n• "Explore Borivali"\n• "Show me places in Mumbai"\n• "Hotels near Delhi"\n\nI know about: ${getAvailableCities().join(', ')}`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  /**
   * Simple keyword-based response logic
   * Scans user input for city names and action keywords
   */
  const processMessage = (text: string) => {
    const lower = text.toLowerCase().trim();
    const cityResult = findCity(lower.replace(/explore|show|places|hotel|nearby|famous|spots|in|me|find|around|near|transport/gi, '').trim());

    // If no city match, try full text
    const finalCity = cityResult || findCity(lower);

    if (finalCity) {
      const { key, data } = finalCity;
      const cityName = key.charAt(0).toUpperCase() + key.slice(1);

      // Determine response type based on keywords
      if (lower.includes('hotel')) {
        return {
          content: `🏨 Looking for hotels near **${cityName}**? Let me take you to the Explore Dashboard where you can find nearby accommodations with ratings and directions!`,
          places: data.places.slice(0, 3),
          cityKey: key,
          cityLat: data.lat,
          cityLon: data.lon,
        };
      }

      if (lower.includes('transport') || lower.includes('station') || lower.includes('airport') || lower.includes('train')) {
        return {
          content: `🚉 Need transport info near **${cityName}**? I can show you nearby railway stations and airports on the Explore Dashboard!`,
          places: data.places.slice(0, 3),
          cityKey: key,
          cityLat: data.lat,
          cityLon: data.lon,
        };
      }

      // Default: show tourist places
      return {
        content: `🌟 Great choice! Here are the top attractions in **${cityName}**:`,
        places: data.places,
        cityKey: key,
        cityLat: data.lat,
        cityLon: data.lon,
      };
    }

    // Greeting responses
    if (lower.match(/^(hi|hello|hey|namaste)/)) {
      return {
        content: `👋 Hello! I'm here to help you explore amazing places across India.\n\nJust tell me a city name like "Explore Mumbai" or "Show me places in Jaipur" and I'll guide you!`,
      };
    }

    // Help response
    if (lower.includes('help') || lower.includes('what can you do')) {
      return {
        content: `🧭 I can help you:\n\n• Find tourist attractions in any city\n• Locate nearby hotels\n• Find transport hubs (railway/airports)\n\nAvailable cities: ${getAvailableCities().join(', ')}\n\nJust type something like "Explore Goa" to get started!`,
      };
    }

    // Fallback
    return {
      content: `🤔 I couldn't find that city in my database. Try one of these:\n\n${getAvailableCities().join(', ')}\n\nExample: "Explore Mumbai" or "Hotels near Jaipur"`,
    };
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userMsg = inputText.trim();
    setInputText('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    // Simulate brief typing delay for natural feel
    setTimeout(() => {
      const response = processMessage(userMsg);
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: response.content,
          places: response.places,
          cityKey: response.cityKey,
          cityLat: response.cityLat,
          cityLon: response.cityLon,
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  /**
   * Navigate to the Explore dashboard with query params
   */
  const handleNavigate = (cityKey: string, lat: number, lon: number) => {
    navigate(`/explore?city=${cityKey}&lat=${lat}&lon=${lon}`);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start animate-fade-in">
      {/* Chat Window */}
      {isOpen && (
        <div className="text-white mb-4 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] bg-[#1A1A1A]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up transform origin-bottom-left">
          {/* Header */}
          <div className="bg-cyan-500/20 px-5 py-3.5 flex items-center justify-between border-b border-white/5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-400/20">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col text-white">
                <span className="font-semibold text-white text-[15px] leading-tight">Travel Explorer</span>
                <span className="text-cyan-300 text-[11px] flex items-center gap-1.5 font-medium mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
                  Smart City Guide
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {msg.role === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-cyan-400/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Compass className="w-3.5 h-3.5 text-cyan-300" />
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {/* Message bubble */}
                  <div
                    className={`p-3.5 text-[13px] leading-relaxed shadow-sm whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-cyan-400 text-black rounded-2xl rounded-tr-sm font-medium'
                        : 'bg-white/20 text-white rounded-2xl rounded-tl-sm border border-white/5'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Place list (bot only) */}
                  {msg.places && msg.places.length > 0 && (
                    <div className="space-y-1.5 mt-1">
                      {msg.places.map((place, pIdx) => (
                        <div
                          key={pIdx}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-800 border border-white/10 text-white"
                        >
                          <span className="text-base shrink-0">{place.emoji}</span>
                          <span className="text-sm text-white font-semibold  leading-tight">{place.name}</span>
                          <span
                            className={`ml-auto shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              place.type === 'indoor'
                                ? 'bg-blue-500/30 text-blue-200 border border-blue-400/30'
                                : 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30'
                            }`}
                          >
                            {place.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  {msg.cityKey && msg.cityLat !== undefined && msg.cityLon !== undefined && (
                    <div className="flex flex-wrap gap-2 mt-1 text-white">
                      <button
                        onClick={() => handleNavigate(msg.cityKey!, msg.cityLat!, msg.cityLon!)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30
                                   text-xs font-semibold hover:bg-cyan-500/30 transition-colors"
                      >
                        🗺️ Explore Location
                      </button>
                      <button
                        onClick={() => handleNavigate(msg.cityKey!, msg.cityLat!, msg.cityLon!)}
                        className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30
                                   text-xs font-semibold hover:bg-blue-500/30 transition-colors"
                      >
                        🏨 Find Hotels
                      </button>
                      <button
                        onClick={() => handleNavigate(msg.cityKey!, msg.cityLat!, msg.cityLon!)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30
                                   text-xs font-semibold hover:bg-emerald-500/30 transition-colors"
                      >
                        🚉 Transport
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-7 h-7 rounded-full bg-cyan-400/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Compass className="w-4 h-4 text-cyan-300" />
                </div>
                <div className="bg-white/10 border border-white/5 rounded-2xl rounded-tl-sm p-4 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white/50 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <form onSubmit={handleSend} className="p-3 bg-black/20 border-t border-white/5">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Try: Explore Mumbai..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isTyping}
                className="w-full bg-white/10 border border-white/10 rounded-full py-3 pl-4 pr-12
                           text-white text-[15px] placeholder:text-white/40 focus:outline-none
                           focus:border-cyan-400/30 disabled:opacity-50 transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="absolute right-2 p-2 bg-cyan-400 text-black rounded-full
                           hover:bg-white disabled:opacity-0 disabled:scale-90 transition-all duration-200"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
            <span className="block text-[10px] text-white/30 mt-2 px-2 tracking-wide">
              🧭 Powered by curated local data
            </span>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-[60px] h-[60px] rounded-full
                    shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-300
                    hover:scale-110 active:scale-95 ${
                      isOpen
                        ? 'bg-[#1A1A1A] border border-white/20 text-white'
                        : 'bg-cyan-400 text-black'
                    }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Compass className="w-7 h-7" />}
      </button>
    </div>
  );
}

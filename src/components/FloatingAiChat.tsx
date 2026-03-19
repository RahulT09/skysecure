import { useState, useEffect, useRef } from 'react';
import { Bot, X, Sparkles, Send, Key, Loader2, MessageSquare, Trash2 } from 'lucide-react';
import { WeatherData, ChatMessage as AppChatMessage } from '@/types/weather';

interface FloatingAiChatProps {
  weather: WeatherData;
}

interface ChatHistoryItem {
  role: 'user' | 'model';
  content: string;
}

export function FloatingAiChat({ weather }: FloatingAiChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('AIzaSyCpDmjpqw1wwz1mVcls1XYLAocWXvpYm4E'); // Force the user's new key
  const [isApiKeySet, setIsApiKeySet] = useState(true);
  
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // We strictly use the hardcoded user key now, so no need to fetch from localStorage.
    
    // Initialize chat with context if empty
    if (chatHistory.length === 0) {
      setChatHistory([
        { role: 'model', content: `Hi! I've analyzed the live weather for ${weather.location} (${weather.temperature}°C, ${weather.condition}). I'm here to help you plan your day or answer any climate questions!` }
      ]);
    }
  }, [weather.location, weather.temperature, weather.condition]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isLoading, isOpen]);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      setIsApiKeySet(true);
    }
  };

  const handleRemoveApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setIsApiKeySet(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !isApiKeySet || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const systemContext = `You are a helpful AI Weather Analyst for an app called SkySecure. Provide concise, friendly answers. Current weather in ${weather.location}: ${weather.temperature}°C, ${weather.condition}, Humidity: ${weather.humidity || 0}%, Wind: ${weather.windSpeed || 0} km/h. Keep responses under 3 sentences unless complex explanation is needed.`;
      
      const promptText = `${systemContext}\n\nUser: ${userMessage}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        const errMsg = errData?.error?.message || `API returned ${response.status}`;
        throw new Error(errMsg);
      }
      
      const data = await response.json();
      const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that.";

      setChatHistory(prev => [...prev, { role: 'model', content: botReply }]);
    } catch (error: any) {
      const errorMessage = error?.message?.includes('API key')
        ? "⚠️ Invalid API key. Please remove the current key and enter a valid one."
        : "⚠️ Couldn't reach AI service. Check your connection and try again.";
      setChatHistory(prev => [...prev, { role: 'model', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end animate-fade-in">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] bg-[#1A1A1A]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up transform origin-bottom-right">
          
          {/* Header */}
          <div className="bg-[#98CBA4]/20 px-5 py-3.5 flex items-center justify-between border-b border-white/5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#98CBA4] flex items-center justify-center shadow-lg shadow-[#98CBA4]/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-white text-[15px] leading-tight">AI Weather Analyst</span>
                <span className="text-[#98CBA4] text-[11px] flex items-center gap-1.5 font-medium mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#98CBA4] animate-pulse" />
                  Powered by Gemini
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isApiKeySet ? (
            /* API Key Input State */
            <div className="flex-1 p-6 flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                <Key className="w-8 h-8 text-white/40" />
              </div>
              <h4 className="text-white font-medium mb-2 text-lg">Connect AI</h4>
              <p className="text-white/60 text-sm mb-6 leading-relaxed">
                Enter your Google Gemini API key to activate the live weather assistant.
              </p>
              <form onSubmit={handleSaveApiKey} className="w-full space-y-3">
                <input
                  type="password"
                  placeholder="Enter API Key..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#98CBA4]/50 focus:ring-1 focus:ring-[#98CBA4]/50 text-sm transition-all"
                />
                <button
                  type="submit"
                  disabled={!apiKey.trim()}
                  className="w-full py-3 bg-[#98CBA4] text-black font-medium text-sm rounded-xl hover:bg-[#85b791] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#98CBA4]/20"
                >
                  Save Key & Start Chatting
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Chat History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                    
                    {/* Icons */}
                    {msg.role === 'model' && (
                      <div className="w-7 h-7 rounded-full bg-[#98CBA4]/20 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-[#98CBA4]" />
                      </div>
                    )}

                    {/* Chat Bubble */}
                    <div className={`p-3.5 text-[14px] leading-relaxed shadow-sm
                      ${msg.role === 'user' 
                        ? 'bg-[#98CBA4] text-black rounded-2xl rounded-tr-sm font-medium' 
                        : msg.content.startsWith('⚠️')
                          ? 'bg-red-500/15 text-red-200 rounded-2xl rounded-tl-sm border border-red-400/20'
                          : 'bg-white/10 text-white/90 rounded-2xl rounded-tl-sm border border-white/5'
                      }
                    `}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 max-w-[80%]">
                    <div className="w-7 h-7 rounded-full bg-[#98CBA4]/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-[#98CBA4]" />
                    </div>
                    <div className="bg-white/10 border border-white/5 rounded-2xl rounded-tl-sm p-4 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-white/50 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-3 bg-black/20 border-t border-white/5">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Ask about your forecast..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-white/10 border border-white/10 rounded-full py-3 pl-4 pr-12 text-white text-[15px] placeholder:text-white/40 focus:outline-none focus:border-[#98CBA4]/30 disabled:opacity-50 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isLoading}
                    className="absolute right-2 p-2 bg-[#98CBA4] text-black rounded-full hover:bg-white disabled:opacity-0 disabled:scale-90 transition-all duration-200"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2 px-2">
                  <span className="text-[10px] text-white/30 tracking-wide">AI can make mistakes.</span>
                  <button 
                    type="button" 
                    onClick={handleRemoveApiKey}
                    className="text-[10px] text-red-400/60 hover:text-red-400 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Remove API Key
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-[60px] h-[60px] rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-300 hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-[#1A1A1A] border border-white/20 text-white' : 'bg-[#98CBA4] text-black'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
      </button>

    </div>
  );
}

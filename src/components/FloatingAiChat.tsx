import { useState, useEffect, useRef } from 'react';
import { Bot, X, Sparkles, Send, Loader2 } from 'lucide-react';
import { WeatherData, ChatMessage as AppChatMessage } from '@/types/weather';

interface FloatingAiChatProps {
  weather: WeatherData;
}

interface ChatHistoryItem {
  role: 'user' | 'model';
  content: string;
}

const GEMINI_API_KEY = 'AIzaSyBYKXlpry1TDBA9iz8_6GfSoGqPCbPVb1g';
const GEMINI_MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

/**
 * Call the Gemini API with automatic retry (backoff) and model fallback.
 */
async function callGeminiWithRetry(prompt: string): Promise<string> {
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
  });

  for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
          }
        );

        if (response.status === 429) {
          // Rate limited — wait and retry
          await new Promise((r) => setTimeout(r, (attempt + 1) * 2000));
          continue;
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => null);
          throw new Error(errData?.error?.message || `API ${response.status}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that.";
      } catch (err: any) {
        if (attempt === 2) break; // exhausted retries for this model
        await new Promise((r) => setTimeout(r, (attempt + 1) * 1500));
      }
    }
  }

  throw new Error('All models exhausted');
}

export function FloatingAiChat({ weather }: FloatingAiChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const systemContext = `You are a helpful AI Weather Analyst for an app called SkySecure. Provide concise, friendly answers. Current weather in ${weather.location}: ${weather.temperature}°C, ${weather.condition}, Humidity: ${weather.humidity || 0}%, Wind: ${weather.windSpeed || 0} km/h. Keep responses under 3 sentences unless complex explanation is needed.`;
      const promptText = `${systemContext}\n\nUser: ${userMessage}`;

      const botReply = await callGeminiWithRetry(promptText);
      setChatHistory(prev => [...prev, { role: 'model', content: botReply }]);
    } catch (error: any) {
      setChatHistory(prev => [...prev, { role: 'model', content: "⚠️ Couldn't reach AI service. Please try again in a moment." }]);
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
            <div className="flex justify-center items-center mt-2 px-2">
              <span className="text-[10px] text-white/30 tracking-wide">AI can make mistakes.</span>
            </div>
          </form>
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

import { ChatMessage, AppMode } from '@/types/weather';
import { MessageCircle, AlertTriangle, Lightbulb, Sparkles } from 'lucide-react';

interface ChatAssistantProps {
  messages: ChatMessage[];
  mode: AppMode;
}

/**
 * Mode-specific bubble color schemes
 */
const modeBubbleStyles: Record<AppMode, {
  bubble: string;
  border: string;
  iconTint: string;
  headerBg: string;
  headerText: string;
  title: string;
  subtitle: string;
}> = {
  general: {
    bubble: 'bg-white/10',
    border: 'border-white/15',
    iconTint: 'text-white/70',
    headerBg: 'bg-primary',
    headerText: 'text-primary-foreground',
    title: '☀️ Weather Assistant',
    subtitle: 'Your friendly weather guide',
  },
  farmer: {
    bubble: 'bg-emerald-500/15',
    border: 'border-emerald-400/25',
    iconTint: 'text-emerald-400',
    headerBg: 'bg-farmer',
    headerText: 'text-primary-foreground',
    title: '🌾 Farmer Assistant',
    subtitle: 'Agricultural weather advice',
  },
  activity: {
    bubble: 'bg-sky-500/15',
    border: 'border-sky-400/25',
    iconTint: 'text-sky-400',
    headerBg: 'bg-activity',
    headerText: 'text-secondary-foreground',
    title: '🌍 Activity Advisor',
    subtitle: 'Daily activity recommendations',
  },
};

/**
 * Chat-style weather assistant that displays advice messages
 */
export function ChatAssistant({ messages, mode }: ChatAssistantProps) {
  const styles = modeBubbleStyles[mode];

  return (
    <div className="glass-card rounded-[2.5rem] overflow-hidden animate-slide-up border border-white/20">
      {/* Chat Header */}
      <div className={`${styles.headerBg} ${styles.headerText} px-5 py-4`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{styles.title}</h3>
            <p className="text-sm opacity-90">{styles.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Loading weather advice...</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatBubble 
              key={message.id} 
              message={message} 
              mode={mode}
              delay={index * 100}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface ChatBubbleProps {
  message: ChatMessage;
  mode: AppMode;
  delay: number;
}

/**
 * Individual chat bubble — styled per mode
 */
function ChatBubble({ message, mode, delay }: ChatBubbleProps) {
  const modeStyle = modeBubbleStyles[mode];

  // Type-specific icon (independent of mode)
  const getIcon = () => {
    switch (message.type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'tip':
        return <Lightbulb className="w-4 h-4 text-yellow-400" />;
      case 'greeting':
        return <Sparkles className={`w-4 h-4 ${modeStyle.iconTint}`} />;
      default:
        return <MessageCircle className={`w-4 h-4 ${modeStyle.iconTint}`} />;
    }
  };

  // Warning messages keep their own distinct bg, others use mode style
  const getBubbleBg = () => {
    if (message.type === 'warning') {
      return 'bg-red-500/10 border-red-400/20';
    }
    return `${modeStyle.bubble} ${modeStyle.border}`;
  };

  return (
    <div 
      className="animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`
        flex gap-3 p-5 rounded-[2rem] rounded-tl-xl border backdrop-blur-md
        transition-colors duration-300
        ${getBubbleBg()}
      `}>
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <p className="text-sm leading-relaxed text-foreground">
          {message.content}
        </p>
      </div>
    </div>
  );
}

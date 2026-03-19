import { WeatherData } from '@/types/weather';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

interface AiAnalysisBannerProps {
  weather: WeatherData;
}

type AnalysisLevel = 'safe' | 'caution' | 'danger';

interface Analysis {
  level: AnalysisLevel;
  title: string;
  description: string;
}

/**
 * AI-style weather analysis banner
 * Evaluates current conditions and shows a verdict
 */
function analyzeWeather(weather: WeatherData): Analysis {
  const { temperature, condition, windSpeed, rainProbability, humidity } = weather;

  // Danger conditions
  if (condition === 'stormy') {
    return {
      level: 'danger',
      title: 'Stay Indoors',
      description: 'Storm activity detected. Avoid outdoor activities and stay safe.',
    };
  }
  if (temperature > 45) {
    return {
      level: 'danger',
      title: 'Extreme Heat Alert',
      description: 'Dangerously high temperatures. Stay indoors and hydrate constantly.',
    };
  }
  if (temperature < -5) {
    return {
      level: 'danger',
      title: 'Extreme Cold Alert',
      description: 'Dangerously low temperatures. Avoid prolonged exposure outdoors.',
    };
  }
  if (windSpeed > 50) {
    return {
      level: 'danger',
      title: 'High Wind Warning',
      description: 'Strong winds may cause hazards. Secure loose objects and stay indoors.',
    };
  }

  // Caution conditions
  if (rainProbability > 60) {
    return {
      level: 'caution',
      title: 'Rain Expected',
      description: 'Carry an umbrella and plan indoor alternatives. Roads may be slippery.',
    };
  }
  if (temperature > 38) {
    return {
      level: 'caution',
      title: 'Heat Advisory',
      description: 'Very hot conditions. Limit outdoor activity to mornings and evenings.',
    };
  }
  if (condition === 'foggy') {
    return {
      level: 'caution',
      title: 'Low Visibility',
      description: 'Foggy conditions reduce visibility. Drive carefully and use fog lights.',
    };
  }
  if (windSpeed > 30) {
    return {
      level: 'caution',
      title: 'Windy Conditions',
      description: 'Moderate to strong winds. Secure light items and be cautious outdoors.',
    };
  }
  if (humidity > 85 && temperature > 30) {
    return {
      level: 'caution',
      title: 'High Humidity',
      description: 'Hot and humid. Stay hydrated and take breaks in cool areas.',
    };
  }

  // Safe conditions
  if (condition === 'sunny' && temperature >= 18 && temperature <= 30) {
    return {
      level: 'safe',
      title: 'Perfect Day Out',
      description: 'Ideal weather for outdoor activities. Make the most of it!',
    };
  }

  return {
    level: 'safe',
    title: 'Safe to Go Out',
    description: 'Great conditions for outdoor activities. Enjoy your day!',
  };
}

const levelConfig = {
  safe: {
    bg: 'bg-emerald-500/15 border-emerald-400/30',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
    titleColor: 'text-emerald-300',
    labelColor: 'text-emerald-400/70',
    Icon: ShieldCheck,
  },
  caution: {
    bg: 'bg-amber-500/15 border-amber-400/30',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
    titleColor: 'text-amber-300',
    labelColor: 'text-amber-400/70',
    Icon: AlertTriangle,
  },
  danger: {
    bg: 'bg-red-500/15 border-red-400/30',
    iconBg: 'bg-red-500/20',
    iconColor: 'text-red-400',
    titleColor: 'text-red-300',
    labelColor: 'text-red-400/70',
    Icon: ShieldAlert,
  },
};

export function AiAnalysisBanner({ weather }: AiAnalysisBannerProps) {
  const analysis = analyzeWeather(weather);
  const config = levelConfig[analysis.level];
  const { Icon } = config;

  return (
    <div
      className={`
        flex items-start gap-4 px-5 py-4 rounded-2xl border backdrop-blur-md
        animate-slide-up ${config.bg}
      `}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className={`font-bold text-[15px] ${config.titleColor}`}>
            {analysis.title}
          </h3>
          <span className={`text-[11px] font-medium ${config.labelColor} flex items-center gap-1`}>
            ✦ AI Analysis
          </span>
        </div>
        <p className="text-sm text-white/70 mt-0.5 leading-relaxed">
          {analysis.description}
        </p>
      </div>
    </div>
  );
}

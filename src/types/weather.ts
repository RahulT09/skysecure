// Weather data types for the application

export interface WeatherData {
  location: string;
  temperature: number;
  condition: WeatherCondition;
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  feelsLike: number;
  description: string;
  timezoneOffset?: number; // Timezone offset in seconds from UTC
  sunrise?: number; // Sunrise time (Unix timestamp)
  sunset?: number; // Sunset time (Unix timestamp)
  forecast?: ForecastDay[]; // 7-day forecast
}

export interface ForecastDay {
  date: Date;
  maxTemp: number;
  minTemp: number;
  condition: WeatherCondition;
  rainProbability?: number;
}

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'windy' | 'foggy' | 'snowy';

export type AppMode = 'general' | 'farmer' | 'activity';

export interface ChatMessage {
  id: string;
  content: string;
  type: 'greeting' | 'advice' | 'warning' | 'tip' | 'user' | 'guide';
  timestamp: Date;
  author?: string;
}

// Travel assistant types
export interface LocalTip {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
  category: 'travel' | 'food' | 'safety' | 'weather' | 'general';
  likes: number;
}

export interface TravelAdvice {
  weather: string[];
  travel: string[];
  safety: string[];
  localTips: string[];
  bestTimes: string[];
}

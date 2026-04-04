# ☁️ SkySecure — Smart Weather Assistant

A premium, AI-powered weather companion built with React & TypeScript. Get real-time weather data, intelligent condition analysis, and personalized advice tailored to your needs — whether you're a farmer, traveler, or just planning your day.   

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.0_Flash-4285F4?logo=google&logoColor=white)
 
---  
  
## ✨ Features
  
### 🌦️ Real-Time Weather
- Live weather data via **OpenWeatherMap API**
- Auto-detects user location via geolocation
- Search any city worldwide
- 7-day forecast with daily highs/lows

### 🤖 AI-Powered Analysis
- **AI Analysis Banner** — Instant safety verdict (Safe / Caution / Stay Indoors) based on current conditions
- **Floating AI Chat** — Ask weather-related questions powered by **Google Gemini 2.0 Flash**
- **Local Guide Chat** — Get location-specific travel and safety tips

### 🎛️ Smart Mode Toggle
Three advice modes with **mode-specific message styling**:
| Mode | Purpose | Bubble Style |
|------|---------|-------------|
| 👤 **General** | Everyday weather tips | Neutral glass |
| 🌾 **Farmer** | Agricultural advice | Green-tinted |
| 🌍 **Activities** | Outdoor planning | Blue-tinted |

### 🎨 Dynamic UI
- **Weather-reactive backgrounds** — Gradient changes for sunny, rainy, cloudy, stormy, snowy, foggy conditions
- **Day/Night themes** — Automatic based on location's timezone
- **Weather particles** — Rain, snow, clouds, lightning, stars, shooting stars
- **Glassmorphism design** — Modern frosted-glass cards
- **Smooth animations** — Slide-up, fade-in, floating effects
- **Fully responsive** — Works on mobile, tablet, and desktop

### 📊 Extra Widgets
- Sun timeline (sunrise/sunset arc)
- UV Index & humidity metrics
- Wind speed, visibility, driving difficulty
- Feels-like temperature

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/RahulT09/skysecure.git

# Navigate to the project
cd skysecure

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Environment Setup

The app uses **OpenWeatherMap API** for weather data. Weather data is fetched via a backend proxy. If the API is unavailable, the app gracefully falls back to mock data.

For the **AI Chat** feature, a Google Gemini API key is needed. You can set it directly in the floating chat widget.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite 5 |
| **Styling** | Tailwind CSS 3 + custom CSS |
| **UI Components** | shadcn/ui + Radix UI |
| **AI** | Google Gemini 2.0 Flash |
| **Weather API** | OpenWeatherMap |
| **State** | React Query + React Hooks |
| **Routing** | React Router v6 |
| **Icons** | Lucide React |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── AiAnalysisBanner.tsx    # AI weather safety verdict
│   ├── ChatAssistant.tsx       # Mode-based advice messages
│   ├── FloatingAiChat.tsx      # Gemini AI chat widget
│   ├── LocalGuideChat.tsx      # Location-specific guide
│   ├── ModeToggle.tsx          # General/Farmer/Activity toggle
│   ├── WeatherCard.tsx         # Main temperature display
│   ├── WeatherParticles.tsx    # Animated weather effects
│   ├── WeeklyForecast.tsx      # 7-day forecast
│   ├── SunTimeline.tsx         # Sunrise/sunset arc
│   ├── SunUvMetrics.tsx        # UV & humidity widgets
│   ├── ExtraMetrics.tsx        # Wind, visibility, etc.
│   └── ui/                     # shadcn/ui components
├── pages/
│   └── Index.tsx               # Main app page
├── utils/
│   ├── weatherApi.ts           # API integration
│   ├── weatherAdvice.ts        # Mode-based advice logic
│   ├── weatherBackground.ts    # Dynamic theme engine
│   └── mockWeather.ts          # Fallback mock data
└── types/
    └── weather.ts              # TypeScript interfaces
```

---

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |

---

## 👨‍💻 Author

**Rahul T** — [@RahulT09](https://github.com/RahulT09)

---

## 📄 License

This project is for educational purposes.

---

> Made with ❤️ for travelers, farmers, and everyone who checks the weather.

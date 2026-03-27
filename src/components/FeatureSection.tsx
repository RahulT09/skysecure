/**
 * FeatureSection Component — Modern card-based feature navigation
 *
 * Replaces the stacked buttons with a premium-feeling grid of feature cards.
 * Each card has: icon, title, description, gradient accent, and hover animation.
 * The "Explore" card is visually highlighted as the primary feature.
 *
 * Design:
 *  - Glassmorphism cards with gradient accents
 *  - Hover: scale up + glow shadow
 *  - Fully responsive: 1 col mobile → 3 col desktop
 *  - Dark theme consistent with the rest of the app
 */
import { useNavigate } from 'react-router-dom';
import { Sprout, Compass, MapPin, Sparkles } from 'lucide-react';

interface FeatureSectionProps {
  /** Called when "Local Guide" card is clicked (opens modal, not a route) */
  onLocalGuideClick: () => void;
}

// ─── Feature card data ───
const features = [
  {
    id: 'farmer',
    title: 'Farmer Mode',
    description: 'Crop suggestions, soil data & market prices',
    icon: Sprout,
    emoji: '',
    route: '/farmer',
    // Gradient accent colors
    gradient: 'from-emerald-500/30 to-green-600/10',
    border: 'border-emerald-400/30',
    hoverBorder: 'hover:border-emerald-400/60',
    glow: 'hover:shadow-emerald-500/20',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-300',
    accentDot: 'bg-emerald-400',
  },
  {
    id: 'explore',
    title: 'Explore Nearby',
    description: 'Tourist spots, hotels, transport & maps',
    icon: Compass,
    emoji: '',
    route: '/explore?city=mumbai&lat=19.076&lon=72.8777',
    gradient: 'from-cyan-500/30 to-blue-600/10',
    border: 'border-cyan-400/30',
    hoverBorder: 'hover:border-cyan-400/60',
    glow: 'hover:shadow-cyan-500/20',
    iconBg: 'bg-cyan-500/20',
    iconColor: 'text-cyan-300',
    accentDot: 'bg-cyan-400',
    featured: true, // visually highlighted
  },
  {
    id: 'guide',
    title: 'Local Guide',
    description: 'Chat with an AI-powered local expert',
    icon: MapPin,
    emoji: '📍',
    route: null, // handled via callback
    gradient: 'from-violet-500/30 to-purple-600/10',
    border: 'border-violet-400/30',
    hoverBorder: 'hover:border-violet-400/60',
    glow: 'hover:shadow-violet-500/20',
    iconBg: 'bg-violet-500/20',
    iconColor: 'text-violet-300',
    accentDot: 'bg-violet-400',
  },
];

export function FeatureSection({ onLocalGuideClick }: FeatureSectionProps) {
  const navigate = useNavigate();

  const handleClick = (feature: typeof features[0]) => {
    if (feature.route) {
      navigate(feature.route);
    } else {
      onLocalGuideClick();
    }
  };

  return (
    <section className="mt-6 animate-slide-up">
      {/* ─── Section Heading ─── */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
          <Sparkles className="w-4 h-4 text-white/70" />
        </div>
        <div>
          <h2 className="text-[17px] font-bold text-white tracking-tight leading-tight">
            Smart Features
          </h2>
          <p className="text-[11px] text-white/40 font-medium">Choose your experience</p>
        </div>
      </div>

      {/* ─── Feature Cards Grid ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <button
              key={feature.id}
              onClick={() => handleClick(feature)}
              className={`
                group relative overflow-hidden text-left
                rounded-2xl p-4 sm:p-5
                bg-gradient-to-br ${feature.gradient}
                backdrop-blur-xl
                border ${feature.border} ${feature.hoverBorder}
                shadow-lg ${feature.glow}
                hover:shadow-2xl hover:scale-[1.03]
                active:scale-[0.98]
                transition-all duration-300 ease-out
                ${feature.featured ? 'ring-1 ring-cyan-400/20' : ''}
              `}
            >
              {/* Featured badge */}
              {feature.featured && (
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full
                                 bg-cyan-400/20 border border-cyan-400/30
                                 text-[9px] font-bold text-cyan-300 uppercase tracking-wider">
                  Popular
                </span>
              )}

              {/* Animated background glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl
                                 ${feature.iconBg} opacity-40`} />
              </div>

              {/* Icon */}
              <div className={`relative w-11 h-11 rounded-xl ${feature.iconBg} 
                              flex items-center justify-center mb-3
                              group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-5 h-5 ${feature.iconColor}`} />
              </div>

              {/* Text */}
              <div className="relative">
                <h3 className="text-[15px] font-bold text-white flex items-center gap-1.5 leading-tight">
                  <span>{feature.emoji}</span>
                  {feature.title}
                </h3>
                <p className="text-[11px] text-white/45 mt-1.5 leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>

              {/* Bottom accent line */}
              <div className={`absolute bottom-0 left-0 right-0 h-[2px] ${feature.accentDot}
                              opacity-0 group-hover:opacity-60 transition-opacity duration-300`} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

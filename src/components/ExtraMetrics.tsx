import { Activity, Car, HeartPulse, Wind } from "lucide-react";

export function ExtraMetrics() {
  return (
    <div className="glass-card rounded-[2.5rem] p-6 animate-slide-up w-full shadow-xl mt-4">
      <div className="flex flex-col gap-5">
        {/* Metric Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-white opacity-90">
              <Wind className="w-6 h-6" />
            </div>
            <span className="text-[17px] font-medium tracking-wide">
              Pollen
            </span>
          </div>
          <span className="text-[17px] font-medium opacity-80">Low</span>
        </div>

        {/* Metric Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-white opacity-90">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-[17px] font-medium tracking-wide">AQI</span>
          </div>
          <span className="text-[17px] font-medium opacity-80">
            <span className="text-[17px] font-medium opacity-80">
              {Math.floor(Math.random() * (120 - 70 + 1)) + 70}
            </span>
          </span>
        </div>

        {/* Metric Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-white opacity-90">
              <HeartPulse className="w-6 h-6" />
            </div>
            <span className="text-[17px] font-medium tracking-wide">
              Running
            </span>
          </div>
          <span className="text-[17px] font-medium opacity-80">
            Poor {Math.floor(Math.random() * (120 - 70 + 1)) + 70}
          </span>
        </div>

        {/* Metric Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-white opacity-90">
              <Car className="w-6 h-6" />
            </div>
            <span className="text-[17px] font-medium tracking-wide">
              Driving difficulty
            </span>
          </div>
          <span className="text-[17px] font-medium opacity-80">None</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/20 text-[13px] opacity-70">
        <span className="font-medium flex items-center gap-1.5">
          <span className="w-4 h-4 bg-white text-[#1a1a1a] text-[9px] font-bold flex items-center justify-center rounded-sm">
            The
          </span>
          The Weather Channel
        </span>
        <span>
          Updated {new Date().toLocaleDateString()}{" "} //v
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}

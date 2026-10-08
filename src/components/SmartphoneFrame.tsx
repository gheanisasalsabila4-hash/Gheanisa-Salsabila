import React from 'react';
import { Wifi, Battery, Signal, Smartphone } from 'lucide-react';

interface SmartphoneFrameProps {
  children: React.ReactNode;
  currentTimeStr: string;
}

export const SmartphoneFrame: React.FC<SmartphoneFrameProps> = ({ children, currentTimeStr }) => {
  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="text-center mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-xs font-semibold">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Simulasi Tampilan Smartphone (Fast Responsive PWA Ready)</span>
        </span>
      </div>

      {/* Realistic Mobile Device Container */}
      <div className="relative w-full max-w-[400px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-700/50">
        {/* Screen Bezel & Dynamic Island / Notch */}
        <div className="relative bg-slate-100 rounded-[36px] overflow-hidden min-h-[740px] flex flex-col border border-slate-900/40">
          {/* Mobile Status Bar */}
          <div className="bg-slate-900 text-white px-6 pt-3 pb-2 flex items-center justify-between text-xs select-none">
            <span className="font-semibold font-mono text-[11px] tracking-tight">
              {currentTimeStr}
            </span>

            {/* Simulated Speaker / Camera Island */}
            <div className="w-20 h-4 bg-black rounded-full mx-auto" />

            <div className="flex items-center gap-1.5 text-[10px]">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

          {/* Mobile Content Viewport with Native Scroll */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {children}
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="bg-slate-900/90 py-2 flex justify-center">
            <div className="w-32 h-1 bg-white/40 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

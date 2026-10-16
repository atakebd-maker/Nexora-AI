import React from 'react';
import { Megaphone } from 'lucide-react';

interface AdBannerProps {
  placement?: 'header' | 'inline' | 'footer' | 'sidebar';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ placement = 'inline', className = '' }) => {
  return (
    <div
      className={`relative rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-3 text-center my-4 transition-all ${className}`}
      aria-label="Advertisement Placement"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-3xl mx-auto px-2">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Megaphone className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span>Sponsored Placement Space</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-400">Google AdSense / Custom Partner Ready</span>
        </div>
        <div className="text-[11px] text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded font-mono">
          {placement === 'header' ? 'Responsive Banner (728×90)' : 'Responsive Ad Slot'}
        </div>
      </div>
    </div>
  );
};

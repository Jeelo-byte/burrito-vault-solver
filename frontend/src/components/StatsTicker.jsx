import React from 'react';
import { Activity, Users, RotateCcw, Box } from 'lucide-react';

export function StatsTicker({ stats }) {
  if (!stats) return null;

  return (
    <div className="bg-slate-950/80 border-b border-slate-900/80 w-full overflow-hidden text-slate-300 relative z-50">
      <div className="flex animate-marquee whitespace-nowrap py-1.5 items-center">
        <div className="flex gap-12 font-semibold text-[10px] tracking-widest uppercase">
          <span className="flex items-center gap-2 text-emerald-400">
            <Activity className="w-3 h-3" /> Global Vault Intel
          </span>
          <span className="flex items-center gap-1.5 min-w-max">
            <Box className="w-3 h-3 text-cyan-400" /> Items Submitted: <span className="text-white">{stats.itemsEntered}</span>
          </span>
          <span className="flex items-center gap-1.5 min-w-max">
            <Users className="w-3 h-3 text-amber-400" /> Peak Simultaneous Users: <span className="text-white">{stats.peakUsers}</span>
          </span>
          <span className="flex items-center gap-1.5 min-w-max">
            <RotateCcw className="w-3 h-3 text-red-400" /> Complete Resets: <span className="text-white">{stats.resets}</span>
          </span>
          
          {/* Duplicate for seamless infinite scroll */}
          <span className="flex items-center gap-2 text-emerald-400 pl-12">
            <Activity className="w-3 h-3" /> Global Vault Intel
          </span>
          <span className="flex items-center gap-1.5 min-w-max">
            <Box className="w-3 h-3 text-cyan-400" /> Items Submitted: <span className="text-white">{stats.itemsEntered}</span>
          </span>
          <span className="flex items-center gap-1.5 min-w-max">
            <Users className="w-3 h-3 text-amber-400" /> Peak Simultaneous Users: <span className="text-white">{stats.peakUsers}</span>
          </span>
          <span className="flex items-center gap-1.5 min-w-max">
            <RotateCcw className="w-3 h-3 text-red-400" /> Complete Resets: <span className="text-white">{stats.resets}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

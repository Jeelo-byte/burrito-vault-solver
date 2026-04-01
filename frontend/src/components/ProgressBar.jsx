import React from 'react';

export function ProgressBar({ remaining, total }) {
  if (total === 0) return null;
  const progress = Math.max(0, Math.min(100, ((total - remaining) / total) * 100));
  
  return (
    <div className="w-full mt-4 mb-8">
      <div className="flex justify-between text-sm text-slate-400 mb-2 font-medium">
        <span>Solution Space Solved</span>
        <span>{remaining.toLocaleString()} / {total.toLocaleString()} combinations remain</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden shadow-inner border border-slate-700">
        <div 
          className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
          style={{ width: `${progress}%` }} 
        />
      </div>
    </div>
  );
}

import React from 'react';
import { History, X } from 'lucide-react';

export function HistoryModal({ isOpen, onClose, log }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-full p-2 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 mb-6 relative z-10 shrink-0">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2.5 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <History className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Action Log</h2>
        </div>

        <div className="overflow-y-auto custom-scrollbar pr-2 flex-grow space-y-3 pb-2 z-10">
          {(!log || log.length === 0) ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No recent actions recorded.
            </div>
          ) : (
            [...log].reverse().map((entry) => (
              <div key={entry.id} className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-400">
                    EVENT #{entry.id}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {entry.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

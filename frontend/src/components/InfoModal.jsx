import React from 'react';
import { X, ExternalLink, Info } from 'lucide-react';

export function InfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="relative p-6 md:p-8">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
              <Info className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">How This Works</h2>
          </div>
          
          <div className="space-y-4 text-slate-300 text-sm md:text-base leading-relaxed mb-8">
            <p>
              Welcome to the <strong className="text-emerald-400 font-semibold">Collaborative Burrito Vault Solver</strong>!
            </p>
            <p>
              This tool helps us work together to crack the Chipotle Burrito Vault game without duplicating guesses.
            </p>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 mt-4">
              <h3 className="text-white font-semibold mb-2 flex flex-col">Instructions:</h3>
              <ul className="list-decimal pl-5 space-y-2 text-slate-400 text-sm">
                <li>Click <strong className="text-slate-200">Request New Assignment</strong> to get a unique block of combinations to try.</li>
                <li>Go to the game website and enter your assigned guesses in order.</li>
                <li>If the game eliminates any ingredients, select them here and click <strong className="text-emerald-400">Submit Result</strong> to globally cross them off for everyone.</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a 
              href="https://unlockburritoday.com/game" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-[0.98]"
            >
              Play the Game <ExternalLink className="w-4 h-4" />
            </a>
            <button 
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl transition-all border border-slate-700 active:scale-[0.98]"
            >
              Got it, let's solve!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

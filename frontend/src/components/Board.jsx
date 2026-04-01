import React from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export function Board({ state, voteState }) {
  if (!state) return null;
  
  const { categories, confirmed, incorrect, partial } = state;
  
  const confirmedList = Object.entries(confirmed).filter(([cat, items]) => items && items.length > 0);

  return (
    <div className="space-y-4">
      {/* Confirmed Options Banner */}
      {confirmedList.length > 0 && (
        <div className="bg-emerald-950/40 border border-emerald-900/50 rounded-xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
             <CheckCircle2 className="w-24 h-24 text-emerald-500" />
           </div>
           <h3 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10">
             <CheckCircle2 className="w-4 h-4" /> Locked Vault Settings
           </h3>
           <div className="flex flex-wrap gap-2 relative z-10">
             {confirmedList.map(([cat, items]) => (
               <div key={cat} className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                 <span className="text-[10px] text-slate-400 uppercase tracking-wider">{cat}:</span>
                 <span className="text-sm font-bold text-emerald-300">{items.join(', ')}</span>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 md:p-5 shadow-2xl border border-slate-800">
        <h2 className="text-lg font-bold text-white mb-4 tracking-tight flex items-center">
          <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-transparent bg-clip-text">Central Vault Grid</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
          {Object.entries(categories).map(([catId, items]) => {
            const confirmedItems = confirmed[catId] || [];
            const isCategoryConfirmed = confirmedItems.length > 0;
            const incorrectItems = incorrect[catId] || [];
            const partialItems = partial[catId] || [];
            
            return (
              <div key={catId} className="bg-slate-800/80 rounded-lg p-3 shadow-inner border border-slate-700/50 flex flex-col max-h-64">
                <h3 className="text-[10px] tracking-wider font-bold text-slate-400 uppercase mb-2 pb-1.5 border-b border-slate-700 flex justify-between items-center shrink-0">
                  {catId} 
                  <span className="text-slate-500 text-[9px]">{items.length} options</span>
                </h3>
                
                <ul className="flex flex-wrap gap-1.5 overflow-y-auto pr-1 pb-1 custom-scrollbar w-full">
                  {items.map(item => {
                    let statusStyles = "text-slate-400 bg-slate-900/40 border-slate-800";
                    let Icon = null;
                    
                    const isConfirmed = confirmedItems.includes(item);
                    const isIncorrect = incorrectItems.includes(item);
                    const isPartial = partialItems.includes(item);

                    if (isConfirmed) {
                      statusStyles = "text-emerald-100 bg-emerald-900/60 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.2)]";
                      Icon = CheckCircle2;
                    } else if (isIncorrect) {
                      statusStyles = "text-red-400 bg-red-950/20 opacity-40 border-red-900/30 line-through";
                      Icon = XCircle;
                    } else if (isPartial) {
                      statusStyles = "text-amber-200 bg-amber-900/40 border-amber-500/50";
                      Icon = AlertCircle;
                    }

                    const vState = voteState?.[catId]?.[item] || { Correct: 0, Partial: 0, Wrong: 0 };
                    const totalVotes = vState.Correct + vState.Partial + vState.Wrong;
                    const pctCorrect = totalVotes > 0 ? (vState.Correct / totalVotes) * 100 : 0;
                    const pctPartial = totalVotes > 0 ? (vState.Partial / totalVotes) * 100 : 0;
                    const pctWrong = totalVotes > 0 ? (vState.Wrong / totalVotes) * 100 : 0;
                    
                    const tooltipText = totalVotes > 0 
                      ? `${totalVotes} Vote${totalVotes > 1 ? 's' : ''} | Correct: ${pctCorrect.toFixed(0)}% | Partial: ${pctPartial.toFixed(0)}% | Wrong: ${pctWrong.toFixed(0)}%`
                      : "No pending votes";

                    return (
                      <li 
                        key={item} 
                        className={`px-2 py-1 rounded text-[11px] border flex items-center gap-1 transition-all relative overflow-hidden cursor-help ${statusStyles}`}
                        title={tooltipText}
                      >
                        <span className="font-medium whitespace-nowrap relative z-10">{item}</span>
                        {Icon && <Icon className={`w-3 h-3 relative z-10 ${isConfirmed ? 'text-emerald-400' : isIncorrect ? 'text-red-900' : 'text-amber-400'}`} />}
                        
                        {totalVotes > 0 && !isConfirmed && !isIncorrect && !isPartial && (
                          <div className="absolute bottom-0 left-0 right-0 flex h-[3px] opacity-80">
                            {pctCorrect > 0 && <div className="bg-emerald-500 h-full" style={{ width: `${pctCorrect}%` }} />}
                            {pctPartial > 0 && <div className="bg-amber-500 h-full" style={{ width: `${pctPartial}%` }} />}
                            {pctWrong > 0 && <div className="bg-red-500 h-full" style={{ width: `${pctWrong}%` }} />}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

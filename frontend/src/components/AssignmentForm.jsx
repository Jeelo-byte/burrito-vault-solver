import React, { useState, useEffect } from 'react';
import { Send, Crosshair } from 'lucide-react';

export function AssignmentForm({ assignment, requestAssignment, submitResult, isConnected, vaultState }) {
  const [results, setResults] = useState({});

  useEffect(() => {
    if (assignment) {
      const initial = {};
      Object.entries(assignment).forEach(([cat, items]) => {
        initial[cat] = {};
        if (items) {
          const uniqueItems = [...new Set(items)];
          uniqueItems.forEach(item => {
            if (vaultState?.confirmed?.[cat]?.includes(item)) {
              initial[cat][item] = 'Correct';
            } else if (vaultState?.incorrect?.[cat]?.includes(item)) {
              initial[cat][item] = 'Wrong';
            } else if (vaultState?.partial?.[cat]?.includes(item)) {
              initial[cat][item] = 'Partial';
            } else {
              initial[cat][item] = 'Pending';
            }
          });
        }
      });
      setResults(initial);
    }
  }, [assignment, vaultState]);

  if (!isConnected) {
    return (
      <div className="bg-slate-900/80 rounded-xl p-6 border border-slate-800 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin w-8 h-8 rounded-full border-t-2 border-b-2 border-emerald-500 mb-4"></div>
        <p className="text-slate-400 text-sm font-medium tracking-wide">Connecting...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700/50 text-center shadow-xl">
        <div className="bg-slate-950/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-slate-800 shadow-inner">
          <Crosshair className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Ready for Assignment</h3>
        <p className="text-slate-400 mb-6 max-w-sm mx-auto text-xs leading-relaxed">
          Request a unique combination to test that no one else is currently trying.
        </p>
        <button 
          onClick={requestAssignment}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold py-3 px-6 rounded-lg w-full transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-[0.98]"
        >
          Request Target
        </button>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    submitResult(assignment, results, true);
  };

  const setCatResult = (cat, item, status) => {
    let newResults;
    setResults(prev => {
      const nextCat = { ...prev[cat], [item]: status };
      
      newResults = {
        ...prev,
        [cat]: nextCat
      };
      return newResults;
    });

    // Timeout ensures React state has updated synchronously if needed, but we pass newResults directly
    setTimeout(() => {
       submitResult(assignment, newResults, false);
    }, 0);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 md:p-5 border border-slate-700/50 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-bold text-white flex-grow">Current Assignment</h3>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">Active</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col gap-2.5">
          {Object.entries(assignment).map(([cat, items]) => {
            if (!items || items.length === 0) return null;
            
            const itemCounts = {};
            items.forEach(i => itemCounts[i] = (itemCounts[i] || 0) + 1);

            return (
              <div key={cat} className="bg-slate-950/40 p-2 md:p-3 rounded-lg border border-slate-800 flex flex-col gap-2">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none bg-slate-900 self-start px-2 py-1 rounded inline-block">{cat}</div>
                
                {Object.entries(itemCounts).map(([item, count]) => {
                  const currentStatus = results[cat]?.[item] || 'Pending';
                  const displayName = count > 1 ? `${count}x ${item}` : item;
                  
                  return (
                    <div key={item} className="flex flex-col xl:flex-row justify-between xl:items-center gap-2 border-t border-slate-900/50 pt-2 first:border-0 first:pt-0">
                      <div className="text-sm font-medium text-white leading-tight break-words flex-1 min-w-0 pr-2">{displayName}</div>
                      
                      <div className="flex shrink-0 space-x-1 bg-slate-900 p-0.5 rounded-md self-start xl:self-auto w-full xl:w-auto">
                        {(cat === 'entree' ? ['Wrong', 'Correct'] : ['Wrong', 'Partial', 'Correct']).map(status => {
                          let btnClass = "px-1.5 sm:px-2 py-1 text-[10px] font-bold rounded transition-all flex-1 text-center ";
                          
                          if (currentStatus === status) {
                            if (status === 'Correct') btnClass += "bg-emerald-500 text-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.3)]";
                            else if (status === 'Wrong') btnClass += "bg-red-500 text-slate-950 shadow-[0_0_8px_rgba(239,68,68,0.3)]";
                            else if (status === 'Partial') btnClass += "bg-amber-500 text-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.3)]";
                          } else {
                            btnClass += "text-slate-400 bg-slate-800/50 hover:bg-slate-700";
                          }
                          
                          return (
                            <button
                              key={status}
                              type="button"
                              onClick={() => setCatResult(cat, item, status)}
                              className={btnClass}
                            >
                              {status}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        <div className="pt-2">
          <button 
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold py-3 rounded-lg transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Send className="w-4 h-4" />
            Finish & Request New Target
          </button>
        </div>
      </form>
    </div>
  );
}

import React, { useState } from 'react';
import { PenTool, Undo, X, AlertTriangle } from 'lucide-react';

export function ManualOverrideForm({ vaultState, submitResult }) {
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [didSubmitFeedback, setDidSubmitFeedback] = useState(false);

  if (!vaultState || !vaultState.categories) return null;

  const categories = Object.keys(vaultState.categories);

  const handleCategoryChange = (e) => {
    setSelectedCat(e.target.value);
    setSelectedItem(''); // Reset item when category changes
  };

  const handleItemChange = (e) => {
    setSelectedItem(e.target.value);
  };

  const submitManualResult = (status) => {
    if (!selectedCat || !selectedItem) return;

    submitResult(null, {
      [selectedCat]: {
        [selectedItem]: status
      }
    }, false);

    setDidSubmitFeedback(true);
    setTimeout(() => setDidSubmitFeedback(false), 2000);
    // Optionally reset fields here, but leaving them might be nice for rapid entry
  };

  return (
    <div className="bg-slate-900/60 rounded-xl p-4 md:p-5 border border-slate-700/50 shadow-lg relative overflow-hidden mt-4">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <PenTool className="w-4 h-4 text-amber-500" />
          Intel Override
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-950/80 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">Manual Input</span>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 pl-1">Category</label>
          <select 
            value={selectedCat} 
            onChange={handleCategoryChange}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 appearance-none"
          >
            <option value="" disabled>Select category...</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 pl-1">Ingredient</label>
          <select 
            value={selectedItem} 
            onChange={handleItemChange}
            disabled={!selectedCat}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 disabled:opacity-50 appearance-none"
          >
            <option value="" disabled>Select ingredient...</option>
            {selectedCat && vaultState.categories[selectedCat].map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div className="pt-2">
          <label className="text-xs font-semibold text-slate-400 pl-1 mb-1.5 block">Mark Status As</label>
          <div className="flex gap-2">
             <button
                type="button"
                onClick={() => submitManualResult('Pending')}
                disabled={!selectedCat || !selectedItem}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50 px-2 py-2 rounded-lg transition-all flex items-center justify-center gap-1 border border-slate-700 hover:border-slate-500/50 hover:text-white"
              >
                <Undo className="w-3.5 h-3.5" /> Undo / Clear
              </button>
              <button
                type="button"
                onClick={() => submitManualResult('Partial')}
                disabled={!selectedCat || !selectedItem}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50 px-2 py-2 rounded-lg transition-all flex items-center justify-center gap-1 border border-slate-700 hover:border-amber-500/50 hover:text-amber-400"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Partial
              </button>
              <button
                type="button"
                onClick={() => submitManualResult('Wrong')}
                disabled={!selectedCat || !selectedItem}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50 px-2 py-2 rounded-lg transition-all flex items-center justify-center gap-1 border border-slate-700 hover:border-red-500/50 hover:text-red-400"
              >
                <X className="w-3.5 h-3.5" /> Wrong
              </button>
          </div>
        </div>

        {didSubmitFeedback && (
          <div className="text-[10px] text-emerald-400 text-center font-bold tracking-widest uppercase animate-pulse mt-2">
            State updated successfully
          </div>
        )}
      </div>
    </div>
  );
}

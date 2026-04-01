import React, { useState, useEffect } from 'react';
import { useVaultState } from './hooks/useVaultState';
import { Board } from './components/Board';
import { AssignmentForm } from './components/AssignmentForm';
import { ProgressBar } from './components/ProgressBar';
import { InfoModal } from './components/InfoModal';
import { Users, Shield, RotateCcw, Info } from 'lucide-react';

function App() {
  const { state, connections, assignment, requestAssignment, submitResult, resetVault } = useVaultState();
  const [confirmReset, setConfirmReset] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  useEffect(() => {
    const hasSeenInfo = localStorage.getItem('burrito_vault_info_seen');
    if (!hasSeenInfo) {
      setIsInfoOpen(true);
    }
  }, []);

  const handleCloseInfo = () => {
    localStorage.setItem('burrito_vault_info_seen', 'true');
    setIsInfoOpen(false);
  };

  const handleReset = () => {
    if (confirmReset) {
      resetVault();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-emerald-500/30 text-sm">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[120px] rounded-full mix-blend-screen"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-4 md:py-6">
        <header className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-slate-800/80 pb-3 gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-cyan-500 p-2 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Shield className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white mb-0">
                Burrito Vault <span className="text-emerald-400">Solver</span>
              </h1>
              <p className="text-slate-400 text-[10px] md:text-xs font-medium tracking-wide">Collaborative Optimization Server</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsInfoOpen(true)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shadow-xl"
              title="How this works"
            >
              <Info className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-700/50 backdrop-blur-sm shadow-xl">
              <Users className="w-3 h-3 text-emerald-400" />
              <span className="text-xs font-semibold text-white">{connections}</span>
              <span className="text-xs text-slate-400 hidden sm:inline">Online</span>
            </div>
            {state && (
              <button 
                onClick={handleReset}
                className={`flex items-center gap-1 border px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  confirmReset 
                    ? 'bg-red-600/90 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30'
                }`}
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">{confirmReset ? 'Confirm Reset' : 'Reset'}</span>
              </button>
            )}
          </div>
        </header>

        <main className="space-y-4">
          {state && (
            <ProgressBar 
              remaining={state.remainingCombos} 
              total={state.totalCombos} 
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
            <div className="lg:col-span-5 xl:col-span-4 order-2 lg:order-1 lg:sticky lg:top-4">
              <AssignmentForm 
                assignment={assignment} 
                requestAssignment={requestAssignment} 
                submitResult={submitResult}
                isConnected={!!state} 
              />
            </div>
            
            <div className="lg:col-span-7 xl:col-span-8 order-1 lg:order-2">
              <Board state={state} />
            </div>
          </div>
        </main>
        
        <footer className="mt-12 pt-4 border-t border-slate-800/50 text-center text-slate-500 text-xs">
          <p>Local Network Collaborative Solver — Not affiliated with Chipotle</p>
        </footer>
      </div>

      <InfoModal isOpen={isInfoOpen} onClose={handleCloseInfo} />
    </div>
  );
}

export default App;

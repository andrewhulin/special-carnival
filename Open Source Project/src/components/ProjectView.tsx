import React, { useState, useEffect } from 'react';
import { useAgencyStore } from '../store/agencyStore';
import { RefreshCcw, Play, Sparkles } from 'lucide-react';
import ResetModal from './ResetModal';
import AgentSetPickerModal from './AgentSetPickerModal';
import { useSceneManager } from '../three/SceneContext';
import { abortAllCalls } from '../services/agencyService';

const ProjectView: React.FC = () => {
  const {
    phase,
    actionLog,
    feedbackItems,
    resetProject,
    setPhase,
  } = useAgencyStore();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const scene = useSceneManager();

  // Auto-open persona picker on first load
  useEffect(() => {
    if (phase === 'idle' && actionLog.length === 0) {
      setIsPickerOpen(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const hasLogs = actionLog.length > 0;

  const handleResetConfirm = () => {
    abortAllCalls();
    scene?.resetScene();
    resetProject();
    setIsResetModalOpen(false);
  };

  const handleStartSimulation = () => {
    setPhase('working');
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 bg-white/50">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-black text-zinc-900 leading-tight">Ash Feedback Lab</h2>
          <div className="flex items-center gap-2">
            <div className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
              phase === 'working' ? 'bg-indigo-500 text-white' :
              phase === 'done' ? 'bg-green-500 text-white' :
              'bg-zinc-100 text-zinc-400'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${phase === 'working' ? 'bg-white animate-pulse' : 'bg-white opacity-40'}`} />
              {phase === 'idle' ? 'ready' : phase}
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-zinc-100 w-full mb-6" />

      {/* Start Testing */}
      {phase === 'idle' && (
        <div className="mb-8">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex flex-col items-center gap-4">
            <Sparkles size={32} className="text-indigo-400" />
            <div className="text-center">
              <p className="text-sm font-bold text-zinc-900 mb-1">Ready to explore</p>
              <p className="text-xs text-zinc-500">Three AI personas will explore the Ash app and share their honest feedback.</p>
            </div>
            <button
              onClick={handleStartSimulation}
              className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm w-full"
            >
              <Play size={14} strokeWidth={3} />
              Start Testing
            </button>
          </div>
        </div>
      )}

      {/* Feedback Summary */}
      {feedbackItems.length > 0 && (
        <div className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">
            Feedback Summary
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-zinc-900">{feedbackItems.length}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Total Items</p>
            </div>
            <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-zinc-900">
                {new Set(feedbackItems.map(f => f.screenId)).size}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Screens</p>
            </div>
          </div>
        </div>
      )}

      {/* Done Message */}
      {phase === 'done' && (
        <div className="mb-8">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
            <p className="text-sm font-bold text-emerald-800 mb-1">Exploration Complete!</p>
            <p className="text-xs text-emerald-600">Click on any persona to ask follow-up questions about their experience.</p>
          </div>
        </div>
      )}

      {/* Reset */}
      {hasLogs && (
        <div className="mt-auto flex justify-end">
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100/50 hover:bg-zinc-100 text-zinc-400 hover:text-red-500 rounded-lg transition-all active:scale-95 group border border-transparent hover:border-red-100"
          >
            <RefreshCcw size={12} className="transition-transform group-hover:rotate-180 duration-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">Reset</span>
          </button>
        </div>
      )}

      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetConfirm}
      />

      <AgentSetPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        hasActiveProject={hasLogs}
      />
    </div>
  );
};

export default ProjectView;

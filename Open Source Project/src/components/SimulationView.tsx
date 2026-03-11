import React, { useState } from 'react';
import UIOverlay from './UIOverlay';
import InspectorPanel from './InspectorPanel';
import SimulatorCompanion from './SimulatorCompanion';
import SimulatorStatus from './SimulatorStatus';
import { Play, Pause, Maximize2, Minimize2, Users } from 'lucide-react';
import { useAgencyStore } from '../store/agencyStore';
import { useStore } from '../store/useStore';
import { getAgentSet } from '../data/agents';
import AgentSetPickerModal from './AgentSetPickerModal';

interface SimulationViewProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  isFullscreen: boolean;
  setIsFullscreen: (value: boolean) => void;
}

const SimulationView: React.FC<SimulationViewProps> = ({ canvasRef, isFullscreen, setIsFullscreen }) => {
  const isPaused = useAgencyStore((s) => s.isPaused);
  const setPaused = useAgencyStore((s) => s.setPaused);
  const pauseOnCall = useAgencyStore((s) => s.pauseOnCall);
  const phase = useAgencyStore((s) => s.phase);
  const setPhase = useAgencyStore((s) => s.setPhase);
  const actionLog = useAgencyStore((s) => s.actionLog);
  const selectedNpcIndex = useStore((s) => s.selectedNpcIndex);
  const isPlaying = !isPaused;
  const selectedAgentSetId = useAgencyStore((s) => s.selectedAgentSetId);

  const activeSet = getAgentSet(selectedAgentSetId);
  const agentCount = activeSet.agents.length - 1; // Exclude player
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const hasLogs = actionLog.length > 0;

  const handleStartTesting = () => {
    setPhase('working');
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 min-h-0 relative">
      {/* Simulation View Header */}
      <div className="h-14 border-b border-black/5 flex items-center justify-between px-5 bg-white shrink-0">
        <div className="flex-1 flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-tight">
              {activeSet.companyType}
            </span>
            <span className="text-sm font-black text-zinc-900 leading-tight">
              {activeSet.companyName}
            </span>
          </div>

          <div className="h-6 w-px bg-zinc-100 mx-1" />

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-white px-2 py-0.5 rounded-full uppercase tracking-tighter" style={{ backgroundColor: activeSet.color }}>
              {agentCount} AGENTS
            </span>
            <button
              onClick={() => setIsPickerOpen(true)}
              className="flex items-center gap-1.5 px-2 py-1 bg-zinc-50 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 rounded-md transition-all border border-zinc-100 hover:border-zinc-200 shrink-0"
              title="Change team"
            >
              <Users size={11} />
              <span className="text-[9px] font-black uppercase tracking-widest">Switch</span>
            </button>
          </div>

          <div className="h-6 w-px bg-zinc-100 mx-1" />
          <SimulatorStatus />
        </div>

        {/* Centered Controls */}
        {pauseOnCall && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPaused(false)}
              disabled={isPlaying}
              className={`p-1 border rounded transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-zinc-50 text-zinc-300 border-zinc-100'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              <Play size={14} fill="none" />
            </button>
            <button
              onClick={() => setPaused(true)}
              disabled={!isPlaying}
              className={`p-1 border rounded transition-all cursor-pointer ${
                !isPlaying
                  ? 'bg-zinc-50 text-zinc-300 border-zinc-100'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              <Pause size={14} fill="none" />
            </button>
          </div>
        )}

        <div className="flex-1 flex items-center justify-end gap-1">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Panel"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      <div ref={canvasRef} className="flex-1 min-h-0 relative overflow-hidden bg-black/5">
        {/* Start Testing CTA — shown when idle */}
        {phase === 'idle' && (
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
              <button
                onClick={handleStartTesting}
                className="flex items-center gap-3 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30"
              >
                <Play size={20} strokeWidth={3} fill="white" />
                Start Testing
              </button>
              <p className="text-xs font-medium text-zinc-500 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
                {agentCount} personas will explore the Ash app
              </p>
            </div>
          </div>
        )}

        <SimulatorCompanion />
        <UIOverlay />
        {isFullscreen && selectedNpcIndex !== null && (
          <div className="absolute top-4 right-4 bottom-4 w-96 z-50 pointer-events-none flex flex-col gap-4">
            <InspectorPanel isFloating />
          </div>
        )}
      </div>

      <AgentSetPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        hasActiveProject={hasLogs}
      />
    </div>
  );
};

export default SimulationView;

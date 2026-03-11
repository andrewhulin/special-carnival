import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useAgencyStore } from '../store/agencyStore';
import { Maximize2, KeyRound, Info, Zap, ZapOff, Play } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import InfoModal from './InfoModal';
import BYOKModal from './BYOKModal';
import { version } from '../../package.json';

const Header: React.FC = () => {
  const { llmConfig, isBYOKOpen, setBYOKOpen } = useStore();
  const { pauseOnCall, togglePauseOnCall, isPaused, setPaused } = useAgencyStore();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const hasKey = !!llmConfig.apiKey;

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <header className="h-14 border-b border-zinc-100 flex items-center justify-between px-6 bg-white shrink-0 relative z-40">
      {/* Left: Project Title */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-zinc-900 leading-none tracking-tight">Ash</span>
          <span className="text-lg font-bold text-zinc-900 leading-none tracking-tighter">Feedback Lab</span>
        </div>

       <div className="flex items-center gap-4 self-start mt-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsInfoOpen(true)}
              className="text-zinc-300 hover:text-zinc-500 transition-colors cursor-pointer"
            >
              <Info size={16} strokeWidth={2} />
            </button>
            <span className="text-[11px] font-medium text-zinc-400 font-mono">v{version}</span>
          </div>

        </div>
      </div>

      {/* Right: Global Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={togglePauseOnCall}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
            pauseOnCall
              ? 'bg-amber-50 text-amber-600 border-amber-200'
              : 'bg-zinc-50 text-zinc-400 border-zinc-100 hover:bg-zinc-100 hover:text-zinc-600'
          }`}
          title={pauseOnCall ? "Pause on AI Call: ON" : "Pause on AI Call: OFF"}
        >
          {pauseOnCall ? <Zap size={14} fill="currentColor" /> : <ZapOff size={14} />}
          <span>{pauseOnCall ? 'Debug Mode ON' : 'Debug Mode'}</span>
        </button>

        <div className="w-[1px] h-4 bg-zinc-200 mx-1" />

        <button
          onClick={handleFullscreen}
          className="text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-2"
          title="Fullscreen Browser"
        >
          <Maximize2 size={18} />
        </button>
        <button
          onClick={() => setBYOKOpen(true)}
          className="relative text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-2"
          title="API Key (BYOK)"
        >
          <KeyRound size={18} className={hasKey ? 'text-emerald-500 hover:text-emerald-600' : ''} />
          {hasKey && (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {isInfoOpen && (
          <InfoModal key="info-modal" onClose={() => setIsInfoOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isBYOKOpen && (
          <BYOKModal key="byok-modal" onClose={() => setBYOKOpen(false)} />
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;

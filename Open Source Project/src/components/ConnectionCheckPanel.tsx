import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, Loader2, Play } from 'lucide-react';
import { simulatorService } from '../services/simulatorService';
import { useStore } from '../store/useStore';
import { useAgencyStore } from '../store/agencyStore';

type CheckStatus = 'pending' | 'checking' | 'pass' | 'fail';

interface CheckItem {
  label: string;
  status: CheckStatus;
  detail?: string;
}

interface ConnectionCheckPanelProps {
  onAllPassed?: () => void;
}

const ConnectionCheckPanel: React.FC<ConnectionCheckPanelProps> = ({ onAllPassed }) => {
  const [checks, setChecks] = useState<CheckItem[]>([
    { label: 'API Key', status: 'pending' },
    { label: 'Bridge Server', status: 'pending' },
    { label: 'iOS Simulator', status: 'pending' },
    { label: 'Screenshot Test', status: 'pending' },
  ]);
  const [allPassed, setAllPassed] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const updateCheck = useCallback((index: number, status: CheckStatus, detail?: string) => {
    setChecks(prev => prev.map((c, i) =>
      i === index ? { ...c, status, detail } : c
    ));
  }, []);

  const runChecks = useCallback(async () => {
    setIsRunning(true);
    setAllPassed(false);
    setChecks(prev => prev.map(c => ({ ...c, status: 'pending' as CheckStatus, detail: undefined })));

    // 1. API Key
    updateCheck(0, 'checking');
    await new Promise(r => setTimeout(r, 300));
    const apiKey = useStore.getState().llmConfig.apiKey;
    if (apiKey && apiKey.length > 10) {
      updateCheck(0, 'pass', 'Configured');
    } else {
      updateCheck(0, 'fail', 'No API key set');
      setIsRunning(false);
      return;
    }

    // 2. Bridge Server
    updateCheck(1, 'checking');
    try {
      const status = await simulatorService.getStatus();
      if (status.bridgeOnline) {
        updateCheck(1, 'pass', 'Online');
      } else {
        updateCheck(1, 'fail', 'Not running — run npm run bridge');
        setIsRunning(false);
        return;
      }

      // 3. iOS Simulator
      updateCheck(2, 'checking');
      await new Promise(r => setTimeout(r, 200));
      if (status.running) {
        updateCheck(2, 'pass', status.device || 'Running');
      } else {
        updateCheck(2, 'fail', 'Simulator not booted');
        setIsRunning(false);
        return;
      }
    } catch {
      updateCheck(1, 'fail', 'Connection error');
      setIsRunning(false);
      return;
    }

    // 4. Screenshot Test
    updateCheck(3, 'checking');
    try {
      await simulatorService.screenshot();
      updateCheck(3, 'pass', 'Captured successfully');
    } catch {
      updateCheck(3, 'fail', 'Screenshot failed');
      setIsRunning(false);
      return;
    }

    setAllPassed(true);
    setIsRunning(false);
  }, [updateCheck]);

  useEffect(() => {
    runChecks();
  }, [runChecks]);

  const handleStart = () => {
    useAgencyStore.getState().setPhase('working');
    onAllPassed?.();
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
        Connection Check
      </p>

      <div className="flex flex-col gap-1.5">
        {checks.map((check, i) => (
          <div
            key={i}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all ${
              check.status === 'pass'
                ? 'bg-emerald-50 border-emerald-100'
                : check.status === 'fail'
                ? 'bg-red-50 border-red-100'
                : check.status === 'checking'
                ? 'bg-indigo-50 border-indigo-100'
                : 'bg-zinc-50 border-zinc-100'
            }`}
          >
            <div className="w-4 h-4 flex items-center justify-center shrink-0">
              {check.status === 'pass' && (
                <Check size={14} className="text-emerald-500" strokeWidth={3} />
              )}
              {check.status === 'fail' && (
                <X size={14} className="text-red-500" strokeWidth={3} />
              )}
              {check.status === 'checking' && (
                <Loader2 size={14} className="text-indigo-500 animate-spin" />
              )}
              {check.status === 'pending' && (
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-zinc-700">{check.label}</span>
              {check.detail && (
                <span className={`text-[10px] ml-1.5 ${
                  check.status === 'pass' ? 'text-emerald-500' :
                  check.status === 'fail' ? 'text-red-500' :
                  'text-zinc-400'
                }`}>
                  {check.detail}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {allPassed ? (
        <button
          onClick={handleStart}
          className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm mt-1"
        >
          <Play size={14} strokeWidth={3} />
          Start Exploration
        </button>
      ) : !isRunning && checks.some(c => c.status === 'fail') ? (
        <button
          onClick={runChecks}
          className="flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 active:scale-95 text-zinc-600 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mt-1"
        >
          Retry Checks
        </button>
      ) : null}
    </div>
  );
};

export default ConnectionCheckPanel;

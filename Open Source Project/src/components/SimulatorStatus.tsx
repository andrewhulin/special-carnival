import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Smartphone } from 'lucide-react';
import { simulatorService } from '../services/simulatorService';

const SimulatorStatus: React.FC = () => {
  const [status, setStatus] = useState<{
    bridgeOnline: boolean;
    running: boolean;
    device: string | null;
  }>({ bridgeOnline: false, running: false, device: null });

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      const result = await simulatorService.getStatus();
      if (mounted) setStatus(result);
    };

    check();
    const interval = setInterval(check, 5000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const isConnected = status.bridgeOnline && status.running;

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border transition-colors ${
        isConnected
          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
          : 'bg-red-50 text-red-500 border-red-200'
      }`}
      title={
        isConnected
          ? `Simulator connected: ${status.device || 'Unknown device'}`
          : !status.bridgeOnline
          ? 'Bridge server not running (npm run bridge)'
          : 'Simulator not booted'
      }
    >
      {isConnected ? (
        <>
          <Smartphone size={10} />
          <span>Connected</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </>
      ) : (
        <>
          <WifiOff size={10} />
          <span>{!status.bridgeOnline ? 'Bridge offline' : 'Sim not running'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        </>
      )}
    </div>
  );
};

export default SimulatorStatus;

import React from 'react';
import { X } from 'lucide-react';
import { useAgencyStore } from '../store/agencyStore';
import { getAllNpcAgents, AGENT_SETS, type GlobalAgent } from '../data/agents';

interface CharacterPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CharacterPickerModal: React.FC<CharacterPickerModalProps> = ({ isOpen, onClose }) => {
  const { enabledAgentKeys, toggleAgentKey, phase } = useAgencyStore();
  const allNpcs = getAllNpcAgents();
  const isTestRunning = phase === 'working';

  if (!isOpen) return null;

  // Group agents by set
  const groupedBySet = AGENT_SETS.map(set => ({
    set,
    agents: allNpcs.filter(a => a.setId === set.id),
  }));

  const enabledCount = enabledAgentKeys.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-black text-zinc-900">Choose Personas</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {enabledCount} selected &middot; Toggle characters on or off
              {isTestRunning && <span className="text-amber-500 ml-1">(locked during test)</span>}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <X size={18} className="text-zinc-400" />
          </button>
        </div>

        {/* Active Team Summary */}
        <div className="px-6 py-3 bg-zinc-50 border-b border-zinc-100 shrink-0">
          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">Active Team</p>
          <div className="flex flex-wrap gap-1.5">
            {enabledAgentKeys.length === 0 ? (
              <span className="text-xs text-zinc-400">No personas selected</span>
            ) : (
              allNpcs
                .filter(a => enabledAgentKeys.includes(a.key))
                .map(a => (
                  <span
                    key={a.key}
                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-zinc-200 rounded-full text-[10px] font-bold text-zinc-700"
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: a.color }} />
                    {a.role}
                  </span>
                ))
            )}
          </div>
        </div>

        {/* Agent Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {groupedBySet.map(({ set, agents }) => (
            <div key={set.id} className="mb-6 last:mb-0">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: set.color }}
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  {set.companyName}
                </span>
                <span className="text-[9px] text-zinc-300">&middot;</span>
                <span className="text-[9px] text-zinc-400">{set.companyType}</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {agents.map((agent) => (
                  <AgentCard
                    key={agent.key}
                    agent={agent}
                    isEnabled={enabledAgentKeys.includes(agent.key)}
                    isDisabled={isTestRunning}
                    onToggle={() => toggleAgentKey(agent.key)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-100 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-900 hover:bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

function AgentCard({
  agent,
  isEnabled,
  isDisabled,
  onToggle,
}: {
  agent: GlobalAgent;
  isEnabled: boolean;
  isDisabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
        isEnabled
          ? 'bg-white border-zinc-200 shadow-sm'
          : 'bg-zinc-50 border-zinc-100 opacity-60'
      } ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`}
      onClick={isDisabled ? undefined : onToggle}
    >
      <div
        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-black"
        style={{ backgroundColor: agent.color }}
      >
        {agent.role.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-zinc-900">{agent.role}</span>
          {agent.age && (
            <span className="text-[10px] text-zinc-400">{agent.age}yo</span>
          )}
        </div>
        <p className="text-[10px] text-zinc-500 truncate">{agent.department}</p>
      </div>
      <div className="shrink-0">
        <div
          className={`w-10 h-5 rounded-full transition-all flex items-center ${
            isEnabled ? 'bg-emerald-500 justify-end' : 'bg-zinc-200 justify-start'
          } ${isDisabled ? 'opacity-50' : ''}`}
        >
          <div className="w-4 h-4 bg-white rounded-full shadow-sm mx-0.5" />
        </div>
      </div>
    </div>
  );
}

export default CharacterPickerModal;

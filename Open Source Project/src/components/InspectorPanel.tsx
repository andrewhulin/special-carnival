import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { useSceneManager } from '../three/SceneContext';
import { useAgencyStore } from '../store/agencyStore';
import { useChatAvailability } from '../hooks/useChatAvailability';
import AgentView from './AgentView';
import ProjectView from './ProjectView';
import ChatPanel from './ChatPanel';
import { getAgentSet } from '../data/agents';
import { MessageSquare, Lock, Play } from 'lucide-react';

interface InspectorPanelProps {
  isFloating?: boolean;
}

const InspectorPanel: React.FC<InspectorPanelProps> = ({ isFloating }) => {
  const { selectedNpcIndex, isChatting } = useStore();
  const scene = useSceneManager();
  const { phase, selectedAgentSetId, feedbackItems } = useAgencyStore();
  const agents = getAgentSet(selectedAgentSetId).agents;
  const { canChat, reason } = useChatAvailability(selectedNpcIndex);
  const prevCanChat = useRef(canChat);

  const agent = selectedNpcIndex !== null ? agents.find(a => a.index === selectedNpcIndex) ?? null : null;

  // When canChat transitions true → false, end any active chat
  useEffect(() => {
    if (prevCanChat.current && !canChat) {
      if (isChatting) scene?.endChat();
    }
    prevCanChat.current = canChat;
  }, [canChat]);

  const handleEndChat = () => {
    scene?.endChat();
  };

  const handleStartChat = () => {
    if (canChat && selectedNpcIndex !== null) {
      scene?.startChat(selectedNpcIndex);
    }
  };

  const handleStartSimulation = () => {
    useAgencyStore.getState().setPhase('working');
  };

  return (
    <div className={`${isFloating ? 'w-full h-full max-h-[85vh] self-end rounded-2xl shadow-2xl border border-white/20' : 'w-80 h-full border-l border-zinc-100'} bg-white flex flex-col pointer-events-auto shrink-0 relative z-30 overflow-hidden transition-all duration-300`}>
      {!agent ? (
        !isFloating && <ProjectView />
      ) : (
        <>
          {/* Header with Persona Name */}
          <div className={`p-4 pb-1 border-b border-zinc-50 bg-white ${isFloating ? 'bg-zinc-50/50' : ''}`}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: agent.color }}
                    />
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      {agent.department}
                    </p>
                  </div>
                  <h2 className="text-xl font-black text-zinc-900 leading-tight">
                    {agent.role}
                  </h2>
                </div>
                {!agent.isPlayer && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-zinc-400">
                      {feedbackItems.filter(f => f.personaIndex === agent.index).length} feedback
                    </span>
                  </div>
                )}
              </div>

              {/* Start Testing Button (shown when idle and persona selected) */}
              {phase === 'idle' && !agent.isPlayer && !isChatting && (
                <div className="flex flex-col gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl animate-in fade-in slide-in-from-top-1 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center justify-center w-5 h-5 bg-indigo-500 rounded-md text-white">
                      <Play size={12} strokeWidth={3} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Ready to Explore</span>
                  </div>
                  <p className="text-[12px] font-bold text-zinc-900 leading-tight">
                    Start the simulation to watch personas explore the Ash app.
                  </p>
                  <button
                    onClick={handleStartSimulation}
                    className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm mt-1"
                  >
                    <Play size={14} strokeWidth={3} />
                    Start Testing
                  </button>
                </div>
              )}

              {/* Chat / Follow-up Button */}
              {(phase !== 'idle' || agent.isPlayer) && !isChatting && (
                <div className="w-full">
                  <button
                    onClick={handleStartChat}
                    disabled={!canChat}
                    title={!canChat ? reason : undefined}
                    className={`w-full h-10 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-[10px] font-black uppercase tracking-widest ${
                      canChat
                      ? 'bg-zinc-900 text-white border-none shadow-md'
                      : 'bg-zinc-50 text-zinc-300 border border-transparent cursor-not-allowed'
                    }`}
                  >
                    {canChat ? (
                      <>
                        <MessageSquare size={13} className="text-white" />
                        Ask Follow-up
                      </>
                    ) : (
                      <>
                        <Lock size={12} className="opacity-40" />
                        {reason}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={`flex-1 overflow-y-auto relative min-h-0 ${isFloating ? 'bg-white' : 'bg-zinc-50/30'}`}>
            {isChatting ? (
              <div className="flex flex-col h-full bg-white">
                <div className="flex-1 overflow-y-auto">
                  <ChatPanel />
                </div>
                {/* Close Chat button at the bottom when chatting */}
                <div className="p-3 bg-white border-t border-zinc-100 flex-shrink-0">
                  <button
                    onClick={handleEndChat}
                    className="w-full h-10 px-4 bg-zinc-900 hover:bg-black text-white rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-[10px] font-black uppercase tracking-widest shadow-md"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Close Chat
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <AgentView agentIndex={selectedNpcIndex!} />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default InspectorPanel;

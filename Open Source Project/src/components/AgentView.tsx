import React from 'react';
import { useAgencyStore } from '../store/agencyStore';
import { getAgentSet } from '../data/agents';
import { getScreen } from '../data/appScreens';

interface AgentViewProps {
  agentIndex: number;
}

const SENTIMENT_EMOJI: Record<string, string> = {
  positive: '\u{1F60A}',
  confused: '\u{1F615}',
  frustrated: '\u{1F624}',
  delighted: '\u{2728}',
  neutral: '\u{1F610}',
};

const AgentView: React.FC<AgentViewProps> = ({ agentIndex }) => {
  const { feedbackItems, personaScreens, selectedAgentSetId } = useAgencyStore();
  const agents = getAgentSet(selectedAgentSetId).agents;

  const agent = agents.find(a => a.index === agentIndex);
  if (!agent) return null;

  const backstory = agent.backstory || '';
  const currentScreenId = personaScreens[agentIndex];
  const currentScreen = currentScreenId ? getScreen(currentScreenId) : null;
  const myFeedback = feedbackItems.filter(f => f.personaIndex === agentIndex);

  return (
    <div className="flex flex-col h-full p-6">
      {/* Backstory */}
      <div className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Backstory</p>
        <p className="text-xs text-zinc-600 leading-relaxed">{backstory.slice(0, 200)}...</p>
      </div>

      <div className="h-px bg-zinc-100 w-full mb-6" />

      {/* Current Screen */}
      <div className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-2">
          {currentScreen && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: agent.color }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: agent.color }}></span>
            </span>
          )}
          Currently Viewing
        </p>
        <p className="text-sm text-zinc-800 leading-snug font-bold">
          {currentScreen ? `"${currentScreen.name}"` : 'Not started yet'}
        </p>
      </div>

      <div className="h-px bg-zinc-100 w-full mb-6" />

      {/* Feedback Count */}
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
          Feedback Given
        </p>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-zinc-900">{myFeedback.length}</span>
          <span className="text-xs text-zinc-400">items</span>
        </div>
      </div>

      {/* Recent Feedback */}
      {myFeedback.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
            Recent
          </p>
          <div className="flex flex-col gap-2">
            {myFeedback.slice(-3).reverse().map(fb => (
              <div key={fb.id} className="bg-zinc-50 rounded-lg p-2 border border-zinc-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">{SENTIMENT_EMOJI[fb.sentiment] || ''}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">{fb.about}</span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  {fb.feedback.length > 100 ? `${fb.feedback.slice(0, 100)}...` : fb.feedback}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentView;

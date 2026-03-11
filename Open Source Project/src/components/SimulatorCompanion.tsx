import React, { useState, useMemo } from 'react';
import { Smartphone, ChevronDown, ChevronUp } from 'lucide-react';
import { useAgencyStore, getActiveAgentSet } from '../store/agencyStore';
import { getScreen } from '../data/appScreens';

const SENTIMENT_EMOJI: Record<string, string> = {
  positive: '😊',
  confused: '😕',
  frustrated: '😤',
  delighted: '🤩',
  neutral: '😐',
};

const SimulatorCompanion: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { personaScreens, feedbackItems, phase } = useAgencyStore();
  const agents = getActiveAgentSet().agents.filter(a => !a.isPlayer);

  // Derive discovered screens dynamically
  const discoveredScreens = useMemo(() => {
    const screenIds = new Set<string>();
    feedbackItems.forEach(f => screenIds.add(f.screenId));
    Object.values(personaScreens).forEach(id => { if (id) screenIds.add(id); });
    return Array.from(screenIds).map(id => ({
      id,
      name: getScreen(id)?.name || id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    }));
  }, [feedbackItems, personaScreens]);

  if (phase === 'idle') return null;

  // Find which screens are actively being viewed
  const activeScreenIds = new Set(Object.values(personaScreens));

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] border border-zinc-100 overflow-hidden min-w-[360px] max-w-[480px]">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-zinc-50/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Smartphone size={14} className="text-violet-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-700">
              iOS Simulator Companion
            </span>
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-600 uppercase tracking-wider">
              {activeScreenIds.size} active
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp size={14} className="text-zinc-400" />
          ) : (
            <ChevronDown size={14} className="text-zinc-400" />
          )}
        </button>

        {isExpanded && (
          <div className="border-t border-zinc-100">
            {/* Screen progress bar — dynamically built as screens are discovered */}
            <div className="px-4 py-2 bg-zinc-50/50">
              {discoveredScreens.length === 0 ? (
                <div className="text-[8px] font-bold text-zinc-300 uppercase tracking-wider text-center py-1">
                  Discovering screens...
                </div>
              ) : (
                <div className="flex gap-1">
                  {discoveredScreens.map((screen) => {
                    const isActive = activeScreenIds.has(screen.id);
                    const feedbackCount = feedbackItems.filter(f => f.screenId === screen.id).length;
                    return (
                      <div
                        key={screen.id}
                        className={`flex-1 rounded-lg px-2 py-1.5 text-center transition-all ${
                          isActive
                            ? 'bg-violet-100 border border-violet-200'
                            : feedbackCount > 0
                              ? 'bg-emerald-50 border border-emerald-100'
                              : 'bg-white border border-zinc-100'
                        }`}
                      >
                        <div className={`text-[8px] font-black uppercase tracking-wider ${
                          isActive ? 'text-violet-700' : feedbackCount > 0 ? 'text-emerald-600' : 'text-zinc-400'
                        }`}>
                          {screen.name}
                        </div>
                        {feedbackCount > 0 && (
                          <div className="text-[7px] font-bold text-zinc-400 mt-0.5">
                            {feedbackCount} feedback
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Per-persona status */}
            <div className="px-4 py-2 space-y-1.5">
              {agents.map((agent) => {
                const screenId = personaScreens[agent.index];
                const screen = screenId ? getScreen(screenId) : null;
                const latestFeedback = feedbackItems
                  .filter(f => f.personaIndex === agent.index)
                  .sort((a, b) => b.timestamp - a.timestamp)[0];

                return (
                  <div
                    key={agent.index}
                    className="flex items-center gap-2 py-1"
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: agent.color }}
                    />
                    <span className="text-[10px] font-black text-zinc-800 uppercase tracking-widest w-16 shrink-0">
                      {agent.role}
                    </span>
                    <span className="text-[10px] font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full shrink-0">
                      {screen?.name ?? 'Starting...'}
                    </span>
                    {latestFeedback && (
                      <span className="text-[9px] text-zinc-400 truncate">
                        {SENTIMENT_EMOJI[latestFeedback.sentiment] || ''} {latestFeedback.feedback.slice(0, 40)}...
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2 bg-zinc-50/50 border-t border-zinc-100">
              <p className="text-[9px] font-medium text-zinc-400 leading-relaxed">
                Open the Ash app in iOS Simulator and navigate to the highlighted screen to see what the personas are reacting to.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulatorCompanion;

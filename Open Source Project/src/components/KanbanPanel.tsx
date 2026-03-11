import React, { useState, useMemo } from 'react'
import { useAgencyStore } from '../store/agencyStore'
import { getActiveAgentSet } from '../store/agencyStore'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { getScreen } from '../data/appScreens'
import type { FeedbackItem } from '../types'

const SENTIMENT_EMOJI: Record<string, string> = {
  positive: '\u{1F60A}',
  confused: '\u{1F615}',
  frustrated: '\u{1F624}',
  delighted: '\u{2728}',
  neutral: '\u{1F610}',
};

/** Convert a screenId like 'persona-picker' or 'app' into a display label. */
function formatScreenLabel(screenId: string): string {
  const known = getScreen(screenId);
  if (known) return known.name;
  // Format unknown screenIds nicely: 'some-screen-id' → 'Some Screen Id'
  return screenId
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

interface KanbanPanelProps {
  height?: number;
}

function renderPersonaTag(agentIndex: number) {
  const agent = getActiveAgentSet().agents.find(a => a.index === agentIndex)
  if (!agent) return null
  return (
    <span className="flex items-center gap-1 text-[10px] text-zinc-500">
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: agent.color }}
      />
      {agent.role} <span className="text-zinc-400">&middot;</span> {agent.department}
    </span>
  )
}

function FeedbackCard({ item }: { item: FeedbackItem }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-white rounded-lg border border-black/5 shadow-sm p-3 space-y-2 group relative">
      <div
        className="flex items-start justify-between gap-1 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="text-sm shrink-0">{SENTIMENT_EMOJI[item.sentiment] || ''}</span>
          <h3 className="text-xs text-zinc-900 leading-snug font-bold truncate">
            {item.about}
          </h3>
        </div>
        <button className="text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0">
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {isExpanded && (
        <p className="text-[11px] text-zinc-500 leading-relaxed bg-zinc-50/50 p-2 rounded border border-black/5 animate-in fade-in slide-in-from-top-1 duration-200">
          {item.feedback}
        </p>
      )}

      <div className="flex flex-wrap gap-x-2 gap-y-1 pt-1">
        {renderPersonaTag(item.personaIndex)}
      </div>

      <span className={`inline-block text-[10px] font-bold rounded-full px-2 py-0.5 ${
        item.sentiment === 'positive' || item.sentiment === 'delighted'
          ? 'text-emerald-600 bg-emerald-50 border border-emerald-200'
          : item.sentiment === 'confused' || item.sentiment === 'frustrated'
          ? 'text-orange-600 bg-orange-50 border border-orange-200'
          : 'text-zinc-600 bg-zinc-50 border border-zinc-200'
      }`}>
        {item.sentiment}
      </span>
    </div>
  )
}

export function KanbanPanel({ height = 320 }: KanbanPanelProps) {
  const { feedbackItems, personaScreens, phase } = useAgencyStore()

  // Derive columns dynamically from feedback items and active persona screens
  const columns = useMemo(() => {
    const screenIds = new Set<string>();

    // Add screens that have feedback
    feedbackItems.forEach(f => screenIds.add(f.screenId));

    // Add screens personas are currently viewing
    Object.values(personaScreens).forEach(id => {
      if (id) screenIds.add(id);
    });

    return Array.from(screenIds).map(id => ({
      screenId: id,
      label: formatScreenLabel(id),
    }));
  }, [feedbackItems, personaScreens])

  const isEmpty = columns.length === 0;

  return (
    <div
      className="w-full bg-white border-t border-black/8 flex flex-col pointer-events-auto shrink-0 relative"
      style={{ height }}
    >
      {/* Columns Scroll Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-zinc-50/20">
        {isEmpty ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">
                {phase === 'idle' ? 'Start testing to see feedback' : 'Waiting for feedback...'}
              </p>
              <p className="text-[10px] text-zinc-300 mt-1">
                Columns will appear as personas discover screens
              </p>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-w-max px-5 py-4 gap-4">
            {columns.map(({ screenId, label }) => {
              const colItems = feedbackItems.filter((f) => f.screenId === screenId)
              const isActive = Object.values(personaScreens).includes(screenId);
              return (
                <div key={screenId} className="w-60 flex flex-col gap-3">
                  <div className="flex items-center justify-between shrink-0 select-none">
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse shrink-0" />
                      )}
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none">
                        {label}
                      </span>
                      <span className="px-1.5 py-0.5 bg-zinc-100 text-zinc-400 text-[9px] font-bold rounded-md min-w-4.5 text-center">
                        {colItems.length}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1">
                    {colItems.map((item) => (
                      <FeedbackCard key={item.id} item={item} />
                    ))}
                    {colItems.length === 0 && (
                      <div className="border border-dashed border-zinc-100 rounded-lg p-4 flex items-center justify-center select-none">
                        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">No feedback yet</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}


import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import InfoModal from './InfoModal';
import { useAgencyStore, getActiveAgentSet } from '../store/agencyStore';
import { getScreen } from '../data/appScreens';
import { MessageCircle, Sparkles } from 'lucide-react';

interface AlertBubbleProps {
  icon: React.ReactNode;
  position: { x: number; y: number };
  visible: boolean;
  color?: string;
  onClick?: () => void;
}

const AlertBubble: React.FC<AlertBubbleProps> = ({ icon, position, visible, color = '#facc15', onClick }) => {
  if (!visible) return null;

  return (
    <div
      className={`absolute z-20 ${onClick ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'}`}
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%) translateY(-10px)'
      }}
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      <div
        className={`bg-zinc-800/90 backdrop-blur-md p-1.5 rounded-full border border-white/10 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform ${onClick ? 'hover:border-white/30' : ''}`}
        style={{ color }}
      >
        {icon}
      </div>
    </div>
  );
};

type PhaseLabel = { text: string; className: string };

function getPersonaPhaseLabel(
  agentIndex: number,
  phase: string,
  personaScreens: Record<number, string>,
): PhaseLabel {
  if (phase === 'done') {
    return { text: 'Done exploring', className: 'text-emerald-400' };
  }
  if (phase === 'working') {
    const screenId = personaScreens[agentIndex];
    if (screenId) {
      const screen = getScreen(screenId);
      return { text: screen?.name || screenId, className: 'text-emerald-400' };
    }
    return { text: 'Exploring...', className: 'text-emerald-400' };
  }
  return { text: 'Waiting', className: 'text-white/70' };
}

const UIOverlay: React.FC = () => {
  const {
    selectedNpcIndex,
    selectedPosition,
    hoveredNpcIndex,
    hoveredPoiLabel,
    hoverPosition,
    npcScreenPositions,
    setSelectedNpc,
  } = useStore();
  const [isHelpOpen, setHelpOpen] = useState(false);
  const {
    phase,
    personaScreens,
    feedbackItems,
  } = useAgencyStore();
  const agents = getActiveAgentSet().agents;

  const selectedAgent = selectedNpcIndex != null ? agents.find(a => a.index === selectedNpcIndex) ?? null : null;
  const hoveredAgent = hoveredNpcIndex != null ? agents.find(a => a.index === hoveredNpcIndex) ?? null : null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none">
      {/* 1. Alert Bubbles — show feedback count or exploring status */}
      {agents.map((agent) => {
        if (agent.isPlayer) return null;
        const pos = npcScreenPositions[agent.index];
        if (!pos) return null;

        const isCurrentlyHovered = hoveredNpcIndex === agent.index || selectedNpcIndex === agent.index;
        if (isCurrentlyHovered) return null;

        const agentFeedback = feedbackItems.filter(f => f.personaIndex === agent.index);
        const isExploring = phase === 'working' && personaScreens[agent.index];

        let alertIcon: React.ReactNode = null;
        let alertColor = '#facc15';

        if (isExploring) {
          alertIcon = <Sparkles size={16} />;
          alertColor = agent.color;
        } else if (agentFeedback.length > 0) {
          alertIcon = <MessageCircle size={16} />;
          alertColor = agent.color;
        }

        if (!alertIcon) return null;

        return (
          <AlertBubble
            key={`alert-${agent.index}`}
            icon={alertIcon}
            position={pos}
            visible={true}
            color={alertColor}
            onClick={() => setSelectedNpc(agent.index)}
          />
        );
      })}

      {/* 2. Selection/Hover Bubble */}
      {(() => {
        // Priority 1: Selected Agent
        if (selectedAgent && selectedPosition) {
          const label = getPersonaPhaseLabel(selectedAgent.index, phase, personaScreens);

          return (
            <div
              className="absolute z-[25] pointer-events-none transition-all duration-75 ease-out"
              style={{
                left: selectedPosition.x,
                top: selectedPosition.y,
                transform: 'translate(-50%, -100%) translateY(-10px)'
              }}
            >
              <div className="bg-zinc-800/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-xl flex items-center gap-2 whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: selectedAgent.color }}
                />
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">
                    {selectedAgent.role}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-widest text-white/40">·</span>
                  <span className="text-[10px] font-medium uppercase tracking-widest text-white/60">
                    {selectedAgent.department}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-widest text-white/40">·</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${label.className}`}>
                    {label.text}
                  </span>
                </div>
              </div>
            </div>
          );
        }

        // Priority 2: Hovered Agent
        if (hoveredAgent && hoverPosition && hoveredNpcIndex !== selectedNpcIndex) {
          const label = getPersonaPhaseLabel(hoveredAgent.index, phase, personaScreens);

          return (
            <div
              className="absolute z-[25] pointer-events-none transition-all duration-75 ease-out"
              style={{
                left: hoverPosition.x,
                top: hoverPosition.y,
                transform: 'translate(-50%, -100%) translateY(-10px)'
              }}
            >
              <div className="bg-zinc-800/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-xl flex items-center gap-2 whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: hoveredAgent.color }}
                />
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">
                    {hoveredAgent.role}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-widest text-white/40">·</span>
                  <span className="text-[10px] font-medium uppercase tracking-widest text-white/60">
                    {hoveredAgent.department}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-widest text-white/40">·</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${label.className}`}>
                    {label.text}
                  </span>
                </div>
              </div>
            </div>
          );
        }

        return null;
      })()}

      {/* POI Hover Bubble */}
      {hoveredPoiLabel && hoverPosition && (
        <div
          className="absolute z-10 pointer-events-none transition-all duration-75 ease-out"
          style={{
            left: hoverPosition.x,
            top: hoverPosition.y,
            transform: 'translate(-50%, -100%) translateY(-10px)'
          }}
        >
          <div className="bg-zinc-800/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-xl flex items-center gap-2 whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
            <span className="text-[10px] font-black uppercase tracking-widest text-white">{hoveredPoiLabel}</span>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {isHelpOpen && <InfoModal onClose={() => setHelpOpen(false)} />}
    </div>
  );
};

export default UIOverlay;

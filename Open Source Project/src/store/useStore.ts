
import { create } from 'zustand';
import { CharacterState } from '../types';
import { resolveEnabledAgents, getDefaultEnabledKeys } from '../data/agents';
import { useAgencyStore } from './agencyStore';

export const useStore = create<CharacterState>()(
  (set) => ({
    isThinking: false,
    instanceCount: resolveEnabledAgents(
      useAgencyStore.getState().enabledAgentKeys ?? getDefaultEnabledKeys()
    ).length,

    selectedNpcIndex: null,
    selectedPosition: null,
    hoveredNpcIndex: null,
    hoveredPoiId: null,
    hoveredPoiLabel: null,
    hoverPosition: null,
    npcScreenPositions: {},
    isChatting: false,
    isTyping: false,
    chatMessages: [],
    inspectorTab: 'info',

    isBYOKOpen: false,
    byokError: null,
    setBYOKOpen: (open: boolean, error: string | null = null) =>
      set({ isBYOKOpen: open, byokError: error }),

    llmConfig: (() => {
      try {
        const saved = localStorage.getItem('byok-config');
        if (saved) return JSON.parse(saved);
      } catch {}
      return {
        provider: 'anthropic',
        apiKey: '',
        model: 'claude-sonnet-4-20250514'
      };
    })(),

    setThinking: (isThinking: boolean) => set({ isThinking }),
    setIsTyping: (isTyping: boolean) => set({ isTyping }),
    setInspectorTab: (tab: 'info' | 'chat') => set({ inspectorTab: tab }),
    setInstanceCount: (count: number) => set({ instanceCount: count }),

    setSelectedNpc: (index: number | null) => set({
      selectedNpcIndex: index,
      selectedPosition: null,
    }),
    setSelectedPosition: (pos: { x: number; y: number } | null) => set({ selectedPosition: pos }),
    setHoveredNpc: (index: number | null, pos: { x: number; y: number } | null) => set({
      hoveredNpcIndex: index,
      hoverPosition: pos,
      hoveredPoiId: null,
      hoveredPoiLabel: null,
    }),
    setHoveredPoi: (id: string | null, label: string | null, pos: { x: number; y: number } | null) => set({
      hoveredPoiId: id,
      hoveredPoiLabel: label,
      hoverPosition: pos,
      hoveredNpcIndex: null,
    }),
    setLlmConfig: (config) => set((s) => ({ llmConfig: { ...s.llmConfig, ...config } })),
  })
);

// Keep instanceCount in sync whenever enabled agents change
useAgencyStore.subscribe((state, prevState) => {
  if (state.enabledAgentKeys !== prevState.enabledAgentKeys) {
    const agents = resolveEnabledAgents(state.enabledAgentKeys);
    useStore.getState().setInstanceCount(agents.length);
  }
});

import { createContext, useContext } from 'react';
import type { ResolvedEventOccurrence } from '../../lib/events';

interface EventSelectionContextValue {
  activeOccurrence: ResolvedEventOccurrence | null;
  setActiveOccurrence: (occurrence: ResolvedEventOccurrence | null) => void;
}

export const EventSelectionContext = createContext<EventSelectionContextValue | null>(null);

export function useEventSelection() {
  const context = useContext(EventSelectionContext);

  if (!context) {
    throw new Error('useEventSelection must be used within EventSelectionContext.Provider');
  }

  return context;
}

export function getEventLayoutId(item: ResolvedEventOccurrence): string {
  return `event-${item.event.slug}-${item.occurrence.startUtc}`;
}

import { useEffect, useState } from 'react';
import {
  MINICON_PROMOTION_END,
  isMiniconPromotionActive,
} from '../content/minicon-2026';

export function useMiniconPromotion(): boolean {
  const [isActive, setIsActive] = useState(() => isMiniconPromotionActive());

  useEffect(() => {
    if (!isActive) return;

    const remaining = Math.max(0, Date.parse(MINICON_PROMOTION_END) - Date.now());
    const timer = window.setTimeout(() => setIsActive(false), remaining);

    return () => window.clearTimeout(timer);
  }, [isActive]);

  return isActive;
}

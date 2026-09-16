"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getSuggestedLayout,
  saveSuggestedLayout,
  type SuggestedLayout,
} from "@/lib/storage";

export const CARD_LAYOUT_CHANGED = "card-layout-changed";

export function useCardLayout() {
  const [layout, setLayoutState] = useState<SuggestedLayout>("grid");

  useEffect(() => {
    setLayoutState(getSuggestedLayout());

    const sync = () => setLayoutState(getSuggestedLayout());
    window.addEventListener(CARD_LAYOUT_CHANGED, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CARD_LAYOUT_CHANGED, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setLayout = useCallback((next: SuggestedLayout) => {
    setLayoutState(next);
    saveSuggestedLayout(next);
    window.dispatchEvent(new CustomEvent(CARD_LAYOUT_CHANGED));
  }, []);

  return { layout, setLayout };
}

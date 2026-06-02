import { useContext } from "react";
import { ScrollActionsContext, ScrollProgressContext, SmoothScrollContext } from "../context/ScrollContexts";

export function useScrollTo() {
  const ctx = useContext(ScrollActionsContext);
  if (ctx === null) {
    throw new Error("useScrollTo must be used within SmoothScrollProvider");
  }
  return ctx;
}

export function useScrollProgress() {
  return useContext(ScrollProgressContext);
}

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

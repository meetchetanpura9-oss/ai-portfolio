import { createContext } from "react";

export interface SmoothScrollContextType {
  scrollTo: (target: string | number, options?: { offset?: number }) => void;
  progress: number;
}

export const SmoothScrollContext = createContext<SmoothScrollContextType | null>(null);
export const ScrollProgressContext = createContext<number>(0);
export const ScrollActionsContext = createContext<((target: string | number, options?: { offset?: number }) => void) | null>(null);

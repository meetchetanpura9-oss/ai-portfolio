import { createContext } from "react";

export const ScrollActionsContext = createContext(null);
export const ScrollProgressContext = createContext(0);
export const SmoothScrollContext = createContext({
  scrollTo: () => {},
  progress: 0,
});

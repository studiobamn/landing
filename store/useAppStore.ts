import { create } from "zustand";

export type NavigationState = "idle" | "exiting" | "entering";

interface AppState {
  // navigation / transitions
  navigationState: NavigationState;
  hasNavigatedInApp: boolean; // false on first load → deep-link plays enter only
  setNavigationState: (s: NavigationState) => void;
  setHasNavigatedInApp: (v: boolean) => void;

  // home view: shuffled view→position mapping, regenerated per load
  homeAssignments: string[];
  setHomeAssignments: (a: string[]) => void;

  // product inquiry handoff (Product → Contact, if ever used)
  pendingProductInquiry?: string;
  setPendingProductInquiry: (name?: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  navigationState: "idle",
  hasNavigatedInApp: false,
  setNavigationState: (navigationState) => set({ navigationState }),
  setHasNavigatedInApp: (hasNavigatedInApp) => set({ hasNavigatedInApp }),

  homeAssignments: [],
  setHomeAssignments: (homeAssignments) => set({ homeAssignments }),

  pendingProductInquiry: undefined,
  setPendingProductInquiry: (pendingProductInquiry) =>
    set({ pendingProductInquiry }),
}));

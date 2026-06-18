"use client";

// Optional blank-cream overlay placeholder for the route-swap gap.
//
// In the current model the cream <body> background already covers the swap
// (views fade their own content to/from transparent), so this stays inert.
// It exists as a mount point if a richer transition curtain is wanted later
// (e.g. a wipe synced to navigationState). Wire it to useAppStore then.

export function TransitionLayer() {
  return null;
}

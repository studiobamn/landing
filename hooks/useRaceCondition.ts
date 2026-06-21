"use client";

// Version-based element merge for conflict-free collaboration.
//
// Each Excalidraw element carries a `version` integer that increments on every
// edit. This gives us per-element conflict resolution without a CRDT library:
//   - Higher version wins for the same element ID
//   - Tie (same version) → local copy wins to avoid spurious remote overwrites
//   - Elements absent from an incoming update are KEPT locally — a broadcast is
//     not a replacement, it's a merge. This is the race-condition fix: User B's
//     local drawings survive when User A broadcasts.
//   - Hard deletes come as isDeleted:true with an incremented version, so they
//     propagate through the same merge path.
//
// Two broadcast event types keep the semantics clear:
//   "board-update"  — normal drawing; use mergeElements
//   "board-replace" — admin clear / restore; replace unconditionally

import { useCallback, useEffect, useRef } from "react";
import type { ExcalidrawEl } from "./useExcalidrawApi";

const snapshot = (elements: ExcalidrawEl[]) =>
  elements.map((el) => ({ ...el }));

export function mergeElements(
  local: ExcalidrawEl[],
  incoming: ExcalidrawEl[],
): ExcalidrawEl[] {
  const localMap = new Map(local.map((el) => [el.id, el]));
  const incomingIds = new Set(incoming.map((el) => el.id));

  // Use incoming array order as the base — z-order in Excalidraw is positional,
  // and layer ops change both array position and the fractional `index` property.
  // The old Map-based merge preserved local insertion order, silently dropping
  // any layer reordering that came in via broadcast.
  // For each shared element, higher version wins; ties go to local.
  const result: ExcalidrawEl[] = incoming.map((el) => {
    const localEl = localMap.get(el.id);
    return localEl && localEl.version >= el.version ? localEl : el;
  });

  // Append local-only elements (drawings the remote hasn't seen yet).
  // They go at the end (visually on top); their relative order is preserved.
  for (const el of local) {
    if (!incomingIds.has(el.id)) result.push(el);
  }

  return result;
}

// True if current has any element that is new or has a higher version than prev.
function hasLocalChanges(
  current: ExcalidrawEl[],
  prev: ExcalidrawEl[],
): boolean {
  if (current.length !== prev.length) return true;
  const prevVersions = new Map(prev.map((el) => [el.id, el.version]));
  return current.some((el) => {
    const v = prevVersions.get(el.id);
    return v === undefined || el.version > v;
  });
}

export function useRaceCondition(
  onRemoteChange: (elements: ExcalidrawEl[]) => void,
) {
  const elementsRef = useRef<ExcalidrawEl[]>([]);
  const onRemoteChangeRef = useRef(onRemoteChange);
  // Tracks how many remote pushes are in-flight. While > 0, applyLocalChange
  // captures Excalidraw's normalized state but suppresses the broadcast.
  // This prevents the ping-pong loop where Excalidraw increments element
  // versions internally during updateScene for group/duplicate/layer ops.
  const remotePushCountRef = useRef(0);

  useEffect(() => {
    onRemoteChangeRef.current = onRemoteChange;
  }, [onRemoteChange]);

  // Called on every Excalidraw onChange. Updates the ref and returns true if
  // there were real local changes worth broadcasting.
  // Returning false suppresses the broadcast when Excalidraw fires onChange
  // after pushToScene() (the echo after a remote update).
  const applyLocalChange = useCallback((elements: ExcalidrawEl[]): boolean => {
    if (remotePushCountRef.current > 0) {
      // Capture whatever Excalidraw normalized the elements to (versions may
      // have been bumped internally) so the next real local edit compares
      // against the correct baseline.
      elementsRef.current = snapshot(elements);
      return false;
    }
    if (!hasLocalChanges(elements, elementsRef.current)) return false;
    elementsRef.current = elements.map((el) => ({ ...el }));
    return true;
  }, []);

  // Merge incoming remote drawing update into local state and notify.
  const applyRemoteUpdate = useCallback((incoming: ExcalidrawEl[]) => {
    const merged = mergeElements(elementsRef.current, incoming);
    elementsRef.current = snapshot(merged);
    remotePushCountRef.current += 1;
    onRemoteChangeRef.current(merged);
    // Decrement after all synchronous Excalidraw processing (and its onChange
    // calls) have completed. rAF fires after the current paint, which is after
    // all synchronous React state updates from updateScene.
    requestAnimationFrame(() => {
      remotePushCountRef.current -= 1;
    });
  }, []);

  // Overwrite local state with incoming without merging (admin clear / restore).
  const replaceRemote = useCallback((elements: ExcalidrawEl[]) => {
    elementsRef.current = snapshot(elements);
    remotePushCountRef.current += 1;
    onRemoteChangeRef.current(elements);
    requestAnimationFrame(() => {
      remotePushCountRef.current -= 1;
    });
  }, []);

  // Set local ref without notifying — used before a local clear/restore
  // broadcast, and for initial DB hydration.
  const setElements = useCallback((elements: ExcalidrawEl[]) => {
    elementsRef.current = snapshot(elements);
  }, []);

  const getElements = useCallback(() => elementsRef.current, []);

  return {
    applyLocalChange,
    applyRemoteUpdate,
    replaceRemote,
    setElements,
    getElements,
  };
}

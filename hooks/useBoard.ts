"use client";

// Top-level board hook. Composes useExcalidrawApi + useRaceCondition +
// useExcalidrawImages and owns the Supabase Realtime channel.
//
// Two channel event types:
//   "board-update"  → normal draw; receiver merges by element version.
//                     Payload includes BinaryFileData[] for any new images so
//                     the receiver can inject them instantly without a storage
//                     round-trip.
//   "board-replace" → admin clear/restore; receiver replaces unconditionally.
//
// Data flow:
//   draw    → onChange → applyLocalChange → uploadNewImages → broadcastUpdate
//   recv    → board-update  → addFiles(files) → applyRemoteUpdate → merge → pushToScene
//   recv    → board-replace → replaceRemote → pushToScene
//   load    → getBoard(DB) → setElements → pushToScene → loadImagesForElements
//   save    → getElements() → saveBoard(DB)
//   clear   → setElements([]) → pushToScene → broadcastReplace([]) → saveBoard
//   restore → restoreBoard(DB) → setElements → pushToScene → broadcastReplace

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { BinaryFileData } from "@excalidraw/excalidraw/types";
import { supabase } from "@/lib/supabase";
import { getBoard, saveBoard, restoreBoard } from "@/lib/queries";
import type { BoardSnapshot } from "@/lib/board-storage";
import { useExcalidrawApi, type ExcalidrawEl } from "./useExcalidrawApi";
import { useRaceCondition } from "./useRaceCondition";
import { useExcalidrawImages } from "./useExcalidrawImages";
import { useDebounce } from "./useDebounce";

export type { ExcalidrawEl, BoardApi } from "./useExcalidrawApi";

const CHANNEL = "graffiti-wall";
const DEBOUNCE_MS = 1500;

const countLive = (els: ExcalidrawEl[]) =>
  els.filter((e) => !e.isDeleted).length;

export function useBoard() {
  const [ready, setReady] = useState(false);
  const [elementCount, setElementCount] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const firstLoadElRef = useRef<ExcalidrawEl[]>([]);

  const {
    api,
    setApi,
    pushToScene,
    getCurrentBoard,
    loadLibraries,
    getFiles,
    addFiles,
  } = useExcalidrawApi();

  const { uploadNewImages, loadImagesForElements } = useExcalidrawImages({
    getFiles,
    addFiles,
  });

  const onRemoteChange = useCallback(
    (elements: ExcalidrawEl[]) => {
      pushToScene(elements);
      setElementCount(countLive(elements));
    },
    [pushToScene],
  );

  const {
    applyLocalChange,
    applyRemoteUpdate,
    replaceRemote,
    setElements,
    getElements,
  } = useRaceCondition(onRemoteChange);

  const broadcastUpdate = useCallback(
    (elements: ExcalidrawEl[], files?: BinaryFileData[]) => {
      channelRef.current?.send({
        type: "broadcast",
        event: "board-update",
        payload: { elements, ...(files?.length ? { files } : {}) },
      });
    },
    [],
  );

  const broadcastReplace = useCallback((elements: ExcalidrawEl[]) => {
    channelRef.current?.send({
      type: "broadcast",
      event: "board-replace",
      payload: { elements },
    });
  }, []);

  // Supabase Realtime channel — two event types with distinct merge semantics.
  useEffect(() => {
    const channel = supabase
      ? supabase.channel(CHANNEL, { config: { broadcast: { self: false } } })
      : null;
    channelRef.current = channel;

    channel?.on("broadcast", { event: "board-update" }, ({ payload }) => {
      const p = payload as {
        elements?: ExcalidrawEl[];
        files?: BinaryFileData[];
      };
      // Inject image files before merging so the scene renders them immediately.
      if (p.files?.length) addFiles(p.files);
      if (p.elements) applyRemoteUpdate(p.elements);
    });

    channel?.on("broadcast", { event: "board-replace" }, ({ payload }) => {
      const incoming =
        (payload as { elements?: ExcalidrawEl[] })?.elements ?? [];
      replaceRemote(incoming);
    });

    channel?.subscribe();

    return () => {
      if (channel) supabase?.removeChannel(channel);
    };
  }, [applyRemoteUpdate, replaceRemote, addFiles]);

  // Load board from DB + images + libraries once the Excalidraw API is ready.
  useEffect(() => {
    if (!api) return;
    (async () => {
      const snap = await getBoard<BoardSnapshot>("data");
      const elements = (snap?.elements as ExcalidrawEl[]) ?? [];
      setElements(elements);
      pushToScene(elements);
      firstLoadElRef.current = elements;
      setElementCount(countLive(elements));
      setReady(true);
      // Load image files from storage and inject into Excalidraw before
      // the user sees the board, so images appear fully rendered on load.
      await loadImagesForElements(elements);
      await loadLibraries();
    })();
  }, [api, setElements, pushToScene, loadImagesForElements, loadLibraries]);

  const save = useCallback(
    async (type: "checkpoint" | "public"): Promise<boolean> => {
      const elements = getElements();
      const board = getCurrentBoard();
      const snap: BoardSnapshot = {
        elements,
        appState: {
          viewBackgroundColor: board?.appState.viewBackgroundColor,
          gridSize: board?.appState.gridSize,
        },
      };
      const col = type === "checkpoint" ? "restore_point" : "data";
      const result = await saveBoard(snap, col);
      if (result && type === "public") {
        firstLoadElRef.current = elements;
      }
      return !!result;
    },
    [getElements, getCurrentBoard],
  );

  const debouncedSave = useDebounce(() => save("public"), DEBOUNCE_MS);

  // Excalidraw onChange: detect real local changes, upload any new images to
  // storage (so late-joining users can fetch them), include the binary data in
  // the broadcast so currently-connected users get instant display.
  const onChange = useCallback(
    (elements: ExcalidrawEl[]) => {
      if (!ready) return;
      if (!applyLocalChange(elements)) return;
      setElementCount(countLive(elements));
      debouncedSave();
      void (async () => {
        const newFiles = await uploadNewImages(elements);
        broadcastUpdate(elements, newFiles);
      })();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ready, applyLocalChange, uploadNewImages, broadcastUpdate],
  );

  const clearBoard = useCallback(async () => {
    setElements([]);
    pushToScene([]);
    broadcastReplace([]);
    await saveBoard(
      { elements: [], appState: { viewBackgroundColor: "transparent" } },
      "data",
    );
    firstLoadElRef.current = [];
    setElementCount(0);
  }, [setElements, pushToScene, broadcastReplace]);

  const restoreCheckpoint = useCallback(async (): Promise<boolean> => {
    const snap = await restoreBoard();
    if (!snap) return false;
    const elements = (snap.elements as ExcalidrawEl[]) ?? [];
    setElements(elements);
    pushToScene(elements);
    broadcastReplace(elements);
    firstLoadElRef.current = elements;
    setElementCount(countLive(elements));
    return true;
  }, [setElements, pushToScene, broadcastReplace]);

  return {
    ready,
    elementCount,
    onChange,
    save,
    clearBoard,
    restoreCheckpoint,
    setApi,
  };
}

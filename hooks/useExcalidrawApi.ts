"use client";

import { useCallback, useRef, useState } from "react";
import type {
  LibraryItems,
  BinaryFileData,
} from "@excalidraw/excalidraw/types";

export type { BinaryFileData };

export interface ExcalidrawEl {
  id: string;
  version: number;
  isDeleted?: boolean;
  [key: string]: unknown;
}

export interface BoardApi {
  updateScene: (scene: {
    elements?: readonly ExcalidrawEl[];
    appState?: Record<string, unknown>;
  }) => void;
  getSceneElements: () => readonly ExcalidrawEl[];
  getAppState: () => Record<string, unknown>;
  updateLibrary: (opts: {
    libraryItems: LibraryItems;
    merge?: boolean;
    openLibraryMenu?: boolean;
  }) => Promise<LibraryItems>;
  getFiles: () => Record<string, BinaryFileData>;
  addFiles: (data: BinaryFileData[]) => void;
}

const LIBRARY_PATH = "/excalidraw/";

export function useExcalidrawApi() {
  const [api, setApiState] = useState<BoardApi | null>(null);
  const apiRef = useRef<BoardApi | null>(null);

  const setApi = useCallback((newApi: BoardApi) => {
    apiRef.current = newApi;
    setApiState(newApi);
  }, []);

  const pushToScene = useCallback((elements: ExcalidrawEl[]) => {
    apiRef.current?.updateScene({ elements });
  }, []);

  const getCurrentBoard = useCallback((): {
    elements: ExcalidrawEl[];
    appState: Record<string, unknown>;
  } | null => {
    if (!apiRef.current) return null;
    return {
      elements: Array.from(apiRef.current.getSceneElements()) as ExcalidrawEl[],
      appState: apiRef.current.getAppState(),
    };
  }, []);

  const loadLibraries = useCallback(async () => {
    if (!apiRef.current) return;
    const [lib1, lib2] = await Promise.all([
      fetch(LIBRARY_PATH + "architecture.excalidrawlib").then((r) => r.json()),
      fetch(LIBRARY_PATH + "basic-shapes.excalidrawlib").then((r) => r.json()),
    ]);
    await apiRef.current.updateLibrary({
      libraryItems: [...(lib1.library ?? lib1), ...(lib2.library ?? lib2)],
    });
  }, []);

  const getFiles = useCallback((): Record<string, BinaryFileData> => {
    return (apiRef.current?.getFiles() ?? {}) as Record<string, BinaryFileData>;
  }, []);

  const addFiles = useCallback((files: BinaryFileData[]) => {
    apiRef.current?.addFiles(files);
  }, []);

  return { api, setApi, pushToScene, getCurrentBoard, loadLibraries, getFiles, addFiles };
}

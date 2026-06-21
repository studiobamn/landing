"use client";

// Manages Excalidraw image files across users and sessions.
//
// Problem: Excalidraw elements only carry a `fileId` reference. The actual
// binary data lives in the Excalidraw API's internal file store, which is
// local to the tab. A remote user receiving an image element has the fileId
// but no binary data → the image doesn't render.
//
// Solution:
//   Upload  — when the admin inserts a new image, upload its DataURL to
//             Supabase Storage keyed by fileId. Return the BinaryFileData
//             so the caller can include it in the live broadcast payload.
//             Remote users receiving the broadcast inject the file directly
//             via api.addFiles(); no storage round-trip needed for live sync.
//
//   Load    — on initial board load (or when a user joins mid-session),
//             find image elements in the snapshot, download their DataURLs
//             from storage by fileId, and inject via api.addFiles().
//
// knownFileIdsRef tracks files already handled so uploads/downloads are
// never repeated within the same session.

import { useCallback, useRef } from "react";
import type { BinaryFileData } from "@excalidraw/excalidraw/types";
import type { ExcalidrawEl } from "./useExcalidrawApi";
import { uploadBoardImage, downloadBoardImage } from "@/lib/board-storage";

function mimeFromDataUrl(dataUrl: string): BinaryFileData["mimeType"] {
  const match = dataUrl.match(/^data:([^;]+);/);
  return (match?.[1] ?? "image/png") as BinaryFileData["mimeType"];
}

function imageElements(elements: ExcalidrawEl[]): ExcalidrawEl[] {
  return elements.filter((el) => el.type === "image" && el.fileId);
}

export function useExcalidrawImages({
  getFiles,
  addFiles,
}: {
  getFiles: () => Record<string, BinaryFileData>;
  addFiles: (files: BinaryFileData[]) => void;
}) {
  // Tracks fileIds already uploaded or loaded this session to skip redundant work.
  const knownFileIdsRef = useRef<Set<string>>(new Set());

  // Called by the admin's onChange after a real local change.
  // Uploads any new image files to storage and returns their BinaryFileData
  // so the caller can include them in the broadcast payload for instant display.
  const uploadNewImages = useCallback(
    async (elements: ExcalidrawEl[]): Promise<BinaryFileData[]> => {
      const newImageEls = imageElements(elements).filter(
        (el) => !knownFileIdsRef.current.has(el.fileId as string),
      );
      if (newImageEls.length === 0) return [];

      const allFiles = getFiles();
      const uploaded: BinaryFileData[] = [];

      await Promise.all(
        newImageEls.map(async (el) => {
          const fileId = el.fileId as string;
          const file = allFiles[fileId];
          if (!file?.dataURL) return;
          const dataUrl = file.dataURL as string;
          const ok = await uploadBoardImage(fileId, dataUrl);
          if (ok) {
            knownFileIdsRef.current.add(fileId);
            uploaded.push(file);
          }
        }),
      );

      return uploaded;
    },
    [getFiles],
  );

  // Called on initial board load and when receiving remote elements that may
  // include image fileIds the current user hasn't seen yet.
  // Downloads missing DataURLs from storage and injects them via api.addFiles.
  const loadImagesForElements = useCallback(
    async (elements: ExcalidrawEl[]): Promise<void> => {
      const missingEls = imageElements(elements).filter(
        (el) => !knownFileIdsRef.current.has(el.fileId as string),
      );
      if (missingEls.length === 0) return;

      const toAdd: BinaryFileData[] = [];

      await Promise.all(
        missingEls.map(async (el) => {
          const fileId = el.fileId as string;
          const dataUrl = await downloadBoardImage(fileId);
          if (!dataUrl) return;
          toAdd.push({
            id: fileId as BinaryFileData["id"],
            dataURL: dataUrl as BinaryFileData["dataURL"],
            mimeType: mimeFromDataUrl(dataUrl),
            created: Date.now(),
          });
          knownFileIdsRef.current.add(fileId);
        }),
      );

      if (toAdd.length > 0) addFiles(toAdd);
    },
    [addFiles],
  );

  return { uploadNewImages, loadImagesForElements };
}

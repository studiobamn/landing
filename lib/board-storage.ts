"use client";

// Supabase Storage helpers for the board.
// Board state lives in the DB (see lib/queries.ts).
// This file handles binary assets: images inserted into the canvas.
//
// Image path: projects/{projectId}/images/{fileId}
// The fileId is Excalidraw's own stable identifier for each inserted file,
// so we use it as the storage filename — no separate mapping needed.

import { supabase } from "@/lib/supabase";
import type { ExcalidrawEl } from "@/hooks/useExcalidrawApi";

export const BOARD_BUCKET = "drawings";

export interface BoardSnapshot {
  elements: ExcalidrawEl[];
  appState?: Record<string, unknown>;
}

const projectId = () =>
  process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID ?? "default";

const imagePath = (fileId: string) =>
  `projects/${projectId()}/images/${fileId}`;

// Upload an Excalidraw file (DataURL string) to storage keyed by its fileId.
export async function uploadBoardImage(
  fileId: string,
  dataUrl: string,
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const blob = new Blob([dataUrl], { type: "text/plain" });
    const { error } = await supabase.storage
      .from(BOARD_BUCKET)
      .upload(imagePath(fileId), blob, {
        upsert: true,
        contentType: "text/plain",
      });
    if (error) {
      console.error("uploadBoardImage:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("uploadBoardImage:", e);
    return false;
  }
}

// Download an image DataURL from storage by its fileId.
export async function downloadBoardImage(
  fileId: string,
): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.storage
      .from(BOARD_BUCKET)
      .download(imagePath(fileId));
    if (error || !data) return null;
    return await data.text();
  } catch (e) {
    console.error("downloadBoardImage:", e);
    return null;
  }
}

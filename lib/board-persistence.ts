"use client";

// Durable persistence for the Board (BOARD.md, Layer 2). Loads the working
// snapshot from board.data on mount; writes the full document snapshot back on
// a debounce (not every stroke). Public RLS allows the anon client to update.

import { getSnapshot, loadSnapshot, type Editor } from "tldraw";
import { supabase } from "@/lib/supabase";

const BOARD_NAME = "live";

/** Load board.data into the editor. Null data → blank the current page. */
export async function loadBoard(editor: Editor) {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("board")
    .select("data")
    .eq("name", BOARD_NAME)
    .maybeSingle();
  if (error) {
    console.error("loadBoard:", error.message);
    return;
  }
  const doc = data?.data;
  try {
    if (doc) {
      loadSnapshot(editor.store, doc);
    } else {
      const ids = [...editor.getCurrentPageShapeIds()];
      if (ids.length) editor.deleteShapes(ids);
    }
  } catch (e) {
    console.error("loadBoard apply:", e);
  }
}

export interface BoardSaver {
  schedule: () => void;
  flush: () => Promise<void>;
}

/** Debounced writer of the document snapshot to board.data. */
export function createBoardSaver(editor: Editor, delayMs = 2500): BoardSaver {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const write = async () => {
    if (!supabase) return;
    const { document } = getSnapshot(editor.store);
    const { error } = await supabase
      .from("board")
      .update({ data: document, updated_at: new Date().toISOString() })
      .eq("name", BOARD_NAME);
    if (error) console.error("saveBoard:", error.message);
  };

  return {
    schedule() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(write, delayMs);
    },
    async flush() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      await write();
    },
  };
}

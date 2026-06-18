"use client";

// Live sync for the Board (BOARD.md, Layer 1). Broadcasts incremental tldraw
// store diffs over a Supabase Realtime channel (throttled), and applies remote
// diffs to the local store. Also relays a "reload" signal so admin wipe/nuke
// makes every connected client re-pull board.data.

import type { Editor, TLRecord } from "tldraw";
import { supabase } from "@/lib/supabase";

const CHANNEL = "board:live";
const THROTTLE_MS = 60;

interface DiffPayload {
  added: TLRecord[];
  updated: TLRecord[];
  removed: string[];
}

export interface BoardSync {
  dispose: () => void;
  requestReload: () => void;
}

export function createBoardSync(editor: Editor, onReload: () => void): BoardSync {
  if (!supabase) return { dispose() {}, requestReload() {} };
  const client = supabase;
  const channel = client.channel(CHANNEL, {
    config: { broadcast: { self: false } },
  });

  // Incoming diffs → merge as remote changes (won't re-broadcast).
  channel.on("broadcast", { event: "diff" }, ({ payload }) => {
    const { added = [], updated = [], removed = [] } = (payload ??
      {}) as DiffPayload;
    editor.store.mergeRemoteChanges(() => {
      if (added.length || updated.length) {
        editor.store.put([...added, ...updated]);
      }
      if (removed.length) {
        editor.store.remove(removed as TLRecord["id"][]);
      }
    });
  });
  channel.on("broadcast", { event: "reload" }, () => onReload());
  channel.subscribe();

  // Outgoing — accumulate local user document changes, broadcast throttled.
  const added = new Map<string, TLRecord>();
  const updated = new Map<string, TLRecord>();
  const removed = new Set<string>();
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    timer = null;
    if (!added.size && !updated.size && !removed.size) return;
    channel.send({
      type: "broadcast",
      event: "diff",
      payload: {
        added: [...added.values()],
        updated: [...updated.values()],
        removed: [...removed],
      },
    });
    added.clear();
    updated.clear();
    removed.clear();
  };

  const unlisten = editor.store.listen(
    (entry) => {
      const c = entry.changes;
      for (const rec of Object.values(c.added)) added.set(rec.id, rec);
      for (const [, to] of Object.values(c.updated)) updated.set(to.id, to);
      for (const rec of Object.values(c.removed)) {
        added.delete(rec.id);
        updated.delete(rec.id);
        removed.add(rec.id);
      }
      if (!timer) timer = setTimeout(flush, THROTTLE_MS);
    },
    { source: "user", scope: "document" },
  );

  return {
    dispose() {
      unlisten();
      if (timer) clearTimeout(timer);
      client.removeChannel(channel);
    },
    requestReload() {
      channel.send({ type: "broadcast", event: "reload", payload: {} });
    },
  };
}

"use client";

// Board — collaborative graffiti wall on a transparent tldraw canvas over the
// site's paper texture (instructions/BOARD.md). Live sync via Supabase Realtime,
// durable via debounced snapshot. Implements the View Contract; exit() MUST
// flush the final save and tear down the realtime subscription.

import "tldraw/tldraw.css";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import gsap from "gsap";
import { getSnapshot, type Editor } from "tldraw";
import { useViewTransition } from "@/hooks/useTransitionRouter";
import { HomeIcon } from "@/components/HomeIcon";
import {
  loadBoard,
  createBoardSaver,
  type BoardSaver,
} from "@/lib/board-persistence";
import { createBoardSync, type BoardSync } from "@/lib/board-sync";
import { AdminControls } from "@/components/board/AdminControls";
import { Loading } from "@/components/board/Loading";
import type { TLComponents, TLUiOverrides } from "tldraw";

// tldraw is browser-only — never render it on the server.
const Tldraw = dynamic(() => import("tldraw").then((m) => m.Tldraw), {
  ssr: false,
});

// Public (user) lockdown — null every UI surface so a plain visitor can only
// draw: no per-selection options ("dialog above a selected shape"), no
// right-click context menu, no menus/panels.
const USER_COMPONENTS: TLComponents = {
  // options that appear when a shape is selected
  // StylePanel: null,
  RichTextToolbar: null,
  ImageToolbar: null,
  VideoToolbar: null,
  // right-click menu (canvas + shapes)
  ContextMenu: null,
  // menus / panels
  MenuPanel: null,
  MainMenu: null,
  PageMenu: null,
  ActionsMenu: null,
  QuickActions: null,
  HelpMenu: null,
  ZoomMenu: null,
  NavigationPanel: null,
  Minimap: null,
  KeyboardShortcutsDialog: null,
  DebugMenu: null,
  DebugPanel: null,
  SharePanel: null,
};

const overrides: TLUiOverrides = {
  tools(editor, tools) {
    // Remove the text tool from the toolbar
    delete tools.asset;
    return tools;
  },
};

export default function BoardView({ mode }: { mode: "user" | "admin" }) {
  const root = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const saverRef = useRef<BoardSaver | null>(null);
  const syncRef = useRef<BoardSync | null>(null);
  const [ready, setReady] = useState(false);

  useViewTransition({
    enter: () =>
      gsap
        .timeline()
        .fromTo(
          root.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.6, ease: "power2.out" },
        ),
    exit: async () => {
      await saverRef.current?.flush(); // 1. flush final save
      syncRef.current?.dispose(); // 2. tear down realtime
      syncRef.current = null;
      await new Promise<void>((resolve) => {
        // 3. exit animation
        gsap.to(root.current, {
          autoAlpha: 0,
          duration: 0.4,
          ease: "power2.in",
          onComplete: resolve,
        });
      });
    },
  });

  const isUser = mode === "user";

  const handleMount = (editor: Editor) => {
    editorRef.current = editor;
    void loadBoard(editor).then(() => {
      const saver = createBoardSaver(editor);
      saverRef.current = saver;
      syncRef.current = createBoardSync(editor, () => void loadBoard(editor));
      // Debounced durable save on every local document change.
      editor.store.listen(() => saver.schedule(), {
        source: "user",
        scope: "document",
      });
      setReady(true); // board loaded → hide the loading view
    });
  };

  return (
    <div
      ref={root}
      className="board-canvas fixed inset-0"
      style={{ opacity: 0 }}
    >
      <HomeIcon top={isUser ? undefined : 50} />
      <div
        className="absolute inset-0"
        // Belt-and-suspenders: block the native right-click menu for users.
        onContextMenu={isUser ? (e) => e.preventDefault() : undefined}
      >
        <Tldraw
          onMount={handleMount}
          licenseKey={process.env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY}
          // user mode: strip all editing UI + block image/video assets.
          components={isUser ? USER_COMPONENTS : undefined}
          acceptedImageMimeTypes={isUser ? [] : undefined}
          acceptedVideoMimeTypes={isUser ? [] : undefined}
          maxAssetSize={isUser ? 0 : undefined}
          overrides={isUser ? overrides : undefined}
        />
      </div>

      {!ready && <Loading label="Loading the board" />}

      {mode === "admin" && (
        <AdminControls
          getDocument={() =>
            editorRef.current
              ? getSnapshot(editorRef.current.store).document
              : null
          }
          reload={async () => {
            if (editorRef.current) await loadBoard(editorRef.current);
          }}
          broadcastReload={() => syncRef.current?.requestReload()}
        />
      )}
    </div>
  );
}

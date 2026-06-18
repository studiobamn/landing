"use client";

// =========================================================
// Home physics — owns the Matter.js world, the DOM-sync loop, the controlled
// entrance, click-vs-drag detection and the "abyss" exit (see HOME.md).
//
// Motion model:
//   1. spawn(): each body flies in from above straight to its target slot
//      (GSAP-driven, collision off) — NOT a gravity drop.
//   2. on arrival: physics activates as a slow zero-gravity drift inside a
//      4-wall box; bodies bounce gently and are drag-throwable.
//   3. startAbyss(): drop the floor + ramp gravity → everything falls away.
//
// Rendering split: Matter draws nothing (bodies are invisible). The 4 <img>
// components are positioned every frame to match their body. The DOM element
// is the source of truth for base size; mobile scale is baked into both the
// body dimensions and the element's transform.
// =========================================================

import { useCallback, useEffect, useRef } from "react";
import Matter from "matter-js";
import gsap from "gsap";
import {
  TARGET_POSITIONS,
  BASE_VIEWPORT,
  VIEW_SIZE,
  MOBILE_BODY_SCALE,
  MOBILE_BREAKPOINT,
  FLOAT_GRAVITY_Y,
  FLOAT_BODY,
  FLOAT_SPEED,
  DRAG_STIFFNESS,
  ABYSS_GRAVITY_Y,
  ENTRY_DURATION,
  ENTRY_STAGGER,
  ENTRY_EASE,
  CLICK_THRESHOLD_MS,
  CLICK_THRESHOLD_PX,
  type ViewKey,
} from "@/components/home/constants";

interface UseHomePhysicsArgs {
  /** Full-viewport wrapper that captures pointer input (mouse + touch). */
  surfaceRef: React.RefObject<HTMLDivElement | null>;
  /** Transparent canvas (kept for layer fidelity; nothing is drawn on it). */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** The 4 DOM image elements, indexed to match Position A..D. */
  itemRefs: React.RefObject<(HTMLDivElement | null)[]>;
  /** Shuffled view assignment per position — used for sizing + click→nav. */
  assignments: ViewKey[];
  /** Called when a body is clicked (not dragged). */
  onItemClick: (view: ViewKey) => void;
  reduceMotion: boolean;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export function useHomePhysics({
  surfaceRef,
  canvasRef,
  itemRefs,
  assignments,
  onItemClick,
  reduceMotion,
}: UseHomePhysicsArgs) {
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const floorRef = useRef<Matter.Body | null>(null);
  const bodiesRef = useRef<Matter.Body[]>([]);
  const targetsRef = useRef<{ x: number; y: number }[]>([]);
  const enteringRef = useRef<boolean[]>([]);
  const entryTweensRef = useRef<gsap.core.Tween[]>([]);
  const sizeRef = useRef({ width: 0, height: 0 });
  const scaleRef = useRef(1);

  // Keep mutable inputs reachable from stable handlers/callbacks.
  const assignmentsRef = useRef(assignments);
  const onItemClickRef = useRef(onItemClick);
  useEffect(() => {
    assignmentsRef.current = assignments;
    onItemClickRef.current = onItemClick;
  });

  // ---- DOM sync (mobile scale baked into the transform) ----
  function syncDom() {
    const items = itemRefs.current;
    const scale = scaleRef.current;
    bodiesRef.current.forEach((body, i) => {
      const el = items[i];
      if (!el) return;
      const x = body.position.x - el.offsetWidth / 2;
      const y = body.position.y - el.offsetHeight / 2;
      // No rotation — bodies are locked upright (inertia: Infinity).
      el.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    });
  }

  // ---- once a body lands, hand it to the slow drift ----
  function releaseFloat(body: Matter.Body, i: number) {
    enteringRef.current[i] = false;
    body.isSensor = false;
    Matter.Body.setVelocity(body, {
      x: rand(-FLOAT_SPEED, FLOAT_SPEED),
      y: rand(-FLOAT_SPEED, FLOAT_SPEED),
    });
  }

  const removeBodies = useCallback(() => {
    entryTweensRef.current.forEach((t) => t.kill());
    entryTweensRef.current = [];
    const engine = engineRef.current;
    if (engine) Matter.World.remove(engine.world, bodiesRef.current);
    bodiesRef.current = [];
  }, []);

  // ---- enter(): fly components in from above, then release to float ----
  const spawn = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    removeBodies();

    engine.gravity.x = 0;
    engine.gravity.y = FLOAT_GRAVITY_Y;

    const { width, height } = sizeRef.current;
    const scale = scaleRef.current;
    const sx = width / BASE_VIEWPORT.width;
    const sy = height / BASE_VIEWPORT.height;
    targetsRef.current = TARGET_POSITIONS.map((p) => ({ x: p.x * sx, y: p.y * sy }));

    const assigned = assignmentsRef.current;
    const bodies = targetsRef.current.map((target, i) => {
      const el = itemRefs.current[i];
      const base = VIEW_SIZE[assigned[i]] ?? { width: 220, height: 280 };
      const w = (el?.offsetWidth || base.width) * scale;
      const h = (el?.offsetHeight || base.height) * scale;
      const startY = -(h + 60); // above the viewport
      const body = Matter.Bodies.rectangle(target.x, startY, w, h, {
        ...FLOAT_BODY,
        isSensor: true, // no collisions while flying in
        render: { visible: false },
      });
      Matter.Body.setInertia(body, Infinity); // lock rotation
      return body;
    });
    bodiesRef.current = bodies;
    enteringRef.current = bodies.map(() => true);
    Matter.World.add(engine.world, bodies);

    if (reduceMotion) {
      bodies.forEach((b, i) => {
        Matter.Body.setPosition(b, targetsRef.current[i]);
        b.isSensor = false;
        enteringRef.current[i] = false;
      });
      syncDom();
      return;
    }

    bodies.forEach((body, i) => {
      const target = targetsRef.current[i];
      const s = { y: body.position.y };
      const tween = gsap.to(s, {
        y: target.y,
        duration: ENTRY_DURATION,
        delay: i * ENTRY_STAGGER,
        ease: ENTRY_EASE,
        onUpdate: () => {
          Matter.Body.setPosition(body, { x: target.x, y: s.y });
          Matter.Body.setVelocity(body, { x: 0, y: 0 });
        },
        onComplete: () => releaseFloat(body, i),
      });
      entryTweensRef.current.push(tween);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemRefs, reduceMotion, removeBodies]);

  // ---- exit(): the abyss ----
  const startAbyss = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    entryTweensRef.current.forEach((t) => t.kill());
    entryTweensRef.current = [];
    if (floorRef.current) {
      Matter.World.remove(engine.world, floorRef.current);
      floorRef.current = null;
    }
    engine.gravity.y = ABYSS_GRAVITY_Y;
    bodiesRef.current.forEach((b) => {
      b.isSensor = false;
      Matter.Sleeping.set(b, false);
      Matter.Body.setVelocity(b, { x: b.velocity.x, y: Math.max(b.velocity.y, 6) });
    });
  }, []);

  // ---- engine lifecycle (mount once) ----
  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    sizeRef.current = { width, height };
    scaleRef.current = width < MOBILE_BREAKPOINT ? MOBILE_BODY_SCALE : 1;

    const engine = Matter.Engine.create({ enableSleeping: false });
    engine.gravity.x = 0;
    engine.gravity.y = FLOAT_GRAVITY_Y;
    engineRef.current = engine;

    const bounds = buildBounds(sizeRef.current);
    floorRef.current = bounds.floor;
    Matter.World.add(engine.world, [
      bounds.left,
      bounds.right,
      bounds.top,
      bounds.floor,
    ]);

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
    }

    // Mouse drag — bound to the top surface so it sees events bubbling up from
    // the image layer above the (non-interactive) canvas.
    const mouse = Matter.Mouse.create(surface);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: DRAG_STIFFNESS, render: { visible: false } },
    });
    Matter.World.add(engine.world, mouseConstraint);

    const onAfterUpdate = () => syncDom();
    Matter.Events.on(engine, "afterUpdate", onAfterUpdate);

    // Click-vs-drag: a quick, near-stationary press on a settled body = click.
    let downTime = 0;
    let downPos = { x: 0, y: 0 };
    let downIndex: number | null = null;

    const bodyIndexAt = (clientX: number, clientY: number): number | null => {
      const rect = surface.getBoundingClientRect();
      const point = { x: clientX - rect.left, y: clientY - rect.top };
      const hit = Matter.Query.point(bodiesRef.current, point)[0];
      const idx = hit ? bodiesRef.current.indexOf(hit) : -1;
      return idx >= 0 ? idx : null;
    };

    const press = (clientX: number, clientY: number) => {
      downTime = Date.now();
      downPos = { x: clientX, y: clientY };
      const idx = bodyIndexAt(clientX, clientY);
      // Ignore presses on a body still flying in.
      downIndex = idx != null && !enteringRef.current[idx] ? idx : null;
      if (downIndex != null) {
        Matter.Sleeping.set(bodiesRef.current[downIndex], false);
      }
    };
    const release = (clientX: number, clientY: number) => {
      if (downIndex == null) return;
      const elapsed = Date.now() - downTime;
      const dx = Math.abs(clientX - downPos.x);
      const dy = Math.abs(clientY - downPos.y);
      const sameBody = bodyIndexAt(clientX, clientY) === downIndex;
      if (
        sameBody &&
        elapsed < CLICK_THRESHOLD_MS &&
        dx < CLICK_THRESHOLD_PX &&
        dy < CLICK_THRESHOLD_PX
      ) {
        const view = assignmentsRef.current[downIndex];
        if (view) onItemClickRef.current(view);
      }
      downIndex = null;
    };

    const onMouseDown = (e: MouseEvent) => press(e.clientX, e.clientY);
    const onMouseUp = (e: MouseEvent) => release(e.clientX, e.clientY);
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) press(t.clientX, t.clientY);
    };
    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (t) release(t.clientX, t.clientY);
    };

    surface.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    surface.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    const onResize = () => {
      sizeRef.current = { width: window.innerWidth, height: window.innerHeight };
      scaleRef.current =
        window.innerWidth < MOBILE_BREAKPOINT ? MOBILE_BODY_SCALE : 1;
      Matter.World.remove(engine.world, [
        bounds.left,
        bounds.right,
        bounds.top,
        ...(floorRef.current ? [floorRef.current] : []),
      ]);
      const next = buildBounds(sizeRef.current);
      bounds.left = next.left;
      bounds.right = next.right;
      bounds.top = next.top;
      if (floorRef.current) floorRef.current = next.floor;
      Matter.World.add(engine.world, [
        next.left,
        next.right,
        next.top,
        ...(floorRef.current ? [next.floor] : []),
      ]);
    };
    window.addEventListener("resize", onResize);

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    runnerRef.current = runner;

    return () => {
      entryTweensRef.current.forEach((t) => t.kill());
      entryTweensRef.current = [];
      surface.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      surface.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
      Matter.Events.off(engine, "afterUpdate", onAfterUpdate);
      if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
      engineRef.current = null;
    };
    // mount-once; refs carry the live inputs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { spawn, startAbyss };
}

// ---- containment box: keeps floating bodies on screen; floor drops on abyss ----
function buildBounds(size: { width: number; height: number }) {
  const opts = { isStatic: true, render: { visible: false } } as const;
  const t = 200; // thickness
  const left = Matter.Bodies.rectangle(
    -t / 2,
    size.height / 2,
    t,
    size.height * 3,
    opts,
  );
  const right = Matter.Bodies.rectangle(
    size.width + t / 2,
    size.height / 2,
    t,
    size.height * 3,
    opts,
  );
  const top = Matter.Bodies.rectangle(
    size.width / 2,
    -t / 2,
    size.width * 3,
    t,
    opts,
  );
  const floor = Matter.Bodies.rectangle(
    size.width / 2,
    size.height + t / 2,
    size.width * 3,
    t,
    opts,
  );
  return { left, right, top, floor };
}

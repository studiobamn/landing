"use client";

import { useMemo } from "react";

interface CustomCompProps {
  imgUrl: string;
  text?: string | null;
  padding?: string | null;
  imgPosition: "top" | "bottom" | "left" | "right";
}

export function CustomComp({
  imgUrl,
  text,
  imgPosition,
  padding,
}: CustomCompProps) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgUrl}
      alt=""
      draggable={false}
      className="block w-full object-cover"
    />
  );

  const body = text ? (
    <p className="font-secondary text-sm leading-relaxed text-bamn-black/80 px-5">
      {text}
    </p>
  ) : null;

  const rootClass = useMemo(() => {
    if (imgPosition === "top") return "flex flex-col gap-4 items-center";
    if (imgPosition === "bottom") return "flex flex-col gap-4 items-center";
    if (imgPosition === "left") return "flex gap-6 items-center";
    if (imgPosition === "right" && !text)
      return "flex gap-6 items-center justify-end";
    if (imgPosition === "right" && text)
      return "flex gap-6 items-center justify-start";
    return "flex gap-6 items-center";
  }, [imgPosition, text]);

  if (imgPosition === "top") {
    return (
      <div className={rootClass} style={{ padding: padding ?? "" }}>
        {img}
        {body}
      </div>
    );
  }

  if (imgPosition === "bottom") {
    return (
      <div className={rootClass} style={{ padding: padding ?? "" }}>
        {body}
        {img}
      </div>
    );
  }

  if (imgPosition === "left") {
    return (
      <div className={rootClass} style={{ padding: padding ?? "" }}>
        <div className="w-1/2 shrink-0">{img}</div>
        {body && <div className="flex-1">{body}</div>}
      </div>
    );
  }

  // right
  return (
    <div className={rootClass} style={{ padding: padding ?? "" }}>
      {body && <div className="flex-1">{body}</div>}
      <div className="w-1/2 shrink-0">{img}</div>
    </div>
  );
}

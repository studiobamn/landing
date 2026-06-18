"use client";

import useMobile from "@/hooks/useMobile";
// Project detail image block: a large vertical image on the left (45% × 800px)
// and a right column (plain_v on top, info_img_sm below) at fixed sizes.

import { resolveMediaUrl } from "@/lib/drive";
import type { Project } from "@/types";

interface ProjectInfoImgsProps {
  project: Project;
}

export function ProjectInfoImgs({ project }: ProjectInfoImgsProps) {
  const lg = resolveMediaUrl(project.info_img_lg);
  const plainV = resolveMediaUrl(project.plain_v_id);
  const sm = resolveMediaUrl(project.info_img_sm);
  const isMobile = useMobile();

  return (
    <div className="flex flex-col md:flex-row items-end md:items-start md:justify-between pt-10 gap-4 md:gap-0">
      {lg && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={lg}
          alt=""
          draggable={false}
          className="object-cover"
          style={{
            width: isMobile ? "100%" : "45%",
            height: isMobile ? 400 : 600,
          }}
        />
      )}

      <div className="flex gap-5 mb-5">
        {plainV && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={plainV}
            alt=""
            draggable={false}
            className="object-cover"
            style={{
              width: isMobile ? 100 : 220,
              height: isMobile ? 180 : 300,
            }}
          />
        )}
        {sm && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sm}
            alt=""
            draggable={false}
            className="object-cover"
            style={{
              width: isMobile ? 100 : 220,
              height: isMobile ? 180 : 300,
            }}
          />
        )}
      </div>
    </div>
  );
}

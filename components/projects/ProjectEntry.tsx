"use client";

// A single filmstrip entry: number label + thumbnail. The whole row is the
// click target. The <img> carries data-thumb so useProjectsInspect can slide it
// off the right edge (and back) during inspect transitions. Clipping to a sliver
// is done by the filmstrip column, not here — so no overflow clip on the slot.

import { resolveMediaUrl } from "@/lib/drive";
import { NUMBER_WIDTH, PROJECTS_FILM_IMG_SIZE } from "./constants";
import type { Project } from "@/types";

interface ProjectEntryProps {
  project: Project;
  onSelect: (id: string, el: HTMLElement | null) => void;
}

export function ProjectEntry({ project, onSelect }: ProjectEntryProps) {
  const src = resolveMediaUrl(project.cover_drive_id);
  const size = PROJECTS_FILM_IMG_SIZE[project.number as string];
  return (
    <button
      data-entry
      style={{ justifyContent: "flex-" }}
      className="group flex w-full cursor-default items-center gap-4 text-left"
    >
      <span
        className="font-secondary shrink-0 text-right text-xs text-bamn-muted"
        style={{ width: NUMBER_WIDTH }}
      >
        {project.number}
      </span>
      <span
        className="flex justify-end w-fit relative"
        style={{ height: size.height }}
        onClick={(e) =>
          onSelect(
            project.id,
            e.currentTarget.querySelector<HTMLElement>("[data-thumb]"),
          )
        }
      >
        {src ? (
          // Drive/external media → raw <img> (STACK.md).
          // eslint-disable-next-line @next/next/no-img-element
          <img
            data-thumb={project.id}
            src={src}
            width={size.width}
            height={size.height}
            alt={project.title}
            draggable={false}
            className="h-full object-cover transition duration-300"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-bamn-muted/20 text-xs text-bamn-muted">
            {project.title}
          </span>
        )}
      </span>
    </button>
  );
}
